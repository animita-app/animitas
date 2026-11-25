'use client'

import { useState, useEffect, useLayoutEffect, useRef } from 'react'
import { useIsMobile } from '@/hooks/use-mobile'
import { usePathname, useRouter } from 'next/navigation'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAnimitas } from '@/contexts/animitas-context'
import { useSearchLocation } from '@/hooks/use-search-location'
import { FilterChip } from '@/components/ui/filter-chip'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Plus, Search as SearchIcon } from 'lucide-react'
import { SearchInput } from '@/components/search/search-input'
import Link from 'next/link'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { SlidingPanels } from '@/components/ui/sliding-panels'

const FALLBACK_TABS_WIDTH = 264

function TabsPanelContent({ setSearchActive, onTabChange, pathname }: { setSearchActive: (active: boolean) => void; onTabChange: (route: string) => void; pathname: string }) {
  const tabValue = pathname.includes('/list') ? 'list' : 'map'
  return (
    <div className="flex items-center gap-1 w-max">
      <Tabs value={tabValue} onValueChange={(v) => { onTabChange(v === 'list' ? '/list' : '/map'); setSearchActive(false) }}>
        <TabsList className="!shadow-none !border-0 bg-transparent !gap-1 !p-0">
          <TabsTrigger value="map" className="h-8 px-3 hover:bg-background-weaker data-[state=active]:text-background data-[state=active]:bg-text-strong data-[state=active]:border-transparent rounded-full">
            Mapa
          </TabsTrigger>
          <TabsTrigger value="list" className="h-8 px-3 hover:bg-background-weaker data-[state=active]:text-background data-[state=active]:bg-text-strong data-[state=active]:border-transparent rounded-full">
            Lista
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <Button size="sm" className="rounded-full" asChild>
        <Link href="/add">
          <Plus />
          Agregar
        </Link>
      </Button>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button size="icon-sm" variant="ghost" aria-label="Buscar" className="rounded-full text-muted-foreground" onClick={() => setSearchActive(true)}>
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

  const handleTabChange = (route: string) => {
    if ('startViewTransition' in document) {
      (document as any).startViewTransition(() => {
        router.push(route)
      })
    } else {
      router.push(route)
    }
  }

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
      className="relative rounded-full backdrop-blur-sm border inline-flex items-center gap-1 p-1 bg-background/80 border-border-weak shadow-xs has-[input:focus-visible]:ring-[3px] has-[input:focus-visible]:ring-ring/50"
    >
      <div ref={tabsMeasureRef} aria-hidden inert className="absolute invisible pointer-events-none">
        <TabsPanelContent setSearchActive={() => {}} onTabChange={() => {}} pathname={pathname} />
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
          <TabsPanelContent setSearchActive={setSearchActive} onTabChange={handleTabChange} pathname={pathname} />
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
