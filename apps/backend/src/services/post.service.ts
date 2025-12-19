import { Post, IPost } from '../models/Post.model';
import { NotFoundError, ForbiddenError } from '../utils/ApiError';
import mongoose, { FlattenMaps } from 'mongoose';
import { LikeService } from './like.service';
import { FollowService } from './follow.service';

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
  isFollowing?: boolean;
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
      postWithDetails.isLiked = await LikeService.checkUserLiked(postId, currentUserId);
    }

    return postWithDetails;
  }

  static async getUserPosts(
    userId: string,
    page: number = 1,
    limit: number = 10,
    currentUserId?: string
  ): Promise<{ posts: PostWithDetails[]; total: number; pages: number }> {
    const skip = (page - 1) * limit;

    const posts = (await Post.find({ author: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username avatar')
      .lean()) as unknown as PopulatedPost[];

    const total = await Post.countDocuments({ author: userId });
    const pages = Math.ceil(total / limit);

    const postsWithLikes = await Promise.all(
      posts.map(async (post) => ({
        ...post,
        isLiked: currentUserId ? await LikeService.checkUserLiked(post._id.toString(), currentUserId) : false,
        isFollowing: currentUserId && currentUserId !== post.author._id.toString()
          ? await FollowService.checkFollowing(currentUserId, post.author._id.toString())
          : false,
      }))
    );

    return { posts: postsWithLikes, total, pages };
  }

  static async getFeedPosts(
    currentUserId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ posts: PostWithDetails[]; total: number; pages: number }> {
    const skip = (page - 1) * limit;

    const followingIds = await FollowService.getFollowingIds(currentUserId);
    const feedAuthorIds = [currentUserId, ...followingIds];

    const posts = (await Post.find({ author: { $in: feedAuthorIds } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username avatar')
      .lean()) as unknown as PopulatedPost[];

    const total = await Post.countDocuments({ author: { $in: feedAuthorIds } });
    const pages = Math.ceil(total / limit);

    const postsWithLikes = await Promise.all(
      posts.map(async (post) => ({
        ...post,
        isLiked: await LikeService.checkUserLiked(post._id.toString(), currentUserId),
        isFollowing: currentUserId !== post.author._id.toString()
          ? await FollowService.checkFollowing(currentUserId, post.author._id.toString())
          : false,
      }))
    );

    return { posts: postsWithLikes, total, pages };
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
