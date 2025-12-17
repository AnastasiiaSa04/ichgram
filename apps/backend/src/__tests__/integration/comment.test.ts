import request from 'supertest';
import app from '../../app';
import { User } from '../../models/User.model';
import { Post } from '../../models/Post.model';
import { Comment } from '../../models/Comment.model';
import { TokenService } from '../../services/token.service';

describe('Comment API', () => {
  let accessToken: string;
  let userId: string;
  let postId: string;
  let commentId: string;
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

    const comment = await Comment.create({
      post: postId,
      author: userId,
      content: 'Test comment',
    });
    commentId = comment._id.toString();

    await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });
  });

  describe('POST /api/comments/post/:postId', () => {
    it('should create a comment', async () => {
      const response = await request(app)
        .post(`/api/comments/post/${postId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'New comment' });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.comment).toBeDefined();
      expect(response.body.data.comment.content).toBe('New comment');

      const updatedPost = await Post.findById(postId);
      expect(updatedPost?.commentsCount).toBe(2);
    });

    it('should create a reply to a comment', async () => {
      const response = await request(app)
        .post(`/api/comments/post/${postId}`)
        .set('Authorization', `Bearer ${anotherAccessToken}`)
        .send({ content: 'Reply', parentComment: commentId });

      expect(response.status).toBe(201);
      expect(response.body.data.comment.content).toBe('Reply');

      const parentComment = await Comment.findById(commentId);
      expect(parentComment?.repliesCount).toBe(1);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post(`/api/comments/post/${postId}`)
        .send({ content: 'Comment' });

      expect(response.status).toBe(401);
    });

    it('should fail if post does not exist', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .post(`/api/comments/post/${fakeId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'Comment' });

      expect(response.status).toBe(404);
    });

    it('should fail with invalid content', async () => {
      const response = await request(app)
        .post(`/api/comments/post/${postId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: '' });

      expect(response.status).toBe(400);
    });

    it('should fail if content exceeds max length', async () => {
      const response = await request(app)
        .post(`/api/comments/post/${postId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'a'.repeat(501) });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/comments/:id', () => {
    it('should get a comment by id', async () => {
      const response = await request(app).get(`/api/comments/${commentId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.comment).toBeDefined();
      expect(response.body.data.comment._id).toBe(commentId);
    });

    it('should return 404 for non-existent comment', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app).get(`/api/comments/${fakeId}`);

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/comments/post/:postId', () => {
    beforeEach(async () => {
      await Comment.create({
        post: postId,
        author: anotherUserId,
        content: 'Another comment',
      });
    });

    it('should get all top-level comments for a post', async () => {
      const response = await request(app).get(`/api/comments/post/${postId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.comments).toHaveLength(2);
      expect(response.body.data.total).toBe(2);
    });

    it('should not include replies in top-level comments', async () => {
      await Comment.create({
        post: postId,
        author: anotherUserId,
        content: 'Reply',
        parentComment: commentId,
      });

      const response = await request(app).get(`/api/comments/post/${postId}`);

      expect(response.status).toBe(200);
      expect(response.body.data.comments).toHaveLength(2);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get(`/api/comments/post/${postId}`)
        .query({ page: 1, limit: 1 });

      expect(response.status).toBe(200);
      expect(response.body.data.comments).toHaveLength(1);
      expect(response.body.data.pages).toBe(2);
    });

    it('should fail if post does not exist', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app).get(`/api/comments/post/${fakeId}`);

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/comments/:id/replies', () => {
    beforeEach(async () => {
      await Comment.create({
        post: postId,
        author: anotherUserId,
        content: 'Reply 1',
        parentComment: commentId,
      });
      await Comment.create({
        post: postId,
        author: userId,
        content: 'Reply 2',
        parentComment: commentId,
      });
    });

    it('should get all replies for a comment', async () => {
      const response = await request(app).get(`/api/comments/${commentId}/replies`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.replies).toHaveLength(2);
      expect(response.body.data.total).toBe(2);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get(`/api/comments/${commentId}/replies`)
        .query({ page: 1, limit: 1 });

      expect(response.status).toBe(200);
      expect(response.body.data.replies).toHaveLength(1);
      expect(response.body.data.pages).toBe(2);
    });

    it('should fail if comment does not exist', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app).get(`/api/comments/${fakeId}/replies`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/comments/:id', () => {
    it('should update a comment by the author', async () => {
      const response = await request(app)
        .put(`/api/comments/${commentId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'Updated content' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.comment.content).toBe('Updated content');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .put(`/api/comments/${commentId}`)
        .send({ content: 'Updated' });

      expect(response.status).toBe(401);
    });

    it('should fail if user is not the author', async () => {
      const response = await request(app)
        .put(`/api/comments/${commentId}`)
        .set('Authorization', `Bearer ${anotherAccessToken}`)
        .send({ content: 'Updated' });

      expect(response.status).toBe(403);
    });

    it('should fail with invalid content', async () => {
      const response = await request(app)
        .put(`/api/comments/${commentId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: '' });

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/comments/:id', () => {
    it('should delete a comment by the author', async () => {
      const response = await request(app)
        .delete(`/api/comments/${commentId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const foundComment = await Comment.findById(commentId);
      expect(foundComment).toBeNull();

      const updatedPost = await Post.findById(postId);
      expect(updatedPost?.commentsCount).toBe(0);
    });

    it('should fail without authentication', async () => {
      const response = await request(app).delete(`/api/comments/${commentId}`);

      expect(response.status).toBe(401);
    });

    it('should fail if user is not the author', async () => {
      const response = await request(app)
        .delete(`/api/comments/${commentId}`)
        .set('Authorization', `Bearer ${anotherAccessToken}`);

      expect(response.status).toBe(403);
    });

    it('should return 404 for non-existent comment', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .delete(`/api/comments/${fakeId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(404);
    });
  });
});
