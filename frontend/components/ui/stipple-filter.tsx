// A worn 80s-90s print for photos, like the faded snapshots taped inside an animita: the color channels
// slip out of register, the ink bleeds, blacks fade to brown, highlights glow warm and film grain sits on top.
// SVG filters only, so no canvas, images or dependencies. Mounted once in the layout.
export function StippleFilter() {
  return (
    <svg aria-hidden width="0" height="0" className="absolute">
      <filter id="stipple" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
        {/* Misregistration: red slips right, blue slips left and down, like a cheap print or a VHS chroma bleed. */}
        <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r" />
        <feOffset in="r" dx="2.2" dy="0" result="rShift" />
        <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g" />
        <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b" />
        <feOffset in="b" dx="-1.6" dy="0.8" result="bShift" />
        <feComposite in="rShift" in2="g" operator="arithmetic" k2="1" k3="1" result="rg" />
        <feComposite in="rg" in2="bShift" operator="arithmetic" k2="1" k3="1" result="rgb" />

        {/* Ink bleed: a soft spread before the grade, so edges smear instead of staying crisp. */}
        <feGaussianBlur in="rgb" stdDeviation="0.7" result="bled" />

        {/* Faded film: less saturation, lifted brown blacks, creamy highlights that never reach white. */}
        <feColorMatrix in="bled" type="saturate" values="0.55" result="muted" />
        <feComponentTransfer in="muted" result="graded">
          <feFuncR type="table" tableValues="0.15 0.4 0.68 0.85 0.9" />
          <feFuncG type="table" tableValues="0.1 0.31 0.58 0.77 0.84" />
          <feFuncB type="table" tableValues="0.09 0.25 0.46 0.64 0.72" />
        </feComponentTransfer>

        {/* Halation: the bright parts glow red-orange around their edges. */}
        <feComponentTransfer in="graded" result="highlights">
          <feFuncR type="linear" slope="2.4" intercept="-1.4" />
          <feFuncG type="linear" slope="1.4" intercept="-0.95" />
          <feFuncB type="linear" slope="0.6" intercept="-0.5" />
        </feComponentTransfer>
        <feGaussianBlur in="highlights" stdDeviation="6" result="glow" />
        <feBlend in="graded" in2="glow" mode="screen" result="glowing" />

        {/* Film grain on top, mid-gray noise so it darkens and lightens evenly. */}
        <feTurbulence type="fractalNoise" baseFrequency="0.95" numOctaves="2" seed="11" result="noise" />
        <feColorMatrix in="noise" type="matrix" values="0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0 0 0 0 1" result="grain" />
        <feComposite in="glowing" in2="grain" operator="arithmetic" k2="1" k3="0.22" k4="-0.11" />
      </filter>
    </svg>
  )
}
