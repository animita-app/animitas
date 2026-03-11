'use client'

import { useState, useMemo, useEffect } from 'react'
import { useIsMobile } from '@/hooks/use-mobile'
import { usePathname, useRouter } from 'next/navigation'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useSpatialContext } from '@/contexts/spatial-context'
import { useHeritageTaxonomy } from '@/hooks/use-heritage-taxonomy'
import { useSearchLocation } from '@/hooks/use-search-location'
import { FilterChip, type FilterOption } from '@/components/ui/filter-chip'
import { Button } from '@/components/ui/button'
import { X, ChevronLeft, Plus, MapIcon, ListIcon, Search as SearchIcon } from 'lucide-react'
import { SearchInput } from '@/components/search/search-input'
import Link from 'next/link'
import { Separator } from '@/components/ui/separator'
import { SlidingPanels } from '@/components/ui/sliding-panels'

interface MainHeaderPanelProps {}

const TABS_WIDTH = 253

function TabsPanelContent({ setSearchActive, onTabChange, pathname }: { setSearchActive: (active: boolean) => void; onTabChange: (route: string) => void; pathname: string }) {
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


export function MainHeaderPanel({}: MainHeaderPanelProps) {
  const pathname = usePathname()
  const router = useRouter()
  const isMobile = useIsMobile()
  const SEARCH_WIDTH = isMobile ? 256 : 320
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

  const isListView = pathname === '/list'
  const { filteredData, clearFilters, setFilter, filters, activeAreaLabel, clearActiveArea } = useSpatialContext()
  const { categories, kinds } = useHeritageTaxonomy()
  const { open, setOpen, isLoading, searchResults, handleSearch, handleSelect, resetSearch } = useSearchLocation()

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
          />
        </SlidingPanels>
      )}
    </nav>
  )
}
