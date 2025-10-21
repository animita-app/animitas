import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, personName, latitude, longitude, story, images } = body

    if (!name || !personName || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return NextResponse.json(
        { error: 'Invalid coordinates' },
        { status: 400 }
      )
    }

    if (latitude < -90 || latitude > 90) {
      return NextResponse.json(
        { error: 'Latitude must be between -90 and 90' },
        { status: 400 }
      )
    }

    if (longitude < -180 || longitude > 180) {
      return NextResponse.json(
        { error: 'Longitude must be between -180 and 180' },
        { status: 400 }
      )
    }

    const generateSlug = (memorialName: string, id: string): string => {
      const baseSlug = memorialName
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/^-+|-+$/g, '')
      return `${baseSlug}-${id.substring(0, 8)}`
    }

    const person = await prisma.person.create({
      data: {
        name: personName,
      },
    })

    const tempId = Math.random().toString(36).substring(2, 10)
    const slug = generateSlug(name, tempId)

    const memorial = await prisma.memorial.create({
      data: {
        name,
        slug,
        lat: latitude,
        lng: longitude,
        story: story || null,
        isPublic: true,
        createdById: session.user.id,
        people: {
          create: {
            personId: person.id,
          },
        },
        images: {
          create: images.map((url: string) => ({
            url,
          })),
        },
      },
      include: {
        images: true,
        people: {
          include: {
            person: true,
          },
        },
      },
    })

    return NextResponse.json({
      data: memorial,
      message: 'Memorial created successfully',
    })
  } catch (error) {
    console.error('Error creating memorial:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
