import { useState, useEffect, useRef, useCallback } from 'react'
import { useSpatialContext } from '@/contexts/spatial-context'
import { Feature, Geometry } from 'geojson'
import { formatPlaceName } from '@/lib/format-place'
import { fetchPlaceBoundary } from '@/lib/boundary-service'
import { searchLocation } from '@/lib/mapbox'

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || ''

export function useSearchLocation(onSearch?: (query: string) => void) {
  const [searchQuery, setSearchQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const { setActiveArea, filteredData } = useSpatialContext()
  const debounceTimer = useRef<NodeJS.Timeout>()

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
    onSearch?.(query)

    if (debounceTimer.current) clearTimeout(debounceTimer.current)

    if (query.length >= 3) {
      debounceTimer.current = setTimeout(async () => {
        const localResults = filteredData.filter(site =>
          site.title?.toLowerCase().includes(query.toLowerCase()) ||
          site.address?.toLowerCase().includes(query.toLowerCase()) ||
          site.city_region?.toLowerCase().includes(query.toLowerCase())
        ).map(site => ({
          id: site.id,
          title: site.title,
          place_name: `${site.title}, ${site.city_region || ''}`,
          text: site.title,
          type: 'local',
          geometry: {
            type: 'Point',
            coordinates: [site.location.lng, site.location.lat]
          },
          properties: site
        }))

        let mapboxResults: any[] = []
        if (MAPBOX_TOKEN) {
          try {
            const features = await searchLocation(query, MAPBOX_TOKEN)
            mapboxResults = features
              .slice(0, 3)
              .map((feature: any) => ({
                id: feature.id,
                title: feature.place_name,
                place_name: feature.place_name,
                text: feature.text,
                type: 'mapbox',
                geometry: feature.geometry,
                bbox: feature.bbox,
                center: feature.center
              }))
          } catch (error) {
          }
        }

        const combined = [...localResults, ...mapboxResults]

        const seen = new Set<string>()
        const deduplicated = combined.filter(result => {
          const key = result.place_name || result.title
          if (seen.has(key)) {
            return false
          }
          seen.add(key)
          return true
        })

        setSearchResults(deduplicated)
        setOpen(true)
        setIsLoading(false)
      }, 300)
    } else {
      setOpen(false)
      setSearchResults([])
      setIsLoading(false)
    }
  }, [filteredData, onSearch])

  const handleSelect = useCallback(async (result: any) => {
    setIsLoading(true)
    let geometry: Geometry | null = null

    if (result.bbox) {
      const [minLng, minLat, maxLng, maxLat] = result.bbox
      const bboxGeometry: Geometry = {
        type: 'Polygon',
        coordinates: [[
          [minLng, minLat],
          [maxLng, minLat],
          [maxLng, maxLat],
          [minLng, maxLat],
          [minLng, minLat]
        ]]
      }
      const label = formatPlaceName(result.title || result.place_name || 'Área seleccionada')

      const bboxFeature: Feature<Geometry> = {
        type: 'Feature',
        geometry: bboxGeometry,
        properties: { ...result, isBbox: true }
      }

      setActiveArea(bboxFeature, label)
      setIsLoading(false)

      fetchPlaceBoundary(result.place_name || result.title).then(boundary => {
        if (boundary) {
          const feature: Feature<Geometry> = {
            type: 'Feature',
            geometry: boundary.geometry,
            properties: { ...result, isBbox: false }
          }
          setActiveArea(feature, label)
        }
      }).catch(() => {})

      resetSearch()
      return
    } else if (result.geometry) {
      geometry = result.geometry
    } else if (result.center) {
      geometry = {
        type: 'Point',
        coordinates: result.center
      }
    }

    if (geometry) {
      const feature: Feature<Geometry> = {
        type: 'Feature',
        geometry,
        properties: result
      }
      const label = formatPlaceName(result.title || result.place_name || 'Área seleccionada')
      setActiveArea(feature, label)
    }

    setIsLoading(false)
    resetSearch()
  }, [setActiveArea])

  const resetSearch = useCallback(() => {
    setSearchQuery('')
    onSearch?.('')
    setOpen(false)
  }, [onSearch])

  return {
    searchQuery,
    setSearchQuery,
    open,
    setOpen,
    isLoading,
    searchResults,
    handleSearch,
    handleSelect,
    resetSearch
  }
}
