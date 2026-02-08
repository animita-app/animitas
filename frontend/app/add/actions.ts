'use server'

import { heritageSitePayloadSchema } from '@/lib/validators/heritage-site'
import { createClient } from '@/lib/supabase/server'
import { slugify } from '@/lib/utils'

export async function submitHeritageSite(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Debes iniciar sesión para registrar una animita.' }
  }

  const raw = {
    name: formData.get('name'),
    story: formData.get('story'),
    isPublic: formData.get('isPublic') === 'true',
    location: formData.get('location') ? JSON.parse(String(formData.get('location'))) : null,
  }

  const parsed = heritageSitePayloadSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: 'Datos inválidos', issues: parsed.error.flatten() }
  }

  const { name, story, isPublic, location } = parsed.data
  const slug = slugify(name)
  const geom = `SRID=4326;POINT(${location.lng} ${location.lat})`

  const { error } = await supabase.from('heritage_sites').insert({
    title: name,
    story,
    slug,
    location: geom,
    status: isPublic ? 'published' : 'draft',
    kind: 'Animita',
    creator_id: user.id,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true, slug }
}
