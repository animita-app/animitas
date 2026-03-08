'use client'

import { ReactNode } from 'react'

interface SlidingPanelsProps {
  activeIndex: number
  widths: number[]
  children: ReactNode[]
}

export function SlidingPanels({ activeIndex, widths, children }: SlidingPanelsProps) {
  const currentWidth = widths[activeIndex] || widths[0]
  // Sum widths before activeIndex for translation
  const translateX = -widths.slice(0, activeIndex).reduce((sum, w) => sum + w, 0)

  return (
    <div
      className="overflow-clip rounded-full transition-[width] duration-200 ease-out-circ"
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
