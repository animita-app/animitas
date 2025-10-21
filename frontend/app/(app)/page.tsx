'use client'

import { useState, useEffect } from 'react'
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
  const [snap, setSnap] = useState<string | number | null>('144px')
  const snapPoints = ['144px', 1]

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
        <DrawerHeader className="text-center pt-2 *:font-medium">
          <DrawerTitle>{memorials.length} animitas</DrawerTitle>
        </DrawerHeader>

      </DrawerContent>
    </Drawer>
  )
}
