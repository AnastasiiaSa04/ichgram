import { Like, ILike } from '../models/Like.model';
import { Post } from '../models/Post.model';
import { NotFoundError, ConflictError } from '../utils/ApiError';
import mongoose from 'mongoose';
import { NotificationService } from './notification.service';
import { NotificationType } from '../models/Notification.model';

export class LikeService {
  static async likePost(postId: string, userId: string): Promise<ILike> {
    const post = await Post.findById(postId);
    if (!post) {
      throw new NotFoundError('Post');
    }

    const existingLike = await Like.findOne({ post: postId, user: userId });
    if (existingLike) {
      throw new ConflictError('Post already liked');
    }

    const like = await Like.create({ post: postId, user: userId });

    await Post.findByIdAndUpdate(postId, { $inc: { likesCount: 1 } });

    await NotificationService.createNotification({
      recipient: post.author.toString(),
      sender: userId,
      type: NotificationType.LIKE,
      post: postId,
    });

    return like;
  }

  static async unlikePost(postId: string, userId: string): Promise<void> {
    const post = await Post.findById(postId);
    if (!post) {
      throw new NotFoundError('Post');
    }

    const like = await Like.findOneAndDelete({ post: postId, user: userId });
    if (!like) {
      throw new NotFoundError('Like');
    }

    await Post.findByIdAndUpdate(postId, { $inc: { likesCount: -1 } });
  }

  static async getPostLikes(
    postId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    likes: Array<{
      _id: mongoose.Types.ObjectId;
      user: {
        _id: mongoose.Types.ObjectId;
        username: string;
        avatar?: string;
      };
      createdAt: Date;
    }>;
    total: number;
    pages: number;
  }> {
    const post = await Post.findById(postId);
    if (!post) {
      throw new NotFoundError('Post');
    }

    const skip = (page - 1) * limit;

    const likes = await Like.find({ post: postId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'username avatar')
      .lean();

    const total = await Like.countDocuments({ post: postId });
    const pages = Math.ceil(total / limit);

    const formattedLikes = likes.map((like) => ({
      _id: like._id,
      user: {
        _id: (like.user as any)._id,
        username: (like.user as any).username,
        avatar: (like.user as any).avatar,
      },
      createdAt: like.createdAt,
    }));

    return { likes: formattedLikes, total, pages };
  }

  static async checkUserLiked(postId: string, userId: string): Promise<boolean> {
    const like = await Like.findOne({ post: postId, user: userId });
    return !!like;
  }
}
