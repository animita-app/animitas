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

    // --- Unclustered Markers (Outer/Inner circles) ---
    // Free users: show circles only at zoom < 10, then switch to images
    // Paid users: show circles at all zoom levels
    if (!map.getLayer(`${sourceId}-outer`)) {
      map.addLayer({
        id: `${sourceId}-outer`,
        type: 'circle',
        source: sourceId,
        filter: ['!', ['has', 'point_count']],
        maxzoom: isFree ? 12 : 0, // Hide at zoom 10+ for free users
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
        maxzoom: isFree ? 12 : 0, // Hide at zoom 10+ for free users
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
      // Layer 1: Default Markers (Zoom Scaled)
      if (!map.getLayer(`${sourceId}-marker-default`)) {
        map.addLayer({
          id: `${sourceId}-marker-default`,
          type: 'symbol',
          source: sourceId,
          minzoom: 0,
          maxzoom: 10, // Hide when DOM markers appear
          filter: ['all', ['!', ['has', 'point_count']], ['==', ['get', 'icon_image_id'], 'marker-15']],
          layout: {
            'icon-image': 'marker-15',
            'icon-size': [
              'interpolate',
              ['linear'],
              ['zoom'],
              10, 0.3,   // Small at zoom 10
              12, 0.5,   // Medium-small at zoom 12
              14, 1.5,   // Medium at zoom 14
            ],
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
          minzoom: 0,
          maxzoom: 10, // Hide when DOM markers appear
          filter: ['all', ['!', ['has', 'point_count']], ['!=', ['get', 'icon_image_id'], 'marker-15']],
          layout: {
            'icon-image': ['get', 'icon_image_id'],
            'icon-size': [
              'interpolate',
              ['linear'],
              ['zoom'],
              10, 0.15,  // Small at zoom 10
              12, 0.25,  // Medium-small at zoom 12
              14, 0.4,   // Medium at zoom 14
              16, 0.45,  // Medium-large at zoom 16
              18, 0.5    // Max size at zoom 18 (same as original)
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

        // Create circular clipping path
        ctx.beginPath()
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
        ctx.closePath()
        ctx.clip()

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

    // Handle Missing Images (Dynamic Loading)
    const onStyleImageMissing = (e: any) => {
      const id = e.id
      if (map.hasImage(id)) return

      // Check if it's one of our people
      const person = SEED_PEOPLE.find(p => p.id === id)
      if (person?.image) {
        map.loadImage(person.image, (error, image) => {
          if (!error && image) {
            if (!map.hasImage(id)) {
              // Process image (circle clip)
              const size = 256
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

                ctx.beginPath()
                ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
                ctx.closePath()
                ctx.clip()

                ctx.drawImage(image as CanvasImageSource, x, y, imgWidth * scale, imgHeight * scale)
                const imageData = ctx.getImageData(0, 0, size, size)
                map.addImage(id, imageData)
              } else {
                map.addImage(id, image)
              }
            }
          }
        })
      } else if (id === 'marker-fallback') {
        map.loadImage(FALLBACK_IMAGE_URL, (error, image) => {
          if (!error && image && !map.hasImage(id)) {
            map.addImage(id, image)
          }
        })
      }
    }

    map.on('styleimagemissing', onStyleImageMissing)

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
      map.off('styleimagemissing', onStyleImageMissing)
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
      {role === 'institutional' && (
        <div className="flex md:hidden items-center justify-center backdrop-blur-sm text-center text-sm uppercase font-ibm-plex-mono absolute inset-0 bg-[#00e]/70 text-white z-50">
          Perdón =(
          <br /><br />
          Sólo me dió el ⌛ para hacerlo en desktop.
        </div>
      )}
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

              // Calculate text scale based on zoom (0.7 at zoom 10, 1.0 at zoom 18)
              const textScale = Math.min(1, Math.max(0.7, 0.7 + ((currentZoom - 10) / 8) * 0.3))

              // Calculate top position based on zoom (scales with marker size)
              // For free: 60px at zoom 10, 80px at zoom 18
              // For paid: 48px at zoom 10, 48px at zoom 18 (fixed)
              const topValue = isFree
                ? 56 + ((currentZoom - 10) / 8) * 20
                : 28 + ((currentZoom - 10) / 8) * 20

              const person = SEED_PEOPLE.find(p => p.id === site.person_id)
              const iconImage = person?.image || FALLBACK_IMAGE_URL

              return (
                <MapMarker
                  key={site.id}
                  map={map}
                  coordinates={[site.location.lng, site.location.lat]}
                  className="group-hover:scale-[102%] transition-all duration-150"
                >
                  <div className="relative flex flex-col items-center cursor-pointer">
                    {/* Visual Pin Image */}
                    <div className="-mt-6 relative z-20 shadow-md rounded-full bg-white p-[1px]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={iconImage}
                        alt={name}
                        className="w-10 h-10 rounded-full object-cover border-[1.5px] border-black"
                      />
                    </div>

                    {isVisible && (
                      <Link
                        href={href}
                        prefetch={false}
                        className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-auto z-30 flex flex-col items-center gap-2"
                        style={{
                          top: `${topValue}px`,
                          transform: `scale(${textScale})`
                        }}
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
