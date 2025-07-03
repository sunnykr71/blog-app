import {
  DeleteObjectsCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import config from '../utils/config'
import { get } from 'http'

const s3Client = new S3Client({
  region: config.AWS_REGION!,
  credentials: {
    accessKeyId: config.AWS_ACCESS_KEY_ID!,
    secretAccessKey: config.AWS_SECRET_ACCESS_KEY!
  }
})

export async function getObjectUrl(key: string) {
  const command = new GetObjectCommand({
    Bucket: config.S3_BUCKET_NAME!,
    Key: `blog-images/${key}`
  })
  const url = await getSignedUrl(s3Client, command, { expiresIn: config.SIGNED_URL_EXPIRATION })
  return url
}

export async function getSignedUploadUrl(contentType: string, key: string) {
  const command = new PutObjectCommand({
    Bucket: config.S3_BUCKET_NAME,
    Key: `blog-images/${key}`,
    ContentType: contentType
  })

  const url = await getSignedUrl(s3Client, command, { expiresIn: config.SIGNED_URL_EXPIRATION })
  return url
}

export async function deleteS3Objects(keys: string[]) {
  if (keys.length === 0) return

  const command = new DeleteObjectsCommand({
    Bucket: config.S3_BUCKET_NAME,
    Delete: {
      Objects: keys.map(key => ({
        Key: `blog-images/${key}`
      }))
    }
  })

  await s3Client.send(command)
}

export async function getListObjects() {
  const command = new ListObjectsV2Command({
    Bucket: config.S3_BUCKET_NAME
  })

  const response = await s3Client.send(command)
  return response
}

export default s3Client
