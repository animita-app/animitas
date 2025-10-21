'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ProfileDetail } from '@/components/profile/profile-detail'

export default function UserProfilePage() {
  const params = useParams<{ username: string }>()
  const { username } = params

  const [user, setUser] = useState<any>(null)
  const [, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/users/${username}`)

        if (!response.ok) {
          throw new Error('Usuario no encontrado')
        }

        const userData = await response.json()
        setUser(userData)
      } catch (err) {
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [username])

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto">
        <ProfileDetail user={user} />
      </div>
    </div>
  )
}
