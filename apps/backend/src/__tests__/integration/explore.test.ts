import request from 'supertest';
import app from '../../app';
import { User } from '../../models/User.model';
import { Post } from '../../models/Post.model';

describe('Explore API', () => {
  let userId: string;

  beforeEach(async () => {
    const user = await User.create({
      email: 'test@example.com',
      username: 'testuser',
      password: 'Password123!',
    });
    userId = user._id.toString();

    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const twoDaysAgo = now - 2 * 24 * 60 * 60 * 1000;

    await Post.create({
      author: userId,
      images: ['https://example.com/image1.jpg'],
      caption: 'Recent popular post',
      likesCount: 100,
      commentsCount: 50,
      createdAt: new Date(oneDayAgo + 1000),
    });

    await Post.create({
      author: userId,
      images: ['https://example.com/image2.jpg'],
      caption: 'Old very popular post',
      likesCount: 500,
      commentsCount: 200,
      createdAt: new Date(twoDaysAgo),
    });

    await Post.create({
      author: userId,
      images: ['https://example.com/image3.jpg'],
      caption: 'Recent less popular post',
      likesCount: 10,
      commentsCount: 5,
      createdAt: new Date(oneDayAgo + 2000),
    });
  });

  describe('GET /api/explore/trending', () => {
    it('should get trending posts', async () => {
      const response = await request(app).get('/api/explore/trending');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.posts.length).toBeGreaterThan(0);
    });

    it('should only include posts from last 24 hours', async () => {
      const response = await request(app).get('/api/explore/trending');

      expect(response.status).toBe(200);
      response.body.data.posts.forEach((post: any) => {
        const timeDiff = Date.now() - new Date(post.createdAt).getTime();
        expect(timeDiff).toBeLessThan(24 * 60 * 60 * 1000);
      });
    });

    it('should support pagination', async () => {
      for (let i = 0; i < 15; i++) {
        await Post.create({
          author: userId,
          images: ['https://example.com/image.jpg'],
          caption: `Test post ${i}`,
          likesCount: i,
        });
      }

      const response = await request(app)
        .get('/api/explore/trending')
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body.data.posts).toHaveLength(10);
      expect(response.body.data.pages).toBeGreaterThan(1);
    });
  });

  describe('GET /api/explore/popular', () => {
    it('should get popular posts', async () => {
      const response = await request(app).get('/api/explore/popular');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.posts).toHaveLength(3);
    });

    it('should sort by popularity (likes)', async () => {
      const response = await request(app).get('/api/explore/popular');

      expect(response.status).toBe(200);
      const posts = response.body.data.posts;

      if (posts.length > 1) {
        for (let i = 0; i < posts.length - 1; i++) {
          expect(posts[i].likesCount).toBeGreaterThanOrEqual(posts[i + 1].likesCount);
        }
      }
    });

    it('should support pagination', async () => {
      for (let i = 0; i < 15; i++) {
        await Post.create({
          author: userId,
          images: ['https://example.com/image.jpg'],
          caption: `Test post ${i}`,
        });
      }

      const response = await request(app)
        .get('/api/explore/popular')
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body.data.posts).toHaveLength(10);
      expect(response.body.data.total).toBeGreaterThanOrEqual(18);
    });
  });

  describe('GET /api/explore/recent', () => {
    it('should get recent posts', async () => {
      const response = await request(app).get('/api/explore/recent');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.posts).toHaveLength(3);
    });

    it('should sort by creation date (newest first)', async () => {
      const response = await request(app).get('/api/explore/recent');

      expect(response.status).toBe(200);
      const posts = response.body.data.posts;

      if (posts.length > 1) {
        for (let i = 0; i < posts.length - 1; i++) {
          expect(new Date(posts[i].createdAt).getTime()).toBeGreaterThanOrEqual(
            new Date(posts[i + 1].createdAt).getTime()
          );
        }
      }
    });

    it('should support pagination', async () => {
      for (let i = 0; i < 15; i++) {
        await Post.create({
          author: userId,
          images: ['https://example.com/image.jpg'],
          caption: `Test post ${i}`,
        });
      }

      const response = await request(app)
        .get('/api/explore/recent')
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body.data.posts).toHaveLength(10);
      expect(response.body.data.pages).toBeGreaterThan(1);
    });
  });
});
