import { Post, IPost } from '../models/Post.model';
import { NotFoundError, ForbiddenError } from '../utils/ApiError';
import mongoose, { FlattenMaps } from 'mongoose';

interface CreatePostData {
  author: string;
  images: string[];
  caption?: string;
  location?: string;
}

interface UpdatePostData {
  caption?: string;
  location?: string;
}

type LeanPost = FlattenMaps<IPost> & { _id: mongoose.Types.ObjectId };

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

interface PostWithDetails {
  _id: mongoose.Types.ObjectId;
  author: {
    _id: mongoose.Types.ObjectId;
    username: string;
    avatar?: string;
  };
  images: string[];
  caption?: string;
  location?: string;
  likesCount: number;
  commentsCount: number;
  createdAt: Date;
  updatedAt: Date;
  isLiked?: boolean;
}

export class PostService {
  static async createPost(data: CreatePostData): Promise<IPost> {
    const post = await Post.create(data);
    return post;
  }

  static async getPostById(postId: string, currentUserId?: string): Promise<PostWithDetails> {
    const post = (await Post.findById(postId)
      .populate('author', 'username avatar')
      .lean()) as PopulatedPost | null;

    if (!post) {
      throw new NotFoundError('Post');
    }

    const postWithDetails: PostWithDetails = {
      _id: post._id,
      author: {
        _id: post.author._id,
        username: post.author.username,
        avatar: post.author.avatar,
      },
      images: post.images,
      caption: post.caption,
      location: post.location,
      likesCount: post.likesCount,
      commentsCount: post.commentsCount,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      isLiked: false,
    };

    if (currentUserId) {
      postWithDetails.isLiked = false;
    }

    return postWithDetails;
  }

  static async getUserPosts(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ posts: LeanPost[]; total: number; pages: number }> {
    const skip = (page - 1) * limit;

    const posts = await Post.find({ author: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username avatar')
      .lean();

    const total = await Post.countDocuments({ author: userId });
    const pages = Math.ceil(total / limit);

    return { posts, total, pages };
  }

  static async getFeedPosts(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ posts: LeanPost[]; total: number; pages: number }> {
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username avatar')
      .lean();

    const total = await Post.countDocuments();
    const pages = Math.ceil(total / limit);

    return { posts, total, pages };
  }

  static async updatePost(
    postId: string,
    userId: string,
    data: UpdatePostData
  ): Promise<IPost> {
    const post = await Post.findById(postId);

    if (!post) {
      throw new NotFoundError('Post');
    }

    if (post.author.toString() !== userId) {
      throw new ForbiddenError('You can only update your own posts');
    }

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $set: data },
      { new: true, runValidators: true }
    ).populate('author', 'username avatar');

    if (!updatedPost) {
      throw new NotFoundError('Post');
    }

    return updatedPost;
  }

  static async deletePost(postId: string, userId: string): Promise<void> {
    const post = await Post.findById(postId);

    if (!post) {
      throw new NotFoundError('Post');
    }

    if (post.author.toString() !== userId) {
      throw new ForbiddenError('You can only delete your own posts');
    }

    await Post.findByIdAndUpdate(postId, { $set: { isDeleted: true } });
  }
}
