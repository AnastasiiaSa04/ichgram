import { UserBasic } from './user.types';

export interface Comment {
  _id: string;
  postId: string;
  userId: string | UserBasic;
  parentCommentId?: string;
  text: string;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommentWithUser extends Omit<Comment, 'userId'> {
  userId: UserBasic;
  repliesCount?: number;
}
