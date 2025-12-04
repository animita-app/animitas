import { Site } from '@/types/mock'
import { Feature, FeatureCollection, LineString, MultiLineString, Polygon, MultiPolygon, Point } from 'geojson'
import * as turf from '@turf/turf'

export type SiteWithMeta = Site & {
  source: 'real' | 'synthetic'
}

export interface SpatialContext {
  roads: Feature<LineString | MultiLineString>[]
  urbanAreas: Feature<Polygon | MultiPolygon>[]
  cemeteries: Feature<Polygon | MultiPolygon>[]
}

const CHILE_BBOX = [-75.6, -56.0, -66.4, -17.5] as const // [minLng, minLat, maxLng, maxLat]

// Common Chilean names for random generation
const FIRST_NAMES = [
  'Juan', 'María', 'José', 'Ana', 'Luis', 'Rosa', 'Carlos', 'Claudia', 'Jorge', 'Patricia',
  'Manuel', 'Carmen', 'Víctor', 'Margarita', 'Francisco', 'Francisca', 'Pedro', 'Camila',
  'Miguel', 'Daniela', 'Cristian', 'Carolina', 'Andrés', 'Paula', 'Roberto', 'Javiera',
  'Patricio', 'Constanza', 'Héctor', 'Valentina', 'Rodrigo', 'Fernanda', 'Ricardo', 'Catalina',
  'Sergio', 'Alejandra', 'Mario', 'Verónica', 'Eduardo', 'Natalia'
]

const LAST_NAMES = [
  'González', 'Muñoz', 'Rojas', 'Díaz', 'Pérez', 'Soto', 'Contreras', 'Silva',
  'Martínez', 'Sepúlveda', 'Morales', 'Rodríguez', 'López', 'Fuentes', 'Hernández',
  'Torres', 'Araya', 'Flores', 'Espinoza', 'Valenzuela', 'Castillo', 'Tapia',
  'Reyes', 'Gutiérrez', 'Castro', 'Pizarro', 'Álvarez', 'Vásquez', 'Sánchez',
  'Fernández', 'Ramírez', 'Carrasco', 'Gómez', 'Cortés', 'Herrera', 'Núñez',
  'Jara', 'Vergara', 'Rivera', 'Figueroa'
]

const TYPOLOGIES = ["Gruta", "Iglesia", "Casa", "Cruz", "Orgánica", "Social", "Moderna", "Monumental", "Tumba", "Muro"] as const;
const DEATH_CAUSES = ["Accidente", "Violencia", "Enfermedad", "Natural", "Desconocida", "Suicidio", "Asesinato"] as const;
const SOCIAL_ROLES = ["Padre", "Madre", "Hijo", "Hija", "Abuelo", "Abuela", "Amigo", "Vecino", "Estudiante", "Trabajador", "Deportista", "Artista", "Músico", "Poeta", "Líder Social", "Devoto"];
const RITUALS = ["Velas", "Flores", "Rezos", "Cantos", "Bailes", "Ofrendas", "Peregrinación", "Limpieza", "Decoración"];
const OFFERINGS = ["Velas", "Flores", "Juguetes", "Peluches", "Cartas", "Placas", "Dinero", "Comida", "Bebida", "Cigarros"];
const SIZES = ["Pequeña", "Mediana", "Grande"] as const;

function getRandomItem<T>(array: readonly T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomItems<T>(array: readonly T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function getRandomDate(start: Date, end: Date): string {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString().split('T')[0];
}

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD') // Split accented characters
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, '') // Trim - from end of text
}

function generateRandomName(): string {
  const first = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)]
  const last = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)]
  return `Animita de ${first} ${last}`
}

