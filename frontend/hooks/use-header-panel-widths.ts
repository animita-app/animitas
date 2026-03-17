import { useRef, useLayoutEffect, useState } from 'react'

export function useHeaderPanelWidths(isMobile?: boolean, searchActive?: boolean) {
  const tabsRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  const [tabsWidth, setTabsWidth] = useState(isMobile ? 164 : 308-31)
  const [searchWidth, setSearchWidth] = useState(isMobile ? 250 : 340)

  useLayoutEffect(() => {
    if (tabsRef.current) {
      const w = Math.ceil(tabsRef.current.scrollWidth) + 14
      setTabsWidth(w)
    }
    if (searchRef.current) {
      const w = Math.ceil(searchRef.current.scrollWidth) + 14
      setSearchWidth(w)
    }
  }, [isMobile])

  const finalSearchWidth = isMobile && searchActive ? Math.max(window.innerWidth - 32, searchWidth) : searchWidth

  return { tabsRef, searchRef, tabsWidth, searchWidth: finalSearchWidth }
}
