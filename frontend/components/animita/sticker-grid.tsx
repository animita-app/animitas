'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import { ResponsiveDialog } from '@/components/ui/responsive-dialog'
import { Badge } from '@/components/ui/badge'
import { StickerReaction } from './sticker-reaction'
import type { Sticker } from '@/types/mock'

interface StickerGridProps {
  stickers: Sticker[]
  onAddSticker: (type: Sticker['type']) => void
}

const AVATARS = ['/avatar.png', '/avatar-1.png', '/avatar-2.png', '/avatar-3.png', '/avatar-4.png']

const getRandomAvatar = () => AVATARS[Math.floor(Math.random() * AVATARS.length)]

const FAKE_USERS: Record<string, { username: string; avatar: string }> = {
  'user-1': { username: '@pype', avatar: '/avatar.png' },
  'user-2': { username: '@vicpino', avatar: '/avatar-1.png' },
  'user-3': { username: '@mlarrain', avatar: '/avatar-2.png' },
  'user-4': { username: '@jkarich', avatar: '/avatar-3.png' },
  'user-5': { username: '@fmoure', avatar: '/avatar-4.png' },
  'user-6': { username: '@lvalenzuela', avatar: '/avatar.png' },
  'user-7': { username: '@tfolch', avatar: '/avatar-1.png' },
  'user-8': { username: '@svalenzuela', avatar: '/avatar-2.png' },
  'user-9': { username: '@pauline', avatar: '/avatar-3.png' },
  'user-10': { username: '@pype', avatar: '/avatar-4.png' },
  'user-11': { username: '@vicpino', avatar: '/avatar.png' },
  'user-12': { username: '@mlarrain', avatar: '/avatar-1.png' },
  'current-user': { username: 'Yo', avatar: getRandomAvatar() },
}

const STICKER_TYPES: Array<{ type: Sticker['type']; emoji?: string; image?: string }> = [
  { type: 'heart', emoji: '❤️' },
  { type: 'candle', emoji: '🕯️' },
  { type: 'teddy', emoji: '🧸' },
  { type: 'rose', emoji: '🌹' },
  { type: 'colo-colo', image: '/stickers/colo-colo.png' },
  { type: 'u-de-chile', image: '/stickers/u-de-chile.png' },
  { type: 'swanderers', image: '/stickers/swanderers.png' },
]

function getStickerDisplay(type: Sticker['type']): { emoji?: string; image?: string } {
  return STICKER_TYPES.find((s) => s.type === type) || { emoji: '❤️' }
}

export function StickerGrid({ stickers, onAddSticker }: StickerGridProps) {
  const [showDialog, setShowDialog] = useState(false)
  const [reactionType, setReactionType] = useState<Sticker['type'] | null>(null)
  const [showReaction, setShowReaction] = useState(false)

  const handleAddSticker = (type: Sticker['type']) => {
    setReactionType(type)
    setShowReaction(true)
    onAddSticker(type)
    setShowDialog(false)
  }

  return (
    <div className="space-y-2 -mx-6 pb-4">
      <h3 className="sr-only font-semibold text-sm">Stickers dejados ({stickers.length})</h3>
      <Carousel>
        <CarouselContent className="ml-0 my-4">
          <CarouselItem className="pl-3 basis-auto">
            <button
              onClick={() => setShowDialog(true)}
              className="relative group"
            >
              <div className="flex items-center justify-center size-20">
                <span className="text-[67px]">❤️</span>
              </div>
              <Badge className="max-w-20 h-5 p-0.5 pr-1 shrink-0 font-normal text-[10px] absolute -bottom-2 left-1/2 -translate-x-1/2 pointer-events-none flex gap-1 items-center justify-center">
                <Image src={FAKE_USERS['current-user'].avatar} alt="Yo" width={14} height={14} className="rounded-full" />
                <span className="text-[15px] -mt-0.5 font-normal items-center">+</span>
              </Badge>
            </button>
          </CarouselItem>

          {stickers.map((sticker) => {
            const user = FAKE_USERS[sticker.userId] || { username: '@user', avatar: '/avatar.png' }
            const display = getStickerDisplay(sticker.type)
            return (
              <CarouselItem key={sticker.id} className="pl-3 basis-auto">
                <div className="relative group">
                  <div className="flex items-center justify-center size-20 rounded-lg bg-muted/30">
                    {display.emoji ? (
                      <span className="text-[67px]">{display.emoji}</span>
                    ) : display.image ? (
                      <Image src={display.image} alt={sticker.type} width={80} height={80} className="object-contain" />
                    ) : (
                      <span className="text-[67px]">❤️</span>
                    )}
                  </div>
                  <Badge className="max-w-20 w-fit normal-case bg-background-weaker text-foreground h-fit p-0.5 pr-1 shrink-0 font-normal text-[10px] absolute -bottom-2 pointer-events-none flex gap-1 items-center justify-center">
                    <Image src={user.avatar} alt={user.username} width={14} height={14} className="rounded-full" />
                    <span className="truncate">{user.username}</span>
                  </Badge>
                </div>
              </CarouselItem>
            )
          })}
        </CarouselContent>
      </Carousel>

      <ResponsiveDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        title="Dejar un sticker"
        description="Elige el tipo de sticker que deseas dejar"
        className="!max-h-[40vh]"
      >
        <h3 className="text-lg pt-2 font-medium w-full text-center">
          Mis stickers
        </h3>
        <div className="grid grid-cols-5 gap-4 p-0">
          {STICKER_TYPES.map(({ type, emoji, image }) => (
            <button
              key={type}
              onClick={() => handleAddSticker(type)}
              className="flex items-center justify-center"
            >
              {emoji ? (
                <span className="text-[50px]">{emoji}</span>
              ) : image ? (
                <Image src={image} alt={type} width={48} height={48} className="object-contain" />
              ) : null}
            </button>
          ))}
        </div>
      </ResponsiveDialog>

      {reactionType && (
        <StickerReaction
          {...getStickerDisplay(reactionType)}
          userAvatar={FAKE_USERS['current-user'].avatar}
          isActive={showReaction}
        />
      )}
    </div>
  )
}
