import request from 'supertest';
import app from '../../app';
import { User } from '../../models/User.model';
import { Post } from '../../models/Post.model';

describe('Search API', () => {
  let userId1: string;
  let userId2: string;

  beforeEach(async () => {
    const user1 = await User.create({
      email: 'john@example.com',
      username: 'johndoe',
      password: 'Password123!',
      fullName: 'John Doe',
    });
    userId1 = user1._id.toString();

    const user2 = await User.create({
      email: 'jane@example.com',
      username: 'janedoe',
      password: 'Password123!',
      fullName: 'Jane Smith',
    });
    userId2 = user2._id.toString();

    await Post.create({
      author: userId1,
      images: ['https://example.com/image1.jpg'],
      caption: 'Beautiful sunset in California',
      location: 'San Francisco, CA',
    });

    await Post.create({
      author: userId2,
      images: ['https://example.com/image2.jpg'],
      caption: 'Amazing beach day',
      location: 'Miami, FL',
    });
  });

  describe('GET /api/search/posts', () => {
    it('should search posts by caption', async () => {
      const response = await request(app).get('/api/search/posts').query({ q: 'sunset' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.posts).toHaveLength(1);
      expect(response.body.data.posts[0].caption).toContain('sunset');
    });

    it('should search posts by location', async () => {
      const response = await request(app).get('/api/search/posts').query({ q: 'Miami' });

      expect(response.status).toBe(200);
      expect(response.body.data.posts).toHaveLength(1);
      expect(response.body.data.posts[0].location).toContain('Miami');
    });

    it('should be case insensitive', async () => {
      const response = await request(app).get('/api/search/posts').query({ q: 'BEACH' });

      expect(response.status).toBe(200);
      expect(response.body.data.posts).toHaveLength(1);
    });

    it('should support pagination', async () => {
      for (let i = 0; i < 15; i++) {
        await Post.create({
          author: userId1,
          images: ['https://example.com/image.jpg'],
          caption: `Test post ${i}`,
        });
      }

      const response = await request(app)
        .get('/api/search/posts')
        .query({ q: 'Test', page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body.data.posts).toHaveLength(10);
      expect(response.body.data.pages).toBe(2);
    });

    it('should fail without search query', async () => {
      const response = await request(app).get('/api/search/posts');

      expect(response.status).toBe(400);
    });

    it('should return empty array for no matches', async () => {
      const response = await request(app).get('/api/search/posts').query({ q: 'nonexistent' });

      expect(response.status).toBe(200);
      expect(response.body.data.posts).toHaveLength(0);
    });
  });

  describe('GET /api/search/global', () => {
    it('should search both users and posts', async () => {
      const response = await request(app).get('/api/search/global').query({ q: 'doe' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.users.length).toBeGreaterThan(0);
    });

    it('should respect limit parameter', async () => {
      const response = await request(app).get('/api/search/global').query({ q: 'doe', limit: 1 });

      expect(response.status).toBe(200);
      expect(response.body.data.users.length).toBeLessThanOrEqual(1);
      expect(response.body.data.posts.length).toBeLessThanOrEqual(1);
    });

    it('should fail without search query', async () => {
      const response = await request(app).get('/api/search/global');

      expect(response.status).toBe(400);
    });

    it('should return results for posts only if no users match', async () => {
      const response = await request(app).get('/api/search/global').query({ q: 'beach' });

      expect(response.status).toBe(200);
      expect(response.body.data.users).toHaveLength(0);
      expect(response.body.data.posts.length).toBeGreaterThan(0);
    });
  });
});
