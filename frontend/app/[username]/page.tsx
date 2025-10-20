'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { ProfileCard } from '@/components/profile/profile-card'
import { UserProfile, fetchUserProfile } from '@/lib/user'
import { getErrorMessage } from '@/lib/utils'

export default function UserProfilePage({ params }: { params: { username: string } }) {
  const { data: session } = useSession()
  const sessionUser = session?.user as any
  const [user, setUser] = useState<UserProfile | null>(null)

  const isOwnProfile = sessionUser?.username === params.username

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await fetchUserProfile(params.username)
        setUser(userData)
      }
    }

    fetchUser()
  }, [params.username])

  return (
    <div className="h-full">
      <ProfileCard
        userId={user.id}
        profilePicture={user.profilePicture}
        isOwnProfile={isOwnProfile}
      />
    </div>
  )
}
