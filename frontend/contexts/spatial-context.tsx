import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react'

export interface MapTarget {
  center?: [number, number]
  bbox?: [number, number, number, number]
}

interface SpatialContextType {
  mapTarget: MapTarget | null
  flyTo: (target: MapTarget) => void

  mapResetToken: number
  requestMapReset: () => void

  filters: Record<string, string[]>
  setFilter: (attribute: string, values: string[]) => void
  toggleFilter: (attribute: string, value: string) => void
  clearFilters: () => void

  filteredData: any[]
}

const SpatialContext = createContext<SpatialContextType | undefined>(undefined)

export function SpatialProvider({ children }: { children: ReactNode }) {
  const [mapTarget, setMapTarget] = useState<MapTarget | null>(null)
  const [mapResetToken, setMapResetToken] = useState(0)
  const [filters, setFilters] = useState<Record<string, string[]>>({})
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
          return
        }

        if (data) {
          const normalized = data.map((site: any) => {
            let location = { lat: 0, lng: 0 }
            if (site.location?.type === 'Point' && site.location.coordinates) {
              location = { lng: site.location.coordinates[0], lat: site.location.coordinates[1] }
            } else if (site.location?.lat !== undefined && site.location?.lng !== undefined) {
              location = { lat: site.location.lat, lng: site.location.lng }
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
      }
    }
    fetchSites()
  }, [])


  const flyTo = (target: MapTarget) => setMapTarget({ ...target })

  const requestMapReset = () => {
    setMapResetToken(t => t + 1)
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

  const filteredData = useMemo(() => {
    let data = dbSites
    Object.entries(filters).forEach(([attr, values]) => {
      if (values.length > 0) {
        data = data.filter(item => values.includes(String(item[attr])))
      }
    })
    return data
  }, [filters, dbSites])

  return (
    <SpatialContext.Provider value={{
      mapTarget,
      flyTo,
      mapResetToken,
      requestMapReset,
      filters,
      setFilter,
      toggleFilter,
      clearFilters,
      filteredData
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
