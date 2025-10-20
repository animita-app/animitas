'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'

import { MemorialDetail } from '@/components/animita/memorial-detail'
import { ResponsiveDialog } from '@/components/ui/responsive-dialog'

export default function MemorialModal({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()

  return (
    <ResponsiveDialog
      open
      onOpenChange={() => router.back()}
      title="Detalle del memorial"
      description="Información y testimonios del memorial seleccionado"
      removeBorderOnExpand
      pinSpaceTop
    >
      <MemorialDetail id={id} />
    </ResponsiveDialog>
  )
}
