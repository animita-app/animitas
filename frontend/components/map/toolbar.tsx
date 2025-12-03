import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu"
import { Save, VectorSquare, Scan } from 'lucide-react'
import { ButtonGroup } from '@/components/ui/button-group'

interface ToolbarProps {
  onResetView?: () => void
  onExport?: (format: 'image' | 'pdf' | 'geojson' | 'geotiff', scope?: 'viewport' | 'all') => void
  onDefineArea?: () => void
  disabled?: boolean
  onToggleProfile?: () => void
  showProfile?: boolean
  onThemeChange?: (theme: any) => void
}

export function Toolbar({ onResetView, onExport, onDefineArea, disabled }: ToolbarProps) {
  return (
    <div className="absolute right-4 bottom-4 z-[20] pointer-events-auto">
      <ButtonGroup>
        <Button
          variant="outline"
          size="icon"
          onClick={onResetView}
          title="Restablecer Vista"
          disabled={!onResetView || disabled}
        >
          <Scan />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={onDefineArea}
          title="Definir área"
        >
          <VectorSquare />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" title="Guardar">
              <Save />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top">
            <DropdownMenuLabel className="sr-only">Guardar</DropdownMenuLabel>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Guardar encuadre</DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => onExport?.('image', 'viewport')}>
                    Como .png
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onExport?.('pdf', 'viewport')}>
                    Como .pdf
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onExport?.('geojson', 'viewport')}>
                    Como GeoJSON
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onExport?.('geotiff', 'viewport')}>
                    Como GeoTIFF
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Guardar todo</DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => onExport?.('image', 'all')}>
                    Como .png
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onExport?.('pdf', 'all')}>
                    Como .pdf
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onExport?.('geojson', 'all')}>
                    Como GeoJSON
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onExport?.('geotiff', 'all')}>
                    Como GeoTIFF
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>

          </DropdownMenuContent>
        </DropdownMenu>
      </ButtonGroup>
    </div>
  )
}
