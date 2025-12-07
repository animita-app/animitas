import { Button } from '@/components/ui/button'
import { VectorSquare, Scan, Wand2, MousePointer2 } from 'lucide-react'
import { ButtonGroup } from '@/components/ui/button-group'

import { cn } from "@/lib/utils"

interface ToolbarProps {
  onResetView?: () => void
  onExport?: (format: 'image' | 'pdf' | 'geojson' | 'geotiff', scope?: 'viewport' | 'all') => void
  onDefineArea?: () => void
  disabled?: boolean
  onToggleProfile?: () => void
  showProfile?: boolean
  onThemeChange?: (theme: any) => void
  onGenerateSynthetic?: () => void
  isFree?: boolean
}

export function Toolbar({ onResetView, onExport, onDefineArea, disabled, onGenerateSynthetic, isFree }: ToolbarProps) {
  return (
    <ButtonGroup className="absolute bottom-4 right-4 z-10 shadow-xs pointer-events-auto">
      <Button
        size="icon"
        onClick={onResetView}
        title="Restablecer Vista"
        disabled={!onResetView || disabled}
        className={cn((!onResetView) && "sr-only")}
      >
        <MousePointer2 className="size-4 rotate-90 stroke-[0.5px] fill-white" />
      </Button>

      {/* {!isFree && (
        <Button
          variant="outline"
          size="icon"
          onClick={onDefineArea}
          title="Definir área"
        >
          <VectorSquare />
        </Button>
      )}

      {onGenerateSynthetic && !isFree && (
        <Button
          variant="outline"
          size="icon"
          onClick={onGenerateSynthetic}
          title="Generar Animitas Sintéticas"
        >
          <Wand2 />
        </Button>
      )} */}
    </ButtonGroup>
  )
}
