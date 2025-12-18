export const API_URL = import.meta.env.VITE_API_URL || '/api';
export const WS_URL = import.meta.env.VITE_WS_URL || '';
export const MAX_FILE_SIZE = parseInt(import.meta.env.VITE_MAX_FILE_SIZE || '5242880', 10);

export const POSTS_PER_PAGE = 10;
export const COMMENTS_PER_PAGE = 20;
export const MESSAGES_PER_PAGE = 50;
export const NOTIFICATIONS_PER_PAGE = 20;
export const SEARCH_RESULTS_LIMIT = 20;

export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  RESET_PASSWORD: '/reset-password',
  EXPLORE: '/explore',
  MESSAGES: '/messages',
  NOTIFICATIONS: '/notifications',
  PROFILE: (username: string) => `/profile/${username}`,
  EDIT_PROFILE: '/settings/edit',
  POST: (postId: string) => `/p/${postId}`,
} as const;

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
} as const;


