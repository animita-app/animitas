import { NextResponse } from 'next/server'
import { heritageSitePayloadSchema } from '@/lib/validators/heritage-site'
import { slugify } from '@/lib/utils'
import { createClient } from '@/lib/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'

type HeritageSiteRow = {
  id: string
  slug: string
}

async function ensureUniqueSlug(
  supabase: SupabaseClient,
  baseSlug: string
): Promise<string> {
  let attempt = 0
  let candidate = baseSlug

  while (true) {
    const { data, error } = await supabase
      .from('heritage_sites')
      .select('slug')
      .eq('slug', candidate)
      .maybeSingle()

    if (error) {
      throw error
    }

    if (!data) {
      return candidate
    }

    attempt += 1
    candidate = `${baseSlug}-${attempt}`
  }
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: 'Debe iniciar sesión para registrar una animita.' },
      { status: 401 }
    )
  }

  let json: unknown
  try {
    json = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const parsed = heritageSitePayloadSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Datos inválidos', issues: parsed.error.flatten() },
      { status: 422 }
    )
  }

  const { name, story, location, isPublic, images, kind: kindSlug, categories: categoryNames, insights } = parsed.data

  const kindSlugLower = (kindSlug || 'animita').toLowerCase()
  const { data: kindData, error: kindError } = await supabase
    .from('heritage_kinds')
    .select('id')
    .eq('slug', kindSlugLower)
    .single()

  if (kindError || !kindData) {
    return NextResponse.json(
      { error: 'Tipo de patrimonio inválido' },
      { status: 422 }
    )
  }

  const baseSlug = slugify(name)
  const slug = await ensureUniqueSlug(supabase, baseSlug)
  const geom = `SRID=4326;POINT(${location.lng} ${location.lat})`

  const payload = {
    title: name,
    story,
    slug,
    location: geom,
    kind_id: kindData.id,
    address: location.address || null,
    city_region: location.cityRegion || null,
    images: images || [],
    status: isPublic ? 'published' : 'draft',
    creator_id: user.id,
    insights: insights || {},
  }

  const { data, error } = await supabase
    .from('heritage_sites')
    .insert(payload)
    .select('id, slug')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  if (categoryNames && categoryNames.length > 0) {
    const { data: categoriesData } = await supabase
      .from('heritage_categories')
      .select('id')
      .in('slug', categoryNames)

    if (categoriesData && categoriesData.length > 0) {
      const linkRows = categoriesData.map(cat => ({
        site_id: data.id,
        category_id: cat.id,
      }))

      await supabase
        .from('heritage_site_categories')
        .insert(linkRows)
    }
  }

  return NextResponse.json(
    {
      success: true,
      slug: data.slug,
    },
    { status: 201 }
  )
}
