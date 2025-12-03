import type { FeatureCollection, Feature, Point, Polygon, LineString } from 'geojson'

export type OverpassLayerType =
  | 'highways'
  | 'cemeteries'
  | 'bars'
  | 'convenience'
  | 'churches'

interface FetchOptions {
  useMock?: boolean
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

export async function fetchHighways(options: FetchOptions = { useMock: true }): Promise<FeatureCollection<LineString>> {
  if (options.useMock) {
    return generateMockLines(20, MOCK_BBOX, { type: 'highway', name: 'Ruta Simulada' })
  }
  return { type: 'FeatureCollection', features: [] }
}

export async function fetchCemeteries(options: FetchOptions = { useMock: true }): Promise<FeatureCollection<Point>> {
  if (options.useMock) {
    return generateMockPoints(5, MOCK_BBOX, { type: 'cemetery', name: 'Cementerio Simulado' })
  }
  return { type: 'FeatureCollection', features: [] }
}

export async function fetchBars(options: FetchOptions = { useMock: true }): Promise<FeatureCollection<Point>> {
  if (options.useMock) {
    return generateMockPoints(15, MOCK_BBOX, { type: 'bar', name: 'Bar Simulado' })
  }
  return { type: 'FeatureCollection', features: [] }
}

export async function fetchConvenienceStores(options: FetchOptions = { useMock: true }): Promise<FeatureCollection<Point>> {
  if (options.useMock) {
    return generateMockPoints(10, MOCK_BBOX, { type: 'convenience', name: 'Almacén Simulado' })
  }
  return { type: 'FeatureCollection', features: [] }
}

export async function fetchChurches(options: FetchOptions = { useMock: true }): Promise<FeatureCollection<Point>> {
  if (options.useMock) {
    return generateMockPoints(8, MOCK_BBOX, { type: 'church', name: 'Iglesia Simulada' })
  }
  return { type: 'FeatureCollection', features: [] }
}

export async function fetchContextLayers() {
  const [highways, cemeteries, bars, convenience, churches] = await Promise.all([
    fetchHighways(),
    fetchCemeteries(),
    fetchBars(),
    fetchConvenienceStores(),
    fetchChurches()
  ])

  return {
    highways,
    cemeteries,
    bars,
    convenience,
    churches
  }
}
