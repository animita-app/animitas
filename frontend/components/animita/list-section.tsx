'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel'
import { getInitials, truncate } from '@/lib/utils'

interface ListSectionProps {
  title: string
  memorials: any[]
  onClose?: () => void
}

function MemorialCard({ memorial }: { memorial: any }) {
  const imageSrc = memorial.images?.[0]?.url || memorial.primaryPerson?.image

  return (
    <Link href={`/animita/${memorial.id}`} className="flex flex-col gap-2 w-fit">
      <div className="relative w-24 h-32 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={memorial.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100px, 120px"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-300 to-slate-400" />
        )}
      </div>
      <h3 className="font-medium text-sm truncate w-24">{truncate(memorial.name, 15)}</h3>
    </Link>
  )
}

export function ListSection({ title, memorials }: ListSectionProps) {
  if (!memorials || memorials.length === 0) {
    return null
  }

  return (
    <section className="py-4 px-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-base font-medium">{title}</h2>
        <span className="text-xs text-muted-foreground">{memorials.length}</span>
      </div>
      <Carousel
        opts={{
          align: 'start',
          dragFree: true,
        }}
        className="w-full"
      >
        <CarouselContent className="gap-3">
          {memorials.map((memorial) => (
            <CarouselItem key={memorial.id} className="basis-auto pl-0">
              <MemorialCard memorial={memorial} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  )
}