function generateRandomAttributes(seed: Site, index: number): Partial<Site> {
  const typology = getRandomItem(TYPOLOGIES);
  const size = getRandomItem(SIZES);
  const deathCause = getRandomItem(DEATH_CAUSES);
  const socialRoles = getRandomItems(SOCIAL_ROLES, Math.floor(Math.random() * 3) + 1);
  const rituals = getRandomItems(RITUALS, Math.floor(Math.random() * 3) + 1);
  const offerings = getRandomItems(OFFERINGS, Math.floor(Math.random() * 3) + 1);
  const antiquityYear = 1900 + Math.floor(Math.random() * 124); // 1900 - 2024
  const createdAt = getRandomDate(new Date(1950, 0, 1), new Date());

  // Generate a random story snippet
  const storyTemplates = [
    "Esta animita fue levantada en memoria de una persona muy querida por la comunidad.",
    "Se dice que concede milagros a quienes rezan con fe.",
    "Un lugar de recogimiento y oración para los vecinos.",
    "La historia de este lugar se ha transmitido de generación en generación.",
    "Aquí descansa el alma de quien partió trágicamente.",
    "Los viajeros suelen detenerse aquí para dejar una ofrenda.",
    "Un recordatorio silencioso de la fragilidad de la vida.",
    "Las velas nunca se apagan en este sitio sagrado."
  ];
  const story = getRandomItem(storyTemplates) + " " + (seed.story ? seed.story.substring(0, 50) + "..." : "");

  const title = generateRandomName();

  return {
    title: title,
    slug: slugify(title),
    person_id: `synthetic-person-${index}-${Date.now()}`,
    typology: typology,
    size: size,
    story: story,
    created_at: createdAt,
    insights: {
      site_id: `synthetic-${index}-${Date.now()}`,
      memorial: {
        death_cause: deathCause,
        social_roles: socialRoles,
        narrator_relation: "Generado Automáticamente"
      },
      spiritual: {
        rituals_mentioned: rituals,
        offerings_mentioned: offerings,
        digital_visit_count: Math.floor(Math.random() * 1000)
      },
      patrimonial: {
        antiquity_year: antiquityYear,
        size: size
      },
      generated_at: new Date().toISOString()
    }
  };
}

/**
 * Generates synthetic animitas based on real seeds and spatial context.
 * Distribution:
 * - ~60% Roads (Mode A)
 * - ~30% Urban Areas (Mode B)
 * - ~10% Cemeteries (Mode C)
 */
export function generateSyntheticSites(
  seeds: Site[],
  totalCount: number,
  context: SpatialContext
): SiteWithMeta[] {
  const syntheticSites: SiteWithMeta[] = []

  // Default probabilities - Adjusted for more rural/highway spread
  let pRoad = 0.85      // Increase road focus to fill gaps between cities
  let pUrban = 0.10     // Decrease urban focus to avoid clustering in major cities
  let pCemetery = 0.05  // Keep cemeteries low

  // Adjust probabilities based on available context
  const hasRoads = context.roads.length > 0
  const hasUrban = context.urbanAreas.length > 0
  const hasCemeteries = context.cemeteries.length > 0

  // If no urban polygons, use roads as proxy for urban areas
  const useRoadsForUrban = !hasUrban && hasRoads

  if (!hasRoads && !hasUrban && !hasCemeteries) {
    console.warn('No spatial context available for synthetic generation. Using random jitter around seeds.')
    // Fallback to simple jitter around seeds if no context
    return generateSimpleJitterSites(seeds, totalCount)
  }

  // Redistribute if some layers are missing
  if (!hasCemeteries) {
    pRoad += pCemetery // Move cemetery weight to road (rural)
    pCemetery = 0
  }

  if (!hasUrban && !useRoadsForUrban) {
    pRoad += pUrban // Move urban weight to road
    pUrban = 0
  }

  if (!hasRoads && !useRoadsForUrban) {
    // If no roads, everything goes to whatever is left (Urban or Cemetery)
    if (hasUrban) pUrban += pRoad
    else if (hasCemeteries) pCemetery += pRoad
    pRoad = 0
  }

  // Normalize (just in case)
  const totalP = pRoad + pUrban + pCemetery
  if (totalP > 0) {
    pRoad /= totalP
    pUrban /= totalP
    pCemetery /= totalP
  }

  const countRoad = Math.round(totalCount * pRoad)
  const countCemetery = Math.round(totalCount * pCemetery)
  const countUrban = totalCount - countRoad - countCemetery // Remainder to ensure exact total

  // Generate sites
  for (let i = 0; i < totalCount; i++) {
    const seed = seeds[Math.floor(Math.random() * seeds.length)]
    let location: { lat: number, lng: number } | null = null

    // Determine mode for this specific site
    let mode: 'road' | 'urban' | 'cemetery' = 'road'

    if (i < countRoad) {
      mode = 'road'
    } else if (i < countRoad + countCemetery) {
      mode = 'cemetery'
    } else {
      mode = 'urban'
    }

    // Try to generate location based on mode
    // We use Uniform Random selection for roads now to avoid clustering on main highways
    if (mode === 'road' && hasRoads) {
      location = generateLocationOnRoadUniform(context.roads)
    } else if (mode === 'cemetery' && hasCemeteries) {
      location = generateLocationInPolygon(context.cemeteries)
    } else if (mode === 'urban') {
      if (hasUrban) {
        location = generateLocationInPolygon(context.urbanAreas)
      } else if (useRoadsForUrban) {
        // Use roads as proxy for urban, but maybe with different jitter or logic?
        // For now, just use the road generator
        location = generateLocationOnRoadUniform(context.roads)
      }
    }

    // Fallbacks
    if (!location && hasUrban) location = generateLocationInPolygon(context.urbanAreas)
    if (!location && hasRoads) location = generateLocationOnRoadUniform(context.roads)
    if (!location) location = generateSimpleJitter(seed.location) // Ultimate fallback

    const attributes = generateRandomAttributes(seed, i);

    syntheticSites.push({
      ...seed,
      ...attributes,
      id: `synthetic-${i}-${Date.now()}`,
      source: 'synthetic',
      location: location,
    })
  }

  return syntheticSites
}

