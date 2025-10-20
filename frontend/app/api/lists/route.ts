import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const isPublic = searchParams.get('isPublic')
    const saved = searchParams.get('saved')

    const where: any = {}

    if (isPublic === 'true') {
      where.isPublic = true
    }

    if (userId) {
      if (saved === 'true') {
        where.saves = {
          some: { userId },
        }
      } else {
        where.createdById = userId
      }
    }

    const lists = await prisma.memorialList.findMany({
      where,
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
        _count: {
          select: {
            items: true,
            saves: true,
            collaborators: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(lists)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch lists' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, description, thumbnailPicture, isPublic = true } = await request.json()

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const list = await prisma.memorialList.create({
      data: {
        name,
        description,
        thumbnailPicture,
        isPublic,
        createdById: (session.user as any).id,
      },
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
      },
    })

    return NextResponse.json(list, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create list' }, { status: 500 })
  }
}
