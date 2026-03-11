'use client'

import { useState, useCallback } from 'react'

interface MapboxResult {
  id: string
  place_name: string
  text: string
  center: [number, number]
  properties?: any
}

export function useLocationSearch() {
  const [isLoading, setIsLoading] = useState(false)
  const [searchResults, setSearchResults] = useState<MapboxResult[]>([])
  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

  const handleSearch = useCallback(
    async (query: string) => {
      if (!query.trim() || !accessToken) {
        setSearchResults([])
        return
      }

      setIsLoading(true)
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${accessToken}&country=CL&limit=6`,
          { signal: AbortSignal.timeout(5000) }
        )
        const data = await response.json()
        setSearchResults(
          data.features?.map((f: any) => ({
            id: f.id,
            place_name: f.place_name,
            text: f.text,
            center: f.center,
            properties: f.properties,
          })) || []
        )
      } catch (err) {
        console.error('Location search error:', err)
        setSearchResults([])
      } finally {
        setIsLoading(false)
      }
    },
    [accessToken]
  )

  const resetSearch = useCallback(() => {
    setSearchResults([])
    setIsLoading(false)
  }, [])

  return {
    isLoading,
    searchResults,
    handleSearch,
    resetSearch,
  }
}
