'use client'

import { useRef, useEffect } from 'react'
import { Search as SearchIcon, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { SearchResultItem } from '@/components/search/search-result-item'
import { cn } from '@/lib/utils'

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
  autoFocus?: boolean
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
  placeholder = 'Busca una animita o un lugar',
  searchType = 'regular',
  autoFocus = false,
}: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus({ preventScroll: true })
  }, [autoFocus])

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

  return (
    <div className='pl-3 flex items-center gap-2 shrink-0 w-full'>
      <SearchIcon size={16} aria-hidden className="text-muted-foreground pointer-events-none shrink-0" />
      <Popover open={isOpen} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <input
            aria-label="Buscar"
            ref={inputRef}
            type="text"
            className={cn(
              'flex-1 h-8 px-1 outline-none bg-transparent text-sm',
              'text-foreground placeholder-muted-foreground'
            )}
            placeholder={placeholder}
            value={inputValue}
            onChange={(e) => {
              onInputChange(e.target.value)
              onSearch(e.target.value)
            }}
            onFocus={() => {
              if (inputValue.length >= 3) onOpenChange(true)
            }}
          />
        </PopoverTrigger>
        <PopoverContent
          className="border border-border-weak max-h-60 p-0 z-50"
          style={{ width: `${panelWidth}px` }}
          align="center"
          sideOffset={4}
        >
          {searchResults.length === 0 ? (
            <div className="p-4 text-sm text-center text-muted-foreground">
              {isLoading ? 'Buscando…' : 'No encontramos animitas ni lugares con ese nombre'}
            </div>
          ) : (
            <ScrollArea className="max-h-60 p-1">
              <div className="space-y-1">
                {searchResults.map((result) => (
                  <SearchResultItem
                    key={result.id}
                    label={result.type === 'local' ? result.title : (result.text || result.place_name)}
                    isAnimita={result.type === 'local'}
                    onClick={() => handleSelectResult(result)}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </PopoverContent>
      </Popover>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={inputValue ? "Borrar búsqueda" : "Cerrar búsqueda"}
        onClick={handleClear}
        className="rounded-full text-muted-foreground shrink-0"
      >
        <X />
      </Button>
    </div>
  )
}
