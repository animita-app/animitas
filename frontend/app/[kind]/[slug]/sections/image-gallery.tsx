"use client"

import React from "react"
import Image from "next/image"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { ImageIcon } from "lucide-react"

interface ImageGalleryProps {
  images: string[] | null
  title: string
}

export function ImageGallery({ images, title }: ImageGalleryProps) {
  if (!images || images.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-400">
        <ImageIcon className="w-16 h-16 mb-4" />
        <p className="text-lg font-medium">No hay fotos</p>
      </div>
    )
  }

  return (
    <Carousel className="w-full h-full bg-black *:h-full">
      <CarouselContent className="w-full h-full ml-0">
        {images.map((image, index) => (
          <CarouselItem key={index} className="pl-0 h-full flex items-center justify-center relative">
            <div className="relative w-full max-h-screen">
              <Image
                src={image}
                alt={`${title} - image ${index + 1}`}
                width={1280}
                height={1280}
                className="object-contain aspect-square"
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  )
}
