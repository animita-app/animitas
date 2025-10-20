import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const memorial = await prisma.memorial.findUnique({
    where: { id },
    include: {
      people: {
        include: {
          person: {
            select: {
              id: true,
              name: true,
              image: true,
              birthDate: true,
              deathDate: true,
              birthPlace: true,
              deathPlace: true,
            },
          },
        },
      },
      createdBy: {
        select: {
          id: true,
          name: true,
          displayName: true,
        },
      },
      images: {
        orderBy: { uploadedAt: 'desc' },
        select: {
          id: true,
          url: true,
          uploadedAt: true,
        },
      },
      candles: {
        orderBy: [
          { isActive: 'desc' },
          { expiresAt: 'desc' },
        ],
        select: {
          id: true,
          duration: true,
          isActive: true,
          message: true,
          litAt: true,
          expiresAt: true,
          user: {
            select: {
              id: true,
              name: true,
              displayName: true,
            },
          },
        },
      },
      testimonies: {
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          content: true,
          images: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
              displayName: true,
            },
          },
        },
      },
    },
  })

  if (!memorial) {
    return NextResponse.json({ error: 'Memorial no encontrado' }, { status: 404 })
  }

  const activeCandleUsers = new Set(
    memorial.candles.filter((candle) => candle.isActive).map((candle) => candle.user?.id).filter(Boolean) as string[]
  )

  const testimoniesWithFlags = memorial.testimonies.map((testimony) => ({
    ...testimony,
    hasCandle: testimony.user?.id ? activeCandleUsers.has(testimony.user.id) : false,
  }))

  return NextResponse.json({
    memorial: {
      id: memorial.id,
      name: memorial.name,
      story: memorial.story,
      createdAt: memorial.createdAt,
      lat: memorial.lat,
      lng: memorial.lng,
      isPublic: memorial.isPublic,
      people: memorial.people.map((mp) => mp.person),
      coordinates: [memorial.lng, memorial.lat] as [number, number],
      createdBy: memorial.createdBy,
      images: memorial.images,
      candles: memorial.candles,
      testimonies: testimoniesWithFlags,
    },
  })
}
