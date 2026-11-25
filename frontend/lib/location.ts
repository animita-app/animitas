export interface LatLng {
  lat: number
  lng: number
}

export function normalizeLocation(raw: any): LatLng | null {
  if (raw?.type === 'Point' && Array.isArray(raw.coordinates)) {
    return { lng: raw.coordinates[0], lat: raw.coordinates[1] }
  }
  if (typeof raw?.lat === 'number' && typeof raw?.lng === 'number') {
    return { lat: raw.lat, lng: raw.lng }
  }
  return null
}

export function directionsUrl({ lat, lng }: LatLng) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
}

// Mapbox addresses come with the region (sometimes in English), a postal code and the country. People
// only need the place and the comuna: "Ruta 5 Norte, Coquimbo".
export function shortAddress(address?: string | null, fallback?: string | null) {
  if (!address) return fallback || ''
  const parts = address
    .split(',')
    .map(part => part.replace(/\s*\d{7}\b/, '').trim())
    .filter(part => part && part !== 'Chile' && !/regi[oó]n|metropolitan|ant[aá]rtica/i.test(part))
  return parts.slice(0, 2).join(', ') || fallback || ''
}
