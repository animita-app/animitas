'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface SlidingPanelsProps {
  activeIndex: number
  widths: number[]
  children: ReactNode[]
  className?: string
}

export function SlidingPanels({ activeIndex, widths, children, className }: SlidingPanelsProps) {
  const currentWidth = widths[activeIndex] || widths[0]
  // Sum widths before activeIndex for translation
  const translateX = -widths.slice(0, activeIndex).reduce((sum, w) => sum + w, 0)

  return (
    <div
      className={cn("overflow-clip rounded-full transition-[width] duration-200 ease-out-circ", className)}
      style={{ width: currentWidth }}
    >
      <div
        className="flex transition-transform duration-200 ease-out-expo items-center"
        style={{
          width: widths.reduce((sum, w) => sum + w, 0),
          transform: `translateX(${translateX}px)`,
        }}
      >
        {children.map((child, i) => (
          <div key={i} style={{ width: widths[i], flexShrink: 0 }} className="flex items-center">
            {child}
          </div>
        ))}
      </div>
    </div>
  )
}
