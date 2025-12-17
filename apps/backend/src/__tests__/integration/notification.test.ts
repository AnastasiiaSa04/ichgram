import request from 'supertest';
import app from '../../app';
import { User } from '../../models/User.model';
import { Post } from '../../models/Post.model';
import { Notification, NotificationType } from '../../models/Notification.model';
import { Follow } from '../../models/Follow.model';
import { Like } from '../../models/Like.model';
import { Comment } from '../../models/Comment.model';
import { TokenService } from '../../services/token.service';
import mongoose from 'mongoose';

describe('Notification API', () => {
  let accessToken1: string;
  let accessToken2: string;
  let user1: any;
  let user2: any;
  let post1: any;
  let notification1: any;
  let notification2: any;

  beforeEach(async () => {
    await User.deleteMany({});
    await Post.deleteMany({});
    await Notification.deleteMany({});
    await Follow.deleteMany({});
    await Like.deleteMany({});
    await Comment.deleteMany({});

    user1 = await User.create({
      email: 'user1@test.com',
      username: 'user1',
      password: 'Password123',
      fullName: 'User One',
    });

    user2 = await User.create({
      email: 'user2@test.com',
      username: 'user2',
      password: 'Password123',
      fullName: 'User Two',
    });

    const tokens1 = TokenService.generateTokenPair(user1);
    const tokens2 = TokenService.generateTokenPair(user2);
    accessToken1 = tokens1.accessToken;
    accessToken2 = tokens2.accessToken;

    post1 = await Post.create({
      author: user1._id,
      caption: 'Test post',
      images: ['image1.jpg'],
    });

    notification1 = await Notification.create({
      recipient: user1._id,
      sender: user2._id,
      type: NotificationType.FOLLOW,
      isRead: false,
    });

    notification2 = await Notification.create({
      recipient: user1._id,
      sender: user2._id,
      type: NotificationType.LIKE,
      post: post1._id,
      isRead: true,
    });
  });

  describe('GET /api/notifications', () => {
    it('should get notifications for authenticated user', async () => {
      const res = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${accessToken1}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.notifications).toHaveLength(2);
      expect(res.body.data.total).toBe(2);
      expect(res.body.data.pages).toBe(1);
      expect(res.body.data.unreadCount).toBe(1);
    });

    it('should return notifications with populated sender', async () => {
      const res = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${accessToken1}`)
        .expect(200);

      const notification = res.body.data.notifications[0];
      expect(notification.sender).toBeDefined();
      expect(notification.sender.username).toBe('user2');
    });

    it('should support pagination', async () => {
      await Notification.create({
        recipient: user1._id,
        sender: user2._id,
        type: NotificationType.FOLLOW,
      });

      const res = await request(app)
        .get('/api/notifications?page=1&limit=2')
        .set('Authorization', `Bearer ${accessToken1}`)
        .expect(200);

      expect(res.body.data.notifications).toHaveLength(2);
      expect(res.body.data.total).toBe(3);
      expect(res.body.data.pages).toBe(2);
    });

    it('should return empty array when no notifications', async () => {
      const res = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${accessToken2}`)
        .expect(200);

      expect(res.body.data.notifications).toHaveLength(0);
      expect(res.body.data.total).toBe(0);
      expect(res.body.data.unreadCount).toBe(0);
    });

    it('should fail without authentication', async () => {
      const res = await request(app).get('/api/notifications').expect(401);

      expect(res.body.success).toBe(false);
    });

    it('should validate pagination parameters', async () => {
      const res = await request(app)
        .get('/api/notifications?page=0&limit=101')
        .set('Authorization', `Bearer ${accessToken1}`)
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/notifications/unread-count', () => {
    it('should get unread count for authenticated user', async () => {
      const res = await request(app)
        .get('/api/notifications/unread-count')
        .set('Authorization', `Bearer ${accessToken1}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.count).toBe(1);
    });

    it('should return 0 when no unread notifications', async () => {
      const res = await request(app)
        .get('/api/notifications/unread-count')
        .set('Authorization', `Bearer ${accessToken2}`)
        .expect(200);

      expect(res.body.data.count).toBe(0);
    });

    it('should fail without authentication', async () => {
      const res = await request(app).get('/api/notifications/unread-count').expect(401);

      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/notifications/:id/read', () => {
    it('should mark notification as read', async () => {
      const res = await request(app)
        .put(`/api/notifications/${notification1._id}/read`)
        .set('Authorization', `Bearer ${accessToken1}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.notification.isRead).toBe(true);

      const updatedNotification = await Notification.findById(notification1._id);
      expect(updatedNotification?.isRead).toBe(true);
    });

    it('should fail when notification does not exist', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .put(`/api/notifications/${fakeId}/read`)
        .set('Authorization', `Bearer ${accessToken1}`)
        .expect(404);

      expect(res.body.success).toBe(false);
    });

    it('should fail when user is not the recipient', async () => {
      const res = await request(app)
        .put(`/api/notifications/${notification1._id}/read`)
        .set('Authorization', `Bearer ${accessToken2}`)
        .expect(404);

      expect(res.body.success).toBe(false);
    });

    it('should fail without authentication', async () => {
      const res = await request(app)
        .put(`/api/notifications/${notification1._id}/read`)
        .expect(401);

      expect(res.body.success).toBe(false);
    });

    it('should fail with invalid notification ID', async () => {
      const res = await request(app)
        .put('/api/notifications/invalid-id/read')
        .set('Authorization', `Bearer ${accessToken1}`)
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/notifications/read-all', () => {
    it('should mark all notifications as read', async () => {
      await Notification.create({
        recipient: user1._id,
        sender: user2._id,
        type: NotificationType.FOLLOW,
        isRead: false,
      });

      const res = await request(app)
        .put('/api/notifications/read-all')
        .set('Authorization', `Bearer ${accessToken1}`)
        .expect(200);

      expect(res.body.success).toBe(true);

      const unreadCount = await Notification.countDocuments({
        recipient: user1._id,
        isRead: false,
      });
      expect(unreadCount).toBe(0);
    });

    it('should work when no unread notifications', async () => {
      const res = await request(app)
        .put('/api/notifications/read-all')
        .set('Authorization', `Bearer ${accessToken2}`)
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it('should fail without authentication', async () => {
      const res = await request(app).put('/api/notifications/read-all').expect(401);

      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /api/notifications/:id', () => {
    it('should delete notification', async () => {
      const res = await request(app)
        .delete(`/api/notifications/${notification1._id}`)
        .set('Authorization', `Bearer ${accessToken1}`)
        .expect(200);

      expect(res.body.success).toBe(true);

      const deletedNotification = await Notification.findById(notification1._id);
      expect(deletedNotification).toBeNull();
    });

    it('should fail when notification does not exist', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .delete(`/api/notifications/${fakeId}`)
        .set('Authorization', `Bearer ${accessToken1}`)
        .expect(404);

      expect(res.body.success).toBe(false);
    });

    it('should fail when user is not the recipient', async () => {
      const res = await request(app)
        .delete(`/api/notifications/${notification1._id}`)
        .set('Authorization', `Bearer ${accessToken2}`)
        .expect(404);

      expect(res.body.success).toBe(false);
    });

    it('should fail without authentication', async () => {
      const res = await request(app)
        .delete(`/api/notifications/${notification1._id}`)
        .expect(401);

      expect(res.body.success).toBe(false);
    });

    it('should fail with invalid notification ID', async () => {
      const res = await request(app)
        .delete('/api/notifications/invalid-id')
        .set('Authorization', `Bearer ${accessToken1}`)
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  describe('Notification Integration with Other Services', () => {
    it('should create notification when user follows another user', async () => {
      await request(app)
        .post(`/api/follows/${user2._id}`)
        .set('Authorization', `Bearer ${accessToken1}`)
        .expect(201);

      const notification = await Notification.findOne({
        recipient: user2._id,
        sender: user1._id,
        type: NotificationType.FOLLOW,
      });

      expect(notification).toBeDefined();
      expect(notification?.isRead).toBe(false);
    });

    it('should create notification when user likes a post', async () => {
      await request(app)
        .post(`/api/likes/${post1._id}`)
        .set('Authorization', `Bearer ${accessToken2}`)
        .expect(201);

      const notification = await Notification.findOne({
        recipient: user1._id,
        sender: user2._id,
        type: NotificationType.LIKE,
        post: post1._id,
      });

      expect(notification).toBeDefined();
    });

    it('should create notification when user comments on a post', async () => {
      await request(app)
        .post(`/api/comments/post/${post1._id}`)
        .set('Authorization', `Bearer ${accessToken2}`)
        .send({
          content: 'Test comment',
        })
        .expect(201);

      const notification = await Notification.findOne({
        recipient: user1._id,
        sender: user2._id,
        type: NotificationType.COMMENT,
        post: post1._id,
      });

      expect(notification).toBeDefined();
    });

    it('should create notification when user replies to a comment', async () => {
      const comment = await Comment.create({
        post: post1._id,
        author: user1._id,
        content: 'Original comment',
      });

      await request(app)
        .post(`/api/comments/post/${post1._id}`)
        .set('Authorization', `Bearer ${accessToken2}`)
        .send({
          content: 'Reply to comment',
          parentComment: comment._id.toString(),
        })
        .expect(201);

      const notification = await Notification.findOne({
        recipient: user1._id,
        sender: user2._id,
        type: NotificationType.COMMENT_REPLY,
      });

      expect(notification).toBeDefined();
    });

    it('should not create notification when user likes own post', async () => {
      await request(app)
        .post(`/api/likes/${post1._id}`)
        .set('Authorization', `Bearer ${accessToken1}`)
        .expect(201);

      const notification = await Notification.findOne({
        recipient: user1._id,
        sender: user1._id,
        type: NotificationType.LIKE,
      });

      expect(notification).toBeNull();
    });

    it('should not create notification when user comments on own post', async () => {
      const commentRes = await request(app)
        .post(`/api/comments/post/${post1._id}`)
        .set('Authorization', `Bearer ${accessToken1}`)
        .send({
          content: 'Self comment',
        });

      expect(commentRes.status).toBe(201);

      const notification = await Notification.findOne({
        recipient: user1._id,
        sender: user1._id,
        type: NotificationType.COMMENT,
      });

      expect(notification).toBeNull();
    });
  });
});
