import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get('username')
  const userId = req.nextUrl.searchParams.get('userId')

  try {
    if (username || userId) {
      const user = await prisma.user.findUnique({
        where: username ? { username } : { id: userId! },
        select: {
          id: true,
          displayName: true,
          username: true,
          image: true,
        }
      })

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      const memorials = await prisma.memorial.findMany({
        where: { createdById: user.id },
        select: {
          id: true,
          name: true,
          images: {
            select: {
              url: true
            },
            take: 1
          },
          _count: {
            select: {
              candles: true,
              testimonies: true
            }
          }
        }
      })

      return NextResponse.json({ user, memorials })
    }

    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: (session.user as any).id },
      select: {
        id: true,
        phone: true,
        username: true,
        displayName: true,
        email: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { image } = await req.json()

  if (!image) {
    return NextResponse.json({ error: 'Image URL is required' }, { status: 400 })
  }

  try {
    await prisma.user.update({
      where: { id: (session.user as any).id },
      data: { image },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update profile picture' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { image, ...otherData } = await req.json()

  const updateData: any = { ...otherData }
  if (image) {
    updateData.image = image
  }

  try {
    const user = await prisma.user.update({
      where: { id: (session.user as any).id },
      data: updateData,
      select: {
        id: true,
        phone: true,
        username: true,
        displayName: true,
        email: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
