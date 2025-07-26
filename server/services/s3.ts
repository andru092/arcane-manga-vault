import { S3Client, GetObjectCommand, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export class S3Service {
  private client: S3Client;
  private bucketName: string;

  constructor() {
    this.client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
    this.bucketName = process.env.S3_BUCKET_NAME || 'manga-vault-storage';
  }

  async uploadMangaPage(mangaId: string, chapterId: string, pageNumber: number, imageBuffer: Buffer, contentType: string): Promise<string> {
    const key = `manga/${mangaId}/chapters/${chapterId}/pages/${pageNumber.toString().padStart(3, '0')}.jpg`;
    
    try {
      await this.client.send(new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: imageBuffer,
        ContentType: contentType,
        CacheControl: 'max-age=31536000', // 1 year cache
      }));
      
      return key;
    } catch (error) {
      console.error('Error uploading manga page:', error);
      throw error;
    }
  }

  async uploadCoverImage(mangaId: string, imageBuffer: Buffer, contentType: string): Promise<string> {
    const key = `manga/${mangaId}/cover.jpg`;
    
    try {
      await this.client.send(new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: imageBuffer,
        ContentType: contentType,
        CacheControl: 'max-age=31536000', // 1 year cache
      }));
      
      return key;
    } catch (error) {
      console.error('Error uploading cover image:', error);
      throw error;
    }
  }

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });
      
      return await getSignedUrl(this.client, command, { expiresIn });
    } catch (error) {
      console.error('Error generating signed URL:', error);
      throw error;
    }
  }

  async checkObjectExists(key: string): Promise<boolean> {
    try {
      await this.client.send(new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      }));
      return true;
    } catch (error) {
      return false;
    }
  }

  generateMangaPageKey(mangaId: string, chapterId: string, pageNumber: number): string {
    return `manga/${mangaId}/chapters/${chapterId}/pages/${pageNumber.toString().padStart(3, '0')}.jpg`;
  }

  generateCoverKey(mangaId: string): string {
    return `manga/${mangaId}/cover.jpg`;
  }
}

export const s3Service = new S3Service();