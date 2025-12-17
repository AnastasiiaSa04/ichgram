import { User } from '../models/User.model';
import { Post } from '../models/Post.model';
import mongoose, { FlattenMaps } from 'mongoose';

interface SearchUsersResult {
  _id: mongoose.Types.ObjectId;
  username: string;
  fullName?: string;
  avatar?: string;
}

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

export class SearchService {
  static async searchUsers(
    query: string,
    limit: number = 10
  ): Promise<SearchUsersResult[]> {
    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { fullName: { $regex: query, $options: 'i' } },
      ],
    })
      .select('username fullName avatar')
      .limit(limit)
      .lean();

    return users;
  }

  static async searchPosts(
    query: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    posts: PopulatedPost[];
    total: number;
    pages: number;
  }> {
    const skip = (page - 1) * limit;

    const rawPosts = await Post.find({
      $or: [
        { caption: { $regex: query, $options: 'i' } },
        { location: { $regex: query, $options: 'i' } },
      ],
    })
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

    const total = await Post.countDocuments({
      $or: [
        { caption: { $regex: query, $options: 'i' } },
        { location: { $regex: query, $options: 'i' } },
      ],
    });

    const pages = Math.ceil(total / limit);

    return { posts, total, pages };
  }

  static async globalSearch(query: string, limit: number = 5) {
    const [users, postsResult] = await Promise.all([
      this.searchUsers(query, limit),
      this.searchPosts(query, 1, limit),
    ]);

    return {
      users,
      posts: postsResult.posts,
      totalUsers: users.length,
      totalPosts: postsResult.total,
    };
  }
}
