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
    <Link href={`/animita/${memorial.id}`} className="flex flex-col gap-2">
      <div className="relative w-full aspect-[3/4] overflow-hidden bg-secondary flex-shrink-0">
        <Image
          src={imageSrc}
          alt={memorial.name}
          width={96}
          height={128}
          className="object-cover w-full h-full"
        />
      </div>
      <h3 className="font-medium truncate">{truncate(memorial.name, 15)}</h3>
    </Link>
  )
}

export function ListSection({ title, memorials }: ListSectionProps) {
  if (!memorials || memorials.length === 0) {
    return null
  }

  return (
    <section className="pb-8">
      <h2 className="text-sm font-medium mb-4">{title}</h2>
      <Carousel
        opts={{
          align: 'start',
          dragFree: true,
        }}
        className="w-full"
      >
        <CarouselContent className="gap-3">
          {memorials.map((memorial) => (
            <CarouselItem key={memorial.id} className="basis-3/5 pl-0">
              <MemorialCard memorial={memorial} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  )
}
