"use client"

import { useEffect, useState } from 'react'

export function useMediaQuery(query: string) {
  const getMatches = () => (typeof window !== 'undefined' ? window.matchMedia(query).matches : false)

  const [matches, setMatches] = useState<boolean>(getMatches)

  useEffect(() => {
    const mediaQuery = window.matchMedia(query)
    const handler = (event: MediaQueryListEvent) => setMatches(event.matches)

    setMatches(mediaQuery.matches)
    mediaQuery.addEventListener('change', handler)

    return () => mediaQuery.removeEventListener('change', handler)
  }, [query])

  return matches
}
