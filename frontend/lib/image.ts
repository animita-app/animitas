import { getErrorMessage } from './utils'
import { uploadImageToSupabase } from './supabase'

interface ImageUploadOptions {
  folder?: string // Supabase bucket path prefix
}

export async function uploadImage(
  file: File,
  options: ImageUploadOptions = {}
): Promise<string> {
  if (!isValidImageFile(file)) {
    throw new Error(getImageError(file) || 'Invalid image file.')
  }

  const bucket = 'base' // User specified 'base' bucket
  const folder = options.folder || 'animitas/images' // Default folder in Supabase
  const fileName = `${folder}/${Date.now()}-${file.name}`

  try {
    const imageUrl = await uploadImageToSupabase(file, bucket, fileName)
    return imageUrl
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

// The cloudinaryUrl and thumbnailUrl functions are no longer needed as we are using Supabase Storage.
// Supabase provides direct public URLs for uploaded files.
// If any existing code relies on these, it will need to be updated to use the direct Supabase URLs.