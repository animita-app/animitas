import { useState, useCallback } from 'react'
import { Animita } from '@/types/animita'

interface UseAnimitaSelectionProps {
  onAnimitaSelect?: (site: Animita | null) => void
  selectedAnimita?: Animita | null
}

export function useAnimitaSelection({
  onAnimitaSelect,
  selectedAnimita: propSelectedAnimita
}: UseAnimitaSelectionProps = {}) {
  const [internalSelectedSite, setInternalSelectedSite] = useState<Animita | null>(null)

  // Use prop if available, otherwise internal state
  const selectedAnimita = propSelectedAnimita !== undefined
    ? propSelectedAnimita
    : internalSelectedSite

  const selectAnimita = useCallback(
    (site: Animita | null) => {
      if (onAnimitaSelect) {
        onAnimitaSelect(site)
      } else {
        setInternalSelectedSite(site)
      }
    },
    [onAnimitaSelect]
  )

  return {
    selectedAnimita,
    selectAnimita
  }
}
