import * as turf from '@turf/turf'
import { Feature, Geometry, Polygon, Point, FeatureCollection, LineString } from 'geojson'
import { HeritageSite } from '@/types/mock'
import { Layer } from '@/components/paywall/types'

export interface GISOperationResult {
  type: 'buffer' | 'intersect' | 'dissolve' | 'clip' | 'spatialJoin'
  geometry: FeatureCollection | Feature
  metadata?: any
}

export interface EnrichedPoint extends Feature<Point> {
  properties: {
    id: string
    nearestRoad?: number // distance in meters
    nearestBar?: number // distance in meters
    nearestChurch?: number // distance in meters
    landUseType?: string
    communeName?: string
    [key: string]: any
  }
}

// --- GIS OPERATIONS ---

export function bufferFeatures(
  features: FeatureCollection | Feature,
  radius: number = 0.5, // kilometers
  units: turf.Units = 'kilometers'
): FeatureCollection<Polygon> {
  // Turf buffer handles FeatureCollection or Feature
  const buffered = turf.buffer(features as any, radius, { units })

  if (!buffered) {
    return turf.featureCollection([])
  }

  // Normalize output to FeatureCollection<Polygon>
  if (buffered.type === 'Feature') {
    return turf.featureCollection([buffered as Feature<Polygon>])
  }
  return buffered as unknown as FeatureCollection<Polygon>
}

export function intersectFeatures(
  target: Feature<Polygon>,
  features: FeatureCollection
): FeatureCollection {
  const intersections: Feature[] = []

  turf.featureEach(features, (currentFeature) => {
    // Turf intersect only works with Polygon/MultiPolygon
    if (currentFeature.geometry.type === 'Polygon' || currentFeature.geometry.type === 'MultiPolygon') {
      const intersection = turf.intersect(
        turf.featureCollection([target as Feature<Polygon>, currentFeature as Feature<Polygon>])
      )
      if (intersection) {
        intersections.push(intersection)
      }
    } else if (currentFeature.geometry.type === 'Point') {
      if (turf.booleanPointInPolygon(currentFeature.geometry.coordinates, target)) {
        intersections.push(currentFeature)
      }
    }
  })

  return turf.featureCollection(intersections)
}

export function dissolveFeatures(
  features: FeatureCollection<Polygon>
): FeatureCollection<Polygon> {
  return turf.dissolve(features) as FeatureCollection<Polygon>
}

export function clipFeatures(
  features: FeatureCollection,
  boundary: Feature<Polygon>
): FeatureCollection {
  const clipped: Feature[] = []

  turf.featureEach(features, (feature) => {
    if (feature.geometry.type === 'Point') {
      if (turf.booleanPointInPolygon(feature.geometry.coordinates, boundary)) {
        clipped.push(feature)
      }
    }
    // For polygons/lines, we might need more complex clipping, but for now points are primary
  })

  return turf.featureCollection(clipped)
}

export function spatialJoin(
  points: FeatureCollection<Point>,
  contextLayers: {
    highways?: FeatureCollection<LineString>
    bars?: FeatureCollection<Point>
    churches?: FeatureCollection<Point>
  }
): FeatureCollection<Point> {
  const enrichedFeatures = points.features.map((point) => {
    const props = { ...point.properties }

    if (contextLayers.highways) {
      // Find nearest point on ANY line in the collection
      let minDistance = Infinity

      turf.featureEach(contextLayers.highways, (line) => {
        const nearest = turf.nearestPointOnLine(line as Feature<LineString>, point)
        if (nearest && nearest.properties && typeof nearest.properties.dist === 'number') {
          if (nearest.properties.dist < minDistance) {
            minDistance = nearest.properties.dist
          }
        }
      })

      if (minDistance !== Infinity) {
        props.nearestRoad = minDistance * 1000 // Convert km to meters
      }
    }

    if (contextLayers.bars) {
      const nearest = turf.nearestPoint(point, contextLayers.bars)
      if (nearest) {
        props.nearestBar = turf.distance(point, nearest, { units: 'meters' })
      }
    }

    if (contextLayers.churches) {
      const nearest = turf.nearestPoint(point, contextLayers.churches)
      if (nearest) {
        props.nearestChurch = turf.distance(point, nearest, { units: 'meters' })
      }
    }

    // Mock Land Use
    const landUses = ['Residencial', 'Comercial', 'Industrial', 'Mixto', 'Rural']
    props.landUseType = landUses[Math.floor(Math.random() * landUses.length)]

    return turf.point(point.geometry.coordinates, props)
  })

  return turf.featureCollection(enrichedFeatures)
}

// --- INSIGHTS GENERATION ---

export function computeAnimitaInsights(
  animitas: HeritageSite[],
  contextLayers: any
): any[] {
  // Convert sites to GeoJSON points
  const points = turf.featureCollection(
    animitas.map(site => turf.point([site.location.lng, site.location.lat], { ...site }))
  )

  const enriched = spatialJoin(points as FeatureCollection<Point>, contextLayers)

  return enriched.features.map(f => ({
    id: f.properties?.id,
    nearestRoad: f.properties?.nearestRoad,
    nearestBar: f.properties?.nearestBar,
    landUse: f.properties?.landUseType
  }))
}
