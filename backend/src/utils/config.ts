import { config } from 'dotenv'

config()

const PORT: number | undefined = Number(process.env.PORT) || 3001
const DATABASE_URL = process.env.DATABASE_URL
const DEV_DATABASE_URL = process.env.DEV_DATABASE_URL
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY
const AWS_REGION = process.env.AWS_REGION
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME
const SIGNED_URL_EXPIRATION = Number(process.env.SIGNED_URL_EXPIRATION) || 300

export default {
  PORT,
  DATABASE_URL,
  DEV_DATABASE_URL,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_REGION,
  S3_BUCKET_NAME,
  SIGNED_URL_EXPIRATION
}
