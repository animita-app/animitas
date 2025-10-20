import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
            profilePicture: true,
            image: true
          }
        },
        people: {
          orderBy: {
            createdAt: 'asc'
          },
          take: 1,
          include: {
            person: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
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
      const primaryPerson = memorial.people[0]?.person ?? null

      return {
        id: memorial.id,
        name: memorial.name,
        lat: memorial.lat,
        lng: memorial.lng,
        story: memorial.story,
        isPublic: memorial.isPublic,
        createdAt: memorial.createdAt,
        coordinates: [memorial.lng, memorial.lat] as [number, number],
        primaryPerson: primaryPerson
          ? {
              id: primaryPerson.id,
              name: primaryPerson.name,
              image: primaryPerson.image
            }
          : null,
        createdBy: memorial.createdBy,
        _count: memorial._count
      }
    })

    return NextResponse.json(userId ? mapped : { memorials: mapped })
  } catch (error) {
    console.error('Error fetching memorials:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
