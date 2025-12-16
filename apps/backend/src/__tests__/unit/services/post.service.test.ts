import { PostService } from '../../../services/post.service';
import { Post } from '../../../models/Post.model';
import { User } from '../../../models/User.model';
import { NotFoundError, ForbiddenError } from '../../../utils/ApiError';
import mongoose from 'mongoose';

describe('PostService', () => {
  let userId: string;
  let postId: string;
  let anotherUserId: string;

  beforeEach(async () => {
    const user = await User.create({
      email: 'test@example.com',
      username: 'testuser',
      password: 'Password123!',
    });
    userId = user._id.toString();

    const anotherUser = await User.create({
      email: 'another@example.com',
      username: 'anotheruser',
      password: 'Password123!',
    });
    anotherUserId = anotherUser._id.toString();

    const post = await Post.create({
      author: userId,
      images: ['https://example.com/image1.jpg'],
      caption: 'Test post',
    });
    postId = post._id.toString();
  });

  describe('createPost', () => {
    it('should create a post with images and caption', async () => {
      const postData = {
        author: userId,
        images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
        caption: 'New post',
        location: 'New York',
      };

      const post = await PostService.createPost(postData);

      expect(post.author.toString()).toBe(userId);
      expect(post.images).toHaveLength(2);
      expect(post.caption).toBe('New post');
      expect(post.location).toBe('New York');
      expect(post.likesCount).toBe(0);
      expect(post.commentsCount).toBe(0);
    });

    it('should create a post without caption and location', async () => {
      const postData = {
        author: userId,
        images: ['https://example.com/image1.jpg'],
      };

      const post = await PostService.createPost(postData);

      expect(post.author.toString()).toBe(userId);
      expect(post.images).toHaveLength(1);
      expect(post.caption).toBeUndefined();
      expect(post.location).toBeUndefined();
    });
  });

  describe('getPostById', () => {
    it('should get a post by id with author details', async () => {
      const post = await PostService.getPostById(postId);

      expect(post._id.toString()).toBe(postId);
      expect(post.author).toBeDefined();
      expect(post.author.username).toBe('testuser');
      expect(post.images).toHaveLength(1);
    });

    it('should throw NotFoundError if post does not exist', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();

      await expect(PostService.getPostById(fakeId)).rejects.toThrow(NotFoundError);
    });

    it('should include isLiked field when currentUserId is provided', async () => {
      const post = await PostService.getPostById(postId, userId);

      expect(post.isLiked).toBeDefined();
      expect(post.isLiked).toBe(false);
    });
  });

  describe('getUserPosts', () => {
    it('should get all posts by a user', async () => {
      await Post.create({
        author: userId,
        images: ['https://example.com/image2.jpg'],
        caption: 'Second post',
      });

      const result = await PostService.getUserPosts(userId);

      expect(result.posts).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.pages).toBe(1);
    });

    it('should support pagination', async () => {
      for (let i = 0; i < 15; i++) {
        await Post.create({
          author: userId,
          images: ['https://example.com/image.jpg'],
          caption: `Post ${i}`,
        });
      }

      const page1 = await PostService.getUserPosts(userId, 1, 10);
      expect(page1.posts).toHaveLength(10);
      expect(page1.total).toBe(16);
      expect(page1.pages).toBe(2);

      const page2 = await PostService.getUserPosts(userId, 2, 10);
      expect(page2.posts).toHaveLength(6);
    });

    it('should return empty array for user with no posts', async () => {
      const result = await PostService.getUserPosts(anotherUserId);

      expect(result.posts).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(result.pages).toBe(0);
    });
  });

  describe('getFeedPosts', () => {
    it('should get feed posts', async () => {
      const result = await PostService.getFeedPosts(userId);

      expect(result.posts.length).toBeGreaterThan(0);
      expect(result.total).toBeGreaterThan(0);
    });

    it('should support pagination', async () => {
      for (let i = 0; i < 15; i++) {
        await Post.create({
          author: userId,
          images: ['https://example.com/image.jpg'],
          caption: `Feed post ${i}`,
        });
      }

      const page1 = await PostService.getFeedPosts(userId, 1, 10);
      expect(page1.posts).toHaveLength(10);
      expect(page1.total).toBeGreaterThanOrEqual(16);

      const page2 = await PostService.getFeedPosts(userId, 2, 10);
      expect(page2.posts.length).toBeGreaterThan(0);
    });
  });

  describe('updatePost', () => {
    it('should update a post by the author', async () => {
      const updateData = {
        caption: 'Updated caption',
        location: 'San Francisco',
      };

      const updatedPost = await PostService.updatePost(postId, userId, updateData);

      expect(updatedPost.caption).toBe('Updated caption');
      expect(updatedPost.location).toBe('San Francisco');
    });

    it('should throw NotFoundError if post does not exist', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();

      await expect(
        PostService.updatePost(fakeId, userId, { caption: 'Updated' })
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw ForbiddenError if user is not the author', async () => {
      await expect(
        PostService.updatePost(postId, anotherUserId, { caption: 'Updated' })
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe('deletePost', () => {
    it('should soft delete a post by the author', async () => {
      await PostService.deletePost(postId, userId);

      const foundPost = await Post.findById(postId);
      expect(foundPost).toBeNull();

      await expect(PostService.getPostById(postId)).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError if post does not exist', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();

      await expect(PostService.deletePost(fakeId, userId)).rejects.toThrow(NotFoundError);
    });

    it('should throw ForbiddenError if user is not the author', async () => {
      await expect(PostService.deletePost(postId, anotherUserId)).rejects.toThrow(
        ForbiddenError
      );
    });
  });
});
