'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'

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

  const particleVariants = {
    initial: {
      x: 0,
      y: 0,
      opacity: 1,
      scale: 1,
    },
    animate: (particle: Particle) => ({
      x: particle.x,
      y: -220 + particle.y,
      opacity: 0,
      scale: 0.4,
      transition: {
        duration: 1.6,
        delay: particle.delay / 1000,
        ease: 'easeOut',
      },
    }),
  }

  return (
    <motion.div className="fixed inset-0 pointer-events-none overflow-hidden z-50" initial={{ opacity: 0 }}>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          variants={particleVariants}
          initial="initial"
          animate="animate"
          custom={particle}
        >
          {particle.type === 'sticker' ? (
            particle.emoji ? (
              <span className="text-4xl">{particle.emoji}</span>
            ) : particle.image ? (
              <Image src={particle.image} alt="sticker" width={28} height={28} className="object-contain" />
            ) : null
          ) : (
            <Image
              src={particle.avatar!}
              alt="avatar"
              width={32}
              height={32}
              className="rounded-full border-2 border-foreground"
            />
          )}
        </motion.div>
      ))}
    </motion.div>
  )
}
