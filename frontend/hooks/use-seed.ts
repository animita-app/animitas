import { useEffect } from 'react'
import { initializeSeed, hasSeedBeenRun } from '@/lib/seed'

export function useSeed(): boolean {
  useEffect(() => {
    if (!hasSeedBeenRun()) {
      initializeSeed()
    }
  }, [])

  return hasSeedBeenRun()
}
