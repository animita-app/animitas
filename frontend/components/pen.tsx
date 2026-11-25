import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

// Ballpoint marks drawn in the interface, the same pen that circles the animitas on the map.

// A loop drawn freehand around whatever it holds: a bit more than one turn that doesn't meet itself.
// Inside a `.pen-redraw`, reaching for it draws the loop again.
export function PenLoop({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <span className={cn('relative inline-flex items-center justify-center', className)}>
      <svg aria-hidden viewBox="0 0 48 48" className="pen-bleed absolute inset-0 size-full overflow-visible">
        <path
          className="pen-stroke"
          pathLength={1}
          d="M30.5 6.8 C19 4.2 7.2 11.6 6.4 23.6 C5.6 35.1 15.8 42.6 26.2 41.4 C36.8 40.2 43.4 31 41.6 20.4 C40.2 12.4 33.6 7.4 24.2 8.6 C21 9 18.6 10 16.8 11.2"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </svg>
      <span className="pen-ink relative">{children}</span>
    </span>
  )
}

// A dot scribbled in red ballpoint: something new is waiting.
export function RedPenDot({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 20 20" className={cn('pen-red overflow-visible', className)}>
      <path
        d="M6 9.5 C6.5 6 11.5 5 13.8 7.6 C15.8 10 14 14.4 10.2 14.6 C6.8 14.8 5.6 11.6 7.4 9.4 C9 7.6 12.4 8 12.6 10.4 C12.8 12.4 10.4 13.2 9.2 12 C8.4 11.2 9 9.8 10.4 10"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
