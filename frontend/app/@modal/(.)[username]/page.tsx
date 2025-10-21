'use client'

import { ProfileDetail } from '@/components/profile/profile-detail'
import { Button } from '@/components/ui/button'
import { ResponsiveDialog } from '@/components/ui/responsive-dialog'
import { getInitials } from '@/lib/utils'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { use, useState, useEffect } from 'react'

export default function ProfileModal({ params }: { params: Promise<{ username: string }> }) {
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
