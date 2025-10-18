import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'

export async function GET() {
  const memorials = await prisma.memorial.findMany({
    select: {
      id: true,
      name: true,
      lat: true,
      lng: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return NextResponse.json({
    memorials: memorials.map((memorial) => ({
      id: memorial.id,
      name: memorial.name,
      coordinates: [memorial.lng, memorial.lat] as [number, number]
    }))
  })
}