function generateLocationOnRoadUniform(
  roads: Feature<LineString | MultiLineString>[]
): { lat: number, lng: number } | null {
  if (roads.length === 0) return null

  // Uniform random selection of a road feature
  // This gives equal chance to a small street vs a highway, spreading points out more
  const road = roads[Math.floor(Math.random() * roads.length)]

  if (!road) return null

  try {
    let targetLine: Feature<LineString> | null = null

    if (road.geometry.type === 'MultiLineString') {
      const coords = road.geometry.coordinates
      const randomSegment = coords[Math.floor(Math.random() * coords.length)]
      targetLine = turf.lineString(randomSegment)
    } else {
      targetLine = road as Feature<LineString>
    }

    const lineLength = turf.length(targetLine)
    const dist = Math.random() * lineLength
    const pt = turf.along(targetLine, dist)

    // Increased jitter significantly to simulate rural/off-road placement
    // ~100m - 500m offset
    // 1 degree approx 111km -> 0.001 approx 100m
    const jitterAmount = 0.001 + (Math.random() * 0.004)
    const jitterLat = (Math.random() - 0.5) * jitterAmount
    const jitterLng = (Math.random() - 0.5) * jitterAmount

    const [lng, lat] = pt.geometry.coordinates

    return {
      lat: lat + jitterLat,
      lng: lng + jitterLng
    }

  } catch (e) {
    return null
  }
}



function generateLocationInPolygon(polygons: Feature<Polygon | MultiPolygon>[]): { lat: number, lng: number } | null {
  if (polygons.length === 0) return null

  // Retry up to 10 times to find a point inside
  for (let i = 0; i < 10; i++) {
    const poly = polygons[Math.floor(Math.random() * polygons.length)]
    const bbox = turf.bbox(poly)

    // Generate random point in bbox
    const minLng = bbox[0]
    const minLat = bbox[1]
    const maxLng = bbox[2]
    const maxLat = bbox[3]

    const lng = minLng + Math.random() * (maxLng - minLng)
    const lat = minLat + Math.random() * (maxLat - minLat)

    const pt = turf.point([lng, lat])

    if (turf.booleanPointInPolygon(pt, poly as any)) {
      return { lat, lng }
    }
  }
  return null
}

function generateSimpleJitterSites(seeds: Site[], count: number): SiteWithMeta[] {
  return Array.from({ length: count }).map((_, i) => {
    const seed = seeds[Math.floor(Math.random() * seeds.length)]
    const attributes = generateRandomAttributes(seed, i);
    return {
      ...seed,
      ...attributes,
      id: `synthetic-jitter-${i}`,
      source: 'synthetic',
      location: generateSimpleJitter(seed.location),
    }
  })
}

function generateSimpleJitter(location: { lat: number, lng: number }): { lat: number, lng: number } {
  // Simple jitter ~1km
  const r = 0.01
  return {
    lat: location.lat + (Math.random() - 0.5) * r,
    lng: location.lng + (Math.random() - 0.5) * r
  }
}
