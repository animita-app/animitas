'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useSpatialContext } from '@/contexts/spatial-context'
import { useHeritageTaxonomy } from '@/hooks/use-heritage-taxonomy'
import { useSearchLocation } from '@/hooks/use-search-location'
import { FilterChip, type FilterOption } from '@/components/ui/filter-chip'
import { Button } from '@/components/ui/button'
import { X, Search as SearchIcon, ChevronLeft } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from '@/components/ui/scroll-area'
import { LayerItem } from '@/components/map/layers/layer-item'
import { Layer } from '@/components/map/types'
import { COLORS } from '@/lib/map-style'
import { formatPlaceName } from '@/lib/format-place'
import { cn } from '@/lib/utils'

interface MainHeaderPanelProps {
  onSearch?: (query: string) => void
}

export function MainHeaderPanel({ onSearch }: MainHeaderPanelProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [searchActive, setSearchActive] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (searchActive) {
      requestAnimationFrame(() => {
        inputRef.current?.focus()
      })
    } else {
      setInputValue('')
    }
  }, [searchActive])

  if (pathname.includes('add')) return null

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
  const kindOptions = useMemo<FilterOption[]>(() =>
    kinds.map(kind => ({ value: kind.slug, label: kind.name })),
    [kinds]
  )
  const cityOptions = useMemo<FilterOption[]>(() => {
    const cities = new Set(filteredData.map((s: any) => s.city_region).filter(Boolean))
    return Array.from(cities).sort().map(city => ({ value: city, label: city }))
  }, [filteredData])

  const hasBanner = !!activeAreaLabel
  const hasFilters = activeCategories.length > 0 || activeKinds.length > 0 || activeCities.length > 0

  if (hasBanner) {
    return (
      <nav className="rounded-full p-1 bg-background/50 backdrop-blur-sm border-0 inline-flex items-center gap-1 animate-in fade-in duration-200">
        <span className="text-sm text-muted-foreground px-1">Área activa:</span>
        <span className="text-sm font-medium text-text-strong">{activeAreaLabel}</span>
        <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground" onClick={clearActiveArea}>
          <X className="h-3 w-3" />
        </Button>
      </nav>
    )
  }

  if (isListView) {
    return (
      <nav className="rounded-full p-1 bg-background/50 backdrop-blur-sm border-0 inline-flex items-center gap-1 animate-in fade-in duration-200">
        <Button variant="ghost" size="icon" onClick={() => { router.push('/map'); setSearchActive(false) }} className="!h-[30px] !w-[30px] rounded-full text-muted-foreground">
          <ChevronLeft />
        </Button>
        <FilterChip defaultLabel="Categoría" options={categoryOptions} value={activeCategories} onSelect={v => setFilter('category', v)} />
        <FilterChip defaultLabel="Tipo" options={kindOptions} value={activeKinds} onSelect={v => setFilter('kind', v)} />
        <FilterChip defaultLabel="Ciudad" options={cityOptions} value={activeCities} onSelect={v => setFilter('city_region', v)} />
        <div className="flex-1" />
        <Button variant="ghost" size="icon" onClick={clearFilters} className="-ml-0.5 !h-[30px] !w-[30px] rounded-full text-muted-foreground"><X size={20} /></Button>
      </nav>
    )
  }

  // Map view
  return (
    <nav className={cn(
      "rounded-full p-1 bg-background/50 backdrop-blur-sm inline-flex items-center gap-1 border animate-in fade-in duration-200",
      searchActive ? "border-border-weak shadow-xs" : "border-transparent shadow-none"
    )}>
      {!searchActive && (
        <div className="flex items-center gap-1 animate-in fade-in duration-200">
          <Tabs value="map" onValueChange={(v) => { router.push(v === 'list' ? '/list' : '/map'); setSearchActive(false) }}>
            <TabsList className="!shadow-none !border-0 bg-transparent !gap-1 !p-0">
              <TabsTrigger value="map" className="hover:bg-black/7 data-[state=active]:text-background data-[state=active]:bg-black px-2.5 rounded-full">Mapa</TabsTrigger>
              <TabsTrigger value="list" className="hover:bg-black/7 data-[state=active]:text-background data-[state=active]:bg-black px-2.5 rounded-full">Lista</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSearchActive(true)}
            className="!h-[30px] !w-[30px] rounded-full text-muted-foreground"
          >
            <SearchIcon size={20} />
          </Button>
        </div>
      )}

      {searchActive && (
        <div className="flex items-center gap-1 flex-1 animate-in fade-in duration-200">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <input
                ref={inputRef}
                type="text"
                className="w-64 h-[30px] px-3 focus:outline-none bg-transparent text-sm"
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
            <PopoverContent className="w-[280px] border border-border-weak max-h-60 p-0 z-50" align="start" sideOffset={8}>
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
                        id: result.id,
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
          }} disabled={isLoading} className="!h-[30px] !w-[30px] rounded-full text-muted-foreground">
            {isLoading ? <div className="animate-spin"><X size={20} /></div> : <X size={20} />}
          </Button>
        </div>
      )}
    </nav>
  )
}
