'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import confetti from "canvas-confetti"
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import { ResponsiveDialog } from '@/components/ui/responsive-dialog'
import { Badge } from '@/components/ui/badge'
import type { Sticker } from '@/types/mock'
import { cn } from '@/lib/utils'
import { getAnimitaStickersByUser, addSticker, getUserId } from '@/lib/localStorage'
import { FAKE_USERS } from '@/constants/seedData'

interface StickerGridProps {
  stickers: Sticker[]
  onAddSticker: (type: Sticker['type']) => void
  animitaId: string
}

const FAKE_USER_KEYS = Object.keys(FAKE_USERS).filter(k => k !== 'current-user')

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

interface StickerItemProps {
  type: Sticker['type']
  className?: string
}

export function StickerItem({ type, className }: StickerItemProps) {
  const display = getStickerDisplay(type)

  return (
    <>
      {display.emoji ? (
        <span className={cn("text-[67px] leading-none", className)}>{display.emoji}</span>
      ) : display.image ? (
        <Image
          src={display.image}
          alt={type}
          width={80}
          height={80}
          className={cn("w-20 h-20 object-contain p-1", className)}
        />
      ) : (
        <span className={cn("text-[67px] leading-none animate-[heartbeat_5s_ease-in-out_infinite]", className)}>❤️</span>
      )}
    </>
  )
}



