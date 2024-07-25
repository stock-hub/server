import {
  DeleteObjectCommand,
  DeleteObjectCommandOutput,
  GetObjectCommand,
  GetObjectCommandOutput,
  PutObjectCommand,
  PutObjectCommandOutput,
  S3Client
} from '@aws-sdk/client-s3'
import { config } from '../config/aws.config'

export class S3StorageService {
  #client: S3Client

  constructor() {
    this.#client = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey
      }
    })
  }

  async upload(options: {
    filename: string
    body: Buffer
  }): Promise<PutObjectCommandOutput> {
    const command = new PutObjectCommand({
      Bucket: config.bucketName,
      Key: options.filename,
      Body: options.body,
      ContentType: 'pdf'
    })

    return await this.#client.send(command)
  }

  async download(filename: string): Promise<GetObjectCommandOutput> {
    const command = new GetObjectCommand({
      Bucket: config.bucketName,
      Key: filename
    })

    return await this.#client.send(command)
  }

  async deleteItem(filename: string): Promise<DeleteObjectCommandOutput> {
    const command = new DeleteObjectCommand({
      Bucket: config.bucketName,
      Key: filename
    })

    return await this.#client.send(command)
  }
}
