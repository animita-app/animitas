'use client'

import { useParams } from 'next/navigation'
import { ProfileDetail } from '@/components/profile/profile-detail'
import { useFetchUser } from '@/hooks/use-fetch-user'

export default function UserProfilePage() {
  const params = useParams<{ username: string }>()
  const { user, loading, error } = useFetchUser(params.username)

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-muted-foreground">Cargando perfil...</div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">{error || 'Usuario no encontrado'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto">
        <ProfileDetail user={user} />
      </div>
    </div>
  )
}
