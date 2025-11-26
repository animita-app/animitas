import React from 'react'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { StickerItem } from '@/components/animita/sticker-grid'

interface MarkerIconProps {
  id?: string
  name?: string
  images?: string[]
  stickers?: { type: string }[]
  className?: string
}

export const MarkerIcon = ({ name, images = [], stickers = [], className }: MarkerIconProps) => {
  const count = images.length

  const getStableRandom = (seed: string) => {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    const x = Math.sin(hash) * 10000;
    return x - Math.floor(x);
  }

  return (
    <div className="flex-col flex items-center justify-center text-center group cursor-pointer">
      <div className="relative size-32 flex items-center justify-center">
        <div className={cn(
          "drop-shadow-xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center",
          count > 1 && "-mt-6"
        )}>
          {images[0] && (
            <Image
              src={images[0]}
              alt={name || "Animita"}
              width={80}
              height={80}
              className="w-20 h-20 object-cover ring-4 ring-white rounded-lg aspect-square shrink-0 z-10 relative"
            />
          )}

          {images[1] && (
            <Image
              src={images[1]}
              alt={name || "Animita"}
              width={80}
              height={80}
              className="z-20 absolute top-8 left-8 w-20 h-20 object-cover rotate-[10deg] ring-4 ring-white rounded-lg aspect-square shrink-0 z-0"
            />
          )}

          {images[2] && (
            <Image
              src={images[2]}
              alt={name || "Animita"}
              width={80}
              height={80}
              className="z-10 absolute top-10 -left-8 w-20 h-20 object-cover -rotate-[10deg] ring-4 ring-white rounded-lg aspect-square shrink-0 z-0"
            />
          )}

          {/* Show 5 stickers with drastic depth effect and randomness */}
          {Array.from({ length: 5 }).map((_, i) => {
            const sticker = stickers[i] || { type: 'heart' }

            // Base positions (drastic depth)
            const positions = [
              { x: 0, y: -105, scale: 1.1, z: 30 },     // Top Center
              { x: -85, y: -85, scale: 0.75, z: 20 },   // Top Left
              { x: 85, y: -85, scale: 0.75, z: 20 },    // Top Right
              { x: -140, y: -40, scale: 0.5, z: 10 },   // Far Left
              { x: 140, y: -40, scale: 0.5, z: 10 },    // Far Right
            ]

            const pos = positions[i]
            const seed = (name || 'animita') + i

            const randX = (getStableRandom(seed + 'x') - 0.5) * 40
            const randY = (getStableRandom(seed + 'y') - 0.5) * 40
            const randScale = (getStableRandom(seed + 's') - 0.5) * 0.2

            return (
              <div
                key={i}
                className="absolute pointer-events-none transition-all duration-500"
                style={{
                  zIndex: pos.z,
                  transform: `translate(${pos.x + randX}px, ${pos.y + randY}px) scale(${pos.scale + randScale})`
                }}
              >
                <StickerItem type={sticker.type as any} className="drop-shadow-md" />
              </div>
            )
          })}
        </div>
      </div>

      <h3 className={cn(
        "z-50 text-sm font-semibold truncate text-card-foreground leading-tight [text-shadow:1.5px_1.5px_0_#fff,_-1.5px_1.5px_0_#fff,_1.5px_-1.5px_0_#fff,_-1.5px_-1.5px_0_#fff]",
        count > 1 && "mt-4"
      )}>
        {name || 'Animita'}
      </h3>
    </div>
  )
}
