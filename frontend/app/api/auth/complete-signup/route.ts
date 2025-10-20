import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { phone, displayName, username, profilePicture } =
      await request.json()

    if (!phone || !displayName || !username) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const existingUsername = await prisma.user.findUnique({
      where: { username },
    })

    if (existingUsername) {
      return NextResponse.json(
        { error: 'Username already taken' },
        { status: 409 }
      )
    }

    const user = await prisma.user.upsert({
      where: { phone },
      update: {
        displayName,
        username,
        profilePicture: profilePicture || undefined,
        phoneVerified: new Date(),
      },
      create: {
        phone,
        displayName,
        username,
        profilePicture: profilePicture || undefined,
        phoneVerified: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        phone: user.phone,
        displayName: user.displayName,
        username: user.username,
        image: user.profilePicture,
      },
    })
  } catch (error) {
    console.error('Complete signup error:', error)

    return NextResponse.json(
      {
        error: 'Failed to complete signup',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
