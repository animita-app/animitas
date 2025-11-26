import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { StickerItem } from './sticker-grid'
import { FAKE_USERS } from '@/constants/seedData'
import type { Petition } from '@/types/mock'
import { cn } from '@/lib/utils'

interface PetitionItemProps {
  petition: Petition
}

import { getUserId } from '@/lib/localStorage'

export function PetitionItem({ petition }: PetitionItemProps) {
  const currentUserId = typeof window !== 'undefined' ? getUserId() : null
  const isCurrentUser = petition.userId === currentUserId

  const user = isCurrentUser
    ? FAKE_USERS['current-user']
    : (FAKE_USERS[petition.userId] || { username: 'Anónimo', avatar: '' })

  const date = formatDistanceToNow(new Date(petition.fecha), { addSuffix: true, locale: es })

  // Reactions logic: top 3 unique stickers + count
  const reactionCount = petition.reactions?.length || 0
  const uniqueReactions = Array.from(new Set(petition.reactions?.map(r => r.type) || [])).slice(0, 3)

  return (
    <div className="p-3 rounded-xl border border-border-weak bg-card text-card-foreground space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.avatar} alt={user.username} />
          <AvatarFallback>{user.username[0]}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col space-y-1">
          <span className="text-sm font-medium leading-none lowercase">{user.username}</span>
          <span className="text-xs text-muted-foreground uppercase">{date}</span>
        </div>
      </div>

      {/* Content */}
      <p className="text-sm text-strong normal-case font-sans leading-relaxed">
        {petition.texto}
      </p>

      {/* Footer / Reactions */}
      <Badge variant="secondary" className="-mx-1 !bg-background-weaker/80 w-fit gap-1 px-2 h-8 items-center font-normal">
        <div className="flex items-center gap-0.5">
          {reactionCount > 0 ?
            uniqueReactions.map((type, i) => (
              <div key={i} className="relative">
                <StickerItem
                  type={type}
                  className="w-5 h-5 text-xl text-center leading-none"
                />
              </div>
            ))
          : "❤️"}
        </div>
        <span className="text-xs text-text-strong">{reactionCount || 0}</span>
      </Badge>
    </div>
  )
}

export function PetitionInput({ onClick, animitaName }: { onClick: () => void; animitaName: string }) {
  const user = FAKE_USERS['current-user']

  return (
    <div
      onClick={onClick}
      className="p-3 rounded-xl border border-border-weak hover:bg-muted/80 cursor-pointer space-y-4 group"
    >
      <div className="flex items-center gap-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.avatar} alt={user.username} />
          <AvatarFallback>Yo</AvatarFallback>
        </Avatar>
        <div className="flex flex-col space-y-1">
          <span className="text-sm font-medium leading-none lowercase">{user.username}</span>
          <span className="text-xs text-muted-foreground uppercase">EN {animitaName}</span>
        </div>
      </div>

      <p className="text-sm font-normal text-muted-foreground/80 font-sans normal-case">
        Deja tu reflexión...
      </p>
    </div>
  )
}
