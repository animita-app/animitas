'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitials } from '@/lib/utils'

interface ListSectionProps {
  title: string
  memorials: any[]
  onClose?: () => void
}

function MemorialCard({ memorial }: { memorial: any }) {
  const people = memorial.people || []

  return (
    <Link href={`/animita/${memorial.id}`}>
      {memorial.primaryPerson.image !== null ? (
        <Image
          src={memorial.primaryPerson.image}
          alt={memorial.name || memorial.name}
          width={256}
          height={384}
          className="aspect-[3/4]"
        />
      ) : (
        <div className="flex bg-secondary aspect-[3/4] w-full"/>
      )}
      <div className="pt-4">
        <h3 className="font-medium truncate">{memorial.name}</h3>
        {people.map((person: any) => (
          <div key={person.id} className="flex items-center gap-2">
            <Avatar className="size-6">
              <AvatarImage src={person.image} alt={person.name} />
              <AvatarFallback className="text-xs">
                {getInitials(person.name)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm truncate">{person.name}</span>
          </div>
        ))}
      </div>
    </Link>
  )
}

export function ListSection({ title, memorials }: ListSectionProps) {
  if (!memorials || memorials.length === 0) {
    return null
  }

  return (
    <section className="py-4 -mr-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-base font-medium">{title}</h2>
      </div>
      <Carousel
        opts={{
          align: 'start',
          dragFree: true,
        }}
        className="w-full"
      >
          <Carousel className="relative mt-4 -mx-6">
            <CarouselContent>
              {memorials.map((memorial) => (
                <CarouselItem key={memorial.id} className="pl-1">
                  <MemorialCard memorial={memorial} />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
      </Carousel>
    </section>
  )
}
