'use client'

import { ReactNode } from 'react'

interface SlidingPanelsProps {
  activeIndex: number
  panelWidth: number
  children: ReactNode[]
}

export function SlidingPanels({ activeIndex, panelWidth, children }: SlidingPanelsProps) {
  const translateX = activeIndex * -panelWidth

  return (
    <div
      className="overflow-clip"
      style={{ width: panelWidth }}
    >
      <div
        className="flex transition-transform duration-200"
        style={{
          width: panelWidth * children.length,
          transform: `translateX(${translateX}px)`,
          transitionTimingFunction: 'cubic-bezier(.4,0,.2,1)'
        }}
      >
        {children}
      </div>
    </div>
  )
}
