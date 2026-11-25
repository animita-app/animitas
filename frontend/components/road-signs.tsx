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

// The blue "retorno" sign of Chilean roads: a U-turn arrow, back to where you started.
export function RetornoSign({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 100 100" className={cn('drop-shadow-[0_3px_3px_rgb(28_24_20_/_0.4)]', className)}>
      <rect x="2" y="2" width="96" height="96" rx="9" fill="#0b4c9a" />
      <rect x="7" y="7" width="86" height="86" rx="6" fill="none" stroke="#f4f1e8" strokeWidth="3.5" />
      <path d="M64 80 V44 C64 30 56 24 47 24 C38 24 30 30 30 44 V58" fill="none" stroke="#f4f1e8" strokeWidth="9" strokeLinecap="butt" />
      <path d="M17 54 L30 72 L43 54 Z" fill="#f4f1e8" />
    </svg>
  )
}

// The close control: one X cut from print, always the same one, glued a little crooked.
export function CutoutClose({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img aria-hidden src="/cutouts/letters/x/0.webp" alt="" width={116} height={112} draggable={false} className={cn('-rotate-6 drop-shadow-[0_2px_2px_rgb(28_24_20_/_0.35)]', className)} />
  )
}
