import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

@Injectable()
export class FileUploadService {
  constructor() {
    // Configure Cloudinary with environment variables
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async deleteFile(publicId: string) {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(
        publicId,
        { invalidate: true, resource_type: 'raw' },
        (error, result) => {
          if (error) return reject(error);
          if (result.result == 'ok') resolve(result);
          reject({
            error: 'resource not found',
            message: 'file with public id ' + publicId + ' was not found',
          });
        },
      );
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    fileName: string,
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const mimeType = file.mimetype;
      // Convert buffer to base64
      const base64String = `data:${mimeType};base64,${file.buffer.toString('base64')}`;

      // Upload to Cloudinary
      cloudinary.uploader.upload(
        base64String,
        {
          public_id: fileName,
          resource_type: 'raw',
        },
        (error, result) => {
          if (error) {
            return reject(error);
          }
          resolve(result);
        },
      );
    });
  }
}
