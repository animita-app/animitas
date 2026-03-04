import { useState, useEffect, useRef, useCallback } from 'react'
import { useSpatialContext } from '@/contexts/spatial-context'
import { Feature, Geometry } from 'geojson'
import { formatPlaceName } from '@/lib/format-place'
import { fetchPlaceBoundary } from '@/lib/boundary-service'

export function useSearchLocation(onSearch?: (query: string) => void) {
  const [searchQuery, setSearchQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const { setActiveArea, filteredData } = useSpatialContext()
  const debounceTimer = useRef<NodeJS.Timeout>()

  const handleSearch = useCallback((query: string) => {
    console.log('[useSearchLocation] handleSearch called:', query)
    setSearchQuery(query)
    onSearch?.(query)

    if (debounceTimer.current) clearTimeout(debounceTimer.current)

    if (query.length >= 3) {
      console.log('[useSearchLocation] Query >= 3, setting up debounce')

      debounceTimer.current = setTimeout(() => {
        console.log('[useSearchLocation] Opening popover after debounce')
        const results = filteredData.filter(site =>
          site.title?.toLowerCase().includes(query.toLowerCase()) ||
          site.address?.toLowerCase().includes(query.toLowerCase()) ||
          site.city_region?.toLowerCase().includes(query.toLowerCase())
        )
        setSearchResults(results.map(site => ({
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
        })))
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
