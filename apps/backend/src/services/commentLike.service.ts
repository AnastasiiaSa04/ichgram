import { CommentLike, ICommentLike } from '../models/CommentLike.model';
import { Comment } from '../models/Comment.model';
import { NotFoundError, ConflictError } from '../utils/ApiError';

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
  }

  static async checkUserLiked(commentId: string, userId: string): Promise<boolean> {
    const like = await CommentLike.findOne({ comment: commentId, user: userId });
    return !!like;
  }
}

