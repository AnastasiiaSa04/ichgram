import { User, IUser } from '../models/User.model';
import { TokenService } from './token.service';
import {
  ValidationError,
  AuthenticationError,
  ConflictError,
  NotFoundError,
} from '../utils/ApiError';

interface RegisterData {
  username: string;
  email: string;
  password: string;
  fullName?: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface AuthResponse {
  user: IUser;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export class AuthService {
  static async register(data: RegisterData): Promise<AuthResponse> {
    const { username, email, password, fullName } = data;

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new ConflictError('Email already registered');
      }
      if (existingUser.username === username) {
        throw new ConflictError('Username already taken');
      }
    }

    const user = await User.create({
      username,
      email,
      password,
      fullName,
    });

    const tokens = TokenService.generateTokenPair(user);

    return {
      user,
      tokens,
    };
  }

  static async login(data: LoginData): Promise<AuthResponse> {
    const { email, password } = data;

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid email or password');
    }

    const tokens = TokenService.generateTokenPair(user);

    user.password = undefined as any;

    return {
      user,
      tokens,
    };
  }

  static async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const payload = TokenService.verifyRefreshToken(refreshToken);

    const user = await User.findById(payload.userId);

    if (!user) {
      throw new NotFoundError('User');
    }

    const tokens = TokenService.generateTokenPair(user);

    return {
      user,
      tokens,
    };
  }

  static async getUserById(userId: string): Promise<IUser> {
    const user = await User.findById(userId);

    if (!user) {
      throw new NotFoundError('User');
    }

    return user;
  }
}
