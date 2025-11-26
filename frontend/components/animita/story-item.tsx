import React from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

export interface Story {
  id: string
  type: 'image' | 'video'
  src: string
  user: {
    username: string
    avatar: string
  }
  isLive?: boolean
  viewed?: boolean
}

interface StoryItemProps {
  story: Story
  onClick: () => void
  className?: string
}

export function StoryItem({ story, onClick, className }: StoryItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn("flex flex-col items-center gap-1 group", className)}
    >
      <div className={cn(
        "relative p-[3px] rounded-full transition-transform duration-200 group-hover:scale-105",
        story.viewed
          ? "bg-border"
          : "bg-gradient-to-tr from-[#00e] to-blue-400"
      )}>
        <div className="relative w-16 h-16 rounded-full border-2 border-background overflow-hidden bg-muted">
          <Image
            src={story.user.avatar}
            alt={story.user.username}
            fill
            className="object-cover"
          />

          {/* Live Badge */}
          {story.isLive && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              {/* Optional overlay for live stories */}
            </div>
          )}
        </div>

        {story.isLive && (
          <Badge className="uppercase absolute -bottom-2 left-1/2 -translate-x-1/2 h-5 px-1.5 bg-[#00e] text-[10px] border-2 border-background font-medium tracking-wider">
            Vivo
          </Badge>
        )}
      </div>

      <span className="sr-only text-xs text-muted-foreground truncate max-w-[70px]">
        {story.user.username}
      </span>
    </button>
  )
}
