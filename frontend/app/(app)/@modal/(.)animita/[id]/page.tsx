'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { MemorialDetail } from '@/components/animita/memorial-detail'
import { ResponsiveDialog } from '@/components/ui/responsive-dialog'

export default function MemorialModal({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [snap, setSnap] = useState<string | number | null>('640px')
  const snapPoints = ['640px', 1]
  const [drawerHeight, setDrawerHeight] = useState(0)

  useEffect(() => {
    const updateDrawerHeight = () => {
      const drawer = document.querySelector('[data-slot="drawer-content"]')
      if (drawer) {
        const rect = drawer.getBoundingClientRect()
        setDrawerHeight(rect.height)
      }
    }

    const timer = setTimeout(updateDrawerHeight, 100)
    window.addEventListener('resize', updateDrawerHeight)
    const observer = new ResizeObserver(updateDrawerHeight)
    const drawer = document.querySelector('[data-slot="drawer-content"]')
    if (drawer) observer.observe(drawer)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', updateDrawerHeight)
      observer.disconnect()
    }
  }, [])

  return (
    <ResponsiveDialog
      open
      onOpenChange={() => router.back()}
      title="Detalle del memorial"
      description="Información y testimonios del memorial seleccionado"
      snapPoints={snapPoints}
      activeSnapPoint={snap}
      setActiveSnapPoint={setSnap}
      drawerHeight={drawerHeight}
    >
      <MemorialDetail id={id} />
    </ResponsiveDialog>
  )
}
