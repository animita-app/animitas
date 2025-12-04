import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu"
import { Plus, ChevronDown } from 'lucide-react'
import { useUser } from '@/contexts/user-context'
import { ROLES } from '@/types/roles'

interface TopHeaderProps {
  onExport?: (format: string, scope?: 'viewport' | 'all') => void
  isLoading?: boolean
}

export function TopHeader({ onExport }: TopHeaderProps) {
  const { role } = useUser()
  const isPaidOrHigher = role === ROLES.PAID || role === ROLES.EDITOR

  return (
    <div className="bg-transparent z-10 flex items-center justify-between">
      {isPaidOrHigher ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="px-2 pr-1.5 [&_svg]:opacity-50 text-black font-ibm-plex-mono">
              [ÁNIMA]
              <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Guardar</DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>Encuadre</DropdownMenuSubTrigger>
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
                      <DropdownMenuSubTrigger>Todo</DropdownMenuSubTrigger>
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
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>

              <DropdownMenuItem>Compartir</DropdownMenuItem>

              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Vista</DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem>Ocultar UI</DropdownMenuItem>
                    <DropdownMenuItem>Zoom In</DropdownMenuItem>
                    <DropdownMenuItem>Zoom Out</DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button variant="ghost" size="sm" className="px-2 pr-1.5 text-black font-ibm-plex-mono cursor-default hover:bg-transparent">
          [ÁNIMA]
        </Button>
      )}

      <div className="flex items-center gap-3">
        <Button size="sm">
          <Plus />
          Añadir
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="cursor-pointer">
              <AvatarImage src="/pype.png" alt="@pype" />
              <AvatarFallback>FM</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem>
              Ver perfil
            </DropdownMenuItem>
            <DropdownMenuItem>
              Configuración
            </DropdownMenuItem>
            <DropdownMenuItem>
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
