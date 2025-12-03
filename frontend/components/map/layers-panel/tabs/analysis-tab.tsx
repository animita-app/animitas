import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GISOperation } from '../types'

interface AnalysisTabProps {
  gisOperation: GISOperation | ''
  gisRadius: number
  onOperationChange: (op: GISOperation) => void
  onRadiusChange: (radius: number) => void
  onExecute: () => void
}

export function AnalysisTab({ gisOperation, gisRadius, onOperationChange, onRadiusChange, onExecute }: AnalysisTabProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Tipo</Label>
        <Select value={gisOperation} onValueChange={(value) => onOperationChange(value as GISOperation)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Seleccionar..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="buffer">Buffer</SelectItem>
            <SelectItem value="intersect">Intersect</SelectItem>
            <SelectItem value="dissolve">Dissolve</SelectItem>
            <SelectItem value="clip">Clip</SelectItem>
            <SelectItem value="spatialJoin">Join</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {gisOperation === 'buffer' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Radio (km)</Label>
            <span className="text-xs text-muted-foreground font-mono">{gisRadius}</span>
          </div>
          <Slider
            value={[gisRadius]}
            min={0.1}
            max={5}
            step={0.1}
            onValueChange={(value) => onRadiusChange(value[0])}
          />
        </div>
      )}

      {gisOperation && (
        <Button
          className="w-full"
          onClick={onExecute}
        >
          Ejecutar
        </Button>
      )}
    </div>
  )
}
