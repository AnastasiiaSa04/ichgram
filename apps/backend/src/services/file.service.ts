import { ValidationError } from '../utils/ApiError';
import { env } from '../config/env';
import path from 'path';
import fs from 'fs';

export class FileService {
  static async uploadFile(file: Express.Multer.File): Promise<string> {
    await this.validateFileType(file);

    if (env.STORAGE_TYPE === 'local') {
      return `/uploads/${file.filename}`;
    }

    return file.path;
  }

  static async deleteFile(fileUrl: string): Promise<void> {
    if (env.STORAGE_TYPE === 'local') {
      const filename = path.basename(fileUrl);
      const filepath = path.join(env.UPLOAD_PATH, filename);

      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    }
  }

  private static async validateFileType(file: Express.Multer.File): Promise<void> {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new ValidationError('Invalid file type. Only JPEG, PNG, GIF and WebP are allowed');
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new ValidationError('File size too large. Maximum size is 5MB');
    }
  }
}
