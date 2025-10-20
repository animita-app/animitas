import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { canAccessAdmin } from '@/lib/admin'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.username || !canAccessAdmin(session.user.username)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const [lists, total] = await Promise.all([
      prisma.memorialList.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          description: true,
          thumbnailPicture: true,
          isPublic: true,
          viewCount: true,
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
              items: true,
              collaborators: true,
              saves: true
            }
          }
        }
      }),
      prisma.memorialList.count()
    ])

    return NextResponse.json({
      lists,
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
    const session = await getServerSession(authOptions)

    if (!session?.user?.username || !canAccessAdmin(session.user.username)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { listId, data } = await request.json()

    if (!listId) {
      return NextResponse.json({ error: 'List ID required' }, { status: 400 })
    }

    const allowedFields = ['name', 'description', 'isPublic']
    const updateData = Object.fromEntries(
      Object.entries(data).filter(([key]) => allowedFields.includes(key))
    )

    const list = await prisma.memorialList.update({
      where: { id: listId },
      data: updateData,
      select: {
        id: true,
        name: true,
        description: true,
        isPublic: true,
        viewCount: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json(list)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.username || !canAccessAdmin(session.user.username)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const listId = searchParams.get('id')

    if (!listId) {
      return NextResponse.json({ error: 'List ID required' }, { status: 400 })
    }

    await prisma.memorialList.delete({
      where: { id: listId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
