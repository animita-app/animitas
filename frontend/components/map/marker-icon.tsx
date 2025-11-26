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
              className="min-w-20 w-20 h-20 object-cover ring-4 ring-white rounded-lg aspect-square shrink-0 z-10 relative"
            />
          )}

          {images[1] && (
            <Image
              src={images[1]}
              alt={name || "Animita"}
              width={80}
              height={80}
              className="z-20 absolute top-8 left-8 min-w-20 w-20 h-20 object-cover rotate-[10deg] ring-4 ring-white rounded-lg aspect-square shrink-0 z-0"
            />
          )}

          {images[2] && (
            <Image
              src={images[2]}
              alt={name || "Animita"}
              width={80}
              height={80}
              className="z-10 absolute top-10 -left-8 min-w-20 w-20 h-20 object-cover -rotate-[10deg] ring-4 ring-white rounded-lg aspect-square shrink-0 z-0"
            />
          )}

          {/* Show variable number of stickers based on total count to represent scarcity/abundance */}
          {(() => {
            // Map sticker count: 0-2 stickers = show 2, 3-5 = show 3, 6-10 = show 5, 11+ = show 7
            const totalStickers = stickers.length
            let visibleCount = 5 // default

            if (totalStickers <= 2) {
              visibleCount = 2
            } else if (totalStickers <= 5) {
              visibleCount = 3
            } else if (totalStickers <= 10) {
              visibleCount = 5
            } else {
              visibleCount = 7
            }

            // Radius configurations for different counts
            const radiusConfig: Record<number, { radius: number, scaleRange: [number, number] }> = {
              2: { radius: 90, scaleRange: [0.85, 0.95] },
              3: { radius: 100, scaleRange: [0.8, 1.0] },
              5: { radius: 110, scaleRange: [0.7, 1.1] },
              7: { radius: 120, scaleRange: [0.6, 1.2] }
            }

            const config = radiusConfig[visibleCount]

            return Array.from({ length: visibleCount }).map((_, i) => {
              const sticker = stickers[i] || { type: 'heart' }
              const seed = (name || 'animita') + i

              // Distribute stickers evenly across the top half of the circle (180 degrees)
              // Start from 180° (left) to 0° (right), which is the top semicircle
              const angleStep = Math.PI / (visibleCount - 1) // Divide 180° by (count - 1)
              const angle = Math.PI - (angleStep * i) // Start from left (180°) and go to right (0°)

              // Calculate position using trigonometry
              // Apply elliptical transformation: wider on X axis (1.5x), same height on Y
              const x = Math.cos(angle) * config.radius * 1.5
              const y = Math.sin(angle) * config.radius

              // Scale based on position - center items larger, edge items smaller
              const normalizedPosition = i / (visibleCount - 1) // 0 to 1
              const centerDistance = Math.abs(normalizedPosition - 0.5) * 2 // 0 at center, 1 at edges
              const baseScale = config.scaleRange[1] - (centerDistance * (config.scaleRange[1] - config.scaleRange[0]))

              // Add randomness
              const randX = (getStableRandom(seed + 'x') - 0.5) * 20
              const randY = (getStableRandom(seed + 'y') - 0.5) * 20
              const randScale = (getStableRandom(seed + 's') - 1.25) * 0.15

              // Z-index based on scale (larger = higher z-index)
              const zIndex = Math.round(baseScale * 40)

              return (
                <div
                  key={i}
                  className="absolute pointer-events-none transition-all duration-500 -mb-8"
                  style={{
                    zIndex,
                    transform: `translate(${x + randX}px, ${-y + randY}px) scale(${baseScale + randScale})`
                  }}
                >
                  <StickerItem type={sticker.type as any} className="drop-shadow-md" />
                </div>
              )
            })
          })()}
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
