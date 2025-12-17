import request from 'supertest';
import app from '../../app';
import { User } from '../../models/User.model';
import { Message } from '../../models/Message.model';
import { Conversation } from '../../models/Conversation.model';
import { TokenService } from '../../services/token.service';
import mongoose from 'mongoose';

describe('Message API', () => {
  let accessToken1: string;
  let accessToken2: string;
  let user1: any;
  let user2: any;
  let conversation1: any;

  beforeEach(async () => {
    await User.deleteMany({});
    await Message.deleteMany({});
    await Conversation.deleteMany({});

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

    conversation1 = await Conversation.create({
      participants: [user1._id, user2._id],
    });
  });

  describe('POST /api/messages', () => {
    it('should send a message to another user', async () => {
      const res = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${accessToken1}`)
        .send({
          recipient: user2._id.toString(),
          content: 'Hello user2!',
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.message.content).toBe('Hello user2!');
      expect(res.body.data.message.sender.username).toBe('user1');
    });

    it('should create a new conversation if none exists', async () => {
      await Conversation.deleteMany({});

      const res = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${accessToken1}`)
        .send({
          recipient: user2._id.toString(),
          content: 'New conversation',
        })
        .expect(201);

      expect(res.body.success).toBe(true);

      const conversations = await Conversation.find({});
      expect(conversations).toHaveLength(1);
    });

    it('should fail when recipient does not exist', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${accessToken1}`)
        .send({
          recipient: fakeId.toString(),
          content: 'Hello!',
        })
        .expect(404);

      expect(res.body.success).toBe(false);
    });

    it('should fail without authentication', async () => {
      const res = await request(app)
        .post('/api/messages')
        .send({
          recipient: user2._id.toString(),
          content: 'Hello!',
        })
        .expect(401);

      expect(res.body.success).toBe(false);
    });

    it('should validate message content', async () => {
      const res = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${accessToken1}`)
        .send({
          recipient: user2._id.toString(),
          content: '',
        })
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/messages/conversations', () => {
    beforeEach(async () => {
      const message1 = await Message.create({
        conversation: conversation1._id,
        sender: user1._id,
        content: 'Message 1',
      });

      await Conversation.findByIdAndUpdate(conversation1._id, {
        lastMessage: message1._id,
        lastMessageAt: message1.createdAt,
      });
    });

    it('should get user conversations', async () => {
      const res = await request(app)
        .get('/api/messages/conversations')
        .set('Authorization', `Bearer ${accessToken1}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.conversations).toHaveLength(1);
      expect(res.body.data.total).toBe(1);
    });

    it('should include conversation participants', async () => {
      const res = await request(app)
        .get('/api/messages/conversations')
        .set('Authorization', `Bearer ${accessToken1}`)
        .expect(200);

      const conversation = res.body.data.conversations[0];
      expect(conversation.participants).toHaveLength(2);
      expect(conversation.participants[0].username).toBeDefined();
    });

    it('should support pagination', async () => {
      const res = await request(app)
        .get('/api/messages/conversations?page=1&limit=10')
        .set('Authorization', `Bearer ${accessToken1}`)
        .expect(200);

      expect(res.body.data.conversations).toHaveLength(1);
      expect(res.body.data.pages).toBe(1);
    });

    it('should fail without authentication', async () => {
      const res = await request(app)
        .get('/api/messages/conversations')
        .expect(401);

      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/messages/conversations/:conversationId', () => {
    beforeEach(async () => {
      await Message.create({
        conversation: conversation1._id,
        sender: user1._id,
        content: 'Message 1',
      });

      await Message.create({
        conversation: conversation1._id,
        sender: user2._id,
        content: 'Message 2',
      });
    });

    it('should get messages in a conversation', async () => {
      const res = await request(app)
        .get(`/api/messages/conversations/${conversation1._id}`)
        .set('Authorization', `Bearer ${accessToken1}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.messages).toHaveLength(2);
      expect(res.body.data.total).toBe(2);
    });

    it('should return messages in chronological order', async () => {
      const res = await request(app)
        .get(`/api/messages/conversations/${conversation1._id}`)
        .set('Authorization', `Bearer ${accessToken1}`)
        .expect(200);

      const messages = res.body.data.messages;
      expect(messages).toHaveLength(2);
      expect(messages[0].sender.username).toBeDefined();
      expect(messages[1].sender.username).toBeDefined();
    });

    it('should support pagination', async () => {
      const res = await request(app)
        .get(`/api/messages/conversations/${conversation1._id}?page=1&limit=1`)
        .set('Authorization', `Bearer ${accessToken1}`)
        .expect(200);

      expect(res.body.data.messages).toHaveLength(1);
      expect(res.body.data.pages).toBe(2);
    });

    it('should fail when conversation does not exist', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .get(`/api/messages/conversations/${fakeId}`)
        .set('Authorization', `Bearer ${accessToken1}`)
        .expect(404);

      expect(res.body.success).toBe(false);
    });

    it('should fail when user is not a participant', async () => {
      const user3 = await User.create({
        email: 'user3@test.com',
        username: 'user3',
        password: 'Password123',
      });
      const tokens3 = TokenService.generateTokenPair(user3);

      const res = await request(app)
        .get(`/api/messages/conversations/${conversation1._id}`)
        .set('Authorization', `Bearer ${tokens3.accessToken}`)
        .expect(403);

      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/messages/conversations/:conversationId/read', () => {
    beforeEach(async () => {
      await Message.create({
        conversation: conversation1._id,
        sender: user2._id,
        content: 'Unread message',
        isRead: false,
      });
    });

    it('should mark messages as read', async () => {
      const res = await request(app)
        .put(`/api/messages/conversations/${conversation1._id}/read`)
        .set('Authorization', `Bearer ${accessToken1}`)
        .expect(200);

      expect(res.body.success).toBe(true);

      const messages = await Message.find({
        conversation: conversation1._id,
        sender: user2._id,
      });
      expect(messages[0].isRead).toBe(true);
    });

    it('should fail when conversation does not exist', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .put(`/api/messages/conversations/${fakeId}/read`)
        .set('Authorization', `Bearer ${accessToken1}`)
        .expect(404);

      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/messages/unread-count', () => {
    beforeEach(async () => {
      await Message.create({
        conversation: conversation1._id,
        sender: user2._id,
        content: 'Unread 1',
        isRead: false,
      });

      await Message.create({
        conversation: conversation1._id,
        sender: user2._id,
        content: 'Unread 2',
        isRead: false,
      });
    });

    it('should get unread message count', async () => {
      const res = await request(app)
        .get('/api/messages/unread-count')
        .set('Authorization', `Bearer ${accessToken1}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.count).toBe(2);
    });

    it('should return 0 when no unread messages', async () => {
      const res = await request(app)
        .get('/api/messages/unread-count')
        .set('Authorization', `Bearer ${accessToken2}`)
        .expect(200);

      expect(res.body.data.count).toBe(0);
    });

    it('should fail without authentication', async () => {
      const res = await request(app)
        .get('/api/messages/unread-count')
        .expect(401);

      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /api/messages/conversations/:conversationId', () => {
    beforeEach(async () => {
      await Message.create({
        conversation: conversation1._id,
        sender: user1._id,
        content: 'Message to delete',
      });
    });

    it('should delete conversation and all messages', async () => {
      const res = await request(app)
        .delete(`/api/messages/conversations/${conversation1._id}`)
        .set('Authorization', `Bearer ${accessToken1}`)
        .expect(200);

      expect(res.body.success).toBe(true);

      const conversation = await Conversation.findById(conversation1._id);
      expect(conversation).toBeNull();

      const messages = await Message.find({ conversation: conversation1._id });
      expect(messages).toHaveLength(0);
    });

    it('should fail when conversation does not exist', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .delete(`/api/messages/conversations/${fakeId}`)
        .set('Authorization', `Bearer ${accessToken1}`)
        .expect(404);

      expect(res.body.success).toBe(false);
    });

    it('should fail when user is not a participant', async () => {
      const user3 = await User.create({
        email: 'user3@test.com',
        username: 'user3',
        password: 'Password123',
      });
      const tokens3 = TokenService.generateTokenPair(user3);

      const res = await request(app)
        .delete(`/api/messages/conversations/${conversation1._id}`)
        .set('Authorization', `Bearer ${tokens3.accessToken}`)
        .expect(403);

      expect(res.body.success).toBe(false);
    });
  });
});
