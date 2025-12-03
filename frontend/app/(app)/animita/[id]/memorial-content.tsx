'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { SiteDetail } from '@/components/site-detail'
import { ResponsiveDialog } from '@/components/ui/responsive-dialog'

interface MemorialContentProps {
  id: string
}

export function MemorialContent({ id }: MemorialContentProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [dialogOpen, setDialogOpen] = useState(true)
  const [snap, setSnap] = useState<string | number | null>(0.75)
  const snapPoints = [0.75, 1]
  useEffect(() => {
    if (pathname.includes(`/animita/${id}`)) {
      setDialogOpen(true)
    }
  }, [id, pathname])

  const handleDialogChange = (nextOpen: boolean) => {
    setDialogOpen(nextOpen)

    if (!nextOpen) {
      // Wait for animation to finish before navigating
      setTimeout(() => {
        router.push('/')
      }, 300)
    }
  }

  return (
    <ResponsiveDialog
      key={id}
      open={dialogOpen}
      onOpenChange={handleDialogChange}

      title="Detalle del sitio"
      description="Información y testimonios del sitio seleccionado"
      snapPoints={snapPoints}
      activeSnapPoint={snap}
      setActiveSnapPoint={setSnap}
      className="min-h-[550px]"
    >
      <SiteDetail id={id} />
    </ResponsiveDialog>
  )
}
