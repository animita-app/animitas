'use client'

import { useSession, signOut } from 'next-auth/react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { getInitials } from '@/lib/utils'
import { Pencil } from 'lucide-react'
import { useRef, useState } from 'react'
import { uploadToCloudinary } from '@/lib/cloudinary'

export function ProfileCard() {
  const { data: session, update } = useSession()
  const user = session?.user
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const imageUrl = await uploadToCloudinary(file)

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageUrl }),
      })

      if (response.ok) {
        await update({ image: imageUrl })
      } else {
        console.error('Failed to update profile picture')
      }
    } catch (error) {
      console.error('Failed to upload image', error)
    } finally {
      setUploading(false)
    }
  }

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/auth' })
  }

  if (!user) {
    return null // Or a loading state
  }

  const userName = (user as any)?.displayName || user?.name || 'Usuario'
  const userUsername = (user as any)?.username
  const userImage = user?.image

  return (
    <div className="p-4">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar className="size-16">
            {userImage && <AvatarImage src={userImage} alt={userName} />}
            <AvatarFallback>{getInitials(userName)}</AvatarFallback>
          </Avatar>
          <button
            className="absolute bottom-0 right-0 bg-black rounded-full p-2 ml-2 mt-2"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
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
        </div>
        <div>
          <h2 className="text-lg font-semibold">{userName}</h2>
          {userUsername && <p className="text-muted-foreground">@{userUsername}</p>}
        </div>
      </div>
      <Button onClick={handleLogout} className="mt-4">
        Salir
      </Button>
    </div>
  )
}
