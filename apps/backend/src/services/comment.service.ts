import { Comment, IComment } from '../models/Comment.model';
import { Post } from '../models/Post.model';
import { CommentLike } from '../models/CommentLike.model';
import { NotFoundError, ForbiddenError } from '../utils/ApiError';
import mongoose, { FlattenMaps } from 'mongoose';
import { NotificationService } from './notification.service';
import { NotificationType } from '../models/Notification.model';
import { CommentLikeService } from './commentLike.service';
import { io } from '../config/socket';

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
  likesCount: number;
  isLiked: boolean;
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

      const parentComment = await Comment.findById(data.parentComment);
      if (parentComment) {
        await NotificationService.createNotification({
          recipient: parentComment.author.toString(),
          sender: data.author,
          type: NotificationType.COMMENT_REPLY,
          post: data.post,
          comment: comment._id.toString(),
        });
      }
    } else {
      await NotificationService.createNotification({
        recipient: post.author.toString(),
        sender: data.author,
        type: NotificationType.COMMENT,
        post: data.post,
        comment: comment._id.toString(),
      });
    }

    const populatedComment = await comment.populate('author', 'username avatar');

    io.emit('comment:new', {
      postId: data.post,
      comment: {
        _id: populatedComment._id,
        post: populatedComment.post,
        author: {
          _id: (populatedComment.author as any)._id,
          username: (populatedComment.author as any).username,
          avatar: (populatedComment.author as any).avatar,
        },
        content: populatedComment.content,
        parentComment: populatedComment.parentComment,
        repliesCount: populatedComment.repliesCount,
        likesCount: populatedComment.likesCount || 0,
        isLiked: false,
        createdAt: populatedComment.createdAt,
        updatedAt: populatedComment.updatedAt,
      },
    });

    return populatedComment;
  }

  static async getCommentById(commentId: string, currentUserId?: string): Promise<PopulatedComment> {
    const rawComment = await Comment.findById(commentId)
      .populate('author', 'username avatar')
      .lean();

    if (!rawComment) {
      throw new NotFoundError('Comment');
    }

    const comment: PopulatedComment = {
      _id: rawComment._id,
      post: rawComment.post,
      author: {
        _id: (rawComment.author as any)._id,
        username: (rawComment.author as any).username,
        avatar: (rawComment.author as any).avatar,
      },
      content: rawComment.content,
      parentComment: rawComment.parentComment,
      repliesCount: rawComment.repliesCount,
      likesCount: rawComment.likesCount || 0,
      isLiked: currentUserId ? await CommentLikeService.checkUserLiked(commentId, currentUserId) : false,
      createdAt: rawComment.createdAt,
      updatedAt: rawComment.updatedAt,
    };

    return comment;
  }

  static async getPostComments(
    postId: string,
    page: number = 1,
    limit: number = 20,
    currentUserId?: string
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

    const rawComments = await Comment.find({ post: postId, parentComment: null })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username avatar')
      .lean();

    const comments: PopulatedComment[] = await Promise.all(
      rawComments.map(async (comment) => {
        const isLiked = currentUserId
          ? !!(await CommentLike.findOne({ comment: comment._id, user: currentUserId }))
          : false;

        return {
          _id: comment._id,
          post: comment.post,
          author: {
            _id: (comment.author as any)._id,
            username: (comment.author as any).username,
            avatar: (comment.author as any).avatar,
          },
          content: comment.content,
          parentComment: comment.parentComment,
          repliesCount: comment.repliesCount,
          likesCount: comment.likesCount || 0,
          isLiked,
          createdAt: comment.createdAt,
          updatedAt: comment.updatedAt,
        };
      })
    );

    const total = await Comment.countDocuments({ post: postId, parentComment: null });
    const pages = Math.ceil(total / limit);

    return { comments, total, pages };
  }

  static async getCommentReplies(
    commentId: string,
    page: number = 1,
    limit: number = 10,
    currentUserId?: string
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

    const rawReplies = await Comment.find({ parentComment: commentId })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username avatar')
      .lean();

    const repliesWithLikes = await Promise.all(
      rawReplies.map(async (reply) => ({
        _id: reply._id,
        post: reply.post,
        author: {
          _id: (reply.author as any)._id,
          username: (reply.author as any).username,
          avatar: (reply.author as any).avatar,
        },
        content: reply.content,
        parentComment: reply.parentComment,
        repliesCount: reply.repliesCount,
        likesCount: reply.likesCount || 0,
        isLiked: currentUserId ? await CommentLikeService.checkUserLiked(reply._id.toString(), currentUserId) : false,
        createdAt: reply.createdAt,
        updatedAt: reply.updatedAt,
      }))
    );

    const total = await Comment.countDocuments({ parentComment: commentId });
    const pages = Math.ceil(total / limit);

    return { replies: repliesWithLikes, total, pages };
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

    io.emit('comment:update', {
      commentId,
      postId: updatedComment.post.toString(),
      content: updatedComment.content,
      updatedAt: updatedComment.updatedAt,
    });

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

    io.emit('comment:delete', {
      commentId,
      postId: comment.post.toString(),
      parentComment: comment.parentComment?.toString(),
    });
  }
}
