import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'Invalid memorial ID' },
        { status: 400 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: memorial, error: memorialError } = await supabase
      .from('memorials')
      .select('*')
      .eq('id', id)
      .single()

    if (memorialError || !memorial) {
      console.log('[MEMORIAL] Error fetching memorial:', memorialError)
      return NextResponse.json(
        { error: 'Memorial not found' },
        { status: 404 }
      )
    }

    const memorialIds = [memorial.id]

    const [imagesResult, peopleResult, candlesResult] = await Promise.all([
      supabase
        .from('memorial_images')
        .select('*')
        .in('memorialId', memorialIds),
      supabase
        .from('memorial_people')
        .select('*, people(*)')
        .in('memorialId', memorialIds),
      supabase
        .from('candles')
        .select('*')
        .eq('memorialId', id)
    ])

    const images = imagesResult.data || []
    const relations = peopleResult.data || []
    const candles = candlesResult.data || []
    const people = relations
      .map((relation: any) => relation.people)
      .filter(Boolean)

    const enrichedMemorial = {
      id: memorial.id,
      name: memorial.name,
      story: memorial.story || null,
      lat: memorial.lat,
      lng: memorial.lng,
      isPublic: memorial.isPublic || true,
      city: memorial.city || null,
      coordinates: [memorial.lng, memorial.lat] as [number, number],
      primaryPersonImage: images.length > 0 ? images[0].url : null,
      images: images.map((img: any) => ({
        id: img.id,
        url: img.url,
        uploadedAt: img.createdAt || new Date().toISOString()
      })),
      people,
      candles,
      testimonies: [],
      createdAt: memorial.createdAt,
      createdBy: memorial.createdById
        ? { id: memorial.createdById, displayName: memorial.createdByName || null }
        : null
    }

    return NextResponse.json({ memorial: enrichedMemorial })
  } catch (error) {
    console.error('[MEMORIAL] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
