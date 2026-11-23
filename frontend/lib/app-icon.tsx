import { ImageResponse } from 'next/og'

export const BRAND_BLUE = '#0000ee'
const FLAME_PATH = 'M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z'

// ImageResponse renders outside the DOM, so it only understands inline styles.
export function appIcon(size: number, { padded = false } = {}) {
  const glyph = Math.round(size * (padded ? 0.5 : 0.62))
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: BRAND_BLUE }}>
        <svg width={glyph} height={glyph} viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth={1.5} strokeLinejoin="round">
          <path d={FLAME_PATH} />
        </svg>
      </div>
    ),
    { width: size, height: size }
  )
}
