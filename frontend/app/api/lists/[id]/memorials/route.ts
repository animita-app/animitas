import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const { memorialId } = await request.json()

    if (!memorialId) {
      return NextResponse.json({ error: 'Memorial ID is required' }, { status: 400 })
    }

    const list = await prisma.memorialList.findUnique({
      where: { id: params.id },
      include: {
        collaborators: {
          where: { userId },
        },
      },
    })

    if (!list) {
      return NextResponse.json({ error: 'List not found' }, { status: 404 })
    }

    const isCreator = list.createdById === userId
    const canEdit = list.collaborators.some(c => c.canEdit)

    if (!isCreator && !canEdit) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const memorial = await prisma.memorial.findUnique({
      where: { id: memorialId },
    })

    if (!memorial) {
      return NextResponse.json({ error: 'Memorial not found' }, { status: 404 })
    }

    const existingItem = await prisma.memorialListItem.findUnique({
      where: {
        listId_memorialId: {
          listId: params.id,
          memorialId,
        },
      },
    })

    if (existingItem) {
      return NextResponse.json({ error: 'Memorial already in list' }, { status: 409 })
    }

    const item = await prisma.memorialListItem.create({
      data: {
        listId: params.id,
        memorialId,
        addedById: userId,
      },
      include: {
        memorial: {
          include: {
            people: {
              include: {
                person: true,
              },
              take: 1,
            },
          },
        },
      },
    })

    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error('Error adding memorial to list:', error)
    return NextResponse.json({ error: 'Failed to add memorial to list' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const searchParams = request.nextUrl.searchParams
    const memorialId = searchParams.get('memorialId')

    if (!memorialId) {
      return NextResponse.json({ error: 'Memorial ID is required' }, { status: 400 })
    }

    const list = await prisma.memorialList.findUnique({
      where: { id: params.id },
      include: {
        collaborators: {
          where: { userId },
        },
      },
    })

    if (!list) {
      return NextResponse.json({ error: 'List not found' }, { status: 404 })
    }

    const isCreator = list.createdById === userId
    const canEdit = list.collaborators.some(c => c.canEdit)

    if (!isCreator && !canEdit) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.memorialListItem.delete({
      where: {
        listId_memorialId: {
          listId: params.id,
          memorialId,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing memorial from list:', error)
    return NextResponse.json({ error: 'Failed to remove memorial from list' }, { status: 500 })
  }
}
