import request from 'supertest';
import app from '../../app';
import { User } from '../../models/User.model';
import { Post } from '../../models/Post.model';
import { Like } from '../../models/Like.model';
import { TokenService } from '../../services/token.service';

describe('Like API', () => {
  let accessToken: string;
  let userId: string;
  let postId: string;
  let anotherAccessToken: string;
  let anotherUserId: string;

  beforeEach(async () => {
    const user = await User.create({
      email: 'test@example.com',
      username: 'testuser',
      password: 'Password123!',
    });
    userId = user._id.toString();
    const tokens = TokenService.generateTokenPair(user);
    accessToken = tokens.accessToken;

    const anotherUser = await User.create({
      email: 'another@example.com',
      username: 'anotheruser',
      password: 'Password123!',
    });
    anotherUserId = anotherUser._id.toString();
    const anotherTokens = TokenService.generateTokenPair(anotherUser);
    anotherAccessToken = anotherTokens.accessToken;

    const post = await Post.create({
      author: userId,
      images: ['https://example.com/image1.jpg'],
      caption: 'Test post',
    });
    postId = post._id.toString();
  });

  describe('POST /api/likes/:postId', () => {
    it('should like a post', async () => {
      const response = await request(app)
        .post(`/api/likes/${postId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.like).toBeDefined();

      const updatedPost = await Post.findById(postId);
      expect(updatedPost?.likesCount).toBe(1);
    });

    it('should fail without authentication', async () => {
      const response = await request(app).post(`/api/likes/${postId}`);

      expect(response.status).toBe(401);
    });

    it('should fail if post does not exist', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .post(`/api/likes/${fakeId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(404);
    });

    it('should fail if post already liked', async () => {
      await request(app).post(`/api/likes/${postId}`).set('Authorization', `Bearer ${accessToken}`);

      const response = await request(app)
        .post(`/api/likes/${postId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(409);
    });
  });

  describe('DELETE /api/likes/:postId', () => {
    beforeEach(async () => {
      await Like.create({ post: postId, user: userId });
      await Post.findByIdAndUpdate(postId, { $inc: { likesCount: 1 } });
    });

    it('should unlike a post', async () => {
      const response = await request(app)
        .delete(`/api/likes/${postId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const updatedPost = await Post.findById(postId);
      expect(updatedPost?.likesCount).toBe(0);

      const like = await Like.findOne({ post: postId, user: userId });
      expect(like).toBeNull();
    });

    it('should fail without authentication', async () => {
      const response = await request(app).delete(`/api/likes/${postId}`);

      expect(response.status).toBe(401);
    });

    it('should fail if post does not exist', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .delete(`/api/likes/${fakeId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(404);
    });

    it('should fail if post not liked', async () => {
      const response = await request(app)
        .delete(`/api/likes/${postId}`)
        .set('Authorization', `Bearer ${anotherAccessToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/likes/:postId', () => {
    beforeEach(async () => {
      await Like.create({ post: postId, user: userId });
      await Like.create({ post: postId, user: anotherUserId });
      await Post.findByIdAndUpdate(postId, { likesCount: 2 });
    });

    it('should get all likes for a post', async () => {
      const response = await request(app).get(`/api/likes/${postId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.likes).toHaveLength(2);
      expect(response.body.data.total).toBe(2);
    });

    it('should support pagination', async () => {
      const response = await request(app).get(`/api/likes/${postId}`).query({ page: 1, limit: 1 });

      expect(response.status).toBe(200);
      expect(response.body.data.likes).toHaveLength(1);
      expect(response.body.data.total).toBe(2);
      expect(response.body.data.pages).toBe(2);
    });

    it('should fail if post does not exist', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app).get(`/api/likes/${fakeId}`);

      expect(response.status).toBe(404);
    });

    it('should return empty array for post with no likes', async () => {
      const newPost = await Post.create({
        author: userId,
        images: ['https://example.com/image2.jpg'],
      });

      const response = await request(app).get(`/api/likes/${newPost._id.toString()}`);

      expect(response.status).toBe(200);
      expect(response.body.data.likes).toHaveLength(0);
      expect(response.body.data.total).toBe(0);
    });
  });
});
