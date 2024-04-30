import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class FileUploadService {
  async uploadFile(file: Express.Multer.File) {
    const API_URL =
      'https://' +
      process.env.COS_BASE_URL +
      '/' +
      process.env.COS_STORAGE_ZONE_NAME +
      '/' +
      file.originalname;

    const response = await fetch(API_URL, {
      method: 'PUT',
      headers: {
        AccessKey: process.env.COS_FTP_KEY,
        'Content-Type': 'application/octet-stream',
      },
      body: file.buffer,
    });

    const res = await response.json();
    if (res.HttpCode != 201) {
      throw new BadRequestException('File upload failed to COS');
    }
  }
}
