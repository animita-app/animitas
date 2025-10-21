'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'

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

const FALLBACK_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23E5E7EB" width="100" height="100"/%3E%3Ctext x="50" y="50" font-size="40" fill="%239CA3AF" text-anchor="middle" dy=".3em"%3E?%3C/text%3E%3C/svg%3E'

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
          <DrawerDescription className="sr-only">Todas las animitas</DrawerDescription>
        </DrawerHeader>

        <Carousel className="relative mx-0">
          <CarouselContent className="ml-0">
            {memorials.map((memorial) => {
              const imageUrl = memorial.primaryPersonImage || FALLBACK_IMAGE
              const displayName =
                memorial.name ||
                (memorial.people?.[0]?.name ? `ANIMITA DE ${memorial.people[0].name.toUpperCase()}` : 'Memorial')

              return (
                <CarouselItem key={memorial.id} className="pl-0 basis-full">
                  <Link href={`/animita/${memorial.id}`}>
                    <div className="relative w-full aspect-square overflow-hidden bg-muted">
                      <Image
                        src={imageUrl}
                        alt={displayName}
                        fill
                        className="object-cover hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent flex items-end p-4">
                        <p className="text-white text-sm font-semibold truncate">
                          {displayName}
                        </p>
                      </div>
                    </div>
                  </Link>
                </CarouselItem>
              )
            })}
          </CarouselContent>
        </Carousel>
      </DrawerContent>
    </Drawer>
  )
}
