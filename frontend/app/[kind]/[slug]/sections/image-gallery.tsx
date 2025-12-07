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
  if (!images || images.length === 0) return null

  return (
    <Carousel className="w-full h-full [&_[data-slot=carousel-content]]:h-full">
      <CarouselContent className="w-full h-full ml-0">
        {images.map((image, index) => (
          <CarouselItem key={index} className="pl-0 w-full h-full flex items-center justify-center relative">
            <div className="relative w-full h-full">
              <Image
                src={image}
                alt={`${title} - image ${index + 1}`}
                width={1280}
                height={1280}
                className="object-contain w-full h-full"
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  )
}
