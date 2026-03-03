import { useState, useEffect, useRef } from 'react'
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

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    onSearch?.(query)

    if (debounceTimer.current) clearTimeout(debounceTimer.current)

    if (query.length >= 3) {
      setOpen(true)
      setIsLoading(true)

      debounceTimer.current = setTimeout(() => {
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
        setIsLoading(false)
      }, 300)
    } else {
      setOpen(false)
      setSearchResults([])
    }
  }

  const handleSelect = async (result: any) => {
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
  }

  const resetSearch = () => {
    setSearchQuery('')
    onSearch?.('')
    setOpen(false)
  }

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
