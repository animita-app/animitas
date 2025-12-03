import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from "@/components/ui/slider"
import { Layer, AnimitaProperty } from '../types'

interface StyleTabProps {
  selectedLayer: Layer
  activeProperties: AnimitaProperty[]
  onPropertyToggle?: (property: AnimitaProperty, visible: boolean) => void
  onUpdateLayer: (updatedLayer: Layer) => void
}

export function StyleTab({ selectedLayer, activeProperties, onPropertyToggle, onUpdateLayer }: StyleTabProps) {
  const isAnimitas = selectedLayer.id === 'animitas'

  return (
    <div className="space-y-6">
      {/* Animitas Properties */}
      {isAnimitas && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="prop-typology">Tipología</Label>
            <Switch
              id="prop-typology"
              checked={activeProperties.includes('typology')}
              onCheckedChange={(checked) => onPropertyToggle?.('typology', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="prop-death-cause">Causa</Label>
            <Switch
              id="prop-death-cause"
              checked={activeProperties.includes('death_cause')}
              onCheckedChange={(checked) => onPropertyToggle?.('death_cause', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="prop-roles">Roles</Label>
            <Switch
              id="prop-roles"
              checked={activeProperties.includes('social_roles')}
              onCheckedChange={(checked) => onPropertyToggle?.('social_roles', checked)}
            />
          </div>
        </div>
      )}

      {/* General Style Controls */}
      <div className="space-y-2">
        <Label>Color</Label>
        <div className="flex items-center gap-2">
          <div className="relative w-full h-9 rounded-md border border-input overflow-hidden">
            <input
              type="color"
              value={selectedLayer.color}
              onChange={(e) => onUpdateLayer({ ...selectedLayer, color: e.target.value })}
              className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] cursor-pointer p-0 border-0"
              disabled={isAnimitas}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Opacidad</Label>
          <span className="text-xs text-muted-foreground">{selectedLayer.opacity}%</span>
        </div>
        <Slider
          value={[selectedLayer.opacity]}
          max={100}
          step={1}
          onValueChange={(value) => onUpdateLayer({ ...selectedLayer, opacity: value[0] })}
        />
      </div>
    </div>
  )
}
