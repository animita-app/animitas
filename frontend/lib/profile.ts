import { uploadToCloudinary, getImageError } from './image'
import { showSuccess, showError } from './notifications'
import { apiPatch } from './api'
import { getErrorMessage } from './utils'


export async function handleProfileImageUpload(
  file: File,
  onUpdate?: (url: string) => Promise<void>
): Promise<string | null> {
  const imageError = getImageError(file)
  if (imageError) {
    showError(imageError)
    return null
  }

  try {
    const imageUrl = await uploadToCloudinary(file, { folder: 'profiles' })
    const { error } = await apiPatch('/profile', { profilePicture: imageUrl })

    if (error) {
      showError(error)
      return null
    }

    showSuccess('Profile picture updated')
    if (onUpdate) {
      await onUpdate(imageUrl)
    }
    return imageUrl
  } catch (error) {
    showError(getErrorMessage(error))
    return null
  }
}

export function getUserDisplayInfo(
  user: any,
  sessionUser: any
): { displayName: string; username: string; image: string | null } {
  return {
    displayName: user?.displayName || sessionUser?.displayName || sessionUser?.name || 'Usuario',
    username: user?.username || sessionUser?.username || '',
    image: user?.profilePicture || user?.image || sessionUser?.image || null
  }
}

export interface ProfileStats {
  memorialsCreated: number
  candles: number
}

export async function fetchUserMemorials(userId: string) {
  const response = await fetch(`/api/memorials?userId=${userId}`)
  if (!response.ok) throw new Error('Failed to fetch memorials')
  return response.json()
}
