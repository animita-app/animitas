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

  const { name, story, location, isPublic } = parsed.data

  const baseSlug = slugify(name)
  const slug = await ensureUniqueSlug(supabase, baseSlug)
  const geom = `SRID=4326;POINT(${location.lng} ${location.lat})`

  const payload = {
    title: name,
    story,
    slug,
    location: geom,
    kind: 'Animita',
    images: [] as string[],
    status: isPublic ? 'published' : 'draft',
    creator_id: user.id,
  }

  const { data, error } = await supabase
    .from('heritage_sites')
    .insert(payload)
    .select('id, slug')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(
    {
      success: true,
      slug: data.slug,
    },
    { status: 201 }
  )
}
