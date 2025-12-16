import multer from 'multer';
import path from 'path';
import { env } from './env';
import fs from 'fs';

const uploadDir = env.UPLOAD_PATH || './uploads';

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

export const storageConfig = env.STORAGE_TYPE === 'local' ? localStorage : localStorage;
