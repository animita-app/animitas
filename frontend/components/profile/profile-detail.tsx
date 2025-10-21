'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { getInitials } from '@/lib/utils'
import { LogOut, Pencil } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase'
import { useState, useRef } from 'react'

interface ProfileDetailProps {
  user: User
}

export function ProfileDetail({ user }: ProfileDetailProps) {
  const { user: sessionUser } = useAuth()
  const isOwnProfile = sessionUser?.user_metadata?.username === user?.username
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !isOwnProfile) return

    try {
      setUploading(true)

      const fileExt = file.name.split('.').pop()
      const fileName = `avatar-${Date.now()}.${fileExt}`
      const filePath = `users/${user.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('base')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('base').getPublicUrl(filePath)

      const { error: updateError } = await supabase
        .from('users')
        .update({ image: data.publicUrl })
        .eq('id', user.id)

      if (updateError) throw updateError
    } catch (error) {
      console.error('Error uploading image:', error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6 pt-4">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar className="size-16 *:bg-secondary text-xl">
            <AvatarImage
              src={user.image || ""}
              alt={user.display_name || ""}
            />
            <AvatarFallback>{getInitials(user?.display_name || user?.username || '')}</AvatarFallback>
          </Avatar>

          {isOwnProfile && (
            <>
              <Button
                size="icon"
                onClick={handleUploadClick}
                disabled={uploading}
                className="absolute size-7 translate-x-1 rounded-full translate-y-1 bottom-0 right-0 !bg-primary text-white"
              >
                <Pencil className="size-4" />
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </>
          )}
        </div>
        <div className="flex-1 space-y-0.5">
          <h2 className="text-lg font-medium">{user?.display_name}</h2>
          <p className="text-muted-foreground">@{user?.username}</p>
        </div>
      </div>

      {user?.created_at && (
        <div className="text-xs text-muted-foreground">
          <p>Se unió el {new Date(user.created_at).toLocaleDateString()}</p>
        </div>
      )}

      {isOwnProfile && (
        <Button
          variant="secondary"
          onClick={handleLogout}
          className="w-full"
        >
          <LogOut />
          Cerrar sesión
        </Button>
      )}
    </div>
  )
}
