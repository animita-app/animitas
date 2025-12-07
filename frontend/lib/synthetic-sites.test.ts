import { generateSyntheticSites, SpatialContext } from './synthetic-sites'
import { HeritageSite } from '@/types/mock'
import * as turf from '@turf/turf'

const MOCK_SEED: HeritageSite = {
  id: 'seed-1',
  slug: 'seed-1',
  kind: 'Animita',
  title: 'Seed Site',
  person_id: 'p1',
  location: { lat: 0, lng: 0 },
  typology: 'Gruta',
  images: [],
  created_at: '2023-01-01',
  created_by: { id: 'u1', name: 'User' },
  allow_edits: false
}

const MOCK_CONTEXT: SpatialContext = {
  roads: [
    turf.lineString([[0, 0], [10, 0]]) as any // Road along X axis
  ],
  urbanAreas: [
    turf.polygon([[[10, 10], [20, 10], [20, 20], [10, 20], [10, 10]]]) as any // Square at (10,10)
  ],
  cemeteries: [
    turf.polygon([[[30, 30], [40, 30], [40, 40], [30, 40], [30, 30]]]) as any // Square at (30,30)
  ]
}

describe('generateSyntheticSites', () => {
  it('should generate correct number of sites', () => {
    const sites = generateSyntheticSites([MOCK_SEED], 100, MOCK_CONTEXT)
    expect(sites.length).toBe(100)
  })

  it('should mark all sites as synthetic', () => {
    const sites = generateSyntheticSites([MOCK_SEED], 10, MOCK_CONTEXT)
    sites.forEach(site => {
      expect(site.source).toBe('synthetic')
    })
  })

  it('should distribute sites roughly according to default probabilities', () => {
    // 60% Road, 30% Urban, 10% Cemetery
    const sites = generateSyntheticSites([MOCK_SEED], 1000, MOCK_CONTEXT)

    let roadCount = 0
    let urbanCount = 0
    let cemeteryCount = 0

    sites.forEach(site => {
      const { lat, lng } = site.location

      // Check if near road (y ~ 0)
      if (Math.abs(lat) < 0.1 && lng >= 0 && lng <= 10) {
        roadCount++
      }
      // Check if in urban (x: 10-20, y: 10-20)
      else if (lng >= 10 && lng <= 20 && lat >= 10 && lat <= 20) {
        urbanCount++
      }
      // Check if in cemetery (x: 30-40, y: 30-40)
      else if (lng >= 30 && lng <= 40 && lat >= 30 && lat <= 40) {
        cemeteryCount++
      }
    })

    // Allow some margin of error due to randomness and jitter
    expect(roadCount).toBeGreaterThan(550)
    expect(roadCount).toBeLessThan(650)

    expect(urbanCount).toBeGreaterThan(250)
    expect(urbanCount).toBeLessThan(350)

    expect(cemeteryCount).toBeGreaterThan(50)
    expect(cemeteryCount).toBeLessThan(150)
  })

  it('should fallback correctly when layers are missing', () => {
    const contextNoRoads: SpatialContext = {
      ...MOCK_CONTEXT,
      roads: []
    }

    const sites = generateSyntheticSites([MOCK_SEED], 100, contextNoRoads)
    expect(sites.length).toBe(100)

    // Should be mostly urban and cemetery now
    // Default: Road 0.6, Urban 0.3, Cemetery 0.1
    // New: Urban 0.3 + 0.6 = 0.9, Cemetery 0.1

    let urbanCount = 0
    let cemeteryCount = 0

    sites.forEach(site => {
      const { lat, lng } = site.location
      if (lng >= 10 && lng <= 20 && lat >= 10 && lat <= 20) urbanCount++
      if (lng >= 30 && lng <= 40 && lat >= 30 && lat <= 40) cemeteryCount++
    })

    expect(urbanCount).toBeGreaterThan(80) // ~90 expected
    expect(cemeteryCount).toBeGreaterThan(5) // ~10 expected
  })

  it('should fallback to jitter if no context provided', () => {
    const emptyContext: SpatialContext = {
      roads: [],
      urbanAreas: [],
      cemeteries: []
    }

    const sites = generateSyntheticSites([MOCK_SEED], 10, emptyContext)
    expect(sites.length).toBe(10)

    sites.forEach(site => {
      // Should be near seed (0,0)
      expect(Math.abs(site.location.lat)).toBeLessThan(1)
      expect(Math.abs(site.location.lng)).toBeLessThan(1)
    })
  })
})
