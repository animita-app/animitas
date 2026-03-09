import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { ProfileView } from './profile-view'

interface PageProps {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params
  const supabase = await createClient()

  const { data } = await supabase
    .from('user_profiles')
    .select('display_name, username')
    .eq('username', username)
    .single()

  if (!data) return { title: 'Perfil' }

  return {
    title: `${data.display_name} (@${data.username})`,
  }
}

export default async function ProfilePage({ params }: PageProps) {
  const { username } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('id, display_name, username, image, role')
    .eq('username', username)
    .single()

  return <ProfileView profile={profile} username={username} />
}
