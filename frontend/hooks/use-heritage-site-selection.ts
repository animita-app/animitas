import { useState, useCallback } from 'react'
import { HeritageSite } from '@/types/mock'

interface UseHeritageSiteSelectionProps {
  onHeritageSiteSelect?: (site: HeritageSite | null) => void
  selectedHeritageSite?: HeritageSite | null
}

export function useHeritageSiteSelection({
  onHeritageSiteSelect,
  selectedHeritageSite: propSelectedHeritageSite
}: UseHeritageSiteSelectionProps = {}) {
  const [internalSelectedSite, setInternalSelectedSite] = useState<HeritageSite | null>(null)

  // Use prop if available, otherwise internal state
  const selectedHeritageSite = propSelectedHeritageSite !== undefined
    ? propSelectedHeritageSite
    : internalSelectedSite

  const handleHeritageSiteSelect = useCallback(
    (site: HeritageSite | null) => {
      if (onHeritageSiteSelect) {
        onHeritageSiteSelect(site)
      } else {
        setInternalSelectedSite(site)
      }
    },
    [onHeritageSiteSelect]
  )

  return {
    selectedHeritageSite,
    handleHeritageSiteSelect
  }
}
