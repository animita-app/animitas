import { Eye, EyeOff, MapPin, Activity, Hexagon, VectorSquare, Spline, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { Layer } from "@/components/map/types"

// Layer Icon Component
const LayerIcon = ({ layer }: { layer: Layer }) => {
  let icon
  let typeLabel

  switch (layer.geometry) {
    case 'point':
      icon = <div className="size-2 rounded-full" style={{ backgroundColor: layer.color }} />
      typeLabel = 'Ubicación (punto)'
      break
    case 'line':
      icon = <Spline size={14} style={{ color: layer.color }} />
      typeLabel = 'Ruta o límite (línea)'
      break
    case 'polygon':
      icon = <VectorSquare size={14} style={{ color: layer.color }} />
      typeLabel = 'Área, región o provincia (polígono)'
      break
    default:
      icon = <div className="size-2 rounded-full" style={{ backgroundColor: layer.color }} />
      typeLabel = 'Desconocido'
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center justify-center min-w-5">
            {icon}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={8}>
          <p>{typeLabel}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

interface LayerItemProps {
  layer: Layer
  isSearchResult?: boolean
  isSelected?: boolean
  onClick?: () => void
  onToggleVisibility: (e: React.MouseEvent) => void
}

export const LayerItem = ({ layer, isSearchResult = false, isSelected = false, onClick, onToggleVisibility }: LayerItemProps) => (
  <div
    className={cn(
      "pl-1 group relative h-8 flex items-center rounded-md cursor-pointer hover:bg-muted",
      !layer.visible && "opacity-60",
      isSelected && "bg-accent/10"
    )}
    onClick={onClick}
  >
    <div className="flex items-center gap-1">
      <LayerIcon layer={layer} />
      <span className={cn("w-full text-sm font-normal text-black truncate select-none", isSearchResult ? "max-w-80" : "max-w-80")}>{layer.label}</span>
    </div>
    {!isSearchResult && (
      <Button
        variant="ghost"
        size="icon"
        className={cn("absolute hover:bg-transparent right-0 duration-50 opacity-0 group-hover:opacity-100", !layer.visible && "opacity-100")}
        onClick={(e) => {
          e.stopPropagation()
          onToggleVisibility(e)
        }}
      >
        {layer.visible ? <Eye className="text-muted-foreground" size={16} /> : <EyeOff className="text-muted-foreground" size={16} />}
      </Button>
    )}
    {isSearchResult && isSelected && (
      <Check className="absolute right-2 text-accent flex-shrink-0" size={16} />
    )}
  </div>
)
