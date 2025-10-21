'use client'

import { ProfileDetail } from '@/components/profile/profile-detail'
import { Button } from '@/components/ui/button'
import { ResponsiveDialog } from '@/components/ui/responsive-dialog'
import { Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
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
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (loading) {
    return (
      <ResponsiveDialog
        open={true}
        onOpenChange={() => router.back()}
        title="Perfil"
        description="Perfil de usuario"
      >
        <Loader2 className="animate-spin text-muted-foreground m-auto" />
      </ResponsiveDialog>
    )
  }

  if (!user) {
    return (
      <ResponsiveDialog
        open={true}
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
      open={true}
      onOpenChange={() => router.back()}
      title="Perfil"
      description="Perfil de usuario"
    >
      <ProfileDetail user={user} />
    </ResponsiveDialog>
  )
}
