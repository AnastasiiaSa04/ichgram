import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { User } from '../models/User.model';
import { Post } from '../models/Post.model';
import { Follow } from '../models/Follow.model';
import { Comment } from '../models/Comment.model';
import { Like } from '../models/Like.model';

const log = (msg: string) => console.log(`[seed] ${msg}`);

const MONGO_URI = process.env.MONGO_URI!;
if (!process.env.MONGO_URI) {
  console.error('[seed] MONGO_URI environment variable is required');
  process.exit(1);
}

const SAMPLE_AVATARS = Array.from({ length: 70 }, (_, i) => 
  `https://i.pravatar.cc/150?img=${i + 1}`
);

const SAMPLE_IMAGES = [
  ...Array.from({ length: 50 }, (_, i) => `https://picsum.photos/seed/${i + 1}/1080/1080`),
  ...Array.from({ length: 30 }, (_, i) => `https://picsum.photos/seed/nature${i}/1080/1080`),
  ...Array.from({ length: 30 }, (_, i) => `https://picsum.photos/seed/city${i}/1080/1080`),
  ...Array.from({ length: 20 }, (_, i) => `https://picsum.photos/seed/food${i}/1080/1080`),
  ...Array.from({ length: 20 }, (_, i) => `https://picsum.photos/seed/travel${i}/1080/1080`),
  ...Array.from({ length: 20 }, (_, i) => `https://picsum.photos/seed/art${i}/1080/1080`),
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
  'Perfect moment 📸',
  'Adventure awaits 🏔️',
  'Food is love 🍕',
  'Stay positive ✨',
  'Making memories 💫',
  'Life is beautiful 🌸',
  'Grateful for today 🙏',
  'Chasing dreams 🚀',
  'Simple pleasures 🌻',
  'Golden hour ✨',
  'Explore more 🗺️',
  'Just breathe 🧘',
  'No filter needed 📷',
  'Mood 💭',
  'Vibes only ⚡',
  'Good energy 🔥',
  'Weekend mood 🎶',
  'Love this place ❤️',
  'Pure happiness 😊',
  'Dream big 💪',
  'Living for moments like this',
  'Can\'t get enough of this view',
  'This is everything 🌈',
  'Throwback to better days',
  'New beginnings 🌱',
  'Lost in the moment',
  'Here\'s to the good life 🥂',
];

const SAMPLE_COMMENTS = [
  'Amazing! 🔥',
  'Love this! ❤️',
  'So beautiful 😍',
  'Great shot!',
  'Stunning!',
  'Goals 🙌',
  'This is everything!',
  'Wow! 😮',
  'Perfect 👌',
  'Need to visit this place!',
  'Incredible view!',
  'Love your feed!',
  'So inspiring ✨',
  'This made my day',
  'Absolutely gorgeous',
  'Can\'t handle this 😭',
  'Where is this?',
  'Take me there!',
  'You\'re killing it!',
  'Major vibes',
  'So cool!',
  'Best one yet!',
  'This is art 🎨',
  'Living the dream!',
  'Obsessed with this',
  'How? Just how?',
  'Teach me your ways!',
  'Legendary 🏆',
  'Pure magic ✨',
  'Yes yes yes!',
  '💯💯💯',
  'Speechless',
  'This deserves more likes',
  'My new wallpaper!',
  'The quality though 📸',
];

const SAMPLE_LOCATIONS = [
  'New York, USA',
  'Paris, France',
  'Tokyo, Japan',
  'London, UK',
  'Barcelona, Spain',
  'Rome, Italy',
  'Sydney, Australia',
  'Amsterdam, Netherlands',
  'Dubai, UAE',
  'Los Angeles, USA',
  'Berlin, Germany',
  'Toronto, Canada',
  'Singapore',
  'Bangkok, Thailand',
  'Seoul, South Korea',
  'Miami, USA',
  'Prague, Czech Republic',
  'Vienna, Austria',
  'Stockholm, Sweden',
  'Copenhagen, Denmark',
];

