import type { FeatureCollection, Feature, Point, Polygon, LineString, MultiPolygon, MultiLineString } from 'geojson'
import osmtogeojson from 'osmtogeojson'
import { fetchOverpassLayer, OverpassLayerType } from './overpass'
export { fetchOverpassLayer }
export type { OverpassLayerType }

// ... existing code ...

export async function fetchPlaceBoundary(placeName: string): Promise<Feature<Polygon | MultiPolygon | LineString | MultiLineString> | null> {
  // Clean up and escape place name
  const cleanName = placeName.split(',')[0].trim().replace(/"/g, '\\"')

  // Prioritize relations for administrative boundaries (cities, comunas)
  // Also search for highways/routes
  const query = `
    [out:json][timeout:10];
    (
      relation["name"="${cleanName}"]["boundary"="administrative"];
      relation["name"="${cleanName}"]["type"="boundary"];
      way["name"="${cleanName}"]["boundary"="administrative"];
      way["name"="${cleanName}"]["highway"];
      relation["name"="${cleanName}"]["type"="route"];
    );
    out body;
    >;
    out skel qt;
  `

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30s timeout

    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query,
      signal: controller.signal
    }).finally(() => clearTimeout(timeoutId))

    if (!response.ok) return null

    const data = await response.json()
    const geojson = osmtogeojson(data)

    // Find the first Polygon, MultiPolygon, LineString, or MultiLineString
    // Prefer relations (usually more complex boundaries) over ways
    const feature = geojson.features.find(f =>
      (f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon' || f.geometry.type === 'LineString' || f.geometry.type === 'MultiLineString') &&
      f.id && f.id.toString().startsWith('relation/')
    ) || geojson.features.find(f =>
      f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon' || f.geometry.type === 'LineString' || f.geometry.type === 'MultiLineString'
    )

    return (feature as Feature<Polygon | MultiPolygon | LineString | MultiLineString>) || null
  } catch (error) {
    return null
  }
}



interface FetchOptions {
  useMock?: boolean
  bbox?: { south: number; west: number; north: number; east: number }
}

// --- MOCK DATA GENERATORS ---

function generateMockPoints(count: number, bbox: number[], properties: any): FeatureCollection<Point> {
  const [minLng, minLat, maxLng, maxLat] = bbox
  const features: Feature<Point>[] = []

  for (let i = 0; i < count; i++) {
    const lng = minLng + Math.random() * (maxLng - minLng)
    const lat = minLat + Math.random() * (maxLat - minLat)
    features.push({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [lng, lat]
      },
      properties: {
        id: `mock-${properties.type}-${i}`,
        ...properties
      }
    })
  }

  return {
    type: 'FeatureCollection',
    features
  }
}

function generateMockLines(count: number, bbox: number[], properties: any): FeatureCollection<LineString> {
  const [minLng, minLat, maxLng, maxLat] = bbox
  const features: Feature<LineString>[] = []

  for (let i = 0; i < count; i++) {
    const startLng = minLng + Math.random() * (maxLng - minLng)
    const startLat = minLat + Math.random() * (maxLat - minLat)
    const endLng = startLng + (Math.random() - 0.5) * 0.01
    const endLat = startLat + (Math.random() - 0.5) * 0.01

    features.push({
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [[startLng, startLat], [endLng, endLat]]
      },
      properties: {
        id: `mock-${properties.type}-${i}`,
        ...properties
      }
    })
  }

  return {
    type: 'FeatureCollection',
    features
  }
}

// --- API FUNCTIONS ---

// Mock BBox around Santiago/Central Chile for realistic random generation
const MOCK_BBOX = [-70.8, -33.6, -70.5, -33.3]
const DEFAULT_BBOX = { south: -33.6, west: -70.8, north: -33.3, east: -70.5 } // Santiago

export async function fetchHighways(options: FetchOptions = { useMock: true }): Promise<FeatureCollection<LineString>> {
  if (options.useMock) {
    return generateMockLines(20, MOCK_BBOX, { type: 'highway', name: 'Ruta Simulada' })
  }
  const bbox = options.bbox || DEFAULT_BBOX
  const key = getCacheKey('highways', bbox)
  if (layerCache.has(key)) return layerCache.get(key)

  const data = await fetchOverpassLayer('highways', bbox) as FeatureCollection<LineString>
  layerCache.set(key, data)
  return data
}

