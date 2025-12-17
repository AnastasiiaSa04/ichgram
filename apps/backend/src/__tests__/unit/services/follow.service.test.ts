import { FollowService } from '../../../services/follow.service';
import { Follow } from '../../../models/Follow.model';
import { User } from '../../../models/User.model';
import { NotFoundError, ConflictError, ForbiddenError } from '../../../utils/ApiError';
import mongoose from 'mongoose';

describe('FollowService', () => {
  let userId1: string;
  let userId2: string;
  let userId3: string;

  beforeEach(async () => {
    const user1 = await User.create({
      email: 'user1@example.com',
      username: 'user1',
      password: 'Password123!',
    });
    userId1 = user1._id.toString();

    const user2 = await User.create({
      email: 'user2@example.com',
      username: 'user2',
      password: 'Password123!',
    });
    userId2 = user2._id.toString();

    const user3 = await User.create({
      email: 'user3@example.com',
      username: 'user3',
      password: 'Password123!',
    });
    userId3 = user3._id.toString();
  });

  describe('followUser', () => {
    it('should follow a user', async () => {
      const follow = await FollowService.followUser(userId1, userId2);

      expect(follow.follower.toString()).toBe(userId1);
      expect(follow.following.toString()).toBe(userId2);

      const user1 = await User.findById(userId1);
      const user2 = await User.findById(userId2);

      expect(user1?.followingCount).toBe(1);
      expect(user2?.followersCount).toBe(1);
    });

    it('should throw ForbiddenError when trying to follow self', async () => {
      await expect(FollowService.followUser(userId1, userId1)).rejects.toThrow(
        ForbiddenError
      );
    });

    it('should throw NotFoundError if user does not exist', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();

      await expect(FollowService.followUser(userId1, fakeId)).rejects.toThrow(
        NotFoundError
      );
    });

    it('should throw ConflictError if already following', async () => {
      await FollowService.followUser(userId1, userId2);

      await expect(FollowService.followUser(userId1, userId2)).rejects.toThrow(
        ConflictError
      );
    });
  });

  describe('unfollowUser', () => {
    beforeEach(async () => {
      await Follow.create({ follower: userId1, following: userId2 });
      await User.findByIdAndUpdate(userId1, { $inc: { followingCount: 1 } });
      await User.findByIdAndUpdate(userId2, { $inc: { followersCount: 1 } });
    });

    it('should unfollow a user', async () => {
      await FollowService.unfollowUser(userId1, userId2);

      const follow = await Follow.findOne({ follower: userId1, following: userId2 });
      expect(follow).toBeNull();

      const user1 = await User.findById(userId1);
      const user2 = await User.findById(userId2);

      expect(user1?.followingCount).toBe(0);
      expect(user2?.followersCount).toBe(0);
    });

    it('should throw ForbiddenError when trying to unfollow self', async () => {
      await expect(FollowService.unfollowUser(userId1, userId1)).rejects.toThrow(
        ForbiddenError
      );
    });

    it('should throw NotFoundError if user does not exist', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();

      await expect(FollowService.unfollowUser(userId1, fakeId)).rejects.toThrow(
        NotFoundError
      );
    });

    it('should throw NotFoundError if not following', async () => {
      await expect(FollowService.unfollowUser(userId1, userId3)).rejects.toThrow(
        NotFoundError
      );
    });
  });

  describe('getFollowers', () => {
    beforeEach(async () => {
      await Follow.create({ follower: userId1, following: userId3 });
      await Follow.create({ follower: userId2, following: userId3 });
    });

    it('should get all followers for a user', async () => {
      const result = await FollowService.getFollowers(userId3);

      expect(result.followers).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.pages).toBe(1);
    });

    it('should support pagination', async () => {
      for (let i = 0; i < 15; i++) {
        const user = await User.create({
          email: `follower${i}@example.com`,
          username: `follower${i}`,
          password: 'Password123!',
        });
        await Follow.create({ follower: user._id, following: userId3 });
      }

      const page1 = await FollowService.getFollowers(userId3, 1, 10);
      expect(page1.followers).toHaveLength(10);
      expect(page1.total).toBe(17);
      expect(page1.pages).toBe(2);

      const page2 = await FollowService.getFollowers(userId3, 2, 10);
      expect(page2.followers).toHaveLength(7);
    });

    it('should return empty array for user with no followers', async () => {
      const result = await FollowService.getFollowers(userId1);

      expect(result.followers).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  describe('getFollowing', () => {
    beforeEach(async () => {
      await Follow.create({ follower: userId1, following: userId2 });
      await Follow.create({ follower: userId1, following: userId3 });
    });

    it('should get all users that a user is following', async () => {
      const result = await FollowService.getFollowing(userId1);

      expect(result.following).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.pages).toBe(1);
    });

    it('should support pagination', async () => {
      for (let i = 0; i < 15; i++) {
        const user = await User.create({
          email: `following${i}@example.com`,
          username: `following${i}`,
          password: 'Password123!',
        });
        await Follow.create({ follower: userId1, following: user._id });
      }

      const page1 = await FollowService.getFollowing(userId1, 1, 10);
      expect(page1.following).toHaveLength(10);
      expect(page1.total).toBe(17);
      expect(page1.pages).toBe(2);

      const page2 = await FollowService.getFollowing(userId1, 2, 10);
      expect(page2.following).toHaveLength(7);
    });

    it('should return empty array for user not following anyone', async () => {
      const result = await FollowService.getFollowing(userId2);

      expect(result.following).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  describe('checkFollowing', () => {
    beforeEach(async () => {
      await Follow.create({ follower: userId1, following: userId2 });
    });

    it('should return true if user is following', async () => {
      const isFollowing = await FollowService.checkFollowing(userId1, userId2);
      expect(isFollowing).toBe(true);
    });

    it('should return false if user is not following', async () => {
      const isFollowing = await FollowService.checkFollowing(userId1, userId3);
      expect(isFollowing).toBe(false);
    });

    it('should return false for self', async () => {
      const isFollowing = await FollowService.checkFollowing(userId1, userId1);
      expect(isFollowing).toBe(false);
    });
  });
});
