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

// The close control: the round "fin de restricción" sign, white with black diagonal bands, that tells a
// driver a zone is over. Here it ends whatever is open.
export function FinSign({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 100 100" className={cn('drop-shadow-[0_3px_3px_rgb(28_24_20_/_0.4)]', className)}>
      <defs>
        <clipPath id="fin-face"><circle cx="50" cy="50" r="40" /></clipPath>
      </defs>
      <circle cx="50" cy="50" r="47" fill="#f4f1e8" />
      <circle cx="50" cy="50" r="44" fill="none" stroke="#1b1916" strokeWidth="2.5" />
      <g clipPath="url(#fin-face)" stroke="#1b1916" strokeWidth="5">
        <line x1="12" y1="78" x2="78" y2="12" />
        <line x1="22" y1="88" x2="88" y2="22" />
        <line x1="2" y1="68" x2="68" y2="2" />
      </g>
    </svg>
  )
}
