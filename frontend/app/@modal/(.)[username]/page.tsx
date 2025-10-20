'use client'

import { ProfileDetail } from '@/components/profile/profile-detail'
import { Button } from '@/components/ui/button'
import { ResponsiveDialog } from '@/components/ui/responsive-dialog'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { use, useState, useEffect } from 'react'

export default function ProfileModal({ params }: { params: Promise<{ username: string }> }) {
  const router = useRouter()
  const { username: userId } = use(params)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        console.log('Fetching user with identifier:', userId)
        const response = await fetch(`/api/users/${userId}`)
        const data = await response.json()

        if (response.ok) {
          console.log('User fetched successfully:', data)
          setUser(data)
        } else {
          console.error('API error:', response.status, data)
        }
      } catch (error) {
        console.error('Failed to fetch user:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [userId])


  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/' })
  }

  return (
    <ResponsiveDialog
      open
      onOpenChange={() => router.back()}
      title="Perfil"
      description="Perfil de usuario"
    >
      {/* <ProfileDetail username={user.username} onClose={() => router.back()} /> */}

      <Button variant="secondary" onClick={handleLogout} >
        Cerrar sesión
      </Button>
    </ResponsiveDialog>
  )
}
