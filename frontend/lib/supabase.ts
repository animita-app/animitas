import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabaseServiceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
  },
})

export const uploadImageToSupabase = async (
  file: File,
  bucket: string,
  path: string,
): Promise<string> => {
  const { data, error } = await supabase.storage.from(bucket).upload(path, file)

  if (error) {
    throw new Error(`Error uploading image: ${error.message}`)
  }

  const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(data.path)

  return publicUrlData.publicUrl
}

export const deleteImageFromSupabase = async (
  bucket: string,
  path: string,
): Promise<void> => {
  const { error } = await supabase.storage.from(bucket).remove([path])

  if (error) {
    throw new Error(`Error deleting image: ${error.message}`)
  }
}
