import { useState, useEffect } from 'react'
import { Search as SearchIcon, Check, XCircle, PanelLeftClose, PanelLeftOpen, History, MapPin, Navigation } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { cn } from '@/lib/utils'

interface SearchPanelProps {
  className?: string
  onSearch?: (query: string) => void
  searchResults?: any[]
  onSelectResult?: (result: any) => void
}

const formatAddress = (address: string) => {
  if (!address) return ''
  const parts = address.split(',')
  if (parts.length <= 2) return address
  return `${parts[0].trim()}, ${parts[1].trim()}`
}

export function SearchPanel({ className, onSearch, searchResults = [], onSelectResult }: SearchPanelProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [history, setHistory] = useState<any[]>([])

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('animita-search-history')
    if (saved) {
      try {
        setHistory(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to parse search history', e)
      }
    }
  }, [])

  const addToHistory = (result: any) => {
    const newHistory = [result, ...history.filter(h => h.id !== result.id)].slice(0, 10)
    setHistory(newHistory)
    localStorage.setItem('animita-search-history', JSON.stringify(newHistory))
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    onSearch?.(query)

    if (query.length < 3) {
      // Keep open to show history if available
      setOpen(true)
    }
  }

  const handleSelect = (result: any) => {
    addToHistory(result)
    onSelectResult?.(result)
    setSearchQuery('')
    onSearch?.('')
    setOpen(false)
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    onSearch?.('')
    // Don't close immediately, show history
    setOpen(true)
  }

  if (isCollapsed) {
    return (
      <Card className="absolute left-4 top-4 z-10 w-12 h-12 flex items-center justify-center shadow-md border border-border-weak rounded-md p-1">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setIsCollapsed(false)}
        >
          <PanelLeftOpen className="text-muted-foreground" />
        </Button>
      </Card>
    )
  }

  return (
    <Card className="absolute left-4 top-4 z-10 w-80 !p-0 !gap-0 shadow-md border border-border-weak rounded-md">
      <CardHeader className="pl-4 border-b border-border-weak !py-1.5 pr-2 h-12 items-center flex flex-row justify-between space-y-0">
        <CardTitle className="font-ibm-plex-mono">[ÁNIMA]</CardTitle>

        <Button
          size="icon"
          variant="ghost"
          onClick={() => setIsCollapsed(true)}
        >
          <PanelLeftClose className="text-muted-foreground" />
        </Button>
      </CardHeader>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <InputGroup className="border-none rounded-0 h-12">
            <InputGroupAddon className="ml-1">
              <SearchIcon />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Buscar lugares, rutas..."
              value={searchQuery}
              onChange={handleSearch}
              onFocus={() => setOpen(true)}
            />
            {searchQuery.length > 0 && (
              <InputGroupAddon align="inline-end">
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-transparent mr-1"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleClearSearch()
                  }}
                >
                  <XCircle className="text-muted-foreground" />
                </Button>
              </InputGroupAddon>
            )}
          </InputGroup>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-80" align="start" onOpenAutoFocus={(e) => e.preventDefault()}>
          <Command>
            <CommandList>
              {searchQuery.length === 0 && history.length > 0 && (
                <CommandGroup heading="Recientes">
                  {history.map((item, i) => (
                    <CommandItem
                      key={`hist-${item.id || i}`}
                      onSelect={() => handleSelect(item)}
                    >
                      {item.title || item.place_name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {searchQuery.length > 0 && (
                <CommandGroup heading="Resultados">
                  {searchResults.length === 0 ? (
                    <CommandEmpty>No se encontraron resultados.</CommandEmpty>
                  ) : (
                    searchResults.map((result, i) => (
                      <CommandItem
                        key={result.id || i}
                        onSelect={() => handleSelect(result)}
                      >
                        <div className="flex flex-col overflow-hidden">
                          <span className="truncate font-normal">{result.title || result.place_name}</span>
                          <span className="truncate text-sm text-muted-foreground">
                            {formatAddress(result.place_name || result.story || '')}
                          </span>
                        </div>
                      </CommandItem>
                    ))
                  )}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </Card>
  )
}
