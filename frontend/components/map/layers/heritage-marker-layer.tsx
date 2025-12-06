'use client'

import { useEffect, useRef } from 'react'
import { COLORS } from '@/lib/map-style'
import { HeritageSite } from '@/types/mock'
import { MapMarker } from '../map-marker'
import { HeritageSiteDetailPopover } from '../heritage-site-detail-popover'
import { SEED_PEOPLE } from '@/constants/people'
import { useUser } from '@/contexts/user-context'
import { ROLES } from '@/types/roles'

export interface HeritageMarkerLayerProps {
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

export function HeritageMarkerLayer({
  map,
  isMapReady,
  data,
  onSiteClick,
  sourceId = 'memorials',
  currentZoom,
  visibleSites,
  selectedSite,
  onSiteSelect
}: HeritageMarkerLayerProps) {
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
    if (isFree) {
      if (!map.getLayer(`${sourceId}-marker`)) {
        map.addLayer({
          id: `${sourceId}-marker`,
          type: 'symbol',
          source: sourceId,
          filter: ['!', ['has', 'point_count']],
          layout: {
            'icon-image': 'marker-15',
            'icon-size': 1.5,
            'icon-allow-overlap': true
          }
        })
      }
    } else {
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
    }

    isInitialized.current = true
  }, [map, isMapReady, sourceId])

  // 2. Update Data
  useEffect(() => {
    if (!map || !isMapReady) return

    const source = map.getSource(sourceId) as mapboxgl.GeoJSONSource
    if (source) {
      const geojson = {
        type: 'FeatureCollection',
        features: data.map((site) => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [site.location.lng, site.location.lat]
          },
          properties: site
        }))
      }
      source.setData(geojson as any)
    }
  }, [map, isMapReady, data, sourceId])

  // 3. Handle Events
  useEffect(() => {
    if (!map || !isMapReady) return

    const layersToClick = [`${sourceId}-inner`, `${sourceId}-outer`, `${sourceId}-marker`]

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

  return (
    <>
      {map && (
        <>
          {(currentZoom >= 10 ? visibleSites : (selectedSite ? [selectedSite] : []))
            .map((site, index) => {
              return (
                <MapMarker
                  key={site.id}
                  map={map}
                  coordinates={[site.location.lng, site.location.lat]}
                >
                  <HeritageSiteDetailPopover
                    heritageSite={site}
                    open={currentZoom >= 10}
                    onClose={() => onSiteSelect?.(null)}
                    isFree={isFree}
                  >
                  </HeritageSiteDetailPopover>
                </MapMarker>
              )
            })}
        </>
      )}
    </>
  )
}
