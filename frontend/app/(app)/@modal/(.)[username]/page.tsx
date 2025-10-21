'use client'

import { ProfileDetail } from '@/components/profile/profile-detail'
import { Button } from '@/components/ui/button'
import { ResponsiveDialog } from '@/components/ui/responsive-dialog'
import { signOut } from 'next-auth/react'
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

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/' })
  }

  if (!user) {
    return (
      <ResponsiveDialog
        open
        onOpenChange={() => router.back()}
        title="Perfil"
        description="Perfil de usuario"
      >
        Usuario no encontrado
        <Button variant="secondary" onClick={handleLogout}>
          Cerrar sesión
        </Button>
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
