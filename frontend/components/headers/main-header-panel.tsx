'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { useIsMobile } from '@/hooks/use-mobile'
import { usePathname, useRouter } from 'next/navigation'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useSpatialContext } from '@/contexts/spatial-context'
import { useHeritageTaxonomy } from '@/hooks/use-heritage-taxonomy'
import { useSearchLocation } from '@/hooks/use-search-location'
import { FilterChip, type FilterOption } from '@/components/ui/filter-chip'
import { Button } from '@/components/ui/button'
import { X, Search as SearchIcon, ChevronLeft, Plus, MapIcon, ListIcon } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from '@/components/ui/scroll-area'
import { LayerItem } from '@/components/map/layers/layer-item'
import { Layer } from '@/components/map/types'
import { COLORS } from '@/lib/map-style'
import { formatPlaceName } from '@/lib/format-place'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { Separator } from '@/components/ui/separator'
import { SlidingPanels } from '@/components/ui/sliding-panels'

interface MainHeaderPanelProps {
  onSearch?: (query: string) => void
}

const TABS_WIDTH = 253

function TabsPanelContent({ onSearch, setSearchActive, onTabChange, pathname }: { onSearch?: (query: string) => void; setSearchActive: (active: boolean) => void; onTabChange: (route: string) => void; pathname: string }) {
  const tabValue = pathname.includes('/list') ? 'list' : 'map'
  return (
    <div
      className="box-border flex items-center gap-1 flex-shrink-0 w-full"
    >
      <Tabs value={tabValue} onValueChange={(v) => { onTabChange(v === 'list' ? '/list' : '/map'); setSearchActive(false) }}>
        <TabsList className="!shadow-none !border-0 bg-transparent !gap-1 !p-0">
          <TabsTrigger
            value="map"
            className="hover:bg-black/7 data-[state=active]:text-background data-[state=active]:bg-black px-2.5 rounded-full"
          >
            <MapIcon className="md:hidden" />
            <span className="hidden md:block">Mapa</span>
          </TabsTrigger>
          <TabsTrigger
            value="list"
            className="hover:bg-black/7 data-[state=active]:text-background data-[state=active]:bg-black px-2.5 rounded-full"
          >
            <ListIcon className="md:hidden" />
            <span className="hidden md:block">Lista</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <Separator orientation="vertical" className='!h-6 mx-1' />

      <Button size="sm" className="h-[30px] !pl-2 gap-1 !rounded-full" asChild>
        <Link href="/add">
          <Plus />
          Añadir
        </Link>
      </Button>

      <Button
        size="icon"
        variant="ghost"
        onClick={() => setSearchActive(true)}
        className="!h-[30px] !w-[30px] rounded-full text-muted-foreground"
      >
        <SearchIcon size={20} />
      </Button>
    </div>
  )
}

function BannerContent({ activeAreaLabel, clearActiveArea }: { activeAreaLabel: string; clearActiveArea: () => void }) {
  return (
    <div className="pl-3 pr-0 w-full flex gap-1 items-center justify-center">
      <span className="text-sm text-white/50 text-nowrap">Área activa:</span>
      <span className="text-sm font-medium text-white truncate">{activeAreaLabel}</span>
      <Button variant="ghost" size="icon" className="ml-auto h-[30px] w-[30px] text-white/50 hover:bg-white/10 rounded-full hover:text-white/70" onClick={clearActiveArea}>
        <X className="h-3 w-3" />
      </Button>
    </div>
  )
}

interface ListViewContentProps {
  categoryOptions: FilterOption[]
  kindOptions: FilterOption[]
  cityOptions: FilterOption[]
  activeCategories: string[]
  activeKinds: string[]
  activeCities: string[]
  setFilter: (key: string, value: string[]) => void
  clearFilters: () => void
  setSearchActive: (active: boolean) => void
  onBackClick: () => void
}

