import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'

export async function GET() {
  const memorials = await prisma.memorial.findMany({
    orderBy: {
      createdAt: 'desc'
    },
    include: {
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
      }
    }
  })

  return NextResponse.json({
    memorials: memorials.map((memorial) => {
      const primaryPerson = memorial.people[0]?.person ?? null

      return {
        id: memorial.id,
        name: memorial.name,
        coordinates: [memorial.lng, memorial.lat] as [number, number],
        primaryPerson: primaryPerson
          ? {
              id: primaryPerson.id,
              name: primaryPerson.name,
              image: primaryPerson.image
            }
          : null
      }
    })
  })
}
