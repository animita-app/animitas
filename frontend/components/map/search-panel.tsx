import { useState } from 'react'
import { Search as SearchIcon, XCircle, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from '@/lib/utils'
import { LayerItem } from './layers-panel/layer-item'
import { Layer } from './layers-panel/types'
import { ScrollArea } from '@/components/ui/scroll-area'
import { COLORS } from '@/lib/map-style'

interface SearchPanelProps {
  className?: string
  onSearch?: (query: string) => void
  searchResults?: any[]
  onSelectResult?: (result: any) => void
}

export function SearchPanel({ onSearch, searchResults = [], onSelectResult }: SearchPanelProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    onSearch?.(query)

    if (query.length >= 3) {
      setOpen(true)
    } else {
      setOpen(false)
    }
  }

  const handleSelect = (result: any) => {
    onSelectResult?.(result)
    setSearchQuery('')
    onSearch?.('')
    setOpen(false)
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    onSearch?.('')
    setOpen(false)
  }

  if (isCollapsed) {
    return (
      <Card className="!py-0 absolute left-4 top-4 z-10 w-12 h-12 flex items-center justify-center shadow-md border border-border-weak rounded-md p-1">
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
    <Card className="!py-0 absolute left-4 top-4 z-10 flex flex-col gap-2 w-80 shadow-md border border-border-weak">
      <CardHeader className="pl-4 border-b border-border-weak !py-1.5 pr-2 h-12 items-center flex flex-row justify-between space-y-0 sr-only">
        <CardTitle className="font-ibm-plex-mono">[ÁNIMA]</CardTitle>
        <Button
          size="icon"
          variant="ghost"
          className="ml-auto h-8 w-8 shrink-0"
          onClick={() => setIsCollapsed(true)}
        >
          <PanelLeftClose className="text-muted-foreground" />
        </Button>
      </CardHeader>
      <Popover open={open && searchResults.length > 0} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              className="w-full bg-transparent border-none focus:outline-none pl-9 pr-8 text-sm h-9"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={handleSearch}
              onFocus={() => {
                if (searchQuery.length >= 3) setOpen(true)
              }}
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="[&_svg]:size-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <XCircle />
              </button>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent
          className="w-80 p-0 overflow-y-hidden"
          align="start"
          sideOffset={8}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <ScrollArea className="max-h-48 p-1">
            <div className="flex flex-col gap-1">
              {searchResults.map((result) => {
                let geometryType: 'point' | 'line' | 'polygon' = 'point'
                if (result.geometry?.type === 'Polygon' || result.geometry?.type === 'MultiPolygon') {
                  geometryType = 'polygon'
                } else if (result.geometry?.type === 'LineString' || result.geometry?.type === 'MultiLineString') {
                  geometryType = 'line'
                } else if (result.bbox) {
                  geometryType = 'polygon'
                }

                const layer: Layer = {
                  id: result.id,
                  label: result.title,
                  type: 'data',
                  geometry: geometryType,
                  color: result.type === 'local' ? COLORS.animitas : '#6b7280',
                  visible: true,
                  opacity: 1,
                }

                return (
                  <LayerItem
                    key={result.id}
                    layer={layer}
                    onClick={() => handleSelect(result)}
                    onToggleVisibility={(e) => {
                      e.stopPropagation()
                    }}
                  />
                )
              })}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </Card>
  )
}
