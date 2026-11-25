import { cn } from '@/lib/utils'

// Chilean road signs drawn as objects (sun-faded colors, white border, a soft shadow), used for the
// interface's few controls: a curve warning to go back. Decorative; the control that
// holds them carries the accessible name.

export function CurveSign({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 100 100" className={cn('drop-shadow-[0_3px_3px_rgb(28_24_20_/_0.4)]', className)}>
      <defs>
        <linearGradient id="curve-sun" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f2c230" />
          <stop offset="1" stopColor="#d9a51a" />
        </linearGradient>
      </defs>
      <rect x="15" y="15" width="70" height="70" rx="6" transform="rotate(45 50 50)" fill="#1b1916" />
      <rect x="19" y="19" width="62" height="62" rx="4" transform="rotate(45 50 50)" fill="url(#curve-sun)" />
      <path d="M58 72 V52 C58 42 52 38 44 38 H36" fill="none" stroke="#1b1916" strokeWidth="7" strokeLinecap="square" />
      <path d="M38 28 L26 38 L38 48 Z" fill="#1b1916" />
    </svg>
  )
}

// The yellow warning diamond with a U-turn arrow, as Chilean roads paint it: back to where you started.
export function RetornoSign({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 100 100" className={cn('drop-shadow-[0_3px_3px_rgb(28_24_20_/_0.4)]', className)}>
      <defs>
        <linearGradient id="retorno-sun" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f2c230" />
          <stop offset="1" stopColor="#d9a51a" />
        </linearGradient>
      </defs>
      <rect x="15" y="15" width="70" height="70" rx="6" transform="rotate(45 50 50)" fill="#1b1916" />
      <rect x="19" y="19" width="62" height="62" rx="4" transform="rotate(45 50 50)" fill="url(#retorno-sun)" />
      <path d="M58 70 V46 C58 37 53 33 46.5 33 C40 33 35 37 35 46 V52" fill="none" stroke="#1b1916" strokeWidth="7" />
      <path d="M26 50 L35 64 L44 50 Z" fill="#1b1916" />
    </svg>
  )
}

// The close control. No Chilean sign means "close", so it's a cross scrawled with the same ballpoint
// that circles the animitas on the map: two strokes that don't quite meet in the middle.
export function PenCross({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 40 40" className={cn('overflow-visible', className)}>
      <defs>
        <filter id="pen-bleed" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="0.9" result="soak" />
          <feMerge>
            <feMergeNode in="soak" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g fill="none" stroke="#2c3f8c" strokeLinecap="round" filter="url(#pen-bleed)" opacity="0.9">
        <path d="M9.5 8.5 C15 14 20 18.5 24 23 C26.5 26 29 28.5 31.5 31.5" strokeWidth="3" />
        <path d="M30.5 7.5 C25.5 12.5 21.5 17.5 17.5 21.5 C14 25 11 28.5 8.5 32" strokeWidth="2.6" />
      </g>
    </svg>
  )
}
