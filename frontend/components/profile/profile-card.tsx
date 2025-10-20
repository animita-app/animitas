'use client'

import { useSession, signOut } from 'next-auth/react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { getInitials, getErrorMessage } from '@/lib/utils'
import { uploadToCloudinary, getImageError, isValidImageFile } from '@/lib/image'
import { showSuccess, showError } from '@/lib/notifications'
import { Pencil } from 'lucide-react'
import { useRef, useState } from 'react'

interface ProfileCardProps {
  userId?: string
  displayName?: string
  username?: string
  profilePicture?: string | null
  isOwnProfile?: boolean
  onImageUpdate?: (url: string) => void
}

export function ProfileCard({
  userId,
  displayName,
  username,
  profilePicture,
  isOwnProfile = true,
  onImageUpdate
}: ProfileCardProps) {
  const { data: session, update } = useSession()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const sessionUser = session?.user as any
  const user = {
    displayName: displayName || sessionUser?.displayName || sessionUser?.name || 'Usuario',
    username: username || sessionUser?.username,
    image: profilePicture || sessionUser?.image
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const imageError = getImageError(file)
    if (imageError) {
      showError(imageError)
      return
    }

    setUploading(true)
    try {
      const imageUrl = await uploadToCloudinary(file, { folder: 'profiles' })

      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profilePicture: imageUrl })
      })

      if (response.ok) {
        await update({ image: imageUrl })
        showSuccess('Profile picture updated')
        onImageUpdate?.(imageUrl)
      } else {
        showError('Failed to update profile picture')
      }
    } catch (error) {
      showError(`Upload failed: ${getErrorMessage(error)}`)
    } finally {
      setUploading(false)
    }
  }

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/auth' })
  }

  return (
    <div className="p-4 pb-8 h-full flex flex-col justify-between">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar className="size-16 relative text-xl">
            {user.image && <AvatarImage src={user.image} alt={user.displayName} />}
            <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
          </Avatar>
          {isOwnProfile && (
            <>
              <button
                className="absolute bottom-0 right-0 bg-black rounded-full p-2 ml-2 mt-2"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                aria-label="Edit profile picture"
              >
                <Pencil className="size-4 text-white" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleImageUpload}
                accept="image/*"
              />
            </>
          )}
        </div>
        <div>
          <h2 className="text-lg font-semibold">{user.displayName}</h2>
          {user.username && <p className="text-muted-foreground">@{user.username}</p>}
        </div>
      </div>

      {isOwnProfile && (
        <Button
          variant="secondary"
          onClick={handleLogout}
          className="w-full mt-auto"
        >
          Cerrar sesión
        </Button>
      )}
    </div>
  )
}
