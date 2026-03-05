"use client"

import * as React from "react"
import {
  X,
  BarChart,
  PieChart,
  Hash,
  Layers,
  Activity,
  ArrowDownNarrowWide,
  ArrowUpNarrowWide,
  Trash2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Component,
  InsightConfig,
  StatType,
  VisualizationType,
  MOCK_ATTRIBUTES
} from "@/components/map/types"
import { cn } from "@/lib/utils"

interface InsightBuilderProps {
  component: Component | null
  layerLabel: string
  onSave: (config: InsightConfig, title: string) => void
  onClose: () => void
  onDelete?: () => void
}

const METRICS: { value: StatType; label: string; icon: any }[] = [
  { value: 'count', label: 'Conteo de registros', icon: Hash },
  { value: 'sum', label: 'Suma de valores', icon: BarChart },
  { value: 'avg', label: 'Promedio', icon: Activity },
  { value: 'min', label: 'Mínimo', icon: ArrowDownNarrowWide },
  { value: 'max', label: 'Máximo', icon: ArrowUpNarrowWide },
]

const VISUALIZATIONS: { value: VisualizationType; label: string; icon: any }[] = [
  { value: 'bar', label: 'Barras', icon: BarChart },
  { value: 'pie', label: 'Circular', icon: PieChart },
  { value: 'statistic', label: 'Valor único', icon: Hash },
  { value: 'histogram', label: 'Histograma', icon: Layers },
]

export function InsightBuilder({
  component,
  layerLabel,
  onSave,
  onClose,
  onDelete
}: InsightBuilderProps) {
  const [title, setTitle] = React.useState(component?.title || "Nuevo Insight")
  const [config, setConfig] = React.useState<InsightConfig>(
    (component?.config as InsightConfig) || {
      metric: 'count',
      visualization: 'bar',
      showAxisLabels: true,
      showZeros: false,
      sortBy: 'alphabetical',
      filters: []
    }
  )

  const handleUpdate = (updates: Partial<InsightConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }))
  }

  const addFilter = () => {
    const newFilter = {
      id: Math.random().toString(36).substr(2, 9),
      attribute: MOCK_ATTRIBUTES[0],
      operator: 'contains',
      value: ''
    }
    handleUpdate({ filters: [...(config.filters || []), newFilter] })
  }

  const removeFilter = (id: string) => {
    handleUpdate({ filters: (config.filters || []).filter(f => f.id !== id) })
  }

  return (
    <Card className="ml-auto w-80 !p-0 !gap-0 shadow-md border-border-weak animate-in duration-150 fade-in flex flex-col max-h-full pointer-events-auto">
      <CardHeader className="px-4 pr-2 border-b border-border-weak !py-1.5 h-12 items-center flex flex-row justify-between space-y-0 shrink-0">
        <CardTitle className="text-sm">Nuevo Insight</CardTitle>
        <Button
          variant="ghost"
          size="icon"
          className="sr-only md:not-sr-only !h-8 !w-8"
          onClick={onClose}
        >
          <X className="size-4" />
        </Button>
      </CardHeader>

      <ScrollArea className="flex-1 min-h-0">
        <div className="p-4 space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nombre del insight..."
              className="text-base font-semibold border-border-weak"
            />
          </div>

          {/* Data Source */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">Origen de datos</Label>
            <div className="flex items-center gap-2 p-2 rounded-md border border-border-weak bg-muted/30 text-sm">
              <span>{layerLabel}</span>
            </div>
          </div>

          {/* Filters */}
          {config.filters && config.filters.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Filtros</Label>
              <div className="space-y-2">
                {config.filters.map((filter) => (
                  <div key={filter.id} className="flex items-center gap-2 group">
                    <div className="flex-1 flex items-center gap-1 p-2 rounded-md border border-border-weak bg-muted/30 text-xs">
                      <span className="font-medium">{filter.attribute}</span>
                      <span className="text-muted-foreground">contiene</span>
                      <input
                        className="flex-1 bg-transparent border-none focus:outline-none text-foreground"
                        placeholder="valor..."
                        value={filter.value}
                        onChange={(e) => {
                          const newFilters = config.filters?.map(f => f.id === filter.id ? { ...f, value: e.target.value } : f)
                          handleUpdate({ filters: newFilters })
                        }}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100"
                      onClick={() => removeFilter(filter.id)}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs"
            onClick={addFilter}
          >
            + Añadir filtro
          </Button>

          {/* Metric Selection */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">Métrica</Label>
            <Select value={config.metric} onValueChange={(v) => handleUpdate({ metric: v as StatType })}>
              <SelectTrigger className="text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {METRICS.map(m => (
                  <SelectItem key={m.value} value={m.value}>
                    <div className="flex items-center gap-2">
                      <m.icon className="size-4" />
                      {m.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {config.metric !== 'count' && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
              <Label className="text-xs font-medium text-muted-foreground">Atributo a medir</Label>
              <Select value={config.attribute} onValueChange={(v) => handleUpdate({ attribute: v })}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_ATTRIBUTES.map(attr => (
                    <SelectItem key={attr} value={attr}>{attr}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Visualization */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">Visualización</Label>
            <Select value={config.visualization} onValueChange={(v) => handleUpdate({ visualization: v as VisualizationType })}>
              <SelectTrigger className="text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VISUALIZATIONS.map(v => (
                  <SelectItem key={v.value} value={v.value}>
                    <div className="flex items-center gap-2">
                      <v.icon className="size-4" />
                      {v.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Mostrar etiquetas de ejes</span>
              <Switch checked={config.showAxisLabels} onCheckedChange={(v) => handleUpdate({ showAxisLabels: v })} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Mostrar ceros</span>
              <Switch checked={config.showZeros} onCheckedChange={(v) => handleUpdate({ showZeros: v })} />
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t border-border-weak p-3 flex items-center justify-between gap-2 bg-muted/30 shrink-0">
        <div className="flex items-center gap-1">
          {onDelete && (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={onDelete}>
              <Trash2 className="size-4" />
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>Cancelar</Button>
          <Button size="sm" onClick={() => onSave(config, title)}>
            {component ? 'Guardar' : 'Crear'}
          </Button>
        </div>
      </div>
    </Card>
  )
}
