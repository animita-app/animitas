'use client'

import { ProfileDetail } from '@/components/profile/profile-detail'
import { ResponsiveDialog } from '@/components/ui/responsive-dialog'
import { useRouter } from 'next/navigation'
import { use, useState, useEffect } from 'react'

export default function ProfileModal({ params }: { params: Promise<{ username: string }> }) {
  const router = useRouter()
  const { username } = use(params)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/users/${username}`)

        if (!response.ok) {
          throw new Error('User not found')
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

  if (loading) {
    return (
      <ResponsiveDialog
        open
        onOpenChange={() => router.back()}
        title="Perfil"
        description="Perfil de usuario"
      >
        <div className="p-8">Loading...</div>
      </ResponsiveDialog>
    )
  }

  if (!user) {
    return (
      <ResponsiveDialog
        open
        onOpenChange={() => router.back()}
        title="Perfil"
        description="Perfil de usuario"
      >
        <div className="p-8">User not found</div>
      </ResponsiveDialog>
    )
  }

  return (
    <ResponsiveDialog
      open
      onOpenChange={() => router.back()}
      title="Perfil"
      description="Perfil de usuario"
    >
      <ProfileDetail user={user} />
    </ResponsiveDialog>
  )
}
