import request from 'supertest';
import app from '../../app';
import { User } from '../../models/User.model';
import { Post } from '../../models/Post.model';
import { TokenService } from '../../services/token.service';
import path from 'path';
import fs from 'fs';

describe('Post API', () => {
  let accessToken: string;
  let userId: string;
  let postId: string;
  let anotherAccessToken: string;
  let anotherUserId: string;
  let testImagePath: string;

  beforeAll(() => {
    const uploadsDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    testImagePath = path.join(__dirname, '../fixtures/test-image.jpg');
    if (!fs.existsSync(testImagePath)) {
      const fixturesDir = path.join(__dirname, '../fixtures');
      if (!fs.existsSync(fixturesDir)) {
        fs.mkdirSync(fixturesDir, { recursive: true });
      }
      const buffer = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'base64'
      );
      fs.writeFileSync(testImagePath, buffer);
    }
  });

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

  describe('POST /api/posts', () => {
    it('should create a post with images', async () => {
      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${accessToken}`)
        .attach('images', testImagePath)
        .field('caption', 'My new post')
        .field('location', 'New York');

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.post).toBeDefined();
      expect(response.body.data.post.caption).toBe('My new post');
      expect(response.body.data.post.location).toBe('New York');
      expect(response.body.data.post.images).toHaveLength(1);
    });

    it('should create a post with multiple images', async () => {
      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${accessToken}`)
        .attach('images', testImagePath)
        .attach('images', testImagePath)
        .field('caption', 'Multiple images post');

      expect(response.status).toBe(201);
      expect(response.body.data.post.images).toHaveLength(2);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/posts')
        .attach('images', testImagePath)
        .field('caption', 'Test post');

      expect(response.status).toBe(401);
    });

    it('should fail without images', async () => {
      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${accessToken}`)
        .field('caption', 'Test post');

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/posts/:id', () => {
    it('should get a post by id', async () => {
      const response = await request(app).get(`/api/posts/${postId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.post).toBeDefined();
      expect(response.body.data.post._id).toBe(postId);
      expect(response.body.data.post.author).toBeDefined();
      expect(response.body.data.post.author.username).toBe('testuser');
    });

    it('should return 404 for non-existent post', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app).get(`/api/posts/${fakeId}`);

      expect(response.status).toBe(404);
    });

    it('should return 400 for invalid post id', async () => {
      const response = await request(app).get('/api/posts/invalid-id');

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/posts/user/:userId', () => {
    it('should get posts by user id', async () => {
      await Post.create({
        author: userId,
        images: ['https://example.com/image2.jpg'],
        caption: 'Second post',
      });

      const response = await request(app).get(`/api/posts/user/${userId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.posts).toBeDefined();
      expect(response.body.data.posts.length).toBeGreaterThanOrEqual(2);
      expect(response.body.data.total).toBeGreaterThanOrEqual(2);
    });

    it('should support pagination', async () => {
      for (let i = 0; i < 15; i++) {
        await Post.create({
          author: userId,
          images: ['https://example.com/image.jpg'],
          caption: `Post ${i}`,
        });
      }

      const response = await request(app)
        .get(`/api/posts/user/${userId}`)
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body.data.posts).toHaveLength(10);
      expect(response.body.data.pages).toBeGreaterThan(1);
    });

    it('should return empty array for user with no posts', async () => {
      const response = await request(app).get(`/api/posts/user/${anotherUserId}`);

      expect(response.status).toBe(200);
      expect(response.body.data.posts).toHaveLength(0);
      expect(response.body.data.total).toBe(0);
    });
  });

  describe('GET /api/posts/feed', () => {
    it('should get feed posts for authenticated user', async () => {
      const response = await request(app)
        .get('/api/posts/feed')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.posts).toBeDefined();
      expect(Array.isArray(response.body.data.posts)).toBe(true);
    });

    it('should fail without authentication', async () => {
      const response = await request(app).get('/api/posts/feed');

      expect(response.status).toBe(401);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/posts/feed')
        .set('Authorization', `Bearer ${accessToken}`)
        .query({ page: 1, limit: 5 });

      expect(response.status).toBe(200);
      expect(response.body.data.posts.length).toBeLessThanOrEqual(5);
    });
  });

  describe('PUT /api/posts/:id', () => {
    it('should update a post by the author', async () => {
      const response = await request(app)
        .put(`/api/posts/${postId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          caption: 'Updated caption',
          location: 'San Francisco',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.post.caption).toBe('Updated caption');
      expect(response.body.data.post.location).toBe('San Francisco');
    });

    it('should fail without authentication', async () => {
      const response = await request(app).put(`/api/posts/${postId}`).send({
        caption: 'Updated caption',
      });

      expect(response.status).toBe(401);
    });

    it('should fail if user is not the author', async () => {
      const response = await request(app)
        .put(`/api/posts/${postId}`)
        .set('Authorization', `Bearer ${anotherAccessToken}`)
        .send({
          caption: 'Updated caption',
        });

      expect(response.status).toBe(403);
    });

    it('should fail with invalid data', async () => {
      const response = await request(app)
        .put(`/api/posts/${postId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          caption: 'a'.repeat(2201),
        });

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/posts/:id', () => {
    it('should delete a post by the author', async () => {
      const response = await request(app)
        .delete(`/api/posts/${postId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const foundPost = await Post.findById(postId);
      expect(foundPost).toBeNull();

      const getResponse = await request(app).get(`/api/posts/${postId}`);
      expect(getResponse.status).toBe(404);
    });

    it('should fail without authentication', async () => {
      const response = await request(app).delete(`/api/posts/${postId}`);

      expect(response.status).toBe(401);
    });

    it('should fail if user is not the author', async () => {
      const response = await request(app)
        .delete(`/api/posts/${postId}`)
        .set('Authorization', `Bearer ${anotherAccessToken}`);

      expect(response.status).toBe(403);
    });

    it('should return 404 for non-existent post', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .delete(`/api/posts/${fakeId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(404);
    });
  });
});