const users = [
  { username: 'johndoe', email: 'john@example.com', fullName: 'John Doe', bio: 'Photographer & Travel enthusiast 📸✈️' },
  { username: 'janedoe', email: 'jane@example.com', fullName: 'Jane Doe', bio: 'Designer | Coffee addict ☕' },
  { username: 'mike_smith', email: 'mike@example.com', fullName: 'Mike Smith', bio: 'Software Developer 💻' },
  { username: 'sarah_wilson', email: 'sarah@example.com', fullName: 'Sarah Wilson', bio: 'Foodie | Chef 🍳' },
  { username: 'alex_tech', email: 'alex@example.com', fullName: 'Alex Johnson', bio: 'Tech lover | Gamer 🎮' },
  { username: 'emma_style', email: 'emma@example.com', fullName: 'Emma Williams', bio: 'Fashion & Lifestyle 👗✨' },
  { username: 'david_fit', email: 'david@example.com', fullName: 'David Brown', bio: 'Fitness Coach | Health First 💪' },
  { username: 'lisa_art', email: 'lisa@example.com', fullName: 'Lisa Anderson', bio: 'Artist | Dreamer 🎨' },
  { username: 'chris_music', email: 'chris@example.com', fullName: 'Chris Martinez', bio: 'Musician | Producer 🎵' },
  { username: 'natalie_travel', email: 'natalie@example.com', fullName: 'Natalie Taylor', bio: 'Wanderlust 🌍 | 50+ countries' },
  { username: 'james_photo', email: 'james@example.com', fullName: 'James Garcia', bio: 'Professional Photographer 📷' },
  { username: 'olivia_books', email: 'olivia@example.com', fullName: 'Olivia White', bio: 'Book lover 📚 | Writer' },
  { username: 'ryan_code', email: 'ryan@example.com', fullName: 'Ryan Lee', bio: 'Full Stack Developer 🚀' },
  { username: 'sophia_yoga', email: 'sophia@example.com', fullName: 'Sophia Kim', bio: 'Yoga Instructor | Mindfulness 🧘‍♀️' },
  { username: 'daniel_chef', email: 'daniel@example.com', fullName: 'Daniel Harris', bio: 'Executive Chef 👨‍🍳' },
  { username: 'ava_dance', email: 'ava@example.com', fullName: 'Ava Thompson', bio: 'Professional Dancer 💃' },
  { username: 'ethan_film', email: 'ethan@example.com', fullName: 'Ethan Moore', bio: 'Filmmaker | Storyteller 🎬' },
  { username: 'mia_nature', email: 'mia@example.com', fullName: 'Mia Jackson', bio: 'Nature lover 🌿 | Eco warrior' },
  { username: 'noah_sports', email: 'noah@example.com', fullName: 'Noah Martin', bio: 'Sports enthusiast ⚽🏀' },
  { username: 'isabella_beauty', email: 'isabella@example.com', fullName: 'Isabella Rodriguez', bio: 'Beauty & Skincare 💄' },
];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

