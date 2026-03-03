'use client'

import { Fragment, useMemo, useState } from 'react'
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
  const isUpdating = pathname.includes('add')
  const currentView = pathname === '/list' ? 'list' : 'map'
  const isListView = currentView === 'list'
  const [searchActive, setSearchActive] = useState(false)

  const { filteredData, clearFilters, setFilter, filters, activeAreaLabel, clearActiveArea } = useSpatialContext()
  const { categories, kinds } = useHeritageTaxonomy()
  const { searchQuery, setSearchQuery, open, setOpen, isLoading, searchResults, handleSearch, handleSelect, resetSearch } = useSearchLocation(onSearch)

  const activeCategory = (filters.category || [])[0] || null
  const activeKind = (filters.kind || [])[0] || null
  const activeCity = (filters.city_region || [])[0] || null

  const categoryOptions = useMemo<FilterOption[]>(() => {
    return categories.map(cat => ({
      value: cat.slug,
      label: cat.name
    }))
  }, [categories])

  const kindOptions = useMemo<FilterOption[]>(() => {
    return kinds.map(kind => ({
      value: kind.slug,
      label: kind.name
    }))
  }, [kinds])

  const cityOptions = useMemo<FilterOption[]>(() => {
    const cities = new Set<string>()
    filteredData.forEach(site => {
      if (site.city_region) cities.add(site.city_region)
    })
    return Array.from(cities).sort().map(city => ({
      value: city,
      label: city
    }))
  }, [filteredData])

  const hasActiveFilters = activeCategory || activeKind || activeCity

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleSearch(e.target.value)
  }

  if (isUpdating) return null

  const hasBanner = !!activeAreaLabel

  return (
    <nav className="rounded-full p-1 bg-background border border-border-weak shadow-xs inline-flex items-center gap-1 transition-all duration-200 will-change-[width]">
      {/* Active Area Banner - replaces content */}
      <div
        className={cn(
          "flex items-center gap-1 px-1 transition-all duration-150",
          hasBanner ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none w-0"
        )}
      >
        <span className="text-sm text-muted-foreground">Área activa:</span>
        <span className="text-sm font-medium text-text-strong">{activeAreaLabel}</span>
        <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground" onClick={clearActiveArea}>
          <X className="h-3 w-3" />
        </Button>
      </div>

      {/* Main Navigation Content */}
      <div
        className={cn(
          "flex items-center gap-1 transition-all duration-150",
          hasBanner ? "opacity-0 scale-95 pointer-events-none w-0" : "opacity-100 scale-100"
        )}
      >
        {isListView && !searchActive && (
          <Button variant="ghost" size="icon" onClick={() => { router.push('/map'); setSearchActive(false) }} className="!h-[30px] !w-[30px] rounded-full text-muted-foreground hover:bg-black/7">
            <ChevronLeft />
          </Button>
        )}

        {!isListView && !searchActive && (
          <Tabs value={currentView} onValueChange={(value) => { router.push(value === 'list' ? '/list' : '/map'); setSearchActive(false) }}>
            <TabsList className="!shadow-none !border-0 bg-transparent !gap-1 !p-0">
              <TabsTrigger value="map" className="hover:bg-black/7 data-[state=active]:text-background data-[state=active]:bg-black px-2.5 rounded-full">Mapa</TabsTrigger>
              <TabsTrigger value="list" className="hover:bg-black/7 data-[state=active]:text-background data-[state=active]:bg-black px-2.5 rounded-full">Lista</TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        {isListView && !searchActive && (
          <Fragment>
            <FilterChip defaultLabel="Categoría" options={categoryOptions} value={activeCategory} onSelect={v => setFilter('category', v ? [v] : [])} />
            <FilterChip defaultLabel="Tipo" options={kindOptions} value={activeKind} onSelect={v => setFilter('kind', v ? [v] : [])} />
            <FilterChip defaultLabel="Ciudad" options={cityOptions} value={activeCity} onSelect={v => setFilter('city_region', v ? [v] : [])} />
            <div className="flex-1" />
            {hasActiveFilters && <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1.5"><X />Limpiar</Button>}
          </Fragment>
        )}

        {!isListView && (
          <Fragment>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchActive(true)}
              className={cn(
                "!h-[30px] !w-[30px] rounded-full transition-all duration-200",
                searchActive ? "opacity-0 scale-90 pointer-events-none" : "opacity-100 scale-100"
              )}
            >
              <SearchIcon />
            </Button>

            <input
              autoFocus={searchActive}
              type="text"
              className={cn(
                "h-[30px] px-3 focus:outline-none overflow-hidden",
                "transition-[max-width,opacity] duration-200 ease-out",
                searchActive ? "max-w-[220px] opacity-100" : "max-w-0 opacity-0"
              )}
              placeholder="Buscar..."
              value={searchQuery}
              onChange={handleSearchInput}
              disabled={isLoading}
              onFocus={() => { if (searchQuery.length >= 3) setOpen(true) }}
            />

            {searchActive && (
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <div />
                </PopoverTrigger>
                <PopoverContent className="border border-border-weak w-[264px] -ml-1 max-h-60 p-0" align="start" sideOffset={8}>
                  {searchResults.length === 0 ? (
                    <div className="p-4 text-sm text-center text-muted-foreground">
                      {isLoading ? 'Buscando...' : 'Sin resultados'}
                    </div>
                  ) : (
                    <ScrollArea className="max-h-60 p-1">
                      <div className="space-y-1">
                        {searchResults.map((result) => {
                          let geometryType: 'point' | 'line' | 'polygon' = 'point'
                          if (result.geometry?.type === 'Polygon' || result.geometry?.type === 'MultiPolygon') geometryType = 'polygon'
                          else if (result.geometry?.type === 'LineString' || result.geometry?.type === 'MultiLineString') geometryType = 'line'
                          else if (result.bbox) geometryType = 'polygon'

                          const layer: Layer = {
                            id: result.id,
                            label: formatPlaceName(result.title || result.text || result.place_name),
                            type: 'data',
                            geometry: geometryType,
                            color: result.type === 'local' ? COLORS.animitas : COLORS.searchElements,
                            visible: true,
                            opacity: 100,
                            source: 'search',
                          }
                          return <LayerItem key={result.id} layer={layer} isSearchResult={true} onClick={() => handleSelect(result)} onToggleVisibility={(e) => { e.stopPropagation() }} />
                        })}
                      </div>
                    </ScrollArea>
                  )}
                </PopoverContent>
              </Popover>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={() => { setSearchActive(false); resetSearch() }}
              disabled={isLoading}
              className={cn(
                "!h-[30px] !w-[30px] rounded-full transition-all duration-200",
                searchActive ? "opacity-100 scale-100" : "opacity-0 scale-90 pointer-events-none"
              )}
            >
              {isLoading ? <div className="animate-spin"><X size={20} /></div> : <X />}
            </Button>
          </Fragment>
        )}
      </div>
    </nav>
  )
}
