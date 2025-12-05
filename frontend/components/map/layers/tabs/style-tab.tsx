import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Layer, HeritageSiteProperty } from '../../../paywall/types'

const HEATMAP_GRADIENTS = [
  { value: 'default', label: 'Azul a Rojo (Default)' },
  { value: 'green-red', label: 'Típico (Verde-Amarillo-Rojo)' },
  { value: 'blue-purple', label: 'Azul a Morado' },
  { value: 'magma', label: 'Magma' }
]

interface StyleTabProps {
  layer: Layer
  onOpacityChange?: (value: number) => void
  onToggleVisibility?: () => void
  activeProperties?: HeritageSiteProperty[]
  onPropertyToggle?: (property: HeritageSiteProperty, visible: boolean) => void
  onUpdateLayer: (updatedLayer: Layer) => void
}

export function StyleTab({ layer, activeProperties, onPropertyToggle, onUpdateLayer }: StyleTabProps) {
  const isAnimitas = layer.id === 'animitas'

  return (
    <div className="space-y-6">
      {/* Animitas Properties */}
      {isAnimitas && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="prop-typology">Tipología</Label>
            <Switch
              id="prop-typology"
              checked={activeProperties?.includes('typology')}
              onCheckedChange={(checked) => onPropertyToggle?.('typology', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="prop-death-cause">Causa</Label>
            <Switch
              id="prop-death-cause"
              checked={activeProperties?.includes('death_cause')}
              onCheckedChange={(checked) => onPropertyToggle?.('death_cause', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="prop-roles">Roles</Label>
            <Switch
              id="prop-roles"
              checked={activeProperties?.includes('social_roles')}
              onCheckedChange={(checked) => onPropertyToggle?.('social_roles', checked)}
            />
          </div>
        </div>
      )}

      {/* General Style Controls */}
      <div className="space-y-2">
        <Label>{layer.geometry === 'heatmap' ? 'Gradiente' : 'Color'}</Label>

        {layer.geometry === 'heatmap' ? (
          <Select
            value={layer.gradient || 'default'}
            onValueChange={(value) => onUpdateLayer({ ...layer, gradient: value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent className="w-[--radix-select-trigger-width]">
              {HEATMAP_GRADIENTS.map((gradient) => (
                <SelectItem key={gradient.value} value={gradient.value}>
                  {gradient.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <div className="flex items-center gap-2">
            <div className="relative w-full h-9 rounded-md border border-input overflow-hidden">
              <input
                type="color"
                value={layer.color}
                onChange={(e) => onUpdateLayer({ ...layer, color: e.target.value })}
                className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] cursor-pointer p-0 border-0"
                disabled={isAnimitas}
              />
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Opacidad</Label>
          <span className="text-xs text-muted-foreground">{layer.opacity}%</span>
        </div>
        <Slider
          value={[layer.opacity]}
          max={100}
          step={1}
          onValueChange={(value) => onUpdateLayer({ ...layer, opacity: value[0] })}
        />
      </div>
    </div>
  )
}
