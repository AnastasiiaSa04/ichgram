import { UserBasic } from './user.types';

export interface Post {
  _id: string;
  userId: string | UserBasic;
  caption?: string;
  imageUrl: string;
  likesCount: number;
  commentsCount: number;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PostWithUser extends Omit<Post, 'userId'> {
  userId: UserBasic;
  isLiked?: boolean;
}
