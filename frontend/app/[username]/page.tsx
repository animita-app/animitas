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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const isOwnProfile = sessionUser?.username === params.username

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true)
        const userData = await fetchUserProfile(params.username)
        setUser(userData)
      } catch (err) {
        setError(getErrorMessage(err))
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [params.username])

  if (loading) return <div className="p-4">Loading...</div>
  if (error) return <div className="p-4 text-red-500">{error}</div>
  if (!user) return <div className="p-4">User not found</div>

  return (
    <div className="h-full">
      <ProfileCard
        userId={user.id}
        displayName={user.displayName}
        username={user.username}
        profilePicture={user.profilePicture}
        isOwnProfile={isOwnProfile}
      />
    </div>
  )
}