function ListViewContent({
  categoryOptions,
  kindOptions,
  cityOptions,
  activeCategories,
  activeKinds,
  activeCities,
  setFilter,
  clearFilters,
  setSearchActive,
  onBackClick
}: ListViewContentProps) {
  return (
    <>
      <Button variant="ghost" size="icon" onClick={onBackClick} className="!h-[30px] !w-[30px] rounded-full text-muted-foreground">
        <ChevronLeft />
      </Button>
      <FilterChip defaultLabel="Categoría" options={categoryOptions} value={activeCategories} onSelect={v => setFilter('category', v)} />
      <FilterChip defaultLabel="Tipo" options={kindOptions} value={activeKinds} onSelect={v => setFilter('kind', v)} />
      <FilterChip defaultLabel="Ciudad" options={cityOptions} value={activeCities} onSelect={v => setFilter('city_region', v)} />
      <div className="flex-1" />
      <Button variant="ghost" size="icon" onClick={clearFilters} className="-ml-0.5 !h-[30px] !w-[30px] rounded-full text-muted-foreground"><X size={20} /></Button>
    </>
  )
}

interface SearchResult {
  id: string | number
  title: string
  place_name: string
  text: string
  type: 'local' | 'mapbox'
  geometry?: any
  bbox?: number[]
  center?: number[]
  properties?: any
}

interface SearchPanelContentProps {
  panelWidth: number
  inputRef: React.RefObject<HTMLInputElement>
  inputValue: string
  setInputValue: (value: string) => void
  open: boolean
  setOpen: (open: boolean) => void
  isLoading: boolean
  searchResults: SearchResult[]
  handleSearch: (query: string) => void
  handleSelect: (result: SearchResult) => void
  resetSearch: () => void
  setSearchActive: (active: boolean) => void
}

function SearchPanelContent({
  panelWidth,
  inputRef,
  inputValue,
  setInputValue,
  open,
  setOpen,
  isLoading,
  searchResults,
  handleSearch,
  handleSelect,
  resetSearch,
  setSearchActive
}: SearchPanelContentProps) {
  return (
    <div
      className="box-border pl-2 pr-2.5 flex items-center gap-1 flex-shrink-0 w-full"
    >
      <SearchIcon className="w-4 h-4 text-muted-foreground pointer-events-none flex-shrink-0" />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <input
            ref={inputRef}
            type="text"
            className="flex-1 h-[30px] px-1 focus:outline-none bg-transparent text-sm text-foreground placeholder-muted-foreground"
            placeholder="Buscar..."
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value)
              handleSearch(e.target.value)
            }}
            disabled={isLoading}
            onFocus={() => {
              if (inputValue.length >= 3) setOpen(true)
            }}
          />
        </PopoverTrigger>
        <PopoverContent className="border border-border-weak max-h-60 p-0 z-50" style={{ width: `${panelWidth}px` }} align="center" sideOffset={8}>
          {searchResults.length === 0 ? (
            <div className="p-4 text-sm text-center text-muted-foreground">{isLoading ? 'Buscando...' : 'Sin resultados'}</div>
          ) : (
            <ScrollArea className="max-h-60 p-1">
              <div className="space-y-1 [&_*]:text-ellipsis [&_*]:whitespace-nowrap">
                {searchResults.map((result) => {
                  let geometryType: 'point' | 'line' | 'polygon' = 'point'
                  if (result.geometry?.type === 'Polygon' || result.geometry?.type === 'MultiPolygon') geometryType = 'polygon'
                  else if (result.geometry?.type === 'LineString' || result.geometry?.type === 'MultiLineString') geometryType = 'line'
                  else if (result.bbox) geometryType = 'polygon'

                  const layer: Layer = {
                    id: String(result.id),
                    label: result.title || result.text || result.place_name,
                    type: 'data',
                    geometry: geometryType,
                    color: result.type === 'local' ? COLORS.animitas : COLORS.searchElements,
                    visible: true,
                    opacity: 100,
                    source: 'search',
                  }
                  return <LayerItem key={result.id} layer={layer} isSearchResult={true} onClick={() => handleSelect(result)} onToggleVisibility={(e) => e.stopPropagation()} />
                })}
              </div>
            </ScrollArea>
          )}
        </PopoverContent>
      </Popover>
      <Button variant="ghost" size="icon" onClick={() => {
        setSearchActive(false)
        setInputValue('')
        resetSearch()
      }} disabled={isLoading} className="!h-[30px] !w-[30px] rounded-full text-muted-foreground flex-shrink-0">
        {isLoading ? <div className="animate-spin"><X size={20} /></div> : <X size={20} />}
      </Button>
    </div>
  )
}