export function StickerGrid({ stickers, onAddSticker, animitaId }: StickerGridProps) {
  const [showDialog, setShowDialog] = useState(false)
  const [reactionType, setReactionType] = useState<Sticker['type'] | null>(null)
  const [confettiImage, setConfettiImage] = useState<{ src: string, x: number, y: number, key: number } | null>(null)

  useEffect(() => {
    const userId = getUserId()
    setReactionType(null)

    if (userId && animitaId) {
      const userStickers = getAnimitaStickersByUser(animitaId)
      const existingSticker = userStickers.find(s => s.userId === userId)
      setReactionType(existingSticker?.type || null)
    }
  }, [animitaId, stickers])

  const triggerRef = useRef<HTMLButtonElement>(null)
  const [currentUserId, setCurrentUserId] = useState<string>('')

  useEffect(() => {
    setCurrentUserId(getUserId())
  }, [])

  const handleAddSticker = (type: Sticker['type']) => {
    setReactionType(type)
    addSticker(animitaId, type)

    onAddSticker(type)
    setShowDialog(false)

    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      const x = rect.left + rect.width / 2
      const y = rect.top + rect.height / 2

      const display = getStickerDisplay(type)
      const origin = {
        x: x / window.innerWidth,
        y: y / window.innerHeight,
      }

      if (display.emoji) {
        const scalar = 3
        const emojiShape = confetti.shapeFromText({ text: display.emoji, scalar })

        confetti({
          origin,
          spread: 128,
          ticks: 32,
          gravity: 0,
          decay: 0.96,
          startVelocity: 20,
          shapes: [emojiShape],
          scalar,
          particleCount: 24,
          zIndex: 100,
        })
      } else if (type === 'colo-colo') {
        confetti({
          origin,
          particleCount: 50,
          spread: 70,
          colors: ['#ffffff', '#000000'],
          zIndex: 100,
        })
      } else if (type === 'u-de-chile') {
        confetti({
          origin,
          particleCount: 50,
          spread: 70,
          colors: ['#0039A6', '#D52B1E'], // Blue and Red
          zIndex: 100,
        })
      } else if (type === 'swanderers') {
        confetti({
          origin,
          particleCount: 50,
          spread: 70,
          colors: ['#009639', '#ffffff'], // Green and White
          zIndex: 100,
        })
      } else {
        confetti({
          origin,
          particleCount: 100,
          spread: 70,
          zIndex: 100,
        })
      }
    }
  }

  const handleOpenChange = (open: boolean) => {
    setShowDialog(open)
  }

  return (
    <div className="space-y-2 -mt-2">
      <h3 className="sr-only font-semibold text-sm">Stickers dejados ({stickers.length})</h3>
      <Carousel opts={{ dragFree: true }}>
        <CarouselContent className="-ml-2 my-4">
          {reactionType ? (
            <CarouselItem className="ml-2 pl-3 basis-auto">
              <button
                ref={triggerRef}
                onClick={() => setShowDialog(true)}
                className="relative group flex items-center justify-center"
              >
                <div className="flex items-center justify-center size-20 rounded-lg">
                  <StickerItem type={reactionType} />
                </div>
                <Badge className="absolute -bottom-2 left-1/2 -translate-x-1/2 max-w-20 w-fit normal-case bg-background-weaker text-foreground h-fit p-0.5 pr-1 shrink-0 font-normal text-[10px] pointer-events-none flex gap-1 items-center justify-center">
                  <Image src={FAKE_USERS['current-user'].avatar} alt="Yo" width={16} height={16} className="rounded-full shrink-0" />
                  <span className="truncate max-w-[4.5rem]">{FAKE_USERS['current-user'].username}</span>
                </Badge>
              </button>
            </CarouselItem>
          ) : (
            <CarouselItem className="ml-2 pl-3 basis-auto">
              <button
                ref={triggerRef}
                onClick={() => setShowDialog(true)}
                className="relative group"
              >
                <div className="flex items-center justify-center size-20 rounded-lg">
                  <span className="text-[67px] animate-[heartbeat_5s_ease-in-out_infinite]">❤️</span>
                </div>
                <Badge className="max-w-20 h-5 p-0.5 shrink-0 font-normal text-[10px] absolute -bottom-2 left-1/2 -translate-x-1/2 pointer-events-none flex gap-1 items-center justify-center">
                  <Image src={FAKE_USERS['current-user'].avatar} alt="Yo" width={16} height={16} className="rounded-full" />
                  <span className="text-[15px] -mt-0.5 font-normal items-center">+</span>
                </Badge>
              </button>
            </CarouselItem>
          )}

          {(() => {
            const filteredStickers = stickers.filter(sticker => sticker.userId !== currentUserId)
            return filteredStickers.map((sticker, index) => {
              const user = FAKE_USERS[sticker.userId] || FAKE_USERS[FAKE_USER_KEYS[index % FAKE_USER_KEYS.length]]

              return (
                <CarouselItem key={sticker.id} className={cn("pl-2 basis-auto", index === filteredStickers.length - 1 && "pr-4")}>
                  <div className="relative group">
                    <div className="flex items-center justify-center size-20 rounded-lg">
                      <StickerItem type={sticker.type} />
                    </div>
                    <Badge className="absolute -bottom-2 left-1/2 -translate-x-1/2 max-w-20 w-fit normal-case bg-background-weaker text-foreground h-fit p-0.5 px-1.5 shrink-0 font-normal text-[10px] pointer-events-none flex gap-1 items-center justify-center">
                      <Image src={user.avatar} alt={user.username} width={14} height={14} className="rounded-full shrink-0" />
                      <span className="truncate max-w-[4.5rem]">{user.username}</span>
                    </Badge>
                  </div>
                </CarouselItem>
              )
            })
          })()}
        </CarouselContent>
      </Carousel>

      <ResponsiveDialog
        open={showDialog}
        onOpenChange={handleOpenChange}
        title="Dejar un sticker"
        description="Elige el tipo de sticker que deseas dejar"
        className="!max-h-[40vh]"
      >
        <h3 className="text-base font-medium w-full text-center">
          Mis stickers
        </h3>
        <div className="grid grid-cols-5 gap-2 p-2 pt-3">
          {STICKER_TYPES.map(({ type }) => (
            <button
              key={type}
              onClick={() => handleAddSticker(type)}
              className={cn(
                "flex items-center justify-center rounded-md transition-colors aspect-square w-full p-2 shrink-0",
                reactionType === type ? "bg-background-weaker" : "hover:bg-background-weaker/50"
              )}
            >
              <StickerItem type={type} className="w-full h-full flex items-center justify-center text-5xl" />
            </button>
          ))}
        </div>
      </ResponsiveDialog>

    </div >
  )
}
