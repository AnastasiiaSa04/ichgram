import { UserBasic } from './user.types';

export interface Post {
  _id: string;
  author: string | UserBasic;
  caption?: string;
  images: string[];
  location?: string;
  likesCount: number;
  commentsCount: number;
  isDeleted?: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PostWithUser extends Omit<Post, 'author'> {
  author: UserBasic;
  isLiked?: boolean;
  isFollowing?: boolean;
}
