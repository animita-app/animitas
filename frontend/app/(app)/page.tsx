'use client'

import { useState, useEffect } from 'react'
import { ListSection } from '@/components/animita/list-section'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'

async function getMemorials() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
  try {
    const response = await fetch(`${apiUrl}/api/memorials`, { cache: 'no-store' })
    if (!response.ok) {
      return []
    }
    const data = await response.json()
    if (data && Array.isArray(data.memorials)) {
      return data.memorials
    }
    return []
  } catch (error) {
    return []
  }
}

export default function MapaPage() {
  const [memorials, setMemorials] = useState<any[]>([])
  const [snap, setSnap] = useState<string | number | null>('96px')
  const snapPoints = ['96px', 1]

  useEffect(() => {
    getMemorials().then(data => setMemorials(data))
  }, [])

  return (
    <Drawer
      open
      modal={false}
      snapPoints={snapPoints}
      activeSnapPoint={snap}
      setActiveSnapPoint={setSnap}
    >
      <DrawerContent>
        <DrawerHeader className="sr-only text-center pt-2 *:font-normal">
          <DrawerTitle>Todas las animitas</DrawerTitle>
        </DrawerHeader>
        <ListSection title="Recién añadidos" memorials={memorials} />
        <ListSection
          title="Más populares"
          memorials={memorials.slice().reverse()}
        />
      </DrawerContent>
    </Drawer>
  )
}
