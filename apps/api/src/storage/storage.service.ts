import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private s3Client?: S3Client;
  private readonly provider: string;
  private readonly bucket: string;
  private readonly localUploadDir = 'uploads';

  constructor(private readonly configService: ConfigService) {
    this.provider = configService.get<string>('STORAGE_PROVIDER', 'local');
    this.bucket = configService.get<string>('AWS_S3_BUCKET', 'elearning-private');

    if (this.provider === 's3') {
      this.s3Client = new S3Client({
        region: configService.get<string>('AWS_REGION', 'ap-southeast-1'),
        credentials: {
          accessKeyId: configService.get<string>('AWS_ACCESS_KEY_ID', ''),
          secretAccessKey: configService.get<string>('AWS_SECRET_ACCESS_KEY', ''),
        },
      });
    } else {
      // Ensure local upload directory exists
      if (!fs.existsSync(this.localUploadDir)) {
        fs.mkdirSync(this.localUploadDir, { recursive: true });
      }
    }
  }

  /**
   * Upload a file to private storage (no public access)
   * Returns a key/path that can later be used to generate a signed URL
   */
  async uploadPrivate(buffer: Buffer, key: string): Promise<string> {
    if (this.provider === 's3' && this.s3Client) {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: buffer,
        }),
      );
      this.logger.log(`Uploaded to S3: ${key}`);
      return key; // Return the key, not a public URL
    }

    // Local fallback
    const filePath = path.join(this.localUploadDir, key.replace(/\//g, '_'));
    fs.writeFileSync(filePath, buffer);
    this.logger.log(`Saved locally: ${filePath}`);
    return key;
  }

  /**
   * Generate a time-limited signed URL for private file access
   */
  async getSignedUrl(key: string, expiresInSeconds = 300): Promise<string> {
    if (this.provider === 's3' && this.s3Client) {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      return getSignedUrl(this.s3Client, command, { expiresIn: expiresInSeconds });
    }

    // Local fallback: return a local server URL (for development only)
    return `http://localhost:3001/api/storage/local/${key.replace(/\//g, '_')}`;
  }

  /**
   * Upload public asset (thumbnails, etc.)
   */
  async uploadPublic(buffer: Buffer, key: string, mimeType?: string): Promise<string> {
    const publicBucket = this.configService.get<string>('AWS_S3_PUBLIC_BUCKET', this.bucket);

    if (this.provider === 's3' && this.s3Client) {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: publicBucket,
          Key: key,
          Body: buffer,
          ContentType: mimeType,
          ACL: 'public-read' as any,
        }),
      );
      const region = this.configService.get<string>('AWS_REGION', 'ap-southeast-1');
      return `https://${publicBucket}.s3.${region}.amazonaws.com/${key}`;
    }

    // Local fallback
    const filePath = path.join(this.localUploadDir, 'public', key.replace(/\//g, '_'));
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, buffer);
    return `http://localhost:3001/api/storage/public/${key.replace(/\//g, '_')}`;
  }
}
