import { useEffect, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import { HeritageSite } from '@/types/heritage'

interface UseVisibleSitesProps {
  map: mapboxgl.Map | null
  isMapReady: boolean
  currentZoom: number
  zoomThreshold: number
  filteredData: HeritageSite[]
  maxVisibleSites?: number
}

export function useVisibleSites({
  map,
  isMapReady,
  currentZoom,
  zoomThreshold,
  filteredData,
  maxVisibleSites = 20
}: UseVisibleSitesProps) {
  const [visibleSites, setVisibleSites] = useState<HeritageSite[]>([])

  useEffect(() => {
    setVisibleSites(filteredData.slice(0, maxVisibleSites))
  }, [filteredData, maxVisibleSites])

  return visibleSites
}
