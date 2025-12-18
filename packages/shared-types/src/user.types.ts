export interface User {
  _id: string;
  username: string;
  email: string;
  fullName?: string;
  bio?: string;
  website?: string;
  avatar?: string;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile extends User {
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isFollowing?: boolean;
}

export interface UserBasic {
  _id: string;
  username: string;
  fullName?: string;
  avatar?: string;
}
