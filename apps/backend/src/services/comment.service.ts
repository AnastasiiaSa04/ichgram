import { Comment, IComment } from '../models/Comment.model';
import { Post } from '../models/Post.model';
import { NotFoundError, ForbiddenError } from '../utils/ApiError';
import mongoose, { FlattenMaps } from 'mongoose';

interface CreateCommentData {
  post: string;
  author: string;
  content: string;
  parentComment?: string;
}

interface UpdateCommentData {
  content: string;
}

interface PopulatedAuthor {
  _id: mongoose.Types.ObjectId;
  username: string;
  avatar?: string;
}

interface PopulatedComment {
  _id: mongoose.Types.ObjectId;
  post: mongoose.Types.ObjectId;
  author: PopulatedAuthor;
  content: string;
  parentComment?: mongoose.Types.ObjectId;
  repliesCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export class CommentService {
  static async createComment(data: CreateCommentData): Promise<IComment> {
    const post = await Post.findById(data.post);
    if (!post) {
      throw new NotFoundError('Post');
    }

    if (data.parentComment) {
      const parentComment = await Comment.findById(data.parentComment);
      if (!parentComment) {
        throw new NotFoundError('Parent comment');
      }
      if (parentComment.post.toString() !== data.post) {
        throw new ForbiddenError('Parent comment does not belong to this post');
      }
    }

    const comment = await Comment.create(data);

    await Post.findByIdAndUpdate(data.post, { $inc: { commentsCount: 1 } });

    if (data.parentComment) {
      await Comment.findByIdAndUpdate(data.parentComment, { $inc: { repliesCount: 1 } });
    }

    return comment.populate('author', 'username avatar');
  }

  static async getCommentById(commentId: string): Promise<PopulatedComment> {
    const comment = (await Comment.findById(commentId)
      .populate('author', 'username avatar')
      .lean()) as PopulatedComment | null;

    if (!comment) {
      throw new NotFoundError('Comment');
    }

    return comment;
  }

  static async getPostComments(
    postId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    comments: PopulatedComment[];
    total: number;
    pages: number;
  }> {
    const post = await Post.findById(postId);
    if (!post) {
      throw new NotFoundError('Post');
    }

    const skip = (page - 1) * limit;

    const comments = (await Comment.find({ post: postId, parentComment: null })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username avatar')
      .lean()) as PopulatedComment[];

    const total = await Comment.countDocuments({ post: postId, parentComment: null });
    const pages = Math.ceil(total / limit);

    return { comments, total, pages };
  }

  static async getCommentReplies(
    commentId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    replies: PopulatedComment[];
    total: number;
    pages: number;
  }> {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new NotFoundError('Comment');
    }

    const skip = (page - 1) * limit;

    const replies = (await Comment.find({ parentComment: commentId })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username avatar')
      .lean()) as PopulatedComment[];

    const total = await Comment.countDocuments({ parentComment: commentId });
    const pages = Math.ceil(total / limit);

    return { replies, total, pages };
  }

  static async updateComment(
    commentId: string,
    userId: string,
    data: UpdateCommentData
  ): Promise<IComment> {
    const comment = await Comment.findById(commentId);

    if (!comment) {
      throw new NotFoundError('Comment');
    }

    if (comment.author.toString() !== userId) {
      throw new ForbiddenError('You can only update your own comments');
    }

    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      { $set: data },
      { new: true, runValidators: true }
    ).populate('author', 'username avatar');

    if (!updatedComment) {
      throw new NotFoundError('Comment');
    }

    return updatedComment;
  }

  static async deleteComment(commentId: string, userId: string): Promise<void> {
    const comment = await Comment.findById(commentId);

    if (!comment) {
      throw new NotFoundError('Comment');
    }

    if (comment.author.toString() !== userId) {
      throw new ForbiddenError('You can only delete your own comments');
    }

    await Comment.findByIdAndUpdate(commentId, { $set: { isDeleted: true } });

    await Post.findByIdAndUpdate(comment.post, { $inc: { commentsCount: -1 } });

    if (comment.parentComment) {
      await Comment.findByIdAndUpdate(comment.parentComment, { $inc: { repliesCount: -1 } });
    }
  }
}
