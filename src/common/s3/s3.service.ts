import { Injectable } from '@nestjs/common';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { FileDto } from './dto/file.dto';
import * as buffer from 'buffer';

@Injectable()
export class S3Service {
  private readonly s3Client: S3Client;
  constructor(private configService: ConfigService) {
    this.s3Client = new S3Client({
      region: configService.get('aws.region'),
      endpoint: configService.get('aws.endpoint'),
      credentials: {
        accessKeyId: configService.get('aws.access_key_id'),
        secretAccessKey: configService.get('aws.secret_access_key'),
      },
    });
  }

  async uploadAvatar(
    buffer_file: buffer.Buffer,
    key: string,
    typeContent: string,
  ) {
    const file: FileDto = {
      key: key,
      bucket: this.configService.get('aws.bucket_avatars'),
    };
    return await this.uploadFile(file, buffer_file, `image/${typeContent}`);
  }
  async downloadAvatar(key: string) {
    const file: FileDto = {
      key: key,
      bucket: this.configService.get('aws.bucket_avatars'),
    };
    return await this.downloadFile(file);
  }
  async removeAvatar(key: string) {
    const file: FileDto = {
      key: key,
      bucket: this.configService.get('aws.bucket_avatars'),
    };
    return await this.removeFile(file);
  }
  async getLinkAvatar(key: string) {
    return `https://storage.yandexcloud.net/${this.configService.get<string>('aws.bucket_avatars')}/${key}`;
  }

  async uploadPost(buffer_file: buffer.Buffer, key: string) {
    const file: FileDto = {
      key: key,
      bucket: this.configService.get('aws.bucket_posts'),
    };
    return await this.uploadFile(file, buffer_file, 'text/plain');
  }
  async downloadPost(key: string) {
    const file: FileDto = {
      key: key,
      bucket: this.configService.get('aws.bucket_posts'),
    };
    return await this.downloadFile(file);
  }
  async removePost(key: string) {
    const file: FileDto = {
      key: key,
      bucket: this.configService.get('aws.bucket_posts'),
    };
    return await this.removeFile(file);
  }
  async getLinkPost(key: string) {
    return `https://storage.yandexcloud.net/${this.configService.get<string>('aws.bucket_posts')}/${key}`;
  }

  async uploadFile(
    file: FileDto,
    buffer_file: buffer.Buffer,
    typeContent: string,
  ) {
    const command = new PutObjectCommand({
      Body: buffer_file,
      Bucket: file.bucket,
      Key: file.key,
      ContentType: typeContent,
    });
    return await this.s3Client.send(command);
  }
  async downloadFile(file: FileDto) {
    const command = new GetObjectCommand({
      Bucket: file.bucket,
      Key: file.key,
    });
    return await this.s3Client.send(command);
  }
  async removeFile(file: FileDto) {
    const command = new DeleteObjectCommand({
      Bucket: file.bucket,
      Key: file.key,
    });
    return await this.s3Client.send(command);
  }
}
