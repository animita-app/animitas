import osmtogeojson from 'osmtogeojson';
import { FeatureCollection } from 'geojson';

const OVERPASS_API_URL = 'https://overpass-api.de/api/interpreter';

// Capas ampliadas para cartografía crítica
export type OverpassLayerType =
  | 'iglesias'
  | 'cementerios'
  | 'paradas'
  | 'bares'
  | 'memoriales'
  | 'altares'
  | 'accidentes'
  | 'curvas_peligrosas'
  | 'sin_iluminacion'
  | 'plazas'
  | 'hospitales'
  | 'carceles'
  | 'cruces_viales'
  | 'highways'
  | 'secondary_roads'
  | 'urban_streets'
  | 'dangerous_junctions'
  | 'traffic_lights'
  | 'roundabouts'
  | 'police'
  | 'fire_station'
  | 'schools'
  | 'universities';

const QUERIES: Record<OverpassLayerType, (bbox: string) => string> = {
  iglesias: (bbox) => `
    [out:json][timeout:25];
    (
      node["amenity"="place_of_worship"](${bbox});
      way["amenity"="place_of_worship"](${bbox});
      relation["amenity"="place_of_worship"](${bbox});
    );
    out body; >; out skel qt;
  `,

  cementerios: (bbox) => `
    [out:json][timeout:25];
    (
      nwr["landuse"="cemetery"](${bbox});
      nwr["amenity"="grave_yard"](${bbox});
    );
    out body; >; out skel qt;
  `,

  paradas: (bbox) => `
    [out:json][timeout:25];
    node["highway"="bus_stop"](${bbox});
    out body; >; out skel qt;
  `,

  bares: (bbox) => `
    [out:json][timeout:25];
    nwr["amenity"~"bar|pub|biergarten"](${bbox});
    out body; >; out skel qt;
  `,

  // —— NUEVAS CAPAS ——————————————————————

  memoriales: (bbox) => `
    [out:json][timeout:25];
    nwr["memorial"](${bbox});
    out body; >; out skel qt;
  `,

  altares: (bbox) => `
    [out:json][timeout:25];
    (
      nwr["amenity"="altar"](${bbox});
      nwr["historic"="wayside_shrine"](${bbox});
      nwr["man_made"="cross"](${bbox});
    );
    out body; >; out skel qt;
  `,

  accidentes: (bbox) => `
    [out:json][timeout:25];
    (
      nwr["hazard"](${bbox});
      nwr["traffic_calming"](${bbox});
      nwr["highway"="traffic_signals"](${bbox});
    );
    out body; >; out skel qt;
  `,

  curvas_peligrosas: (bbox) => `
    [out:json][timeout:25];
    nwr["hazard"="curve"](${bbox});
    out body; >; out skel qt;
  `,

  sin_iluminacion: (bbox) => `
    [out:json][timeout:25];
    (
      way["highway"]["lit"="no"](${bbox});
      node["highway"]["lit"="no"](${bbox});
    );
    out body; >; out skel qt;
  `,

  plazas: (bbox) => `
    [out:json][timeout:25];
    nwr["leisure"="park"](${bbox});
    out body; >; out skel qt;
  `,

  carceles: (bbox) => `
    [out:json][timeout:25];
    nwr["amenity"="prison"](${bbox});
    out body; >; out skel qt;
  `,

  // Transporte
  highways: (bbox) => `
    [out:json][timeout:25];
    way["highway"~"motorway|trunk|primary"](${bbox});
    out body; >; out skel qt;
  `,
  secondary_roads: (bbox) => `
    [out:json][timeout:25];
    way["highway"~"secondary|tertiary"](${bbox});
    out body; >; out skel qt;
  `,
  urban_streets: (bbox) => `
    [out:json][timeout:25];
    way["highway"~"residential|living_street"](${bbox});
    out body; >; out skel qt;
  `,
  dangerous_junctions: (bbox) => `
    [out:json][timeout:25];
    node["highway"="crossing"](${bbox});
    out body; >; out skel qt;
  `,
  traffic_lights: (bbox) => `
    [out:json][timeout:25];
    node["highway"="traffic_signals"](${bbox});
    out body; >; out skel qt;
  `,
  roundabouts: (bbox) => `
    [out:json][timeout:25];
    way["junction"="roundabout"](${bbox});
    out body; >; out skel qt;
  `,

  // Servicios
  hospitales: (bbox) => `
    [out:json][timeout:25];
    nwr["amenity"~"hospital|clinic"](${bbox});
    out body; >; out skel qt;
  `,
  police: (bbox) => `
    [out:json][timeout:25];
    nwr["amenity"="police"](${bbox});
    out body; >; out skel qt;
  `,
  fire_station: (bbox) => `
    [out:json][timeout:25];
    nwr["amenity"="fire_station"](${bbox});
    out body; >; out skel qt;
  `,

  // Sociabilidad
  schools: (bbox) => `
    [out:json][timeout:25];
    nwr["amenity"~"school|college"](${bbox});
    out body; >; out skel qt;
  `,
  universities: (bbox) => `
    [out:json][timeout:25];
    nwr["amenity"="university"](${bbox});
    out body; >; out skel qt;
  `,

  // Existing...
  cruces_viales: (bbox) => `
    [out:json][timeout:25];
    nwr["highway"="crossing"](${bbox});
    out body; >; out skel qt;
  `
};

export async function fetchOverpassLayer(
  type: OverpassLayerType,
  bounds: { south: number; west: number; north: number; east: number }
): Promise<FeatureCollection> {
  const bbox = `${bounds.south},${bounds.west},${bounds.north},${bounds.east}`;
  const query = QUERIES[type](bbox);

  try {
    console.log(`Fetching Overpass layer: ${type} with bbox: ${bbox}`)
    const response = await fetch(OVERPASS_API_URL, {
      method: 'POST',
      body: `data=${encodeURIComponent(query)}`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    if (!response.ok) throw new Error(`Overpass API error: ${response.statusText}`);

    const data = await response.json();
    const geojson = osmtogeojson(data) as FeatureCollection;
    console.log(`Overpass layer ${type} fetched successfully. Features: ${geojson.features.length}`)
    return geojson;

  } catch (error) {
    console.error(`Failed to fetch ${type} layer:`, error);
    return { type: 'FeatureCollection', features: [] };
  }
}
