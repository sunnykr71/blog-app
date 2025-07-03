import path from 'path'

function getFileExtension(contentType: string, originalName: string) {
  const mimeToExt: { [key: string]: string } = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/svg+xml': 'svg'
  }

  if (mimeToExt[contentType]) return mimeToExt[contentType]

  if (originalName) {
    const ext = path.extname(originalName)
    return ext.slice(1) || 'jpg'
  }

  return 'jpg'
}

export function generateFileName(contentType: string, originalName: string) {
  const timestamp = Date.now()
  const extension = getFileExtension(contentType, originalName)
  return `image-${timestamp}.${extension}`
}
