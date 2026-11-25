// One-ink stipple print for photos, like a photocopy taped to an animita: grayscale, add noise, then threshold
// to two tones. It's an SVG filter so it needs no images, canvas or dependencies. Mounted once in the layout.
export function StippleFilter() {
  return (
    <svg aria-hidden width="0" height="0" className="absolute">
      <filter id="stipple" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
        <feColorMatrix
          in="SourceGraphic"
          type="matrix"
          values=".33 .55 .12 0 0  .33 .55 .12 0 0  .33 .55 .12 0 0  0 0 0 1 0"
          result="luma"
        />
        <feComponentTransfer in="luma" result="contrast">
          <feFuncR type="gamma" amplitude="1.15" exponent="1.1" offset="0" />
          <feFuncG type="gamma" amplitude="1.15" exponent="1.1" offset="0" />
          <feFuncB type="gamma" amplitude="1.15" exponent="1.1" offset="0" />
        </feComponentTransfer>
        <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="1" seed="7" result="noise" />
        <feColorMatrix in="noise" type="matrix" values="1 0 0 0 0  1 0 0 0 0  1 0 0 0 0  0 0 0 0 1" result="grain" />
        <feComposite in="contrast" in2="grain" operator="arithmetic" k1="0" k2="1" k3="0.8" k4="-0.4" result="mix" />
        <feComponentTransfer in="mix">
          <feFuncR type="discrete" tableValues="0.1 0.988" />
          <feFuncG type="discrete" tableValues="0.098 0.988" />
          <feFuncB type="discrete" tableValues="0.094 0.988" />
        </feComponentTransfer>
      </filter>
    </svg>
  )
}
