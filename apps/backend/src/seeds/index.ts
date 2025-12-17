import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { User } from '../models/User.model';
import { Post } from '../models/Post.model';
import { Follow } from '../models/Follow.model';

const log = (msg: string) => console.log(`[seed] ${msg}`);

const MONGO_URI = process.env.MONGO_URI!;
if (!process.env.MONGO_URI) {
  console.error('[seed] MONGO_URI environment variable is required');
  process.exit(1);
}

const SAMPLE_AVATARS = [
  'https://i.pravatar.cc/150?img=1',
  'https://i.pravatar.cc/150?img=2',
  'https://i.pravatar.cc/150?img=3',
  'https://i.pravatar.cc/150?img=4',
  'https://i.pravatar.cc/150?img=5',
];

const SAMPLE_IMAGES = [
  'https://picsum.photos/seed/1/1080/1080',
  'https://picsum.photos/seed/2/1080/1080',
  'https://picsum.photos/seed/3/1080/1080',
  'https://picsum.photos/seed/4/1080/1080',
  'https://picsum.photos/seed/5/1080/1080',
  'https://picsum.photos/seed/6/1080/1080',
  'https://picsum.photos/seed/7/1080/1080',
  'https://picsum.photos/seed/8/1080/1080',
];

const SAMPLE_CAPTIONS = [
  'Beautiful day! ☀️',
  'Living my best life 🌟',
  'Coffee and chill ☕',
  'Weekend vibes 🎉',
  'Nature is amazing 🌿',
  'City lights 🌃',
  'Good times with friends 👯',
  'Sunset lover 🌅',
];

const users = [
  {
    username: 'johndoe',
    email: 'john@example.com',
    password: 'Password123!',
    fullName: 'John Doe',
    bio: 'Photographer & Travel enthusiast 📸✈️',
  },
  {
    username: 'janedoe',
    email: 'jane@example.com',
    password: 'Password123!',
    fullName: 'Jane Doe',
    bio: 'Designer | Coffee addict ☕',
  },
  {
    username: 'mike_smith',
    email: 'mike@example.com',
    password: 'Password123!',
    fullName: 'Mike Smith',
    bio: 'Software Developer 💻',
  },
  {
    username: 'sarah_wilson',
    email: 'sarah@example.com',
    password: 'Password123!',
    fullName: 'Sarah Wilson',
    bio: 'Foodie | Chef 🍳',
  },
  {
    username: 'alex_tech',
    email: 'alex@example.com',
    password: 'Password123!',
    fullName: 'Alex Johnson',
    bio: 'Tech lover | Gamer 🎮',
  },
];

async function seed() {
  try {
    log('Connecting to database...');
    await mongoose.connect(MONGO_URI);
    log('Connected to database');

    const existingUsers = await User.countDocuments();
    // if (existingUsers > 0) {
    //   log('Database already has data, skipping seed');
    //   await mongoose.disconnect();
    //   return;
    // }

    log('Seeding database...');

    const hashedPassword = await bcrypt.hash('Password123!', 10);
    const createdUsers = await User.insertMany(
      users.map((user, index) => ({
        ...user,
        password: hashedPassword,
        avatar: SAMPLE_AVATARS[index % SAMPLE_AVATARS.length],
      }))
    );

    log(`Created ${createdUsers.length} users`);

    const posts = [];
    for (const user of createdUsers) {
      const numPosts = Math.floor(Math.random() * 4) + 2;
      for (let i = 0; i < numPosts; i++) {
        const numImages = Math.floor(Math.random() * 3) + 1;
        const images = Array.from({ length: numImages }, () => 
          SAMPLE_IMAGES[Math.floor(Math.random() * SAMPLE_IMAGES.length)]
        );
        posts.push({
          author: user._id,
          images,
          caption: SAMPLE_CAPTIONS[Math.floor(Math.random() * SAMPLE_CAPTIONS.length)],
          likesCount: Math.floor(Math.random() * 100),
          commentsCount: Math.floor(Math.random() * 20),
        });
      }
    }

    const createdPosts = await Post.insertMany(posts);
    log(`Created ${createdPosts.length} posts`);

    const follows = [];
    for (let i = 0; i < createdUsers.length; i++) {
      for (let j = 0; j < createdUsers.length; j++) {
        if (i !== j && Math.random() > 0.5) {
          follows.push({
            follower: createdUsers[i]._id,
            following: createdUsers[j]._id,
          });
        }
      }
    }

    if (follows.length > 0) {
      await Follow.insertMany(follows);

      for (const follow of follows) {
        await User.findByIdAndUpdate(follow.follower, { $inc: { followingCount: 1 } });
        await User.findByIdAndUpdate(follow.following, { $inc: { followersCount: 1 } });
      }
    }

    log(`Created ${follows.length} follow relationships`);
    log('Seeding completed successfully!');
    log('');
    log('Test accounts:');
    log('  Email: john@example.com | Password: Password123!');
    log('  Email: jane@example.com | Password: Password123!');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[seed] Seeding failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seed();

