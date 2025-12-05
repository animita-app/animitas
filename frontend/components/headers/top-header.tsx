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
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { Plus, ChevronDown } from 'lucide-react'
import { useUser } from '@/contexts/user-context'
import { ROLES } from '@/types/roles'
import { Badge } from '../ui/badge'
import { cn } from '@/lib/utils'

interface TopHeaderProps {
  onExport?: (format: string, scope?: 'viewport' | 'all') => void
  isLoading?: boolean
  componentCount?: number
}

export function TopHeader({ onExport, componentCount = 0 }: TopHeaderProps) {
  const { role, setRole } = useUser()
  const isPaidOrHigher = role === ROLES.PAID || role === ROLES.EDITOR

  return (
    <div className="-ml-2 md:ml-0 bg-transparent z-10 flex items-center justify-between">
      {isPaidOrHigher ? (
        <DropdownMenu openOnHover={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="active:scale-100 gap-1 [&_svg]:opacity-50 px-2 pr-1.5 text-black font-ibm-plex-mono">
              [ÁNIMA]
              <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            {role !== ROLES.EDITOR && (
              <>
                <DropdownMenuGroup>
                  <div className="flex flex-col gap-2 p-2 mb-3">
                    <div className="-ml-1 mb-2 flex w-full justify-between items-center">
                      <Badge className="bg-white text-black">
                        Pro
                      </Badge>

                      <Button variant="link" className="!py-0 !h-auto text-sm text-white underline hover:text-white items-end justify-end px-0">
                        Mejorar el plan
                      </Button>
                    </div>

                    <div className="flex w-full justify-between">
                      <p className="text-sm text-balance text-white">
                        Uso
                      </p>

                      <span>
                        {componentCount} {' '}
                        <span className="opacity-50">
                          / 3
                        </span>
                      </span>
                    </div>

                    <div className="flex gap-1">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className={cn("h-0.5 w-full bg-neutral-700", i <= componentCount && "bg-white")} />
                      ))}
                    </div>
                  </div>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
              </>
            )}
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
            <DropdownMenuGroup>
              <DropdownMenuItem>
                Perfil
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Configuración</DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuCheckboxItem
                      checked={role === ROLES.DEFAULT}
                      onCheckedChange={() => setRole(ROLES.DEFAULT)}
                    >
                      Default
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={role === ROLES.PAID}
                      onCheckedChange={() => setRole(ROLES.PAID)}
                    >
                      Pro
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={role === ROLES.EDITOR}
                      onCheckedChange={() => setRole(ROLES.EDITOR)}
                    >
                      Editor
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem>
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
