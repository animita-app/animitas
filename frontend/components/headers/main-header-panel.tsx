'use client'

import { useState, useEffect, useLayoutEffect, useRef } from 'react'
import { useIsMobile } from '@/hooks/use-mobile'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { useAnimitas } from '@/contexts/animitas-context'
import { useSearchLocation } from '@/hooks/use-search-location'
import { FilterChip } from '@/components/ui/filter-chip'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Search as SearchIcon } from 'lucide-react'
import { SearchInput } from '@/components/search/search-input'
import Link from 'next/link'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { SlidingPanels } from '@/components/ui/sliding-panels'

const FALLBACK_TABS_WIDTH = 264

// Real objects cut out of the animitas' own photos stand on the bar like offerings on a shelf.
const SHELF = [
  { href: '/map', src: '/cutouts/street-sign.png', label: 'Mapa' },
  { href: '/list', src: '/cutouts/shrine.png', label: 'Lista' },
  { href: '/add', src: '/cutouts/flag.png', label: 'Agregar' },
]

function ShelfItem({ href, src, label, active, onNavigate }: { href: string; src: string; label: string; active: boolean; onNavigate: () => void }) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className="group flex w-16 flex-col items-center gap-1 rounded-lg pb-1 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      <Image
        src={src}
        alt=""
        width={96}
        height={96}
        className={cn(
          '-mt-6 h-12 w-auto object-contain drop-shadow-[0_3px_3px_rgb(28_24_20_/_0.35)] transition-[translate,filter] duration-200 ease-out group-hover:-translate-y-1 group-active:translate-y-0 motion-reduce:transition-none',
          active ? '-translate-y-1' : '[filter:grayscale(0.7)_sepia(0.2)_opacity(0.8)] group-hover:[filter:none]'
        )}
      />
      <span className={cn('text-xs', active ? 'font-medium text-text-strong' : 'text-text-weak')}>{label}</span>
    </Link>
  )
}

function TabsPanelContent({ setSearchActive, pathname }: { setSearchActive: (active: boolean) => void; pathname: string }) {
  return (
    <div className="flex items-end gap-1 w-max">
      {SHELF.map(item => (
        <ShelfItem
          key={item.href}
          {...item}
          active={pathname === item.href || (item.href === '/map' && pathname.startsWith('/animita'))}
          onNavigate={() => setSearchActive(false)}
        />
      ))}

      <Tooltip>
        <TooltipTrigger asChild>
          <Button size="icon-sm" variant="ghost" aria-label="Buscar" className="mb-3 text-muted-foreground" onClick={() => setSearchActive(true)}>
            <SearchIcon />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Buscar</TooltipContent>
      </Tooltip>
    </div>
  )
}

interface ListViewContentProps {
  comunas: string[]
  selected: string[]
  onSelect: (comunas: string[]) => void
  onBackClick: () => void
}

function ListViewContent({ comunas, selected, onSelect, onBackClick }: ListViewContentProps) {
  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label="Volver al mapa" onClick={onBackClick} className="rounded-full text-muted-foreground">
            <ArrowLeft />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Volver al mapa</TooltipContent>
      </Tooltip>
      <FilterChip defaultLabel="Comuna" options={comunas.map(c => ({ value: c, label: c }))} value={selected} onSelect={onSelect} />
      {selected.length > 0 && (
        <Button variant="ghost" size="sm" onClick={() => onSelect([])} className="rounded-full text-muted-foreground">
          Limpiar
        </Button>
      )}
    </>
  )
}


export function MainHeaderPanel() {
  const pathname = usePathname()
  const router = useRouter()
  const isMobile = useIsMobile()
  const SEARCH_WIDTH = isMobile ? 280 : 320
  const tabsMeasureRef = useRef<HTMLDivElement>(null)
  const [tabsWidth, setTabsWidth] = useState(FALLBACK_TABS_WIDTH)
  const [searchActive, setSearchActive] = useState(false)
  const [inputValue, setInputValue] = useState('')

  const handleBackClick = () => {
    if ('startViewTransition' in document) {
      (document as any).startViewTransition(() => {
        router.push('/map')
        setSearchActive(false)
      })
    } else {
      router.push('/map')
      setSearchActive(false)
    }
  }

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

  const isListView = pathname === '/list'
  const { comunas, selectedComunas, setSelectedComunas } = useAnimitas()
  const { open, setOpen, isLoading, searchResults, handleSearch, handleSelect, resetSearch } = useSearchLocation()

  return (
    <nav
      aria-label="Navegación principal"
      className="relative inline-flex items-end gap-1 rounded-xl border border-border-weak bg-background/85 px-1.5 pt-1 backdrop-blur-sm shadow-[0_1px_0_rgb(255_255_255_/_0.6)_inset,0_8px_24px_-12px_rgb(28_24_20_/_0.35)] has-[input:focus-visible]:ring-[3px] has-[input:focus-visible]:ring-ring/50"
    >
      <div ref={tabsMeasureRef} aria-hidden inert className="absolute invisible pointer-events-none">
        <TabsPanelContent setSearchActive={() => {}} pathname={pathname} />
      </div>
      {isListView && (
        <ListViewContent
          comunas={comunas}
          selected={selectedComunas}
          onSelect={setSelectedComunas}
          onBackClick={handleBackClick}
        />
      )}
      {!isListView && (
        <SlidingPanels activeIndex={searchActive ? 1 : 0} widths={[tabsWidth, SEARCH_WIDTH]}>
          <TabsPanelContent setSearchActive={setSearchActive} pathname={pathname} />
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
      )}
    </nav>
  )
}
