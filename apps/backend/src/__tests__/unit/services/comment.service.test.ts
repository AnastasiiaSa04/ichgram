import { CommentService } from '../../../services/comment.service';
import { Comment } from '../../../models/Comment.model';
import { Post } from '../../../models/Post.model';
import { User } from '../../../models/User.model';
import { NotFoundError, ForbiddenError } from '../../../utils/ApiError';
import mongoose from 'mongoose';

describe('CommentService', () => {
  let userId: string;
  let postId: string;
  let commentId: string;
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

    const comment = await Comment.create({
      post: postId,
      author: userId,
      content: 'Test comment',
    });
    commentId = comment._id.toString();

    await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });
  });

  describe('createComment', () => {
    it('should create a comment', async () => {
      const comment = await CommentService.createComment({
        post: postId,
        author: userId,
        content: 'New comment',
      });

      expect(comment.post.toString()).toBe(postId);
      expect(comment.author._id.toString()).toBe(userId);
      expect(comment.content).toBe('New comment');

      const updatedPost = await Post.findById(postId);
      expect(updatedPost?.commentsCount).toBe(2);
    });

    it('should create a reply to a comment', async () => {
      const reply = await CommentService.createComment({
        post: postId,
        author: anotherUserId,
        content: 'Reply to comment',
        parentComment: commentId,
      });

      expect(reply.parentComment?.toString()).toBe(commentId);

      const parentComment = await Comment.findById(commentId);
      expect(parentComment?.repliesCount).toBe(1);
    });

    it('should throw NotFoundError if post does not exist', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();

      await expect(
        CommentService.createComment({
          post: fakeId,
          author: userId,
          content: 'Comment',
        })
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError if parent comment does not exist', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();

      await expect(
        CommentService.createComment({
          post: postId,
          author: userId,
          content: 'Reply',
          parentComment: fakeId,
        })
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw ForbiddenError if parent comment belongs to different post', async () => {
      const anotherPost = await Post.create({
        author: userId,
        images: ['https://example.com/image2.jpg'],
      });

      await expect(
        CommentService.createComment({
          post: anotherPost._id.toString(),
          author: userId,
          content: 'Reply',
          parentComment: commentId,
        })
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe('getCommentById', () => {
    it('should get a comment by id', async () => {
      const comment = await CommentService.getCommentById(commentId);

      expect(comment._id.toString()).toBe(commentId);
      expect(comment.content).toBe('Test comment');
    });

    it('should throw NotFoundError if comment does not exist', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();

      await expect(CommentService.getCommentById(fakeId)).rejects.toThrow(NotFoundError);
    });
  });

  describe('getPostComments', () => {
    beforeEach(async () => {
      await Comment.create({
        post: postId,
        author: anotherUserId,
        content: 'Another comment',
      });
    });

    it('should get all top-level comments for a post', async () => {
      const result = await CommentService.getPostComments(postId);

      expect(result.comments).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('should not include replies in top-level comments', async () => {
      await Comment.create({
        post: postId,
        author: anotherUserId,
        content: 'Reply',
        parentComment: commentId,
      });

      const result = await CommentService.getPostComments(postId);

      expect(result.comments).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('should support pagination', async () => {
      const result = await CommentService.getPostComments(postId, 1, 1);

      expect(result.comments).toHaveLength(1);
      expect(result.total).toBe(2);
      expect(result.pages).toBe(2);
    });

    it('should throw NotFoundError if post does not exist', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();

      await expect(CommentService.getPostComments(fakeId)).rejects.toThrow(NotFoundError);
    });
  });

  describe('getCommentReplies', () => {
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
      const result = await CommentService.getCommentReplies(commentId);

      expect(result.replies).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('should support pagination', async () => {
      const result = await CommentService.getCommentReplies(commentId, 1, 1);

      expect(result.replies).toHaveLength(1);
      expect(result.total).toBe(2);
      expect(result.pages).toBe(2);
    });

    it('should throw NotFoundError if comment does not exist', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();

      await expect(CommentService.getCommentReplies(fakeId)).rejects.toThrow(NotFoundError);
    });
  });

  describe('updateComment', () => {
    it('should update a comment by the author', async () => {
      const updatedComment = await CommentService.updateComment(commentId, userId, {
        content: 'Updated content',
      });

      expect(updatedComment.content).toBe('Updated content');
    });

    it('should throw NotFoundError if comment does not exist', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();

      await expect(
        CommentService.updateComment(fakeId, userId, { content: 'Updated' })
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw ForbiddenError if user is not the author', async () => {
      await expect(
        CommentService.updateComment(commentId, anotherUserId, { content: 'Updated' })
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe('deleteComment', () => {
    it('should soft delete a comment by the author', async () => {
      await CommentService.deleteComment(commentId, userId);

      const foundComment = await Comment.findById(commentId);
      expect(foundComment).toBeNull();

      const updatedPost = await Post.findById(postId);
      expect(updatedPost?.commentsCount).toBe(0);
    });

    it('should decrement repliesCount when deleting a reply', async () => {
      const reply = await Comment.create({
        post: postId,
        author: anotherUserId,
        content: 'Reply',
        parentComment: commentId,
      });

      await Comment.findByIdAndUpdate(commentId, { $inc: { repliesCount: 1 } });
      await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });

      await CommentService.deleteComment(reply._id.toString(), anotherUserId);

      const parentComment = await Comment.findById(commentId);
      expect(parentComment?.repliesCount).toBe(0);
    });

    it('should throw NotFoundError if comment does not exist', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();

      await expect(CommentService.deleteComment(fakeId, userId)).rejects.toThrow(
        NotFoundError
      );
    });

    it('should throw ForbiddenError if user is not the author', async () => {
      await expect(CommentService.deleteComment(commentId, anotherUserId)).rejects.toThrow(
        ForbiddenError
      );
    });
  });
});
