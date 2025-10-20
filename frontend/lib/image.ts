import { getErrorMessage } from './utils'

interface CloudinaryResponse {
  secure_url: string
  public_id: string
  width: number
  height: number
  bytes: number
}

interface ImageUploadOptions {
  folder?: string
  resourceType?: 'image' | 'video' | 'auto'
  quality?: 'auto' | string
  transformation?: Record<string, any>[]
}

export async function uploadToCloudinary(
  file: File,
  options: ImageUploadOptions = {}
): Promise<string> {
  try {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

    if (!cloudName || !uploadPreset) {
      throw new Error('Cloudinary configuration missing')
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', uploadPreset)
    formData.append('folder', options.folder || 'animitas')

    if (options.resourceType) {
      formData.append('resource_type', options.resourceType)
    }

    if (options.quality) {
      formData.append('quality', options.quality)
    }

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    )

    if (!response.ok) {
      throw new Error('Upload failed')
    }

    const data: CloudinaryResponse = await response.json()
    return data.secure_url
  } catch (error) {
    throw new Error(`Image upload failed: ${getErrorMessage(error)}`)
  }
}

export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        resolve({ width: img.width, height: img.height })
      }
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = e.target?.result as string
    }

    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

export function isValidImageFile(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  const maxSize = 5 * 1024 * 1024

  if (!validTypes.includes(file.type)) {
    return false
  }

  if (file.size > maxSize) {
    return false
  }

  return true
}

export function getImageError(file: File): string | null {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  const maxSize = 5 * 1024 * 1024

  if (!validTypes.includes(file.type)) {
    return 'Invalid image format. Use JPG, PNG, WebP, or GIF.'
  }

  if (file.size > maxSize) {
    return 'Image is too large. Maximum size is 5MB.'
  }

  return null
}

export function compressImage(
  dataUrl: string,
  quality: number = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()

    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Failed to get canvas context'))
        return
      }

      ctx.drawImage(img, 0, 0)
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob)
          else reject(new Error('Failed to compress image'))
        },
        'image/jpeg',
        quality
      )
    }

    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = dataUrl
  })
}

export function cloudinaryUrl(
  publicId: string,
  options: Record<string, any> = {}
): string {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  if (!cloudName) return ''

  const transformations = Object.entries(options)
    .map(([key, value]) => `${key}_${value}`)
    .join(',')

  const transform = transformations ? `/${transformations}` : ''
  return `https://res.cloudinary.com/${cloudName}/image/upload${transform}/${publicId}`
}

export function thumbnailUrl(imageUrl: string, width: number = 200): string {
  if (!imageUrl.includes('cloudinary.com')) return imageUrl

  const parts = imageUrl.split('/upload/')
  if (parts.length !== 2) return imageUrl

  return `${parts[0]}/upload/w_${width},h_${width},c_fill,q_auto/${parts[1]}`
}
