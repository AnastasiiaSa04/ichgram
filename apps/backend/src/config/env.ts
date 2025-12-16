import dotenv from 'dotenv';
import path from 'path';

const envFile =
  process.env.NODE_ENV === 'production'
    ? '.env.production'
    : process.env.NODE_ENV === 'test'
    ? '.env.test'
    : '.env.development';

dotenv.config({ path: path.resolve(process.cwd(), envFile) });

interface EnvConfig {
  NODE_ENV: string;
  PORT: number;
  MONGO_URI: string;
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_ACCESS_EXPIRE: string;
  JWT_REFRESH_EXPIRE: string;
  STORAGE_TYPE: 'local' | 'cloudinary' | 's3';
  UPLOAD_PATH: string;
  CLOUDINARY_CLOUD_NAME?: string;
  CLOUDINARY_API_KEY?: string;
  CLOUDINARY_API_SECRET?: string;
  FRONTEND_URL: string;
  LOG_LEVEL: string;
}

const getEnvVariable = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const env: EnvConfig = {
  NODE_ENV: getEnvVariable('NODE_ENV', 'development'),
  PORT: parseInt(getEnvVariable('PORT', '5000'), 10),
  MONGO_URI: getEnvVariable('MONGO_URI'),
  JWT_SECRET: getEnvVariable('JWT_SECRET'),
  JWT_REFRESH_SECRET: getEnvVariable('JWT_REFRESH_SECRET'),
  JWT_ACCESS_EXPIRE: getEnvVariable('JWT_ACCESS_EXPIRE', '15m'),
  JWT_REFRESH_EXPIRE: getEnvVariable('JWT_REFRESH_EXPIRE', '7d'),
  STORAGE_TYPE: getEnvVariable('STORAGE_TYPE', 'local') as 'local' | 'cloudinary' | 's3',
  UPLOAD_PATH: getEnvVariable('UPLOAD_PATH', './uploads'),
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  FRONTEND_URL: getEnvVariable('FRONTEND_URL', 'http://localhost:3000'),
  LOG_LEVEL: getEnvVariable('LOG_LEVEL', 'info'),
};
