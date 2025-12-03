import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { Layer } from './types'

// Layer Icon Component
const LayerIcon = ({ layer }: { layer: Layer }) => {
  let icon
  let typeLabel

  switch (layer.geometry) {
    case 'point':
      icon = <div className="w-2 h-2 rounded-full" style={{ backgroundColor: layer.color }} />
      typeLabel = 'Punto'
      break
    case 'line':
      icon = <div className="w-4 h-1 rounded-full" style={{ backgroundColor: layer.color }} />
      typeLabel = 'Línea'
      break
    case 'polygon':
      icon = <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: layer.color }} />
      typeLabel = 'Polígono'
      break
    default:
      icon = <div className="w-2 h-2 rounded-full" style={{ backgroundColor: layer.color }} />
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
  isElement?: boolean
  onClick: () => void
  onToggleVisibility: (e: React.MouseEvent) => void
}

export const LayerItem = ({ layer, isElement = false, onClick, onToggleVisibility }: LayerItemProps) => (
  <div
    className={cn(
      "group relative h-8 flex items-center rounded-md cursor-pointer hover:bg-muted",
      !layer.visible && "opacity-60"
    )}
    onClick={onClick}
  >
    <div className="flex items-center gap-2">
      <LayerIcon layer={layer} />
      <span className="text-sm font-normal text-black truncate max-w-[180px]">{layer.label}</span>
    </div>
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
  </div>
)
