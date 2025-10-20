import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      memorialId,
      standStyle,
      stickStyle,
      flameStyle,
      backgroundColor,
      testimony,
      duration,
      isAnonymous,
    } = body

    if (!memorialId || !testimony || !duration) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const userId = 'test-user-id'

    const durationMap = {
      ONE_DAY: 1,
      THREE_DAYS: 3,
      SEVEN_DAYS: 7,
    }

    const days = durationMap[duration as keyof typeof durationMap] || 1
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + days)

    const candle = await prisma.candle.create({
      data: {
        memorialId,
        userId,
        duration,
        message: testimony,
        isActive: true,
        expiresAt,
        standStyle: standStyle || 'classic',
        stickStyle: stickStyle || 'smooth',
        flameStyle: flameStyle || 'warm',
        backgroundColor: backgroundColor || 'plain',
      },
    })

    const testimonyRecord = await prisma.testimony.create({
      data: {
        memorialId,
        userId,
        content: testimony,
        images: [],
        isPublic: !isAnonymous,
      },
    })

    return NextResponse.json({ candle, testimony: testimonyRecord })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create candle' },
      { status: 500 }
    )
  }
}
