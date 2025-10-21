'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { getInitials } from '@/lib/utils'
import { LogOut } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { useSession } from 'next-auth/react'

interface ProfileDetailProps {
  user: {
    id: string
    username: string
    displayName?: string
    email?: string
    phone?: string
    image?: string
    stats?: {
      memorialsCreated: number
      listsCreated: number
      candles: number
    }
    createdAt?: string
  }
}

export function ProfileDetail({ user }: ProfileDetailProps) {
  const { data: session } = useSession()
  const sessionUser = session?.user as any
  const isOwnProfile = sessionUser?.username === user?.username

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/' })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Avatar className="size-16 text-xl">
          {user?.image && <AvatarImage src={user.image} alt={user.displayName || user.username} />}
          <AvatarFallback>{getInitials(user?.displayName || user?.username)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h2 className="text-xl font-medium">{user?.displayName || user?.username}</h2>
          <p className="text-muted-foreground">@{user?.username}</p>
        </div>
      </div>

      {user?.stats && (
        <div className="grid grid-cols-3 gap-3 py-4">
          <div className="text-center">
            <p className="text-lg font-semibold">{user.stats.memorialsCreated}</p>
            <p className="text-muted-foreground">Memorials</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold">{user.stats.listsCreated}</p>
            <p className="text-muted-foreground">Lists</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold">{user.stats.candles}</p>
            <p className="text-muted-foreground">Candles</p>
          </div>
        </div>
      )}

      {user?.createdAt && (
        <div className="text-xs text-muted-foreground">
          <p>Se unió el {new Date(user.createdAt).toLocaleDateString()}</p>
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
