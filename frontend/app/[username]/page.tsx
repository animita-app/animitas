'use client'

import { useSession } from 'next-auth/react'
import { ProfileCard } from '@/components/profile/profile-card'

export default function UserProfilePage({ params }: { params: { username: string } }) {
  const { data: session } = useSession()
  const isOwnProfile = session?.user && (session.user as any).username === params.username

  return (
    <div>
      {isOwnProfile && <ProfileCard />}
      Damn
    </div>
  )
}
