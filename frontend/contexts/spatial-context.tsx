import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react'
import { Feature, Geometry, FeatureCollection, Point } from 'geojson'
import { SEED_HERITAGE_SITES } from '@/constants/heritage-sites'
import { clipFeatures } from '@/lib/gis-engine'
import * as turf from '@turf/turf'
import { useUser } from './user-context'
import { ROLES } from '@/types/roles'

interface SpatialContextType {
  activeArea: Feature<Geometry> | FeatureCollection | null
  activeAreaLabel: string | null
  setActiveArea: (area: Feature<Geometry> | FeatureCollection, label: string) => void
  clearActiveArea: () => void

  // Cruise Mode
  isCruiseActive: boolean
  setCruiseActive: (active: boolean) => void
  isNarrating: boolean
  setIsNarrating: (narrating: boolean) => void

  // Filtering
  filters: Record<string, string[]>
  setFilter: (attribute: string, values: string[]) => void
  toggleFilter: (attribute: string, value: string) => void
  clearFilters: () => void

  // Data
  filteredData: any[]
  syntheticSites: any[]
  setSyntheticSites: (sites: any[]) => void
}

const SpatialContext = createContext<SpatialContextType | undefined>(undefined)

export function SpatialProvider({ children }: { children: ReactNode }) {
  const { role } = useUser()
  const isFree = role === ROLES.FREE

  const [activeArea, setActiveAreaState] = useState<Feature<Geometry> | FeatureCollection | null>(null)
  const [activeAreaLabel, setActiveAreaLabel] = useState<string | null>(null)
  const [filters, setFilters] = useState<Record<string, string[]>>({})
  const [syntheticSites, setSyntheticSites] = useState<any[]>([])
  const [isCruiseActive, setCruiseActive] = useState(false) // Start as false, activated by clicking "Empezar"
  const [isNarrating, setIsNarrating] = useState(false)

  const setActiveArea = (area: Feature<Geometry> | FeatureCollection, label: string) => {
    setActiveAreaState(area)
    setActiveAreaLabel(label)
  }

  const clearActiveArea = () => {
    setActiveAreaState(null)
    setActiveAreaLabel(null)
  }

  const setFilter = (attribute: string, values: string[]) => {
    setFilters(prev => ({
      ...prev,
      [attribute]: values
    }))
  }

  const toggleFilter = (attribute: string, value: string) => {
    setFilters(prev => {
      const current = prev[attribute] || []
      const next = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value]

      if (next.length === 0) {
        const { [attribute]: _, ...rest } = prev
        return rest
      }

      return { ...prev, [attribute]: next }
    })
  }

  const clearFilters = () => {
    setFilters({})
  }

  // Compute filtered data
  const filteredData = useMemo(() => {
    const allSites = [...SEED_HERITAGE_SITES, ...syntheticSites]

    let data = allSites.map(site => ({
      ...site,
      // Flatten nested properties for easier access
      death_cause: site.death_cause || site.insights?.memorial?.death_cause || 'unknown',
      typology: site.typology || 'unknown',
      antiquity_year: site.insights?.patrimonial?.antiquity_year || 0,
      size: site.insights?.patrimonial?.size || 'unknown'
    }))

    // 1. Spatial Filter (Active Area)
    if (activeArea) {
      // Convert data to FeatureCollection
      const points = turf.featureCollection(
        data.map(d => turf.point([d.location.lng, d.location.lat], d))
      )

      let clipped: FeatureCollection<Point> | null = null

      if (activeArea.type === 'FeatureCollection') {
        // Union all polygons in the collection for clipping
        // For simplicity, we just check if point is in ANY of the features
        // Or we can use clipFeatures which handles FeatureCollection?
        // clipFeatures in gis-engine expects a single boundary Feature<Polygon>
        // We might need to iterate or union.
        // Let's assume activeArea is usually a single feature or we handle it simply.

        // If it's a collection, we can check against each feature.
        const features = activeArea.features
        const validPoints = points.features.filter(pt => {
          return features.some(poly => {
            if (poly.geometry.type === 'Polygon' || poly.geometry.type === 'MultiPolygon') {
              return turf.booleanPointInPolygon(pt, poly as Feature<any>)
            }
            return false
          })
        })
        clipped = turf.featureCollection(validPoints)
      } else {
        // Single Feature
        if (activeArea.geometry.type === 'Polygon' || activeArea.geometry.type === 'MultiPolygon') {
          clipped = clipFeatures(points, activeArea as Feature<any>) as FeatureCollection<Point>
        }
      }

      if (clipped) {
        data = clipped.features.map(f => f.properties as any)
      }
    }

    // 2. Attribute Filters
    Object.entries(filters).forEach(([attr, values]) => {
      if (values.length > 0) {
        data = data.filter(item => values.includes(String((item as any)[attr])))
      }
    })

    return data
  }, [activeArea, filters, syntheticSites])

  return (
    <SpatialContext.Provider value={{
      activeArea,
      activeAreaLabel,
      setActiveArea,
      clearActiveArea,
      filters,
      setFilter,
      toggleFilter,
      clearFilters,
      filteredData,
      syntheticSites,
      // @ts-ignore
      setSyntheticSites,
      isCruiseActive,
      setCruiseActive,
      isNarrating,
      setIsNarrating
    }}>
      {children}
    </SpatialContext.Provider>
  )
}

export function useSpatialContext() {
  const context = useContext(SpatialContext)
  if (context === undefined) {
    throw new Error('useSpatialContext must be used within a SpatialProvider')
  }
  return context
}
