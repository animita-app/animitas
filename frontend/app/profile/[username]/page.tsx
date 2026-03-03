"use client"

import { useParams } from 'next/navigation'
import { useUser } from '@/contexts/user-context'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function ProfilePage() {
  const params = useParams()
  const { currentUser } = useUser()
  const username = decodeURIComponent(params.username as string).replace(/@/g, '')

  if (!currentUser) {
    return <div className="p-6">Loading...</div>
  }

  const isOwnProfile = currentUser.username?.toLowerCase() === username?.toLowerCase()

  return (
    <div className="flex h-svh w-full items-center justify-center bg-background p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-4 text-center">
          <Avatar className="mx-auto size-24">
            <AvatarImage src={currentUser.avatarUrl || undefined} alt={currentUser.name} />
            <AvatarFallback>{currentUser?.username?.[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold text-text-strong">{currentUser.name}</h1>
            <p className="text-sm text-text-weak">@{username}</p>
          </div>
        </div>

        {isOwnProfile && (
          <div className="space-y-4 border-t border-border-weak pt-6">
            <button className="w-full rounded-lg bg-accent px-4 py-2 text-white transition-colors hover:bg-accent/90">
              Editar Perfil
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
