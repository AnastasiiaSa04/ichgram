import { ExploreService } from '../../../services/explore.service';
import { User } from '../../../models/User.model';
import { Post } from '../../../models/Post.model';

describe('ExploreService', () => {
  let userId: string;

  beforeEach(async () => {
    const user = await User.create({
      email: 'test@example.com',
      username: 'testuser',
      password: 'Password123!',
    });
    userId = user._id.toString();

    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const twoDaysAgo = now - 2 * 24 * 60 * 60 * 1000;

    await Post.create({
      author: userId,
      images: ['https://example.com/image1.jpg'],
      caption: 'Recent popular post',
      likesCount: 100,
      commentsCount: 50,
      createdAt: new Date(oneDayAgo + 1000),
    });

    await Post.create({
      author: userId,
      images: ['https://example.com/image2.jpg'],
      caption: 'Old very popular post',
      likesCount: 500,
      commentsCount: 200,
      createdAt: new Date(twoDaysAgo),
    });

    await Post.create({
      author: userId,
      images: ['https://example.com/image3.jpg'],
      caption: 'Recent less popular post',
      likesCount: 10,
      commentsCount: 5,
      createdAt: new Date(oneDayAgo + 2000),
    });
  });

  describe('getTrendingPosts', () => {
    it('should get trending posts from last 24 hours', async () => {
      const result = await ExploreService.getTrendingPosts();

      expect(result.posts.length).toBeGreaterThan(0);
      result.posts.forEach((post) => {
        const timeDiff = Date.now() - new Date(post.createdAt).getTime();
        expect(timeDiff).toBeLessThan(24 * 60 * 60 * 1000);
      });
    });

    it('should sort by engagement (likes + comments)', async () => {
      const result = await ExploreService.getTrendingPosts();

      if (result.posts.length > 1) {
        for (let i = 0; i < result.posts.length - 1; i++) {
          const engagement1 = result.posts[i].likesCount + result.posts[i].commentsCount;
          const engagement2 = result.posts[i + 1].likesCount + result.posts[i + 1].commentsCount;
          expect(engagement1).toBeGreaterThanOrEqual(engagement2);
        }
      }
    });

    it('should support pagination', async () => {
      for (let i = 0; i < 15; i++) {
        await Post.create({
          author: userId,
          images: ['https://example.com/image.jpg'],
          caption: `Test post ${i}`,
          likesCount: i,
        });
      }

      const page1 = await ExploreService.getTrendingPosts(1, 10);
      expect(page1.posts).toHaveLength(10);
      expect(page1.pages).toBeGreaterThan(1);

      const page2 = await ExploreService.getTrendingPosts(2, 10);
      expect(page2.posts.length).toBeGreaterThan(0);
    });
  });

  describe('getPopularPosts', () => {
    it('should get popular posts from all time', async () => {
      const result = await ExploreService.getPopularPosts();

      expect(result.posts).toHaveLength(3);
    });

    it('should sort by likes and comments (all time)', async () => {
      const result = await ExploreService.getPopularPosts();

      if (result.posts.length > 1) {
        for (let i = 0; i < result.posts.length - 1; i++) {
          expect(result.posts[i].likesCount).toBeGreaterThanOrEqual(
            result.posts[i + 1].likesCount
          );
        }
      }
    });

    it('should support pagination', async () => {
      for (let i = 0; i < 15; i++) {
        await Post.create({
          author: userId,
          images: ['https://example.com/image.jpg'],
          caption: `Test post ${i}`,
        });
      }

      const page1 = await ExploreService.getPopularPosts(1, 10);
      expect(page1.posts).toHaveLength(10);
      expect(page1.total).toBeGreaterThanOrEqual(18);
    });
  });

  describe('getRecentPosts', () => {
    it('should get recent posts sorted by creation date', async () => {
      const result = await ExploreService.getRecentPosts();

      expect(result.posts).toHaveLength(3);

      if (result.posts.length > 1) {
        for (let i = 0; i < result.posts.length - 1; i++) {
          expect(new Date(result.posts[i].createdAt).getTime()).toBeGreaterThanOrEqual(
            new Date(result.posts[i + 1].createdAt).getTime()
          );
        }
      }
    });

    it('should support pagination', async () => {
      for (let i = 0; i < 15; i++) {
        await Post.create({
          author: userId,
          images: ['https://example.com/image.jpg'],
          caption: `Test post ${i}`,
        });
      }

      const page1 = await ExploreService.getRecentPosts(1, 10);
      expect(page1.posts).toHaveLength(10);
      expect(page1.total).toBeGreaterThanOrEqual(18);
      expect(page1.pages).toBeGreaterThan(1);
    });
  });
});