async function seed() {
  try {
    log('Connecting to database...');
    await mongoose.connect(MONGO_URI);
    log('Connected to database');

    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      log('Database already has data, skipping seed');
      await mongoose.disconnect();
      return;
    }

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
      const numPosts = randomInt(5, 12);
      for (let i = 0; i < numPosts; i++) {
        const numImages = randomInt(1, 4);
        const images = Array.from({ length: numImages }, () => randomItem(SAMPLE_IMAGES));
        const hasLocation = Math.random() > 0.5;
        posts.push({
          author: user._id,
          images,
          caption: randomItem(SAMPLE_CAPTIONS),
          location: hasLocation ? randomItem(SAMPLE_LOCATIONS) : undefined,
          likesCount: 0,
          commentsCount: 0,
          createdAt: new Date(Date.now() - randomInt(0, 30 * 24 * 60 * 60 * 1000)),
        });
      }
    }
    const createdPosts = await Post.insertMany(posts);
    log(`Created ${createdPosts.length} posts`);

    const likes: { user: mongoose.Types.ObjectId; post: mongoose.Types.ObjectId }[] = [];
    const likeSet = new Set<string>();
    
    for (const post of createdPosts) {
      const numLikes = randomInt(5, Math.min(createdUsers.length, 15));
      const shuffledUsers = shuffleArray(createdUsers);
      
      for (let i = 0; i < numLikes; i++) {
        const key = `${shuffledUsers[i]._id}-${post._id}`;
        if (!likeSet.has(key)) {
          likeSet.add(key);
          likes.push({
            user: shuffledUsers[i]._id,
            post: post._id,
          });
        }
      }
    }
    
    await Like.insertMany(likes);
    log(`Created ${likes.length} likes`);

    const likesPerPost = new Map<string, number>();
    for (const like of likes) {
      const postId = like.post.toString();
      likesPerPost.set(postId, (likesPerPost.get(postId) || 0) + 1);
    }
    
    for (const [postId, count] of likesPerPost) {
      await Post.findByIdAndUpdate(postId, { likesCount: count });
    }

    const comments: { post: mongoose.Types.ObjectId; author: mongoose.Types.ObjectId; content: string; createdAt: Date }[] = [];
    
    for (const post of createdPosts) {
      const numComments = randomInt(2, 10);
      const shuffledUsers = shuffleArray(createdUsers);
      
      for (let i = 0; i < numComments; i++) {
        comments.push({
          post: post._id,
          author: shuffledUsers[i % shuffledUsers.length]._id,
          content: randomItem(SAMPLE_COMMENTS),
          createdAt: new Date(Date.now() - randomInt(0, 7 * 24 * 60 * 60 * 1000)),
        });
      }
    }
    
    await Comment.insertMany(comments);
    log(`Created ${comments.length} comments`);

    const commentsPerPost = new Map<string, number>();
    for (const comment of comments) {
      const postId = comment.post.toString();
      commentsPerPost.set(postId, (commentsPerPost.get(postId) || 0) + 1);
    }
    
    for (const [postId, count] of commentsPerPost) {
      await Post.findByIdAndUpdate(postId, { commentsCount: count });
    }

    const follows: { follower: mongoose.Types.ObjectId; following: mongoose.Types.ObjectId }[] = [];
    const followSet = new Set<string>();
    
    for (const user of createdUsers) {
      const numFollowing = randomInt(5, createdUsers.length - 1);
      const otherUsers = shuffleArray(createdUsers.filter(u => u._id.toString() !== user._id.toString()));
      
      for (let i = 0; i < Math.min(numFollowing, otherUsers.length); i++) {
        const key = `${user._id}-${otherUsers[i]._id}`;
        if (!followSet.has(key)) {
          followSet.add(key);
          follows.push({
            follower: user._id,
            following: otherUsers[i]._id,
          });
        }
      }
    }
    
    await Follow.insertMany(follows);
    log(`Created ${follows.length} follow relationships`);

    const followingCount = new Map<string, number>();
    const followersCount = new Map<string, number>();
    
    for (const follow of follows) {
      const followerId = follow.follower.toString();
      const followingId = follow.following.toString();
      followingCount.set(followerId, (followingCount.get(followerId) || 0) + 1);
      followersCount.set(followingId, (followersCount.get(followingId) || 0) + 1);
    }
    
    for (const user of createdUsers) {
      const userId = user._id.toString();
      await User.findByIdAndUpdate(userId, {
        followingCount: followingCount.get(userId) || 0,
        followersCount: followersCount.get(userId) || 0,
        postsCount: posts.filter(p => p.author.toString() === userId).length,
      });
    }

    log('');
    log('✅ Seeding completed successfully!');
    log('');
    log('📊 Statistics:');
    log(`   Users: ${createdUsers.length}`);
    log(`   Posts: ${createdPosts.length}`);
    log(`   Likes: ${likes.length}`);
    log(`   Comments: ${comments.length}`);
    log(`   Follows: ${follows.length}`);
    log('');
    log('🔑 Test accounts (password: Password123!):');
    log('   john@example.com');
    log('   jane@example.com');
    log('   emma@example.com');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[seed] Seeding failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seed();
