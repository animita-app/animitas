import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ param: string }> }
) {
  try {
    const { param } = await params

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { id: param },
          { username: param }
        ]
      },
      select: {
        id: true,
        phone: true,
        username: true,
        displayName: true,
        email: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            memorialsCreated: true,
            listsCreated: true,
            candles: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const mappedUser = {
      id: user.id,
      phone: user.phone,
      username: user.username,
      displayName: user.displayName,
      email: user.email,
      image: user.image,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      stats: {
        memorialsCreated: user._count.memorialsCreated,
        listsCreated: user._count.listsCreated,
        candles: user._count.candles
      }
    }

    return NextResponse.json(mappedUser)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
