import { normalizeLocation } from '@/lib/location'
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
  sitesStatus: SitesStatus
  reloadSites: () => void
}

export type SitesStatus = 'loading' | 'ready' | 'error'

const SpatialContext = createContext<SpatialContextType | undefined>(undefined)

export function SpatialProvider({ children }: { children: ReactNode }) {
  const [mapTarget, setMapTarget] = useState<MapTarget | null>(null)
  const [mapResetToken, setMapResetToken] = useState(0)
  const [filters, setFilters] = useState<Record<string, string[]>>({})
  const [dbSites, setDbSites] = useState<any[]>([])

  const [sitesStatus, setSitesStatus] = useState<SitesStatus>('loading')
  const [reloadToken, setReloadToken] = useState(0)

  React.useEffect(() => {
    let cancelled = false
    setSitesStatus('loading')

    const fetchSites = async () => {
      try {
        const { createClient } = await import('@/lib/supabase/client')
        const { data, error } = await createClient()
          .from('heritage_sites')
          .select('*')
          .eq('status', 'published')

        if (cancelled) return
        if (error || !data) {
          setSitesStatus('error')
          return
        }

        setDbSites(
          data
            .map((site: any) => ({ ...site, location: normalizeLocation(site.location) ?? normalizeLocation(site) }))
            .filter((site: any) => site.location)
        )
        setSitesStatus('ready')
      } catch {
        if (!cancelled) setSitesStatus('error')
      }
    }
    fetchSites()
    return () => { cancelled = true }
  }, [reloadToken])

  const reloadSites = () => setReloadToken(t => t + 1)

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
      filteredData,
      sitesStatus,
      reloadSites
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
