"use client"

import { createContext, useContext, useState } from 'react'

interface SiteEditingContextType {
  isEditing: boolean
  setIsEditing: (v: boolean) => void
  cancelToken: number
  confirmToken: number
  requestCancel: () => void
  requestConfirm: () => void
}

export const SiteEditingContext = createContext<SiteEditingContextType>({
  isEditing: false,
  setIsEditing: () => {},
  cancelToken: 0,
  confirmToken: 0,
  requestCancel: () => {},
  requestConfirm: () => {},
})

export function SiteEditingProvider({ children }: { children: React.ReactNode }) {
  const [isEditing, setIsEditing] = useState(false)
  const [cancelToken, setCancelToken] = useState(0)
  const [confirmToken, setConfirmToken] = useState(0)

  return (
    <SiteEditingContext.Provider value={{
      isEditing,
      setIsEditing,
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
