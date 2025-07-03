import { Request, Response, NextFunction } from 'express'
import { getSignedUploadUrl } from '../lib/s3'
import { generateFileName } from '../utils/upload-helpers'

async function getSignedPutUrl(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { contentType, fileName } = req.body
  try {
    const key = generateFileName(contentType, fileName)

    const url = await getSignedUploadUrl(contentType, key)
    res.status(200).json({
      success: true,
      message: 'Signed upload URL fetched successfully',
      data: { url, key }
    })
  } catch (err) {
    next(err)
  }
}

export default {
  getSignedPutUrl
}
