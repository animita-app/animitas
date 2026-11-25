import type mapboxgl from 'mapbox-gl'

// Mapbox can't read CSS variables, so these mirror --color-neutral-light-1 and --color-neutral-light-12.
const PAPER = [239, 233, 221]
const INK = [34, 29, 24]

function parseGray(value: unknown): number | null {
  if (typeof value !== 'string') return null
  const hex = value.match(/^#([0-9a-f]{6})$/i)
  const rgb = value.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/i)
  const [r, g, b] = hex
    ? [0, 2, 4].map(i => parseInt(hex[1].slice(i, i + 2), 16))
    : rgb
      ? [rgb[1], rgb[2], rgb[3]].map(Number)
      : [NaN, NaN, NaN]
  if ([r, g, b].some(Number.isNaN) || Math.max(r, g, b) - Math.min(r, g, b) > 6) return null
  return (r + g + b) / 3
}

export function warmGray(value: unknown): string | null {
  const lightness = parseGray(value)
  if (lightness === null) return null
  const t = Math.min(1, lightness / 252)
  const [r, g, b] = INK.map((ink, i) => Math.round(ink + (PAPER[i] - ink) * t))
  return `rgb(${r}, ${g}, ${b})`
}

// The base style is neutral gray; repaint every gray on the same ink-to-paper ramp as the rest of the app.
export function applyPaperStyle(map: mapboxgl.Map) {
  for (const layer of map.getStyle()?.layers ?? []) {
    const paint = (layer as { paint?: Record<string, unknown> }).paint ?? {}
    for (const [property, value] of Object.entries(paint)) {
      if (!property.endsWith('color')) continue
      const warm = warmGray(value)
      if (warm) map.setPaintProperty(layer.id, property as any, warm)
    }
  }
}
