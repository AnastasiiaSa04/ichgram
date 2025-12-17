import { Follow, IFollow } from '../models/Follow.model';
import { User } from '../models/User.model';
import { NotFoundError, ConflictError, ForbiddenError } from '../utils/ApiError';
import mongoose from 'mongoose';

interface UserProfile {
  _id: mongoose.Types.ObjectId;
  username: string;
  fullName?: string;
  avatar?: string;
}

export class FollowService {
  static async followUser(followerId: string, followingId: string): Promise<IFollow> {
    if (followerId === followingId) {
      throw new ForbiddenError('You cannot follow yourself');
    }

    const followingUser = await User.findById(followingId);
    if (!followingUser) {
      throw new NotFoundError('User');
    }

    const existingFollow = await Follow.findOne({
      follower: followerId,
      following: followingId,
    });
    if (existingFollow) {
      throw new ConflictError('Already following this user');
    }

    const follow = await Follow.create({
      follower: followerId,
      following: followingId,
    });

    await User.findByIdAndUpdate(followerId, { $inc: { followingCount: 1 } });
    await User.findByIdAndUpdate(followingId, { $inc: { followersCount: 1 } });

    return follow;
  }

  static async unfollowUser(followerId: string, followingId: string): Promise<void> {
    if (followerId === followingId) {
      throw new ForbiddenError('You cannot unfollow yourself');
    }

    const followingUser = await User.findById(followingId);
    if (!followingUser) {
      throw new NotFoundError('User');
    }

    const follow = await Follow.findOneAndDelete({
      follower: followerId,
      following: followingId,
    });

    if (!follow) {
      throw new NotFoundError('Follow relationship');
    }

    await User.findByIdAndUpdate(followerId, { $inc: { followingCount: -1 } });
    await User.findByIdAndUpdate(followingId, { $inc: { followersCount: -1 } });
  }

  static async getFollowers(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    followers: UserProfile[];
    total: number;
    pages: number;
  }> {
    const skip = (page - 1) * limit;

    const follows = await Follow.find({ following: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('follower', 'username fullName avatar')
      .lean();

    const followers: UserProfile[] = follows.map((follow) => ({
      _id: (follow.follower as any)._id,
      username: (follow.follower as any).username,
      fullName: (follow.follower as any).fullName,
      avatar: (follow.follower as any).avatar,
    }));

    const total = await Follow.countDocuments({ following: userId });
    const pages = Math.ceil(total / limit);

    return { followers, total, pages };
  }

  static async getFollowing(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    following: UserProfile[];
    total: number;
    pages: number;
  }> {
    const skip = (page - 1) * limit;

    const follows = await Follow.find({ follower: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('following', 'username fullName avatar')
      .lean();

    const following: UserProfile[] = follows.map((follow) => ({
      _id: (follow.following as any)._id,
      username: (follow.following as any).username,
      fullName: (follow.following as any).fullName,
      avatar: (follow.following as any).avatar,
    }));

    const total = await Follow.countDocuments({ follower: userId });
    const pages = Math.ceil(total / limit);

    return { following, total, pages };
  }

  static async checkFollowing(
    followerId: string,
    followingId: string
  ): Promise<boolean> {
    const follow = await Follow.findOne({
      follower: followerId,
      following: followingId,
    });
    return !!follow;
  }
}
