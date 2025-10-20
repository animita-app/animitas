import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    const userId = (session?.user as any)?.id

    const list = await prisma.memorialList.findUnique({
      where: { id: params.id },
      include: {
        createdBy: {
          select: {
            id: true,
            displayName: true,
            name: true,
            profilePicture: true,
            image: true,
          },
        },
        items: {
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
        },
        collaborators: {
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
                name: true,
                profilePicture: true,
                image: true,
              },
            },
          },
        },
        _count: {
          select: {
            saves: true,
          },
        },
      },
    })

    if (!list) {
      return NextResponse.json({ error: 'List not found' }, { status: 404 })
    }

    if (!list.isPublic && list.createdById !== userId) {
      const isCollaborator = list.collaborators.some(c => c.userId === userId)
      if (!isCollaborator) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
      }
    }

    const isCreator = list.createdById === userId
    const isCollaborator = list.collaborators.some(c => c.userId === userId)

    if (!isCreator && !isCollaborator && userId) {
      await prisma.memorialList.update({
        where: { id: params.id },
        data: { viewCount: { increment: 1 } },
      })
    }

    return NextResponse.json(list)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch list' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const { name, description, thumbnailPicture, isPublic } = await request.json()

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

    const updatedList = await prisma.memorialList.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(thumbnailPicture !== undefined && { thumbnailPicture }),
        ...(isPublic !== undefined && { isPublic }),
      },
    })

    return NextResponse.json(updatedList)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update list' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id

    const list = await prisma.memorialList.findUnique({
      where: { id: params.id },
    })

    if (!list) {
      return NextResponse.json({ error: 'List not found' }, { status: 404 })
    }

    if (list.createdById !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.memorialList.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete list' }, { status: 500 })
  }
}
