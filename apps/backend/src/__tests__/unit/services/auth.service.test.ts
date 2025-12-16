import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/User.model';
import { ConflictError, AuthenticationError, NotFoundError } from '../../../utils/ApiError';

describe('AuthService', () => {
  describe('register', () => {
    const validUserData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'Password123',
      fullName: 'Test User',
    };

    it('should create a new user successfully', async () => {
      const result = await AuthService.register(validUserData);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('tokens');
      expect(result.user.username).toBe(validUserData.username);
      expect(result.user.email).toBe(validUserData.email);
      expect(result.user.fullName).toBe(validUserData.fullName);
      expect(result.tokens).toHaveProperty('accessToken');
      expect(result.tokens).toHaveProperty('refreshToken');
    });

    it('should hash the password', async () => {
      const result = await AuthService.register(validUserData);

      const user = await User.findById(result.user._id).select('+password');
      expect(user?.password).not.toBe(validUserData.password);
      expect(user?.password).toBeDefined();
    });

    it('should throw ConflictError if email already exists', async () => {
      await AuthService.register(validUserData);

      await expect(
        AuthService.register({
          ...validUserData,
          username: 'differentuser',
        })
      ).rejects.toThrow(ConflictError);
    });

    it('should throw ConflictError if username already exists', async () => {
      await AuthService.register(validUserData);

      await expect(
        AuthService.register({
          ...validUserData,
          email: 'different@example.com',
        })
      ).rejects.toThrow(ConflictError);
    });
  });

  describe('login', () => {
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'Password123',
    };

    beforeEach(async () => {
      await AuthService.register(userData);
    });

    it('should login with valid credentials', async () => {
      const result = await AuthService.login({
        email: userData.email,
        password: userData.password,
      });

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('tokens');
      expect(result.user.email).toBe(userData.email);
      expect(result.tokens).toHaveProperty('accessToken');
      expect(result.tokens).toHaveProperty('refreshToken');
    });

    it('should throw AuthenticationError with invalid email', async () => {
      await expect(
        AuthService.login({
          email: 'wrong@example.com',
          password: userData.password,
        })
      ).rejects.toThrow(AuthenticationError);
    });

    it('should throw AuthenticationError with invalid password', async () => {
      await expect(
        AuthService.login({
          email: userData.email,
          password: 'WrongPassword123',
        })
      ).rejects.toThrow(AuthenticationError);
    });

    it('should not return password in user object', async () => {
      const result = await AuthService.login({
        email: userData.email,
        password: userData.password,
      });

      expect(result.user.password).toBeUndefined();
    });
  });

  describe('refreshToken', () => {
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'Password123',
    };

    it('should refresh tokens with valid refresh token', async () => {
      const registerResult = await AuthService.register(userData);
      const oldRefreshToken = registerResult.tokens.refreshToken;

      const result = await AuthService.refreshToken(oldRefreshToken);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('tokens');
      expect(result.tokens).toHaveProperty('accessToken');
      expect(result.tokens).toHaveProperty('refreshToken');
      expect(result.tokens.refreshToken).not.toBe(oldRefreshToken);
    });

    it('should throw AuthenticationError with invalid refresh token', async () => {
      await expect(AuthService.refreshToken('invalid-token')).rejects.toThrow(
        AuthenticationError
      );
    });

    it('should throw NotFoundError if user not found', async () => {
      const registerResult = await AuthService.register(userData);
      const refreshToken = registerResult.tokens.refreshToken;

      await User.findByIdAndDelete(registerResult.user._id);

      await expect(AuthService.refreshToken(refreshToken)).rejects.toThrow(NotFoundError);
    });
  });

  describe('getUserById', () => {
    it('should return user by id', async () => {
      const registerResult = await AuthService.register({
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123',
      });

      const user = await AuthService.getUserById(registerResult.user._id.toString());

      expect(user).toBeDefined();
      expect(user._id.toString()).toBe(registerResult.user._id.toString());
      expect(user.email).toBe('test@example.com');
    });

    it('should throw NotFoundError if user not found', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      await expect(AuthService.getUserById(fakeId)).rejects.toThrow(NotFoundError);
    });
  });
});
