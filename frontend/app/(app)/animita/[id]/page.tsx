'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'

import MapboxMap from '@/components/map/mapbox-map'
import { MemorialDetail } from '@/components/animita/memorial-detail'
import { ResponsiveDialog } from '@/components/ui/responsive-dialog'

const FALLBACK_MAPBOX_TOKEN =
  'pk.eyJ1IjoiaWNhcnVzbWluZCIsImEiOiJjbWc4c2puMDIwYWxqMmxwczF0cWY2azZyIn0.YiZOCFkJJbVqu5lJwv9akQ'

export default function MemorialPage() {
  const params = useParams<{ id: string }>()
  const { id } = params
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(true)
  const [snap, setSnap] = useState<string | number | null>('720px')
  const snapPoints = ['720px', 1]
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || FALLBACK_MAPBOX_TOKEN

  const handleDialogChange = (nextOpen: boolean) => {
    setDialogOpen(nextOpen)
    if (!nextOpen) {
      router.push('/')
    }
  }

  return (
    <div className="h-svh md:max-w-3/4 flex flex-col">
      <main className="flex-1 relative h-full">
        <MapboxMap
          accessToken={mapboxToken}
          focusedMemorialId={id}
        />
      </main>

      <ResponsiveDialog
        open={dialogOpen}
        onOpenChange={handleDialogChange}
        title="Detalle del memorial"
        description="Información y testimonios del memorial seleccionado"
        snapPoints={snapPoints}
        activeSnapPoint={snap}
        setActiveSnapPoint={setSnap}
      >
        <MemorialDetail id={id} />
      </ResponsiveDialog>
    </div>
  )
}