export async function fetchCemeteries(options: FetchOptions = { useMock: true }): Promise<FeatureCollection<Point>> {
  if (options.useMock) {
    return generateMockPoints(5, MOCK_BBOX, { type: 'cemetery', name: 'Cementerio Simulado' })
  }
  const bbox = options.bbox || DEFAULT_BBOX
  const key = getCacheKey('cementerios', bbox)
  if (layerCache.has(key)) return layerCache.get(key)

  const data = await fetchOverpassLayer('cementerios', bbox) as FeatureCollection<Point>
  layerCache.set(key, data)
  return data
}

export async function fetchBars(options: FetchOptions = { useMock: true }): Promise<FeatureCollection<Point>> {
  if (options.useMock) {
    return generateMockPoints(15, MOCK_BBOX, { type: 'bar', name: 'Bar Simulado' })
  }
  const bbox = options.bbox || DEFAULT_BBOX
  const key = getCacheKey('bares', bbox)
  if (layerCache.has(key)) return layerCache.get(key)

  const data = await fetchOverpassLayer('bares', bbox) as FeatureCollection<Point>
  layerCache.set(key, data)
  return data
}

export async function fetchConvenienceStores(options: FetchOptions = { useMock: true }): Promise<FeatureCollection<Point>> {
  if (options.useMock) {
    return generateMockPoints(10, MOCK_BBOX, { type: 'convenience', name: 'Almacén Simulado' })
  }
  // Not implemented in overpass.ts
  return { type: 'FeatureCollection', features: [] }
}

export async function fetchChurches(options: FetchOptions = { useMock: true }): Promise<FeatureCollection<Point>> {
  if (options.useMock) {
    return generateMockPoints(8, MOCK_BBOX, { type: 'church', name: 'Iglesia Simulada' })
  }
  const bbox = options.bbox || DEFAULT_BBOX
  const key = getCacheKey('iglesias', bbox)
  if (layerCache.has(key)) return layerCache.get(key)

  const data = await fetchOverpassLayer('iglesias', bbox) as FeatureCollection<Point>
  layerCache.set(key, data)
  return data
}

// Simple in-memory cache
const layerCache = new Map<string, any>()

function getCacheKey(layerType: string, bbox?: { south: number; west: number; north: number; east: number }) {
  if (!bbox) return `${layerType}-default`
  // Round bbox to 2 decimal places to group nearby requests
  const s = bbox.south.toFixed(2)
  const w = bbox.west.toFixed(2)
  const n = bbox.north.toFixed(2)
  const e = bbox.east.toFixed(2)
  return `${layerType}-${s},${w},${n},${e}`
}

export async function fetchContextLayers(options: FetchOptions = { useMock: true }) {
  const bbox = options.bbox || DEFAULT_BBOX

  const fetchWithCache = async (type: OverpassLayerType) => {
    const key = getCacheKey(type, bbox)
    if (layerCache.has(key)) {
      return layerCache.get(key)
    }
    const data = await fetchOverpassLayer(type, bbox)
    layerCache.set(key, data)
    return data
  }

  const [
    highways, urban_streets, traffic_lights,
    hospitals, cemeteries, police, fire_station,
    churches, schools, universities, bars
  ] = await Promise.all([
    // Transporte
    fetchWithCache('highways'),

    fetchWithCache('urban_streets'),
    fetchWithCache('traffic_lights'),

    // Servicios
    fetchWithCache('hospitales'),
    fetchWithCache('cementerios'),
    fetchWithCache('police'),
    fetchWithCache('fire_station'),

    // Sociabilidad
    fetchWithCache('iglesias'),
    fetchWithCache('schools'),
    fetchWithCache('universities'),
    fetchWithCache('bares')
  ])

  return {
    highways, urban_streets, traffic_lights,
    hospitals, cemeteries, police, fire_station,
    churches, schools, universities, bars
  }
}
