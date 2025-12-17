import { User, IUser } from '../models/User.model';
import { NotFoundError } from '../utils/ApiError';
import mongoose, { FlattenMaps } from 'mongoose';
import { FollowService } from './follow.service';

interface UpdateProfileData {
  fullName?: string;
  bio?: string;
  avatar?: string;
}

type LeanUser = FlattenMaps<IUser> & { _id: mongoose.Types.ObjectId };

interface UserProfile {
  _id: mongoose.Types.ObjectId;
  username: string;
  email: string;
  fullName?: string;
  bio?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  postsCount: number;
  followersCount: number;
  followingCount: number;
  isFollowing?: boolean;
}

export class UserService {
  static async getUserById(userId: string): Promise<LeanUser> {
    const user = await User.findById(userId).select('-password').lean();

    if (!user) {
      throw new NotFoundError('User');
    }

    return user;
  }

  static async updateProfile(userId: string, data: UpdateProfileData): Promise<IUser> {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: data },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      throw new NotFoundError('User');
    }

    return user;
  }

  static async getUserProfile(
    userId: string,
    currentUserId?: string
  ): Promise<UserProfile> {
    const user = await User.findById(userId).select('-password').lean();

    if (!user) {
      throw new NotFoundError('User');
    }

    const postsCount = 0;
    let isFollowing = false;

    if (currentUserId && currentUserId !== userId) {
      isFollowing = await FollowService.checkFollowing(currentUserId, userId);
    }

    const userProfile: UserProfile = {
      _id: user._id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      bio: user.bio,
      avatar: user.avatar,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      postsCount,
      followersCount: user.followersCount,
      followingCount: user.followingCount,
      isFollowing,
    };

    return userProfile;
  }

  static async searchUsers(
    query: string,
    limit: number = 10
  ): Promise<Array<{ username: string; fullName?: string; avatar?: string; _id: mongoose.Types.ObjectId }>> {
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

  static async updateAvatar(userId: string, avatarUrl: string): Promise<IUser> {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { avatar: avatarUrl } },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      throw new NotFoundError('User');
    }

    return user;
  }
}
