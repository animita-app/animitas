"use client"

import { createContext, useContext, useState } from 'react'

export interface StagedChanges {
  title?: string
  story?: string
  insights?: Record<string, any>
  images?: string[]
}

interface SiteEditingContextType {
  isEditing: boolean
  setIsEditing: (v: boolean) => void
  stagedChanges: StagedChanges
  updateStagedChange: <K extends keyof StagedChanges>(field: K, value: StagedChanges[K]) => void
  clearStagedChanges: () => void
  cancelToken: number
  confirmToken: number
  requestCancel: () => void
  requestConfirm: () => void
}

export const SiteEditingContext = createContext<SiteEditingContextType>({
  isEditing: false,
  setIsEditing: () => {},
  stagedChanges: {},
  updateStagedChange: () => {},
  clearStagedChanges: () => {},
  cancelToken: 0,
  confirmToken: 0,
  requestCancel: () => {},
  requestConfirm: () => {},
})

export function SiteEditingProvider({ children }: { children: React.ReactNode }) {
  const [isEditing, setIsEditing] = useState(false)
  const [stagedChanges, setStagedChanges] = useState<StagedChanges>({})
  const [cancelToken, setCancelToken] = useState(0)
  const [confirmToken, setConfirmToken] = useState(0)

  const updateStagedChange = <K extends keyof StagedChanges>(field: K, value: StagedChanges[K]) => {
    setStagedChanges(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const clearStagedChanges = () => {
    setStagedChanges({})
  }

  return (
    <SiteEditingContext.Provider value={{
      isEditing,
      setIsEditing,
      stagedChanges,
      updateStagedChange,
      clearStagedChanges,
      cancelToken,
      confirmToken,
      requestCancel: () => setCancelToken(t => t + 1),
      requestConfirm: () => setConfirmToken(t => t + 1),
    }}>
      {children}
    </SiteEditingContext.Provider>
  )
}

export function useSiteEditing() {
  return useContext(SiteEditingContext)
}
