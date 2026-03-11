'use client'

import { useRef, useEffect } from 'react'
import { Search as SearchIcon, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { LayerItem } from '@/components/map/layers/layer-item'
import { Layer } from '@/components/map/types'
import { COLORS } from '@/lib/map-style'
import { cn } from '@/lib/utils'
import clsx from 'clsx'

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

interface SearchInputProps {
  panelWidth: number
  inputValue: string
  onInputChange: (value: string) => void
  isLoading: boolean
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  searchResults: SearchResult[]
  onSearch: (query: string) => void
  onSelectResult: (result: SearchResult) => void
  onClear: () => void
  onClose?: () => void
  placeholder?: string
  searchType?: 'regular' | 'ai'
}

export function SearchInput({
  panelWidth,
  inputValue,
  onInputChange,
  isLoading,
  isOpen,
  onOpenChange,
  searchResults,
  onSearch,
  onSelectResult,
  onClear,
  onClose,
  placeholder = 'Buscar...',
  searchType = 'regular',
}: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => {
        inputRef.current?.focus()
      })
    }
  }, [isOpen])

  const handleClear = () => {
    if (inputValue.length === 0) {
      onClose?.()
    } else {
      onInputChange('')
      onClear()
    }
  }

  const handleSelectResult = (result: SearchResult) => {
    onSelectResult(result)
    onOpenChange(false)
  }

  const createLayer = (result: SearchResult): Layer => {
    let geometryType: 'point' | 'line' | 'polygon' = 'point'
    if (result.geometry?.type === 'Polygon' || result.geometry?.type === 'MultiPolygon') {
      geometryType = 'polygon'
    } else if (result.geometry?.type === 'LineString' || result.geometry?.type === 'MultiLineString') {
      geometryType = 'line'
    } else if (result.bbox) {
      geometryType = 'polygon'
    }

    return {
      id: String(result.id),
      label: result.title || result.text || result.place_name,
      type: 'data',
      geometry: geometryType,
      color: result.type === 'local' ? COLORS.animitas : COLORS.searchElements,
      visible: true,
      opacity: 100,
      source: 'search',
    }
  }

  return (
    <div className='box-border pl-2 pr-2.5 flex items-center gap-1 flex-shrink-0 w-full'>
      <SearchIcon className="w-4 h-4 text-muted-foreground pointer-events-none flex-shrink-0" />
      <Popover open={isOpen} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <input
            ref={inputRef}
            type="text"
            className={cn(
              'flex-1 h-[30px] px-1 focus:outline-none bg-transparent text-sm',
              'text-foreground placeholder-muted-foreground'
            )}
            placeholder={placeholder}
            value={inputValue}
            onChange={(e) => {
              onInputChange(e.target.value)
              onSearch(e.target.value)
            }}
            disabled={isLoading}
            onFocus={() => {
              if (inputValue.length >= 3) onOpenChange(true)
            }}
          />
        </PopoverTrigger>
        <PopoverContent
          className="border border-border-weak max-h-60 p-0 z-50"
          style={{ width: `${panelWidth}px` }}
          align="center"
          sideOffset={8}
        >
          {searchResults.length === 0 ? (
            <div className="p-4 text-sm text-center text-muted-foreground">
              {isLoading ? 'Buscando...' : 'Sin resultados'}
            </div>
          ) : (
            <ScrollArea className="max-h-60 p-1">
              <div className="space-y-1 [&_*]:text-ellipsis [&_*]:whitespace-nowrap">
                {searchResults.map((result) => (
                  <LayerItem
                    key={result.id}
                    layer={createLayer(result)}
                    isSearchResult={true}
                    onClick={() => handleSelectResult(result)}
                    onToggleVisibility={(e) => e.stopPropagation()}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </PopoverContent>
      </Popover>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleClear}
        disabled={isLoading}
        className={cn(
          '!h-[30px] !w-[30px] rounded-full text-muted-foreground flex-shrink-0',
          clsx({
            'animate-spin': isLoading,
          })
        )}
      >
        <X size={20} />
      </Button>
    </div>
  )
}
