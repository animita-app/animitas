import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { getInitials } from '@/lib/utils'

interface ProfileDetailProps {
  user: any
}

export function ProfileDetail({ user }: ProfileDetailProps) {
  return (
    <div className="space-y-6 pt-4">
      <div className="flex items-center gap-4">
        <Avatar className="size-16 *:bg-secondary text-xl">
          <AvatarFallback>{getInitials(user?.display_name || user?.username || '')}</AvatarFallback>
        </Avatar>
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
    </div>
  )
}
