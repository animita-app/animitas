'use client'

import Image from 'next/image'

interface MemorialPopupProps {
  images: string[]
  name: string
}

export function MemorialPopup({ images, name }: MemorialPopupProps) {
  const imageCount = Math.min(images.length, 3)

  if (imageCount === 1) {
    return (
      <div className="p-2">
        <Image
          src={images[0]}
          alt={name}
          width={120}
          height={120}
          className="rounded-lg ring-2 ring-background object-cover w-28 h-28"
        />
      </div>
    )
  }

  if (imageCount === 2) {
    return (
      <div className="p-4 relative w-32 h-32">
        <div className="absolute left-4 top-4">
          <Image
            src={images[0]}
            alt={name}
            width={100}
            height={100}
            className="rounded-lg ring-2 ring-background object-cover w-24 h-24 rotate-20"
          />
        </div>
        <div className="absolute right-0 top-6">
          <Image
            src={images[1]}
            alt={name}
            width={100}
            height={100}
            className="rounded-lg ring-2 ring-background object-cover w-24 h-24 -rotate-20"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 relative w-40 h-40">
      <div className="absolute left-4 top-8 z-10">
        <Image
          src={images[0]}
          alt={name}
          width={120}
          height={120}
          className="rounded-lg ring-2 ring-background object-cover w-28 h-28 rotate-20"
        />
      </div>
      <div className="absolute right-4 top-8 z-10">
        <Image
          src={images[1]}
          alt={name}
          width={120}
          height={120}
          className="rounded-lg ring-2 ring-background object-cover w-28 h-28 -rotate-20"
        />
      </div>
      <div className="absolute left-1/2 -translate-x-1/2 top-2 z-20">
        <Image
          src={images[2]}
          alt={name}
          width={120}
          height={120}
          className="rounded-lg ring-2 ring-background object-cover w-28 h-28"
        />
      </div>
    </div>
  )
}
