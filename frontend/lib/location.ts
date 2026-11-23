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
