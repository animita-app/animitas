'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'

import { MemorialDetail } from '@/components/animita/memorial-detail'
import { ResponsiveDialog } from '@/components/ui/responsive-dialog'

export default function MemorialModal({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [snap, setSnap] = useState<string | number | null>('96px')
  const snapPoints = ['96px', 1]

  return (
    <ResponsiveDialog
      open
      onOpenChange={() => router.back()}
      title="Detalle del memorial"
      description="Información y testimonios del memorial seleccionado"
      snapPoints={snapPoints}
      activeSnapPoint={snap}
      setActiveSnapPoint={setSnap}
    >
      <MemorialDetail id={id} />
    </ResponsiveDialog>
  )
}
