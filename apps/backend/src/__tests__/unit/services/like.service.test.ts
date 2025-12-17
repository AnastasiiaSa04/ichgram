import { LikeService } from '../../../services/like.service';
import { Like } from '../../../models/Like.model';
import { Post } from '../../../models/Post.model';
import { User } from '../../../models/User.model';
import { NotFoundError, ConflictError } from '../../../utils/ApiError';
import mongoose from 'mongoose';

describe('LikeService', () => {
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

  describe('likePost', () => {
    it('should like a post', async () => {
      const like = await LikeService.likePost(postId, userId);

      expect(like.post.toString()).toBe(postId);
      expect(like.user.toString()).toBe(userId);

      const updatedPost = await Post.findById(postId);
      expect(updatedPost?.likesCount).toBe(1);
    });

    it('should throw NotFoundError if post does not exist', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();

      await expect(LikeService.likePost(fakeId, userId)).rejects.toThrow(NotFoundError);
    });

    it('should throw ConflictError if post already liked', async () => {
      await LikeService.likePost(postId, userId);

      await expect(LikeService.likePost(postId, userId)).rejects.toThrow(ConflictError);
    });
  });

  describe('unlikePost', () => {
    beforeEach(async () => {
      await LikeService.likePost(postId, userId);
    });

    it('should unlike a post', async () => {
      await LikeService.unlikePost(postId, userId);

      const like = await Like.findOne({ post: postId, user: userId });
      expect(like).toBeNull();

      const updatedPost = await Post.findById(postId);
      expect(updatedPost?.likesCount).toBe(0);
    });

    it('should throw NotFoundError if post does not exist', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();

      await expect(LikeService.unlikePost(fakeId, userId)).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError if post not liked', async () => {
      await expect(LikeService.unlikePost(postId, anotherUserId)).rejects.toThrow(
        NotFoundError
      );
    });
  });

  describe('getPostLikes', () => {
    beforeEach(async () => {
      await LikeService.likePost(postId, userId);
      await LikeService.likePost(postId, anotherUserId);
    });

    it('should get all likes for a post', async () => {
      const result = await LikeService.getPostLikes(postId);

      expect(result.likes).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.pages).toBe(1);
    });

    it('should support pagination', async () => {
      const result = await LikeService.getPostLikes(postId, 1, 1);

      expect(result.likes).toHaveLength(1);
      expect(result.total).toBe(2);
      expect(result.pages).toBe(2);
    });

    it('should throw NotFoundError if post does not exist', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();

      await expect(LikeService.getPostLikes(fakeId)).rejects.toThrow(NotFoundError);
    });

    it('should return empty array for post with no likes', async () => {
      const newPost = await Post.create({
        author: userId,
        images: ['https://example.com/image2.jpg'],
      });

      const result = await LikeService.getPostLikes(newPost._id.toString());

      expect(result.likes).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  describe('checkUserLiked', () => {
    it('should return true if user liked the post', async () => {
      await LikeService.likePost(postId, userId);

      const isLiked = await LikeService.checkUserLiked(postId, userId);
      expect(isLiked).toBe(true);
    });

    it('should return false if user did not like the post', async () => {
      const isLiked = await LikeService.checkUserLiked(postId, userId);
      expect(isLiked).toBe(false);
    });
  });
});
