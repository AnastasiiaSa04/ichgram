import request from 'supertest';
import app from '../../app';
import { User } from '../../models/User.model';
import { Follow } from '../../models/Follow.model';
import { TokenService } from '../../services/token.service';

describe('Follow API', () => {
  let accessToken1: string;
  let accessToken2: string;
  let accessToken3: string;
  let userId1: string;
  let userId2: string;
  let userId3: string;

  beforeEach(async () => {
    const user1 = await User.create({
      email: 'user1@example.com',
      username: 'user1',
      password: 'Password123!',
    });
    userId1 = user1._id.toString();
    const tokens1 = TokenService.generateTokenPair(user1);
    accessToken1 = tokens1.accessToken;

    const user2 = await User.create({
      email: 'user2@example.com',
      username: 'user2',
      password: 'Password123!',
    });
    userId2 = user2._id.toString();
    const tokens2 = TokenService.generateTokenPair(user2);
    accessToken2 = tokens2.accessToken;

    const user3 = await User.create({
      email: 'user3@example.com',
      username: 'user3',
      password: 'Password123!',
    });
    userId3 = user3._id.toString();
    const tokens3 = TokenService.generateTokenPair(user3);
    accessToken3 = tokens3.accessToken;
  });

  describe('POST /api/follows/:userId', () => {
    it('should follow a user', async () => {
      const response = await request(app)
        .post(`/api/follows/${userId2}`)
        .set('Authorization', `Bearer ${accessToken1}`);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.follow).toBeDefined();

      const user1 = await User.findById(userId1);
      const user2 = await User.findById(userId2);

      expect(user1?.followingCount).toBe(1);
      expect(user2?.followersCount).toBe(1);
    });

    it('should fail without authentication', async () => {
      const response = await request(app).post(`/api/follows/${userId2}`);

      expect(response.status).toBe(401);
    });

    it('should fail when trying to follow self', async () => {
      const response = await request(app)
        .post(`/api/follows/${userId1}`)
        .set('Authorization', `Bearer ${accessToken1}`);

      expect(response.status).toBe(403);
    });

    it('should fail if user does not exist', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .post(`/api/follows/${fakeId}`)
        .set('Authorization', `Bearer ${accessToken1}`);

      expect(response.status).toBe(404);
    });

    it('should fail if already following', async () => {
      await request(app)
        .post(`/api/follows/${userId2}`)
        .set('Authorization', `Bearer ${accessToken1}`);

      const response = await request(app)
        .post(`/api/follows/${userId2}`)
        .set('Authorization', `Bearer ${accessToken1}`);

      expect(response.status).toBe(409);
    });
  });

  describe('DELETE /api/follows/:userId', () => {
    beforeEach(async () => {
      await Follow.create({ follower: userId1, following: userId2 });
      await User.findByIdAndUpdate(userId1, { $inc: { followingCount: 1 } });
      await User.findByIdAndUpdate(userId2, { $inc: { followersCount: 1 } });
    });

    it('should unfollow a user', async () => {
      const response = await request(app)
        .delete(`/api/follows/${userId2}`)
        .set('Authorization', `Bearer ${accessToken1}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const follow = await Follow.findOne({ follower: userId1, following: userId2 });
      expect(follow).toBeNull();

      const user1 = await User.findById(userId1);
      const user2 = await User.findById(userId2);

      expect(user1?.followingCount).toBe(0);
      expect(user2?.followersCount).toBe(0);
    });

    it('should fail without authentication', async () => {
      const response = await request(app).delete(`/api/follows/${userId2}`);

      expect(response.status).toBe(401);
    });

    it('should fail when trying to unfollow self', async () => {
      const response = await request(app)
        .delete(`/api/follows/${userId1}`)
        .set('Authorization', `Bearer ${accessToken1}`);

      expect(response.status).toBe(403);
    });

    it('should fail if user does not exist', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .delete(`/api/follows/${fakeId}`)
        .set('Authorization', `Bearer ${accessToken1}`);

      expect(response.status).toBe(404);
    });

    it('should fail if not following', async () => {
      const response = await request(app)
        .delete(`/api/follows/${userId3}`)
        .set('Authorization', `Bearer ${accessToken1}`);

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/follows/:userId/followers', () => {
    beforeEach(async () => {
      await Follow.create({ follower: userId1, following: userId3 });
      await Follow.create({ follower: userId2, following: userId3 });
    });

    it('should get all followers for a user', async () => {
      const response = await request(app).get(`/api/follows/${userId3}/followers`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.followers).toHaveLength(2);
      expect(response.body.data.total).toBe(2);
    });

    it('should support pagination', async () => {
      for (let i = 0; i < 15; i++) {
        const user = await User.create({
          email: `follower${i}@example.com`,
          username: `follower${i}`,
          password: 'Password123!',
        });
        await Follow.create({ follower: user._id, following: userId3 });
      }

      const response = await request(app)
        .get(`/api/follows/${userId3}/followers`)
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body.data.followers).toHaveLength(10);
      expect(response.body.data.pages).toBe(2);
    });

    it('should return empty array for user with no followers', async () => {
      const response = await request(app).get(`/api/follows/${userId1}/followers`);

      expect(response.status).toBe(200);
      expect(response.body.data.followers).toHaveLength(0);
      expect(response.body.data.total).toBe(0);
    });
  });

  describe('GET /api/follows/:userId/following', () => {
    beforeEach(async () => {
      await Follow.create({ follower: userId1, following: userId2 });
      await Follow.create({ follower: userId1, following: userId3 });
    });

    it('should get all users that a user is following', async () => {
      const response = await request(app).get(`/api/follows/${userId1}/following`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.following).toHaveLength(2);
      expect(response.body.data.total).toBe(2);
    });

    it('should support pagination', async () => {
      for (let i = 0; i < 15; i++) {
        const user = await User.create({
          email: `following${i}@example.com`,
          username: `following${i}`,
          password: 'Password123!',
        });
        await Follow.create({ follower: userId1, following: user._id });
      }

      const response = await request(app)
        .get(`/api/follows/${userId1}/following`)
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body.data.following).toHaveLength(10);
      expect(response.body.data.pages).toBe(2);
    });

    it('should return empty array for user not following anyone', async () => {
      const response = await request(app).get(`/api/follows/${userId2}/following`);

      expect(response.status).toBe(200);
      expect(response.body.data.following).toHaveLength(0);
      expect(response.body.data.total).toBe(0);
    });
  });
});
