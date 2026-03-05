import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react'
import { Feature, Geometry, FeatureCollection, Point } from 'geojson'
import { clipFeatures } from '@/lib/gis-engine'
import * as turf from '@turf/turf'
import { useUser } from './user-context'
import { ROLES } from '@/types/roles'

interface SpatialContextType {
  activeArea: Feature<Geometry> | FeatureCollection | null
  activeAreaLabel: string | null
  setActiveArea: (area: Feature<Geometry> | FeatureCollection, label: string) => void
  clearActiveArea: () => void

  // Research Panel
  showResearchPanel: boolean
  setShowResearchPanel: (show: boolean) => void

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
  const isDefault = role === ROLES.DEFAULT

  const [activeArea, setActiveAreaState] = useState<Feature<Geometry> | FeatureCollection | null>(null)
  const [activeAreaLabel, setActiveAreaLabel] = useState<string | null>(null)
  const [showResearchPanel, setShowResearchPanel] = useState(false)
  const [filters, setFilters] = useState<Record<string, string[]>>({})
  const [syntheticSites, setSyntheticSites] = useState<any[]>([])
  const [dbSites, setDbSites] = useState<any[]>([])

  // Fetch initial data from Supabase
  React.useEffect(() => {
    const fetchSites = async () => {
      try {
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()

        const { data, error } = await supabase
          .from('heritage_sites')
          .select('*, heritage_kinds!kind_id(slug)')
          .eq('status', 'published')

        if (error) {
          console.error("[SpatialContext] Query error:", error)
          return
        }

        if (data) {
          const normalized = data.map((site: any) => {
            let location = { lat: 0, lng: 0 }

            if (site.location) {
              if (site.location.type === 'Point' && site.location.coordinates) {
                location = { lng: site.location.coordinates[0], lat: site.location.coordinates[1] }
              } else if (site.location.lat !== undefined && site.location.lng !== undefined) {
                location = { lat: site.location.lat, lng: site.location.lng }
              }
            }

            return {
              ...site,
              location,
              kind: (site.heritage_kinds as any)?.slug || 'animita'
            }
          })
          setDbSites(normalized)
        }
      } catch (err: any) {
        console.error("[SpatialContext] Error fetching sites:", err?.message || err)
      }
    }
    fetchSites()
  }, [])


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
    const allSites = [...dbSites, ...syntheticSites]

    let data = allSites.map(site => {
      // Ensure location exists to avoid crashes
      const loc = site.location || { lat: 0, lng: 0 }

      return {
        ...site,
        location: loc,
        // Flatten nested properties for easier access
        death_cause: site.death_cause || site.insights?.memorial?.death_cause || 'unknown',
        typology: site.typology || 'unknown',
        antiquity_year: site.insights?.patrimonial?.antiquity_year || 0,
        size: site.insights?.patrimonial?.size || 'unknown'
      }
    })


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
  }, [activeArea, filters, syntheticSites, dbSites])

  return (
    <SpatialContext.Provider value={{
      activeArea,
      activeAreaLabel,
      setActiveArea,
      clearActiveArea,
      showResearchPanel,
      setShowResearchPanel,
      filters,
      setFilter,
      toggleFilter,
      clearFilters,
      filteredData,
      syntheticSites,
      // @ts-ignore
      setSyntheticSites
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
