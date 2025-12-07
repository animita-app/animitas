'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { COLORS, ICONS } from '@/lib/map-style'
import { HeritageSite } from '@/types/mock'
import { MapMarker } from '../map-marker'

const FALLBACK_IMAGE_URL = '/images/marker-fallback.webp'
import { SEED_PEOPLE } from '@/constants/people'
import { useUser } from '@/contexts/user-context'
import { ROLES } from '@/types/roles'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ArrowUpRight } from 'lucide-react'

export interface MarkerLayerProps {
  map: mapboxgl.Map | null
  isMapReady: boolean
  data: any[] // HeritageSite[]
  onSiteClick?: (id: string, feature: mapboxgl.MapboxGeoJSONFeature) => void
  sourceId?: string
  currentZoom: number
  visibleSites: HeritageSite[]
  selectedSite: HeritageSite | null
  onSiteSelect?: (site: HeritageSite | null) => void
}

const CLUSTER_CONFIG = {
  cluster: true,
  clusterMaxZoom: 20, // Clusters will break apart up to zoom level 20
  clusterRadius: 25
}

export function MarkerLayer({
  map,
  isMapReady,
  data,
  onSiteClick,
  sourceId = 'memorials',
  currentZoom,
  visibleSites,
  selectedSite,
  onSiteSelect
}: MarkerLayerProps) {
  const isInitialized = useRef(false)
  const { role } = useUser()
  const isFree = role === ROLES.FREE

  // 1. Initialize Source and Layers
  useEffect(() => {
    if (!map || !isMapReady || isInitialized.current) return

    // Add Source if it doesn't exist
    if (!map.getSource(sourceId)) {
      map.addSource(sourceId, {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
        promoteId: 'id', // Use the 'id' property for feature-state
        ...CLUSTER_CONFIG
      })
    }

    // --- Clusters Layers ---
    if (!map.getLayer('clusters')) {
      map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: sourceId,
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': ['step', ['get', 'point_count'], 'transparent', 10, 'transparent', 30, 'transparent'],
          'circle-radius': ['step', ['get', 'point_count'], 20, 10, 30, 30, 40],
          'circle-opacity': 0.85,
          'circle-stroke-color': COLORS.animitas,
          'circle-stroke-width': 1.5
        }
      })
    }

    if (!map.getLayer('cluster-count')) {
      map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: sourceId,
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 14
        },
        paint: { 'text-color': COLORS.animitas }
      })
    }

    // --- Unclustered Markers (Outer/Inner or Image) ---
    // Always add circle layers (needed for < zoom 10 for free, or all zooms for paid)
    if (!map.getLayer(`${sourceId}-outer`)) {
      map.addLayer({
        id: `${sourceId}-outer`,
        type: 'circle',
        source: sourceId,
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'],
            3, 8,
            6, 18,
            12, 24,
            18, 32
          ],
          'circle-color': 'transparent',
          'circle-opacity': 0.85,
          'circle-stroke-color': COLORS.animitas,
          'circle-stroke-width': 1.5
        }
      })
    }

    if (!map.getLayer(`${sourceId}-inner`)) {
      map.addLayer({
        id: `${sourceId}-inner`,
        type: 'circle',
        source: sourceId,
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'],
            3, 2.5,
            6, 6,
            12, 8,
            18, 12
          ],
          'circle-color': COLORS.animitas,
          'circle-opacity': 0.92
        }
      })
    }

    // --- Marker Image Layer (Free Only - Zoom >= 10) ---
    if (isFree) {
      // Layer 1: Default Markers (Fixed Size)
      if (!map.getLayer(`${sourceId}-marker-default`)) {
        map.addLayer({
          id: `${sourceId}-marker-default`,
          type: 'symbol',
          source: sourceId,
          minzoom: 10,
          filter: ['all', ['!', ['has', 'point_count']], ['==', ['get', 'icon_image_id'], 'marker-15']],
          layout: {
            'icon-image': 'marker-15',
            'icon-size': 1.5,
            'icon-allow-overlap': true,
            'icon-ignore-placement': true,
            'icon-pitch-alignment': 'viewport',
            'icon-rotation-alignment': 'viewport'
          }
        })
      }

      // Layer 2: Person Images (Zoom Scaled)
      if (!map.getLayer(`${sourceId}-marker-image`)) {
        map.addLayer({
          id: `${sourceId}-marker-image`,
          type: 'symbol',
          source: sourceId,
          minzoom: 10,
          filter: ['all', ['!', ['has', 'point_count']], ['!=', ['get', 'icon_image_id'], 'marker-15']],
          layout: {
            'icon-image': ['get', 'icon_image_id'],
            'icon-size': [
              'interpolate',
              ['linear'],
              ['zoom'],
              14, 0.5, // ~130px
            ],
            'icon-allow-overlap': true,
            'icon-ignore-placement': true,
            'icon-pitch-alignment': 'viewport',
            'icon-rotation-alignment': 'viewport'
          }
        })
      }
    }

    // Apply Zoom Range Logic
    if (map.getLayer(`${sourceId}-outer`)) {
      map.setLayerZoomRange(`${sourceId}-outer`, 0, isFree ? 12 : 24)
    }
    if (map.getLayer(`${sourceId}-inner`)) {
      map.setLayerZoomRange(`${sourceId}-inner`, 0, isFree ? 12 : 24)
    }

    isInitialized.current = true
  }, [map, isMapReady, sourceId, isFree])

  // 1.5. Load Markers Images (People)
  useEffect(() => {
    if (!map || !isMapReady) return

    const processAndAddImage = (id: string, image: any) => { // HTMLImageElement
      if (map.hasImage(id)) return

      const size = 256 // Fixed square size
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')
      if (ctx) {
        const imgWidth = image.width
        const imgHeight = image.height
        const scale = Math.max(size / imgWidth, size / imgHeight)
        const x = (size / 2) - (imgWidth / 2) * scale
        const y = (size / 2) - (imgHeight / 2) * scale

        ctx.drawImage(image as CanvasImageSource, x, y, imgWidth * scale, imgHeight * scale)

        const imageData = ctx.getImageData(0, 0, size, size)
        map.addImage(id, imageData)
      } else {
        map.addImage(id, image)
      }
    }

    // Load Fallback
    if (!map.hasImage('marker-fallback')) {
      map.loadImage(FALLBACK_IMAGE_URL, (error, image) => {
        if (!error && image) processAndAddImage('marker-fallback', image)
      })
    }

    // Load People Images
    data.forEach(site => {
      const person = SEED_PEOPLE.find(p => p.id === site.person_id)
      if (person && person.image && !map.hasImage(person.id)) {
        map.loadImage(person.image, (error, image) => {
          if (error) {
            console.warn(`Failed to load image for ${person.full_name}`, error)
            return
          }
          if (image) processAndAddImage(person.id, image)
        })
      }
    })
  }, [map, isMapReady, data])

  // 2. Update Data
  useEffect(() => {
    if (!map || !isMapReady) return

    const source = map.getSource(sourceId) as mapboxgl.GeoJSONSource
    if (source) {

      const geojson = {
        type: 'FeatureCollection',
        features: data.map((site) => {
          const person = SEED_PEOPLE.find(p => p.id === site.person_id)
          const iconId = person?.image ? person.id : 'marker-fallback'

          return {
            type: 'Feature',
            id: site.id, // Add feature ID for feature-state
            geometry: {
              type: 'Point',
              coordinates: [site.location.lng, site.location.lat]
            },
            properties: {
              ...site,
              icon_image_id: iconId
            }
          }
        })
      }
      source.setData(geojson as any)
    }
  }, [map, isMapReady, data, sourceId])

  // 3. Handle Events
  useEffect(() => {
    if (!map || !isMapReady) return

    const layersToClick = [`${sourceId}-inner`, `${sourceId}-outer`, `${sourceId}-marker-default`, `${sourceId}-marker-image`]


    // Point Click
    const onPointClick = (e: mapboxgl.MapMouseEvent & { features?: mapboxgl.MapboxGeoJSONFeature[] }) => {
      if (!e.features || e.features.length === 0) return
      const feature = e.features[0]
      const id = feature.properties?.id

      if (id && onSiteClick) {
        onSiteClick(id, feature)
      }
    }

    // Cluster Click
    const onClusterClick = (e: mapboxgl.MapMouseEvent & { features?: mapboxgl.MapboxGeoJSONFeature[] }) => {
      if (!e.features || e.features.length === 0) return
      const feature = e.features[0]
      const clusterId = feature.properties?.cluster_id
      const source = map.getSource(sourceId) as mapboxgl.GeoJSONSource

      source.getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err || zoom === null || zoom === undefined) return
        map.flyTo({
          center: (feature.geometry as any).coordinates,
          zoom: zoom,
          speed: 1.2,
          curve: 1,
          essential: true,
          duration: 500
        })
      })
    }

    const onMouseEnter = () => { map.getCanvas().style.cursor = 'pointer' }
    const onMouseLeave = () => { map.getCanvas().style.cursor = '' }

    // Register Point Events
    layersToClick.forEach(layerId => {
      if (map.getLayer(layerId)) {
        map.on('click', layerId, onPointClick)
        map.on('mouseenter', layerId, onMouseEnter)
        map.on('mouseleave', layerId, onMouseLeave)
      }
    })

    // Register Cluster Events
    if (map.getLayer('clusters')) {
      map.on('click', 'clusters', onClusterClick)
      map.on('mouseenter', 'clusters', onMouseEnter)
      map.on('mouseleave', 'clusters', onMouseLeave)
    }

    return () => {
      // Cleanup
      layersToClick.forEach(layerId => {
        try {
          if (map.getStyle() && map.getLayer(layerId)) {
            map.off('click', layerId, onPointClick)
            map.off('mouseenter', layerId, onMouseEnter)
            map.off('mouseleave', layerId, onMouseLeave)
          }
        } catch (e) { }
      })
      try {
        if (map.getStyle() && map.getLayer('clusters')) {
          map.off('click', 'clusters', onClusterClick)
          map.off('mouseenter', 'clusters', onMouseEnter)
          map.off('mouseleave', 'clusters', onMouseLeave)
        }
      } catch (e) { }
    }
  }, [map, isMapReady, onSiteClick, sourceId])

  // Helper to get iconography
  const getTypologyData = (type?: string) => {
    return ICONS.typology[type as keyof typeof ICONS.typology] || ICONS.typology.default
  }
  const getDeathCauseData = (cause?: string) => {
    return ICONS.deathCause[cause as keyof typeof ICONS.deathCause] || ICONS.deathCause.default
  }

  return (
    <>
      {map && (
        <>
          {(currentZoom >= 10 ? visibleSites : (selectedSite ? [selectedSite] : []))
            .map((site, index) => {
              const name = site.title
              const typology = site.typology
              const death_cause = site.insights?.memorial?.death_cause
              const kind = (site as any).kind || 'animita'
              const slug = site.slug || site.id

              const typologyData = getTypologyData(typology)
              const deathCauseData = getDeathCauseData(death_cause)
              const isVisible = currentZoom >= 10
              const href = `/${kind.toLowerCase()}/${slug}`

              return (
                <MapMarker
                  key={site.id}
                  map={map}
                  coordinates={[site.location.lng, site.location.lat]}
                  className="group-hover:scale-[102%] transition-all duration-150"
                >
                  <div className="relative flex flex-col items-center cursor-pointer">
                    <div className="-mt-6 relative z-20">
                      {/* Empty children placeholder */}
                    </div>

                    {isVisible && (
                      <Link
                        href={href}
                        prefetch={false}
                        className={cn(
                          "absolute left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-auto z-30 flex flex-col items-center gap-2",
                          isFree ? "top-20" : "top-12"
                        )}
                      >
                        <span className="font-ibm-plex-mono uppercase text-sm font-medium text-black">
                          {name || 'Animita'}
                        </span>
                        <Button size="sm" variant="link" className="hover:underline group-hover:underline text-accent hover:text-accent/80 group-hover:text-accent/80 [&_svg]:opacity-50 gap-1">
                          Ver detalles
                          <ArrowUpRight />
                        </Button>
                      </Link>
                    )}
                  </div>
                </MapMarker>
              )
            })}
        </>
      )}
    </>
  )
}
