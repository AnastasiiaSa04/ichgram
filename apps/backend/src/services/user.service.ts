import { User, IUser } from '../models/User.model';
import { NotFoundError } from '../utils/ApiError';
import mongoose from 'mongoose';

interface UpdateProfileData {
  fullName?: string;
  bio?: string;
  avatar?: string;
}

interface UserProfile extends Omit<IUser, 'password'> {
  postsCount: number;
  followersCount: number;
  followingCount: number;
  isFollowing?: boolean;
}

export class UserService {
  static async getUserById(userId: string): Promise<IUser> {
    const user = await User.findById(userId).select('-password').lean();

    if (!user) {
      throw new NotFoundError('User');
    }

    return user as IUser;
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
  ): Promise<Partial<UserProfile>> {
    const user = await User.findById(userId).select('-password').lean();

    if (!user) {
      throw new NotFoundError('User');
    }

    const postsCount = 0;
    const followersCount = 0;
    const followingCount = 0;
    let isFollowing = false;

    if (currentUserId) {
      isFollowing = false;
    }

    return {
      ...user,
      postsCount,
      followersCount,
      followingCount,
      isFollowing,
    } as Partial<UserProfile>;
  }

  static async searchUsers(query: string, limit: number = 10): Promise<IUser[]> {
    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { fullName: { $regex: query, $options: 'i' } },
      ],
    })
      .select('username fullName avatar')
      .limit(limit)
      .lean();

    return users as IUser[];
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
