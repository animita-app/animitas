import { useState, useEffect } from 'react'
import mapboxgl from 'mapbox-gl'
import { fetchOverpassLayer, OverpassLayerType } from '@/lib/overpass-client'

interface UseOverpassDataProps {
  map: mapboxgl.Map | null
  activeLayers: Record<string, boolean>
  loadedLayers: Set<string>
  setLoadedLayers: React.Dispatch<React.SetStateAction<Set<string>>>
}

export function useOverpassData({ map, activeLayers, loadedLayers, setLoadedLayers }: UseOverpassDataProps) {
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchLayers = async () => {
      const layersToFetch = Object.entries(activeLayers)
        .filter(([id, isActive]) => isActive && !loadedLayers.has(id))
        .map(([id]) => id)

      if (layersToFetch.length === 0) return

      setIsLoading(true)

      for (const id of layersToFetch) {
        try {
          if (id === 'critical_points') {
            const response = await fetch('/data/Puntos_criticos_2024.csv')
            const csvText = await response.text()

            // Simple CSV Parser
            const lines = csvText.split('\n')
            const headers = lines[0].split(',')
            const latIndex = headers.indexOf('Latitud')
            const lonIndex = headers.indexOf('Longitud')
            const countIndex = headers.indexOf('Cantidad_d') // Use quantity for heatmap weight

            const features: any[] = []

            for (let i = 1; i < lines.length; i++) {
              const line = lines[i].trim()
              if (!line) continue

              const row = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(',');

              if (row.length > Math.max(latIndex, lonIndex)) {
                const clean = (val: string) => val ? val.replace(/^"|"$/g, '') : ''

                const lat = parseFloat(clean(row[latIndex]))
                const lon = parseFloat(clean(row[lonIndex]))
                const count = parseInt(clean(row[countIndex])) || 1

                if (!isNaN(lat) && !isNaN(lon)) {
                  features.push({
                    type: 'Feature',
                    geometry: { type: 'Point', coordinates: [lon, lat] },
                    properties: { weight: count }
                  })
                }
              }
            }

            const geojson = { type: 'FeatureCollection', features } as any

            if (map) {
              const source = map.getSource(id) as mapboxgl.GeoJSONSource | undefined
              if (source) {
                source.setData(geojson)
                setLoadedLayers(prev => new Set(prev).add(id))
              }
            }
            continue
          }

          // Map layer ID to Overpass ID if needed
          let overpassId = id as OverpassLayerType
          if (id === 'churches') overpassId = 'iglesias'
          if (id === 'cemeteries') overpassId = 'cementerios'
          if (id === 'bars') overpassId = 'bares'
          if (id === 'hospitals') overpassId = 'hospitales'

          // Skip if not a valid Overpass layer (e.g. animitas)
          if (id === 'animitas') continue

          if (!overpassId) {
            continue
          }

          const data = await fetchOverpassLayer(overpassId, { south: -33.6, west: -70.8, north: -33.3, east: -70.5 })

          if (map) {
            const source = map.getSource(id) as mapboxgl.GeoJSONSource | undefined
            if (source) {
              source.setData(data)
              setLoadedLayers(prev => new Set(prev).add(id))
            }
          }
        } catch (err) {
          // Silent fail
        }
      }

      setIsLoading(false)
    }

    fetchLayers()
  }, [activeLayers, loadedLayers, map, setLoadedLayers])

  return { isLoading }
}
