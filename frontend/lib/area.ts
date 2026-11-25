import type { MultiPolygon, Polygon } from 'geojson'

// A place chosen in the search that narrows the map and the list to the animitas inside it.
export interface Area {
  label: string
  geometry: Polygon | MultiPolygon
  // True while only the place's box is known; the outline isn't drawn until the real one arrives.
  rough?: boolean
}

// The place's box: used to narrow right away while its outline loads, never drawn.
export function bboxPolygon([w, s, e, n]: number[]): Polygon {
  return { type: 'Polygon', coordinates: [[[w, s], [e, s], [e, n], [w, n], [w, s]]] }
}

// Ray casting on one ring: count edge crossings to the right of the point.
function inRing(lng: number, lat: number, ring: number[][]) {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]
    const [xj, yj] = ring[j]
    if ((yi > lat) !== (yj > lat) && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

function inPolygon(lng: number, lat: number, rings: number[][][]) {
  return inRing(lng, lat, rings[0]) && !rings.slice(1).some(hole => inRing(lng, lat, hole))
}

export function pointInArea(lng: number, lat: number, geometry: Area['geometry']) {
  return geometry.type === 'Polygon'
    ? inPolygon(lng, lat, geometry.coordinates)
    : geometry.coordinates.some(poly => inPolygon(lng, lat, poly))
}

export function areaBounds(geometry: Area['geometry']): [number, number, number, number] {
  let w = Infinity, s = Infinity, e = -Infinity, n = -Infinity
  const polys = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates
  for (const poly of polys) for (const [x, y] of poly[0]) {
    w = Math.min(w, x); e = Math.max(e, x); s = Math.min(s, y); n = Math.max(n, y)
  }
  return [w, s, e, n]
}

const boundaries = new Map<string, Area['geometry'] | null>()

// The real outline of a comuna, city or region (see /api/boundary).
export async function fetchBoundary(place: string): Promise<Area['geometry'] | null> {
  const key = place.toLowerCase().trim()
  if (boundaries.has(key)) return boundaries.get(key)!
  try {
    const res = await fetch(`/api/boundary?q=${encodeURIComponent(place)}`)
    const { geometry } = await res.json()
    boundaries.set(key, geometry ?? null)
    return geometry ?? null
  } catch {
    return null
  }
}
