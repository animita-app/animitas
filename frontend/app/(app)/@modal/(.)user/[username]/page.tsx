'use client'

import { ProfileDetail } from '@/components/profile/profile-detail'
import { ResponsiveDialog } from '@/components/ui/responsive-dialog'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { use } from 'react'
import { useFetchUser } from '@/hooks/use-fetch-user'

export default function ProfileModal({ params }: { params: Promise<{ username: string }> }) {
  const router = useRouter()
  const { username } = use(params)
  const { user, loading, error } = useFetchUser(username)

  return (
    <ResponsiveDialog
      open={true}
      onOpenChange={() => router.back()}
      title="Perfil"
      description="Perfil de usuario"
    >
      {loading && <Loader2 className="animate-spin text-muted-foreground m-auto" />}
      {error && <p className="text-destructive">{error}</p>}
      {!loading && !error && user && <ProfileDetail user={user} />}
      {!loading && !error && !user && <p className="text-destructive">Usuario no encontrado</p>}
    </ResponsiveDialog>
  )
}
