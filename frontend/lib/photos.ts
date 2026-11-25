import type { SupabaseClient } from '@supabase/supabase-js'

// The restored project only has the "base" bucket, so avatars live there too.
const BUCKET = 'base'

function extension(file: File) {
  return file.name.split('.').pop()?.toLowerCase() || 'jpg'
}

async function upload(supabase: SupabaseClient, path: string, file: File, upsert = false) {
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert, contentType: file.type })
  if (error) throw new Error(`No se pudo subir ${file.name}`)
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
}

export function uploadAnimitaPhoto(supabase: SupabaseClient, userId: string, file: File) {
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension(file)}`
  return upload(supabase, `users/${userId}/animitas/${name}`, file)
}

export async function uploadAvatar(supabase: SupabaseClient, userId: string, file: File) {
  const url = await upload(supabase, `users/${userId}/avatar`, file, true)
  return `${url}?t=${Date.now()}`
}
