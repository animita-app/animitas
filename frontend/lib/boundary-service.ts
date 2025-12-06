import type { Feature, Polygon, MultiPolygon, LineString, MultiLineString } from 'geojson'
import * as turf from '@turf/turf'

/**
 * Fast boundary fetching service using OSM Boundaries API
 * This replaces slow Overpass queries for administrative boundaries
 */

// Cache boundaries in memory for the session
const boundaryCache = new Map<string, Feature<Polygon | MultiPolygon | LineString | MultiLineString>>()

interface OSMBoundariesResponse {
  type: string
  features: Feature<Polygon | MultiPolygon>[]
}

/**
 * Simplify geometry for faster rendering
 * @param feature - GeoJSON feature to simplify
 * @param tolerance - Simplification tolerance (0.001 = ~100m, 0.01 = ~1km)
 */
function simplifyGeometry(
  feature: Feature<Polygon | MultiPolygon | LineString | MultiLineString>,
  tolerance: number = 0.001
): Feature<Polygon | MultiPolygon | LineString | MultiLineString> {
  try {
    if (feature.geometry.type === 'LineString' || feature.geometry.type === 'MultiLineString') {
      // For lines, use turf simplify
      const simplified = turf.simplify(feature as any, { tolerance, highQuality: false })
      return simplified as Feature<LineString | MultiLineString>
    } else {
      // For polygons, use turf simplify
      const simplified = turf.simplify(feature as any, { tolerance, highQuality: false })
      return simplified as Feature<Polygon | MultiPolygon>
    }
  } catch (error) {
    return feature
  }
}

/**
 * Fetch boundary from OSM Boundaries API
 * Much faster than Overpass for administrative boundaries
 */
async function fetchFromOSMBoundaries(
  placeName: string
): Promise<Feature<Polygon | MultiPolygon | LineString | MultiLineString> | null> {
  try {
    // Use Nominatim with better parameters for administrative boundaries
    // featuretype=boundary prioritizes administrative boundaries
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(placeName)}&format=json&polygon_geojson=1&limit=5&featuretype=boundary`

    const nominatimResponse = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'ANIMA-App/1.0'
      }
    })

    if (!nominatimResponse.ok) {
      return null
    }

    const nominatimData = await nominatimResponse.json()

    if (!nominatimData || nominatimData.length === 0) {
      return null
    }

    // Prefer administrative boundaries (relation type)
    // Filter for results that have geojson and are administrative boundaries
    const adminBoundary = nominatimData.find((place: any) =>
      place.geojson &&
      place.osm_type === 'relation' &&
      (place.type === 'administrative' || place.class === 'boundary')
    )

    const place = adminBoundary || nominatimData.find((p: any) => p.geojson) || nominatimData[0]

    // If Nominatim already returned the geometry, use it
    if (place.geojson) {
      const feature: Feature<Polygon | MultiPolygon> = {
        type: 'Feature',
        geometry: place.geojson,
        properties: {
          name: place.display_name,
          osm_id: place.osm_id,
          osm_type: place.osm_type,
          place_type: place.type,
          class: place.class
        }
      }

      const simplified = simplifyGeometry(feature, 0.001)

      return simplified
    }

    return null
  } catch (error) {
    return null
  }
}

/**
 * Fetch boundary using Overpass (fallback method)
 * Only used when OSM Boundaries API fails
 */
async function fetchFromOverpass(
  placeName: string
): Promise<Feature<Polygon | MultiPolygon | LineString | MultiLineString> | null> {

  const cleanName = placeName.split(',')[0].trim().replace(/"/g, '\\"')

  const query = `
    [out:json][timeout:25];
    (
      relation["name"="${cleanName}"]["boundary"="administrative"];
      relation["name"="${cleanName}"]["type"="boundary"];
      way["name"="${cleanName}"]["boundary"="administrative"];
      way["name"="${cleanName}"]["highway"];
      relation["name"="${cleanName}"]["type"="route"];
    );
    out geom;
  `

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000)

    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query,
      signal: controller.signal
    }).finally(() => clearTimeout(timeoutId))

    if (!response.ok) {
      return null
    }

    const data = await response.json()

    // Convert OSM data to GeoJSON
    const osmtogeojson = (await import('osmtogeojson')).default
    const geojson = osmtogeojson(data)

    // Find the first valid geometry
    const feature = geojson.features.find(f =>
      (f.geometry.type === 'Polygon' ||
        f.geometry.type === 'MultiPolygon' ||
        f.geometry.type === 'LineString' ||
        f.geometry.type === 'MultiLineString') &&
      f.id?.toString().startsWith('relation/')
    ) || geojson.features.find(f =>
      f.geometry.type === 'Polygon' ||
      f.geometry.type === 'MultiPolygon' ||
      f.geometry.type === 'LineString' ||
      f.geometry.type === 'MultiLineString'
    )

    if (!feature) {
      return null
    }

    // Simplify for faster rendering
    const simplified = simplifyGeometry(
      feature as Feature<Polygon | MultiPolygon | LineString | MultiLineString>,
      0.001
    )

    return simplified
  } catch (error) {
    return null
  }
}

/**
 * Main function to fetch place boundary
 * Uses fast OSM Boundaries API first, falls back to Overpass
 * Results are cached in memory
 */
export async function fetchPlaceBoundary(
  placeName: string
): Promise<Feature<Polygon | MultiPolygon | LineString | MultiLineString> | null> {

  // Check cache first
  const cacheKey = placeName.toLowerCase().trim()
  if (boundaryCache.has(cacheKey)) {
    return boundaryCache.get(cacheKey)!
  }

  // Try OSM Boundaries API first (fast)
  let boundary = await fetchFromOSMBoundaries(placeName)

  // Fallback to Overpass if needed
  if (!boundary) {
    boundary = await fetchFromOverpass(placeName)
  }

  // Cache the result
  if (boundary) {
    boundaryCache.set(cacheKey, boundary)
  }

  return boundary
}

/**
 * Clear the boundary cache (useful for memory management)
 */
export function clearBoundaryCache() {
  boundaryCache.clear()
}

/**
 * Get cache statistics
 */
export function getBoundaryCacheStats() {
  return {
    size: boundaryCache.size,
    keys: Array.from(boundaryCache.keys())
  }
}
