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
    const { collaboratorUserId, canEdit = true, canInvite = false } = await request.json()

    if (!collaboratorUserId) {
      return NextResponse.json({ error: 'Collaborator user ID is required' }, { status: 400 })
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
    const canInviteOthers = list.collaborators.some(c => c.canInvite)

    if (!isCreator && !canInviteOthers) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: collaboratorUserId },
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const existingCollaborator = await prisma.memorialListCollaborator.findUnique({
      where: {
        listId_userId: {
          listId: params.id,
          userId: collaboratorUserId,
        },
      },
    })

    if (existingCollaborator) {
      return NextResponse.json({ error: 'User is already a collaborator' }, { status: 409 })
    }

    const collaborator = await prisma.memorialListCollaborator.create({
      data: {
        listId: params.id,
        userId: collaboratorUserId,
        canEdit,
        canInvite,
      },
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
    })

    return NextResponse.json(collaborator, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add collaborator' }, { status: 500 })
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
    const collaboratorUserId = searchParams.get('userId')

    if (!collaboratorUserId) {
      return NextResponse.json({ error: 'Collaborator user ID is required' }, { status: 400 })
    }

    const list = await prisma.memorialList.findUnique({
      where: { id: params.id },
    })

    if (!list) {
      return NextResponse.json({ error: 'List not found' }, { status: 404 })
    }

    if (list.createdById !== userId && collaboratorUserId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.memorialListCollaborator.delete({
      where: {
        listId_userId: {
          listId: params.id,
          userId: collaboratorUserId,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to remove collaborator' }, { status: 500 })
  }
}
