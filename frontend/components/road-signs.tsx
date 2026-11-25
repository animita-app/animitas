import { cn } from '@/lib/utils'

// Chilean road signs drawn as objects (sun-faded colors, white border, a soft shadow), used for the
// interface's few controls: PARE to close and a curve warning to go back. Decorative; the control that
// holds them carries the accessible name.

export function PareSign({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 100 100" className={cn('drop-shadow-[0_3px_3px_rgb(28_24_20_/_0.4)]', className)}>
      <defs>
        <linearGradient id="pare-sun" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#d23b30" />
          <stop offset="1" stopColor="#a8231d" />
        </linearGradient>
      </defs>
      <polygon points="30,2 70,2 98,30 98,70 70,98 30,98 2,70 2,30" fill="#f4f1e8" />
      <polygon points="32,7 68,7 93,32 93,68 68,93 32,93 7,68 7,32" fill="url(#pare-sun)" />
      <text x="50" y="61" textAnchor="middle" fontFamily="'DIN Condensed','Avenir Next Condensed','Arial Narrow',sans-serif" fontWeight="700" fontSize="30" fill="#f4f1e8" letterSpacing="1">PARE</text>
    </svg>
  )
}

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