export function MainHeaderPanel({ onSearch }: MainHeaderPanelProps) {
  const pathname = usePathname()
  const router = useRouter()
  const isMobile = useIsMobile()
  const SEARCH_WIDTH = isMobile ? 256 : 320
  const [searchActive, setSearchActive] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

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
    if (searchActive) {
      requestAnimationFrame(() => {
        inputRef.current?.focus()
      })
    } else {
      setInputValue('')
    }
  }, [searchActive])

  const isListView = pathname === '/list'
  const { filteredData, clearFilters, setFilter, filters, activeAreaLabel, clearActiveArea } = useSpatialContext()
  const { categories, kinds } = useHeritageTaxonomy()
  const { searchQuery, open, setOpen, isLoading, searchResults, handleSearch, handleSelect, resetSearch } = useSearchLocation(onSearch)

  const activeCategories = filters.category || []
  const activeKinds = filters.kind || []
  const activeCities = filters.city_region || []

  const categoryOptions = useMemo<FilterOption[]>(() =>
    categories.map(cat => ({ value: cat.slug, label: cat.name })),
    [categories]
  )
  const kindOptions = useMemo<FilterOption[]>(() => {
    if (activeCategories.length === 0) return kinds.map(k => ({ value: k.slug, label: k.name }))
    const activeCategoryIds = new Set(categories.filter(c => activeCategories.includes(c.slug)).map(c => c.id))
    return kinds.filter(k => activeCategoryIds.has(k.category_id)).map(k => ({ value: k.slug, label: k.name }))
  }, [kinds, categories, activeCategories])
  const cityOptions = useMemo<FilterOption[]>(() => {
    const cities = new Set(filteredData.map((s: any) => s.city_region).filter(Boolean))
    return Array.from(cities).sort().map(city => ({ value: city, label: city }))
  }, [filteredData])

  const hasBanner = !!activeAreaLabel
  const hasFilters = activeCategories.length > 0 || activeKinds.length > 0 || activeCities.length > 0


  return (
    <nav
      className={`rounded-full py-1 backdrop-blur-sm border inline-flex items-center gap-1 animate-in fade-in p-1 transition-all duration-300 ease-out-expo ${
        hasBanner ? 'bg-black border-black' : 'bg-background/50 border-border-weak'
      }`}
      style={{
        width: hasBanner ? TABS_WIDTH : (isListView ? 'auto' : (searchActive ? SEARCH_WIDTH : TABS_WIDTH))
      }}
    >
      {hasBanner && <BannerContent activeAreaLabel={activeAreaLabel} clearActiveArea={clearActiveArea} />}
      {isListView && (
        <ListViewContent
          categoryOptions={categoryOptions}
          kindOptions={kindOptions}
          cityOptions={cityOptions}
          activeCategories={activeCategories}
          activeKinds={activeKinds}
          activeCities={activeCities}
          setFilter={setFilter}
          clearFilters={clearFilters}
          setSearchActive={setSearchActive}
          onBackClick={handleBackClick}
        />
      )}
      {!hasBanner && !isListView && (
        <SlidingPanels activeIndex={searchActive ? 1 : 0} widths={[TABS_WIDTH, SEARCH_WIDTH]}>
          <TabsPanelContent onSearch={onSearch} setSearchActive={setSearchActive} onTabChange={handleTabChange} pathname={pathname} />
          <SearchPanelContent
            panelWidth={SEARCH_WIDTH}
            inputRef={inputRef}
            inputValue={inputValue}
            setInputValue={setInputValue}
            open={open}
            setOpen={setOpen}
            isLoading={isLoading}
            searchResults={searchResults}
            handleSearch={handleSearch}
            handleSelect={handleSelect}
            resetSearch={resetSearch}
            setSearchActive={setSearchActive}
          />
        </SlidingPanels>
      )}
    </nav>
  )
}
