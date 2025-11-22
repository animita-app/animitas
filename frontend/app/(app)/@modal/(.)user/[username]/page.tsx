'use client'

import { ResponsiveDialog } from '@/components/ui/responsive-dialog'
import { useRouter } from 'next/navigation'
import { use } from 'react'

export default function ProfileModal({ params }: { params: Promise<{ username: string }> }) {
  const router = useRouter()
  const { username } = use(params)

  return (
    <ResponsiveDialog
      open={true}
      onOpenChange={() => router.back()}
      title="Perfil"
      description="Perfil de usuario"
    >
      <p className="text-muted-foreground">Esta funcionalidad no está disponible en el mockup</p>
    </ResponsiveDialog>
  )
}
