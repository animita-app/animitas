import { Plus, X, ChartBarDecreasing, ChartColumn, ListOrdered } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Layer, Component } from '../../../paywall/types'

interface ComponentsTabProps {
  selectedLayer: Layer
  onOpenForm: (component?: Component) => void
  onRemove: (componentId: string) => void
}

const getComponentIcon = (type: string) => {
  switch (type) {
    case 'bar_chart': return <ChartBarDecreasing />
    case 'histogram': return <ChartColumn />
    case 'statistic': return <ListOrdered />
    default: return null
  }
}

export function ComponentsTab({ selectedLayer, onOpenForm, onRemove }: ComponentsTabProps) {
  return (
    <div className="space-y-4">
      {/* Component List */}
      {selectedLayer.components && selectedLayer.components.length > 0 && (
        <div className="space-y-2">
          {selectedLayer.components.map(component => (
            <div
              key={component.id}
              className="flex items-center justify-between p-2 pl-4 border rounded-md hover:bg-muted/50 cursor-pointer"
              onClick={() => onOpenForm(component)}
            >
              <div className="flex items-center gap-3">
                <div className="text-muted-foreground">
                  {getComponentIcon(component.type)}
                </div>

                <div>
                  <p className="text-sm font-medium">{component.title}</p>
                  <p className="sr-only text-xs text-muted-foreground capitalize">{component.type.replace('_', ' ')}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation()
                  onRemove(component.id)
                }}
              >
                <X />
              </Button>
            </div>
          ))}
        </div>
      )}

      {(!selectedLayer.components || selectedLayer.components.length === 0) && (
        <div className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-md">
          No hay componentes configurados.
        </div>
      )}

      <Button
        variant="link"
        className="shadow-none text-accent hover:text-accent/80 hover:underline !p-0 !px-0 !py-0 !h-auto has-[>svg]:!px-0"
        onClick={() => onOpenForm()}
      >
        <Plus />
        Añadir
      </Button>
    </div>
  )
}
