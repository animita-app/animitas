import React from 'react'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface UserBadgeProps {
  user: {
    username: string
    avatar: string
  }
  className?: string
  variant?: 'default' | 'minimal'
}

export function UserBadge({ user, className, variant = 'default' }: UserBadgeProps) {
  return (
    <Badge
      className={cn(
        "max-w-20 w-fit normal-case bg-background-weaker text-foreground h-fit p-0.5 pr-1 shrink-0 font-normal text-[10px] pointer-events-none flex gap-1 items-center justify-center",
        className
      )}
    >
      <Image
        src={user.avatar}
        alt={user.username}
        width={16}
        height={16}
        className="rounded-full shrink-0 w-4 h-4 object-cover"
      />
      <span className="truncate max-w-[4.5rem]">{user.username}</span>
    </Badge>
  )
}
