export async function handleProfileImageUpload(
  file: File,
  onUpdate?: (url: string) => Promise<void>
): Promise<string | null> {
  throw new Error('Profile image upload not available in mockup mode')
}

export function getUserDisplayInfo(
  user: any,
  sessionUser: any
): { displayName: string; username: string; image: string | null } {
  return {
    displayName: user?.displayName || sessionUser?.displayName || sessionUser?.name || 'Usuario',
    username: user?.username || sessionUser?.username || '',
    image: user?.image || sessionUser?.image || null
  }
}

export interface ProfileStats {
  memorialsCreated: number
  candles: number
}

export async function fetchUserMemorials(userId: string) {
  throw new Error('Fetching user memorials not available in mockup mode')
}
