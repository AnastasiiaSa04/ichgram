import { Post } from '../models/Post.model';
import mongoose from 'mongoose';

interface PopulatedAuthor {
  _id: mongoose.Types.ObjectId;
  username: string;
  avatar?: string;
}

interface PopulatedPost {
  _id: mongoose.Types.ObjectId;
  author: PopulatedAuthor;
  images: string[];
  caption?: string;
  location?: string;
  likesCount: number;
  commentsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export class ExploreService {
  static async getTrendingPosts(
    page: number = 1,
    limit: number = 20
  ): Promise<{
    posts: PopulatedPost[];
    total: number;
    pages: number;
  }> {
    const skip = (page - 1) * limit;

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const rawPosts = await Post.find({ createdAt: { $gte: oneDayAgo } })
      .sort({ likesCount: -1, commentsCount: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username avatar')
      .lean();

    const posts: PopulatedPost[] = rawPosts.map((post) => ({
      _id: post._id,
      author: {
        _id: (post.author as any)._id,
        username: (post.author as any).username,
        avatar: (post.author as any).avatar,
      },
      images: post.images,
      caption: post.caption,
      location: post.location,
      likesCount: post.likesCount,
      commentsCount: post.commentsCount,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    }));

    const total = await Post.countDocuments({ createdAt: { $gte: oneDayAgo } });
    const pages = Math.ceil(total / limit);

    return { posts, total, pages };
  }

  static async getPopularPosts(
    page: number = 1,
    limit: number = 20
  ): Promise<{
    posts: PopulatedPost[];
    total: number;
    pages: number;
  }> {
    const skip = (page - 1) * limit;

    const rawPosts = await Post.find()
      .sort({ likesCount: -1, commentsCount: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username avatar')
      .lean();

    const posts: PopulatedPost[] = rawPosts.map((post) => ({
      _id: post._id,
      author: {
        _id: (post.author as any)._id,
        username: (post.author as any).username,
        avatar: (post.author as any).avatar,
      },
      images: post.images,
      caption: post.caption,
      location: post.location,
      likesCount: post.likesCount,
      commentsCount: post.commentsCount,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    }));

    const total = await Post.countDocuments();
    const pages = Math.ceil(total / limit);

    return { posts, total, pages };
  }

  static async getRecentPosts(
    page: number = 1,
    limit: number = 20
  ): Promise<{
    posts: PopulatedPost[];
    total: number;
    pages: number;
  }> {
    const skip = (page - 1) * limit;

    const rawPosts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username avatar')
      .lean();

    const posts: PopulatedPost[] = rawPosts.map((post) => ({
      _id: post._id,
      author: {
        _id: (post.author as any)._id,
        username: (post.author as any).username,
        avatar: (post.author as any).avatar,
      },
      images: post.images,
      caption: post.caption,
      location: post.location,
      likesCount: post.likesCount,
      commentsCount: post.commentsCount,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    }));

    const total = await Post.countDocuments();
    const pages = Math.ceil(total / limit);

    return { posts, total, pages };
  }
}
