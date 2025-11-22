'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface Particle {
  id: string
  type: 'sticker' | 'avatar'
  emoji?: string
  image?: string
  avatar?: string
  x: number
  y: number
  delay: number
}

interface StickerReactionProps {
  emoji?: string
  image?: string
  userAvatar: string
  isActive: boolean
}

export function StickerReaction({ emoji, image, userAvatar, isActive }: StickerReactionProps) {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    if (!isActive) return

    const stickerCount = 6
    const avatarCount = 2
    const newParticles: Particle[] = []

    for (let i = 0; i < stickerCount; i++) {
      newParticles.push({
        id: `sticker-${i}`,
        type: 'sticker',
        emoji,
        image,
        x: Math.cos((i / stickerCount) * Math.PI * 2) * 50,
        y: Math.sin((i / stickerCount) * Math.PI * 2) * 50,
        delay: i * 40,
      })
    }

    for (let i = 0; i < avatarCount; i++) {
      newParticles.push({
        id: `avatar-${i}`,
        type: 'avatar',
        avatar: userAvatar,
        x: Math.cos((i / avatarCount) * Math.PI * 2 + Math.PI / 4) * 60,
        y: Math.sin((i / avatarCount) * Math.PI * 2 + Math.PI / 4) * 60,
        delay: i * 100,
      })
    }

    setParticles(newParticles)

    const timer = setTimeout(() => {
      setParticles([])
    }, 1600)

    return () => clearTimeout(timer)
  }, [isActive, emoji, image, userAvatar])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute"
          style={{
            left: '50%',
            top: '50%',
            animation: `float-reaction 1.5s ease-out forwards`,
            animationDelay: `${particle.delay}ms`,
          }}
        >
          {particle.type === 'sticker' ? (
            particle.emoji ? (
              <span className="text-3xl" style={{ transform: `translate(${particle.x}px, ${particle.y}px)` }}>
                {particle.emoji}
              </span>
            ) : particle.image ? (
              <div style={{ transform: `translate(${particle.x}px, ${particle.y}px)` }}>
                <Image src={particle.image} alt="sticker" width={24} height={24} className="object-contain" />
              </div>
            ) : null
          ) : (
            <div style={{ transform: `translate(${particle.x}px, ${particle.y}px)` }}>
              <Image
                src={particle.avatar!}
                alt="avatar"
                width={28}
                height={28}
                className="rounded-full border-2 border-foreground"
              />
            </div>
          )}
        </div>
      ))}

      {particles.length > 0 && (
        <style>{`
          @keyframes float-reaction {
            0% {
              opacity: 1;
              transform: translate(-50%, -50%) scale(1);
            }
            100% {
              opacity: 0;
              transform: translate(-50%, -220px) scale(0.5);
            }
          }
        `}</style>
      )}
    </div>
  )
}
