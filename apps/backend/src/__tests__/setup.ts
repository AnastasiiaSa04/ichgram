import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

// Mock socket.io
jest.mock('../config/socket', () => ({
  io: {
    emit: jest.fn(),
    to: jest.fn().mockReturnThis(),
  },
  emitToUser: jest.fn(),
  getSocketId: jest.fn(),
  initializeSocket: jest.fn(),
}));

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

jest.setTimeout(10000);
