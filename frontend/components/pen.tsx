import type { CSSProperties, ReactNode } from 'react'
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

// A dot scribbled in red ballpoint: something new is waiting. Same hand as the blue circles: a quick
// tangle of strokes that fills the dot unevenly, the ink soaking at the edges.
export function RedPenDot({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg aria-hidden viewBox="0 0 20 20" style={style} className={cn('pen-red overflow-visible', className)}>
      <path
        d="M5.2 10.6 C4.6 6.4 9.8 3.6 13.6 5.8 C16.6 7.6 16.4 12.6 12.8 14.6 C9.4 16.4 5.4 14.2 5.8 10.8 C6.2 7.8 10.4 6.6 12.6 8.6 C14.4 10.2 13 13.4 10.4 13.4 C8.4 13.4 7.6 11.2 9.2 10 C10.4 9.2 11.8 10.2 11 11.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M7.4 7.6 C9.6 6.8 12.6 7.4 14.2 9.6" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.7" />
    </svg>
  )
}

// A number marked in red ballpoint: the pen scribbles a dense blob and the number is left in the paper's
// color inside it, so it reads from across the page.
export function RedPenCount({ count, className }: { count: number; className?: string }) {
  return (
    <span className={cn('relative inline-flex items-center justify-center', className)}>
      <svg aria-hidden viewBox="0 0 40 40" className="pen-red absolute inset-0 size-full overflow-visible">
        <path
          d="M20 4.5 C29.5 4 36 11 35.4 20.4 C34.8 29.6 27.6 35.8 18.8 35.2 C10 34.6 4.2 27.6 4.8 19 C5.4 10.8 11.8 5 20 4.5 Z"
          fill="currentColor"
        />
        <path
          d="M9 13 C14 7 27 6.4 32 13 M7 22 C12 30 27 33 33 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.9"
        />
      </svg>
      {/* Written in the paper's color, so not .pen-ink: its unlayered blue would win over any utility. */}
      <span className="pen-hand relative text-text-inverted">{count > 9 ? '9+' : count}</span>
    </span>
  )
}
