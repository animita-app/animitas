import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    const where: any = {}

    if (userId) {
      where.createdById = userId
    }

    const memorials = await prisma.memorial.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        createdBy: {
          select: {
            id: true,
            displayName: true,
            username: true,
            image: true
          }
        },
        images: {
          select: {
            id: true,
            url: true,
            uploadedAt: true
          },
          orderBy: {
            uploadedAt: 'asc'
          }
        },
        _count: {
          select: {
            candles: true,
            testimonies: true,
            images: true
          }
        }
      }
    })

    const mapped = memorials.map((memorial) => {
      const firstImage = memorial.images[0]?.url ?? null

      return {
        id: memorial.id,
        slug: memorial.slug,
        name: memorial.name,
        lat: memorial.lat,
        lng: memorial.lng,
        story: memorial.story,
        isPublic: memorial.isPublic,
        createdAt: memorial.createdAt,
        coordinates: [memorial.lng, memorial.lat] as [number, number],
        primaryPersonImage: firstImage,
        createdBy: memorial.createdBy,
        images: memorial.images,
        _count: memorial._count
      }
    })

    return NextResponse.json({ memorials: mapped })
  } catch (error) {
    console.error('Error in /api/memorials:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
