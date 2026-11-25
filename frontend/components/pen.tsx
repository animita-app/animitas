import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

// Ballpoint marks drawn in the interface, the same pen that circles the animitas on the map.

// A loop drawn freehand around whatever it holds: a bit more than one turn that doesn't meet itself.
export function PenLoop({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <span className={cn('relative inline-flex items-center justify-center', className)}>
      <svg aria-hidden viewBox="0 0 48 48" className="pen-bleed absolute inset-0 size-full overflow-visible">
        <path
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
