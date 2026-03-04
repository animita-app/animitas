'use client'

import { useState, useMemo } from 'react'
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

  if (pathname.includes('add')) return null

  const isListView = pathname === '/list'
  const { filteredData, clearFilters, setFilter, filters, activeAreaLabel, clearActiveArea } = useSpatialContext()
  const { categories, kinds } = useHeritageTaxonomy()
  const { searchQuery, open, setOpen, isLoading, searchResults, handleSearch, handleSelect, resetSearch } = useSearchLocation(onSearch)

  const activeCategory = filters.category?.[0] || null
  const activeKind = filters.kind?.[0] || null
  const activeCity = filters.city_region?.[0] || null

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
  const hasFilters = activeCategory || activeKind || activeCity

  if (hasBanner) {
    return (
      <nav className="rounded-full p-1 bg-background border border-border-weak shadow-xs inline-flex items-center gap-1 transition-all duration-200">
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
      <nav className="rounded-full p-1 bg-background border border-border-weak shadow-xs inline-flex items-center gap-1 transition-all duration-200">
        <Button variant="ghost" size="icon" onClick={() => { router.push('/map'); setSearchActive(false) }} className="!h-[30px] !w-[30px] rounded-full text-muted-foreground">
          <ChevronLeft />
        </Button>
        <FilterChip defaultLabel="Categoría" options={categoryOptions} value={activeCategory} onSelect={v => setFilter('category', v ? [v] : [])} />
        <FilterChip defaultLabel="Tipo" options={kindOptions} value={activeKind} onSelect={v => setFilter('kind', v ? [v] : [])} />
        <FilterChip defaultLabel="Ciudad" options={cityOptions} value={activeCity} onSelect={v => setFilter('city_region', v ? [v] : [])} />
        <div className="flex-1" />
        {hasFilters && <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1.5"><X />Limpiar</Button>}
      </nav>
    )
  }

  // Map view
  return (
    <nav className="rounded-full p-1 bg-background border border-border-weak shadow-xs inline-flex items-center gap-1 transition-all duration-200 will-change-[width]">
      <div className={cn("transition-opacity duration-200", searchActive ? "opacity-0 pointer-events-none" : "opacity-100")}>
        <Tabs value="map" onValueChange={(v) => { router.push(v === 'list' ? '/list' : '/map'); setSearchActive(false) }}>
          <TabsList className="!shadow-none !border-0 bg-transparent !gap-1 !p-0">
            <TabsTrigger value="map" className="hover:bg-black/7 data-[state=active]:text-background data-[state=active]:bg-black px-2.5 rounded-full">Mapa</TabsTrigger>
            <TabsTrigger value="list" className="hover:bg-black/7 data-[state=active]:text-background data-[state=active]:bg-black px-2.5 rounded-full">Lista</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <input
        autoFocus={searchActive}
        type="text"
        className={cn("h-[30px] px-3 focus:outline-none bg-transparent text-sm transition-opacity duration-200 flex-1", searchActive ? "opacity-100" : "opacity-0 pointer-events-none")}
        placeholder="Buscar..."
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        disabled={isLoading}
        onFocus={() => { if (searchQuery.length >= 3) setOpen(true) }}
      />

      {searchActive && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild><div /></PopoverTrigger>
          <PopoverContent className="border border-border-weak w-[264px] -ml-1 max-h-60 p-0" align="start" sideOffset={8}>
            {searchResults.length === 0 ? (
              <div className="p-4 text-sm text-center text-muted-foreground">{isLoading ? 'Buscando...' : 'Sin resultados'}</div>
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
                    return <LayerItem key={result.id} layer={layer} isSearchResult={true} onClick={() => handleSelect(result)} onToggleVisibility={(e) => e.stopPropagation()} />
                  })}
                </div>
              </ScrollArea>
            )}
          </PopoverContent>
        </Popover>
      )}

      <Button variant="ghost" size="icon" onClick={() => setSearchActive(!searchActive)} className="!h-[30px] !w-[30px] rounded-full text-muted-foreground">
        {searchActive ? <X size={20} /> : <SearchIcon size={20} />}
      </Button>
    </nav>
  )
}
