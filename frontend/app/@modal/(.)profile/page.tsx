'use client'

import { useRouter } from 'next/navigation'
import { ResponsiveDialog } from '@/components/ui/responsive-dialog'
import { ProfileCard } from '@/components/profile/profile-card'

export default function ProfileModal() {
  const router = useRouter()

  return (
    <ResponsiveDialog
      open
      onOpenChange={() => router.back()}
      title="Perfil"
      description="Tu perfil de usuario"
    >
      <ProfileCard />
    </ResponsiveDialog>
  )
}
