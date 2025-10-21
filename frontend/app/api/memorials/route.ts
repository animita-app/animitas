import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

export async function GET(_request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: memorials, error: memorialsError } = await supabase
      .from('memorials')
      .select('*')

    if (memorialsError) {
      console.log('[MEMORIALS] Error:', memorialsError)
      return NextResponse.json({ memorials: [] })
    }

    if (!memorials) {
      console.log('[MEMORIALS] No memorials returned')
      return NextResponse.json({ memorials: [] })
    }

    console.log('[MEMORIALS] Found', memorials.length, 'memorials')

    const memorialIds = memorials.map((m: any) => m.id)

    const [imagesResult, peopleResult] = await Promise.all([
      supabase
        .from('memorial_images')
        .select('*')
        .in('memorialId', memorialIds),
      supabase
        .from('memorial_people')
        .select('*, people(*)')
        .in('memorialId', memorialIds)
    ])

    const imagesByMemorial = new Map<string, typeof imagesResult.data>()
    const peopleByMemorial = new Map<string, any[]>()

    imagesResult.data?.forEach((img) => {
      if (!imagesByMemorial.has(img.memorialId)) {
        imagesByMemorial.set(img.memorialId, [])
      }
      imagesByMemorial.get(img.memorialId)!.push(img)
    })

    peopleResult.data?.forEach((relation) => {
      if (!peopleByMemorial.has(relation.memorialId)) {
        peopleByMemorial.set(relation.memorialId, [])
      }
      const people = relation.people as any
      if (people) {
        peopleByMemorial.get(relation.memorialId)!.push(people)
      }
    })

    const enrichedMemorials = memorials.map((memorial: any) => {
      const images = imagesByMemorial.get(memorial.id) || []
      const people = peopleByMemorial.get(memorial.id) || []

      return {
        id: memorial.id,
        name: memorial.name,
        coordinates: [memorial.lng, memorial.lat],
        primaryPersonImage: images.length > 0 ? images[0].url : null,
        images: images.map((img: any) => ({ id: img.id, url: img.url })),
        people,
        candles: people.length,
        story: memorial.story,
        createdAt: memorial.createdAt
      }
    })

    return NextResponse.json({ memorials: enrichedMemorials })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
