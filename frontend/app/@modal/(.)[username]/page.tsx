'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@prisma/client'

import { ProfileDetail } from '@/components/profile/profile-detail'
import { ResponsiveDialog } from '@/components/ui/responsive-dialog'

export default function ProfileModal({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params)
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/profile?username=${encodeURIComponent(username)}&userId=${encodeURIComponent(username)}`)
        if (!response.ok) throw new Error('User not found')
        const data = await response.json()
        setUser(data.user)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load user')
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [username])

  if (error) {
    return (
      <ResponsiveDialog
        open
        onOpenChange={() => router.back()}
        title="Error"
        description="Could not load profile"
      >
        <div className="text-red-500">{error}</div>
      </ResponsiveDialog>
    )
  }

  if (loading || !user) {
    return (
      <ResponsiveDialog
        open
        onOpenChange={() => router.back()}
        title="Perfil"
        description="Cargando perfil..."
      >
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
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
      <ProfileDetail username={user.username} user={user} onClose={() => router.back()} />
    </ResponsiveDialog>
  )
}
