import { Eye, EyeOff, MapPin, Activity, Hexagon, VectorSquare, Spline } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { Layer } from '../../paywall/types'

// Layer Icon Component
const LayerIcon = ({ layer }: { layer: Layer }) => {
  let icon
  let typeLabel

  switch (layer.geometry) {
    case 'point':
      icon = <div className="size-2 rounded-full" style={{ backgroundColor: layer.color }} />
      typeLabel = 'Punto'
      break
    case 'line':
      icon = <Spline size={14} style={{ color: layer.color }} />
      typeLabel = 'Línea'
      break
    case 'polygon':
      icon = <VectorSquare size={14} style={{ color: layer.color }} />
      typeLabel = 'Polígono'
      break
    default:
      icon = <div className="size-2 rounded-full" style={{ backgroundColor: layer.color }} />
      typeLabel = 'Desconocido'
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center justify-center w-6 h-6">
            {icon}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>{typeLabel}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

interface LayerItemProps {
  layer: Layer
  isSearchResult?: boolean
  onClick?: () => void
  onToggleVisibility: (e: React.MouseEvent) => void
}

export const LayerItem = ({ layer, isSearchResult = false, onClick, onToggleVisibility }: LayerItemProps) => (
  <div
    className={cn(
      "pl-1 group relative h-8 flex items-center rounded-md cursor-pointer hover:bg-muted",
      !layer.visible && "opacity-60"
    )}
    onClick={onClick}
  >
    <div className="flex items-center gap-1">
      <LayerIcon layer={layer} />
      <span className={cn("text-sm font-medium text-black truncate select-none", !isSearchResult && "max-w-56")}>{layer.label}</span>
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
  </div>
)
