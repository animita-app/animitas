import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { canAccessAdmin } from '@/lib/admin'

export async function GET(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.username || !canAccessAdmin(session.user.username)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const [memorials, total] = await Promise.all([
      prisma.memorial.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          lat: true,
          lng: true,
          story: true,
          isPublic: true,
          createdAt: true,
          updatedAt: true,
          createdBy: {
            select: {
              id: true,
              username: true,
              displayName: true
            }
          },
          _count: {
            select: {
              people: true,
              candles: true,
              testimonies: true,
              images: true
            }
          }
        }
      }),
      prisma.memorial.count()
    ])

    return NextResponse.json({
      memorials,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.username || !canAccessAdmin(session.user.username)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { memorialId, data } = await request.json()

    if (!memorialId) {
      return NextResponse.json({ error: 'Memorial ID required' }, { status: 400 })
    }

    const allowedFields = ['name', 'story', 'isPublic', 'lat', 'lng']
    const updateData = Object.fromEntries(
      Object.entries(data).filter(([key]) => allowedFields.includes(key))
    )

    const memorial = await prisma.memorial.update({
      where: { id: memorialId },
      data: updateData,
      select: {
        id: true,
        name: true,
        lat: true,
        lng: true,
        story: true,
        isPublic: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json(memorial)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.username || !canAccessAdmin(session.user.username)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const memorialId = searchParams.get('id')

    if (!memorialId) {
      return NextResponse.json({ error: 'Memorial ID required' }, { status: 400 })
    }

    await prisma.memorial.delete({
      where: { id: memorialId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
