'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

// Whether an animita is open as a sheet over the map (rather than as its own page). The header reads it
// to stay on screen over the map; the layout's slot segment can't tell the two apart reliably.
const SheetContext = createContext<{ open: boolean; setOpen: (open: boolean) => void }>({ open: false, setOpen: () => {} })

export function SheetProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  return <SheetContext.Provider value={{ open, setOpen }}>{children}</SheetContext.Provider>
}

export const useSheetOpen = () => useContext(SheetContext).open

// Mounted inside a sheet: marks it open while it's on screen.
export function useMarkSheetOpen() {
  const { setOpen } = useContext(SheetContext)
  useEffect(() => {
    setOpen(true)
    return () => setOpen(false)
  }, [setOpen])
}
