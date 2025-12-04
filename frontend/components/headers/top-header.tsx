import React from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu"
import { Save, Plus, ChevronDown } from 'lucide-react'
import { ButtonGroup } from '../ui/button-group'

interface TopHeaderProps {
  onExport?: (format: string, scope?: 'viewport' | 'all') => void
}

export function TopHeader({ onExport }: TopHeaderProps) {
  return (
    <div className="pl-4 bg-transparent z-10 flex items-center justify-between">
      <div className="text-black font-ibm-plex-mono">
        [ÁNIMA]
      </div>

      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <ButtonGroup className="group *:group-hover:bg-muted *:active:scale-100 active:scale-[97%]">
              <Button variant="outline" size="sm">
                Guardar
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-fit px-2">
                <ChevronDown />
              </Button>
            </ButtonGroup>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
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

        <Button size="sm">
          <Plus />
          Añadir
        </Button>

        <Avatar className="cursor-pointer">
          <AvatarImage src="/pype.png" alt="@pype" />
          <AvatarFallback>FM</AvatarFallback>
        </Avatar>
      </div>
    </div>
  )
}
