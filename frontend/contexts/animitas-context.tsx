'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react'
import type { Animita } from '@/types/animita'
import { createClient } from '@/lib/supabase/client'
import { listAnimitas } from '@/lib/animitas'

export interface MapTarget {
  center?: [number, number]
  bbox?: [number, number, number, number]
}

export type AnimitasStatus = 'loading' | 'ready' | 'error'

interface AnimitasContextType {
  animitas: Animita[]
  status: AnimitasStatus
  reload: () => void
  comunas: string[]
  selectedComunas: string[]
  setSelectedComunas: (comunas: string[]) => void
  mapTarget: MapTarget | null
  flyTo: (target: MapTarget) => void
  clearMapTarget: () => void
  resetToken: number
  requestReset: () => void
}

const AnimitasContext = createContext<AnimitasContextType | undefined>(undefined)

export function AnimitasProvider({ children }: { children: ReactNode }) {
  const [all, setAll] = useState<Animita[]>([])
  const [status, setStatus] = useState<AnimitasStatus>('loading')
  const [reloadToken, setReloadToken] = useState(0)
  const [selectedComunas, setSelectedComunas] = useState<string[]>([])
  const [mapTarget, setMapTarget] = useState<MapTarget | null>(null)
  const [resetToken, setResetToken] = useState(0)

  useEffect(() => {
    let cancelled = false
    setStatus('loading')
    listAnimitas(createClient())
      .then(list => {
        if (cancelled) return
        setAll(list)
        setStatus('ready')
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })
    return () => { cancelled = true }
  }, [reloadToken])

  const comunas = useMemo(
    () => Array.from(new Set(all.map(a => a.city_region).filter((c): c is string => !!c))).sort((a, b) => a.localeCompare(b, 'es')),
    [all]
  )

  const animitas = useMemo(
    () => selectedComunas.length === 0 ? all : all.filter(a => a.city_region && selectedComunas.includes(a.city_region)),
    [all, selectedComunas]
  )

  const reload = useCallback(() => setReloadToken(t => t + 1), [])
  const flyTo = useCallback((target: MapTarget) => setMapTarget({ ...target }), [])
  const clearMapTarget = useCallback(() => setMapTarget(null), [])
  const requestReset = useCallback(() => setResetToken(t => t + 1), [])

  return (
    <AnimitasContext.Provider value={{ animitas, status, reload, comunas, selectedComunas, setSelectedComunas, mapTarget, flyTo, clearMapTarget, resetToken, requestReset }}>
      {children}
    </AnimitasContext.Provider>
  )
}

export function useAnimitas() {
  const context = useContext(AnimitasContext)
  if (!context) throw new Error('useAnimitas must be used within an AnimitasProvider')
  return context
}
