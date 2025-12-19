import { CommentLike, ICommentLike } from '../models/CommentLike.model';
import { Comment } from '../models/Comment.model';
import { NotFoundError, ConflictError } from '../utils/ApiError';
import { io } from '../config/socket';
import { NotificationService } from './notification.service';
import { NotificationType } from '../models/Notification.model';

export class CommentLikeService {
  static async likeComment(commentId: string, userId: string): Promise<ICommentLike> {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new NotFoundError('Comment');
    }

    const existingLike = await CommentLike.findOne({ comment: commentId, user: userId });
    if (existingLike) {
      throw new ConflictError('Comment already liked');
    }

    const like = await CommentLike.create({ comment: commentId, user: userId });

    await Comment.findByIdAndUpdate(commentId, { $inc: { likesCount: 1 } });

    // Create notification for comment like
    await NotificationService.createNotification({
      recipient: comment.author.toString(),
      sender: userId,
      type: NotificationType.COMMENT_LIKE,
      post: comment.post.toString(),
      comment: commentId,
    });

    io.emit('comment:like', {
      commentId,
      userId,
      likesCount: comment.likesCount + 1,
      postId: comment.post.toString(),
    });

    return like;
  }

  static async unlikeComment(commentId: string, userId: string): Promise<void> {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new NotFoundError('Comment');
    }

    const like = await CommentLike.findOneAndDelete({ comment: commentId, user: userId });
    if (!like) {
      throw new NotFoundError('Like');
    }

    await Comment.findByIdAndUpdate(commentId, { $inc: { likesCount: -1 } });

    // Delete the comment like notification
    await NotificationService.deleteNotificationByAction({
      recipient: comment.author.toString(),
      sender: userId,
      type: NotificationType.COMMENT_LIKE,
      comment: commentId,
    });

    io.emit('comment:unlike', {
      commentId,
      userId,
      likesCount: comment.likesCount - 1,
      postId: comment.post.toString(),
    });
  }

  static async checkUserLiked(commentId: string, userId: string): Promise<boolean> {
    const like = await CommentLike.findOne({ comment: commentId, user: userId });
    return !!like;
  }
}




