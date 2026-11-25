'use client'

import { useState, useEffect, useLayoutEffect, useRef } from 'react'
import { useIsMobile } from '@/hooks/use-mobile'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ShelfObject } from '@/components/shelf-object'
import { useAnimitas } from '@/contexts/animitas-context'
import { useSearchLocation } from '@/hooks/use-search-location'
import { SearchInput } from '@/components/search/search-input'
import Link from 'next/link'
import { SlidingPanels } from '@/components/ui/sliding-panels'

const FALLBACK_TABS_WIDTH = 280

// Real objects stand on the page like offerings at an animita. No labels until you reach for one.
const SHELF = [
  { href: '/map', src: '/cutouts/map.png', label: 'Mapa', size: 'h-14' },
  { href: '/list', src: '/cutouts/shrines.png', label: 'Lista', size: 'h-14' },
  { href: '/add', src: '/cutouts/candle.png', label: 'Agregar', size: 'h-12' },
]

function Shelf({ setSearchActive, pathname }: { setSearchActive: (active: boolean) => void; pathname: string }) {
  const { requestReset } = useAnimitas()
  return (
    <div className="shelf flex items-end gap-6 px-6 pb-1 w-max">
      {SHELF.map(item => {
        const active = pathname === item.href || (item.href === '/map' && pathname.startsWith('/animita'))
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={(e) => {
              setSearchActive(false)
              // Already on the map: the map object brings the whole country back into view.
              if (item.href === '/map' && pathname === '/map') {
                e.preventDefault()
                requestReset()
              }
            }}
            aria-label={item.label}
            aria-current={active ? 'page' : undefined}
            className="shelf-item relative flex flex-col items-center rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <ShelfObject {...item} active={active} />
          </Link>
        )
      })}
      <button
        type="button"
        aria-label="Buscar"
        onClick={() => setSearchActive(true)}
        className="shelf-item relative flex flex-col items-center rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        <ShelfObject src="/cutouts/magnifier.png" label="Buscar" size="h-10" />
      </button>
    </div>
  )
}

export function MainHeaderPanel() {
  const pathname = usePathname()
  const isMobile = useIsMobile()
  const SEARCH_WIDTH = isMobile ? 280 : 320
  const tabsMeasureRef = useRef<HTMLDivElement>(null)
  const [tabsWidth, setTabsWidth] = useState(FALLBACK_TABS_WIDTH)
  const [searchActive, setSearchActive] = useState(false)
  const [inputValue, setInputValue] = useState('')

  useEffect(() => {
    if (!searchActive) {
      setInputValue('')
    }
  }, [searchActive])

  useLayoutEffect(() => {
    const el = tabsMeasureRef.current
    if (!el) return
    const measure = () => setTabsWidth(Math.ceil(el.getBoundingClientRect().width))
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const { open, setOpen, isLoading, searchResults, handleSearch, handleSelect, resetSearch } = useSearchLocation()

  return (
    <nav
      aria-label="Navegación principal"
      className={cn(
        'relative inline-flex items-end rounded-full transition-colors duration-200',
        searchActive && 'border border-border-weak bg-background/90 backdrop-blur-sm has-[input:focus-visible]:ring-[3px] has-[input:focus-visible]:ring-ring/50'
      )}
    >
      <div ref={tabsMeasureRef} aria-hidden inert className="absolute invisible pointer-events-none">
        <Shelf setSearchActive={() => {}} pathname={pathname} />
      </div>
      <SlidingPanels activeIndex={searchActive ? 1 : 0} widths={[tabsWidth, SEARCH_WIDTH]}>
          <Shelf setSearchActive={setSearchActive} pathname={pathname} />
          <SearchInput
            panelWidth={SEARCH_WIDTH}
            inputValue={inputValue}
            onInputChange={setInputValue}
            isOpen={open}
            onOpenChange={setOpen}
            isLoading={isLoading}
            searchResults={searchResults}
            onSearch={handleSearch}
            onSelectResult={handleSelect}
            onClear={resetSearch}
            onClose={() => setSearchActive(false)}
            autoFocus={searchActive}
          />
      </SlidingPanels>
    </nav>
  )
}
