import multer from 'multer';
import { Request } from 'express';
import { storageConfig } from '../config/storage';
import { ValidationError } from '../utils/ApiError';

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ValidationError('Only image files (JPEG, PNG, GIF, WebP) are allowed'));
  }
};

export const uploadImage = multer({
  storage: storageConfig,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter,
});
