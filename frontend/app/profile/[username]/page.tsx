import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProfileView } from './profile-view'
import { DEMO_USER } from '@/lib/demo/flag'
import { isDemoServer } from '@/lib/demo/server'

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

  if (!profile && (await isDemoServer()) && username === DEMO_USER.username) {
    return <ProfileView key={DEMO_USER.id} profile={DEMO_USER} />
  }
  if (!profile) notFound()

  return <ProfileView key={profile.id} profile={profile} />
}
