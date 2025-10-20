import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
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

    const existingSave = await prisma.memorialListSave.findUnique({
      where: {
        listId_userId: {
          listId: params.id,
          userId,
        },
      },
    })

    if (existingSave) {
      return NextResponse.json({ error: 'List already saved' }, { status: 409 })
    }

    const save = await prisma.memorialListSave.create({
      data: {
        listId: params.id,
        userId,
      },
    })

    return NextResponse.json(save, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save list' }, { status: 500 })
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

    await prisma.memorialListSave.delete({
      where: {
        listId_userId: {
          listId: params.id,
          userId,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to unsave list' }, { status: 500 })
  }
}
