import { SearchService } from '../../../services/search.service';
import { User } from '../../../models/User.model';
import { Post } from '../../../models/Post.model';

describe('SearchService', () => {
  let userId1: string;
  let userId2: string;
  let postId1: string;
  let postId2: string;

  beforeEach(async () => {
    const user1 = await User.create({
      email: 'john@example.com',
      username: 'johndoe',
      password: 'Password123!',
      fullName: 'John Doe',
    });
    userId1 = user1._id.toString();

    const user2 = await User.create({
      email: 'jane@example.com',
      username: 'janedoe',
      password: 'Password123!',
      fullName: 'Jane Smith',
    });
    userId2 = user2._id.toString();

    const post1 = await Post.create({
      author: userId1,
      images: ['https://example.com/image1.jpg'],
      caption: 'Beautiful sunset in California',
      location: 'San Francisco, CA',
    });
    postId1 = post1._id.toString();

    const post2 = await Post.create({
      author: userId2,
      images: ['https://example.com/image2.jpg'],
      caption: 'Amazing beach day',
      location: 'Miami, FL',
    });
    postId2 = post2._id.toString();
  });

  describe('searchUsers', () => {
    it('should search users by username', async () => {
      const users = await SearchService.searchUsers('john');

      expect(users).toHaveLength(1);
      expect(users[0].username).toBe('johndoe');
    });

    it('should search users by full name', async () => {
      const users = await SearchService.searchUsers('Jane');

      expect(users).toHaveLength(1);
      expect(users[0].fullName).toBe('Jane Smith');
    });

    it('should be case insensitive', async () => {
      const users = await SearchService.searchUsers('JOHN');

      expect(users).toHaveLength(1);
      expect(users[0].username).toBe('johndoe');
    });

    it('should return multiple results', async () => {
      const users = await SearchService.searchUsers('doe');

      expect(users.length).toBeGreaterThanOrEqual(2);
    });

    it('should respect limit parameter', async () => {
      const users = await SearchService.searchUsers('doe', 1);

      expect(users).toHaveLength(1);
    });

    it('should return empty array for no matches', async () => {
      const users = await SearchService.searchUsers('nonexistent');

      expect(users).toHaveLength(0);
    });
  });

  describe('searchPosts', () => {
    it('should search posts by caption', async () => {
      const result = await SearchService.searchPosts('sunset');

      expect(result.posts).toHaveLength(1);
      expect(result.posts[0].caption).toContain('sunset');
    });

    it('should search posts by location', async () => {
      const result = await SearchService.searchPosts('Miami');

      expect(result.posts).toHaveLength(1);
      expect(result.posts[0].location).toContain('Miami');
    });

    it('should be case insensitive', async () => {
      const result = await SearchService.searchPosts('BEACH');

      expect(result.posts).toHaveLength(1);
    });

    it('should support pagination', async () => {
      for (let i = 0; i < 15; i++) {
        await Post.create({
          author: userId1,
          images: ['https://example.com/image.jpg'],
          caption: `Test post ${i}`,
        });
      }

      const page1 = await SearchService.searchPosts('Test', 1, 10);
      expect(page1.posts).toHaveLength(10);
      expect(page1.total).toBe(15);
      expect(page1.pages).toBe(2);

      const page2 = await SearchService.searchPosts('Test', 2, 10);
      expect(page2.posts).toHaveLength(5);
    });

    it('should return empty array for no matches', async () => {
      const result = await SearchService.searchPosts('nonexistent');

      expect(result.posts).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  describe('globalSearch', () => {
    it('should search both users and posts', async () => {
      const result = await SearchService.globalSearch('doe');

      expect(result.users.length).toBeGreaterThan(0);
      expect(result.totalUsers).toBeGreaterThan(0);
    });

    it('should respect limit parameter', async () => {
      const result = await SearchService.globalSearch('doe', 1);

      expect(result.users.length).toBeLessThanOrEqual(1);
      expect(result.posts.length).toBeLessThanOrEqual(1);
    });

    it('should return results for posts only if no users match', async () => {
      const result = await SearchService.globalSearch('beach');

      expect(result.users).toHaveLength(0);
      expect(result.posts.length).toBeGreaterThan(0);
    });
  });
});
