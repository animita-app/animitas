"use client"

import * as React from "react"
import {
  X,
  Plus,
  ChevronRight,
  ChevronDown,
  Database,
  Filter as FilterIcon,
  BarChart,
  Layers,
  Hash,
  PieChart,
  Activity,
  Clock,
  Info,
  Trash2,
  MoreVertical,
  Globe,
  ArrowDownNarrowWide,
  ArrowUpNarrowWide
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
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
  { value: 'sum', label: 'Suma de valores', icon: Plus },
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
    <Card className="absolute top-0 right-100 w-[380px] h-full z-50 flex flex-col bg-background border-none shadow-sm animate-in slide-in-from-right-10 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-weak">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 p-1 px-1.5 rounded-md hover:bg-background-weak cursor-pointer text-text-weak font-bold text-sm font-ibm-plex-mono uppercase">
            <span>Insight</span>
            <ChevronDown className="w-4 h-4 opacity-50" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="w-8 h-8 text-text-weaker" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-8 pb-32">
        {/* Title */}
        <div className="space-y-4">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-xl font-bold border-none px-0 h-auto focus-visible:ring-0 bg-transparent placeholder:text-text-weaker"
            placeholder="Nombre del insight..."
          />

          <div className="space-y-4">
            {/* Data Source */}
            <div className="space-y-2">
              <Label className="text-sm font-bold text-text-weaker uppercase tracking-wider font-ibm-plex-mono">Origen de datos</Label>
              <div className="flex items-center justify-between p-3 rounded-lg border border-border-weak bg-background-weak/50">
                <div className="flex items-center gap-2 text-base font-medium text-text">
                  <div className="w-6 h-6 rounded bg-accent/10 text-accent flex items-center justify-center">
                    <Database className="w-4 h-4" />
                  </div>
                  <span>{layerLabel}</span>
                </div>
                <ChevronDown className="w-4 h-4 text-text-weaker" />
              </div>
            </div>

            {/* Filters */}
            <div className="space-y-2">
              <div className="flex flex-col gap-2">
                {config.filters?.map((filter) => (
                  <div key={filter.id} className="flex items-center gap-2 group">
                    <div className="flex-1 flex items-center bg-background-weak border border-border-weak rounded-lg overflow-hidden h-11">
                      <div className="px-3 border-r border-border-weak flex items-center h-full bg-background min-w-[100px]">
                        <span className="text-sm font-bold text-text uppercase font-ibm-plex-mono">{filter.attribute}</span>
                      </div>
                      <div className="px-3 border-r border-border-weak text-xs uppercase font-bold text-text-weaker bg-background-weak flex items-center font-ibm-plex-mono">
                        contiene
                      </div>
                      <input
                        className="flex-1 bg-transparent border-none px-4 text-base focus:outline-none text-text"
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
                      className="w-8 h-8 opacity-0 group-hover:opacity-100 text-text-weaker"
                      onClick={() => removeFilter(filter.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-text-weak h-10 border border-dashed border-border-weak rounded-lg hover:bg-background-weak text-sm font-bold"
                onClick={addFilter}
              >
                + Añadir filtro
              </Button>
            </div>
          </div>
        </div>

        {/* Metric Selection */}
        <div className="p-5 rounded-xl border border-border-weak bg-background shadow-sm space-y-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-sm font-bold text-text-weaker uppercase tracking-wider font-ibm-plex-mono">Métrica</Label>
              <Select value={config.metric} onValueChange={(v) => handleUpdate({ metric: v as StatType })}>
                <SelectTrigger className="border-none p-0 h-auto shadow-none focus:ring-0 text-base font-bold hover:bg-background-weak rounded-md py-1 px-1 -ml-1 text-text-strong transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {METRICS.map(m => (
                    <SelectItem key={m.value} value={m.value}>
                      <div className="flex items-center gap-2">
                        <m.icon className="w-4 h-4" />
                        {m.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {config.metric !== 'count' && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                <Label className="text-sm font-bold text-text-weaker uppercase tracking-wider font-ibm-plex-mono">Atributo a medir</Label>
                <Select value={config.attribute} onValueChange={(v) => handleUpdate({ attribute: v })}>
                  <SelectTrigger className="flex items-center gap-2 p-3 rounded-lg border border-border-weak bg-background-weak/50 h-11 transition-all hover:border-border text-base">
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
          </div>
        </div>

        {/* Grouping */}
        <div className="p-5 rounded-xl border border-border-weak bg-background shadow-sm space-y-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-bold text-text-weaker uppercase tracking-wider font-ibm-plex-mono">Agrupado por</Label>
                {config.groupBy && (
                  <button className="text-sm font-bold text-text-weaker hover:text-destructive transition-colors uppercase font-ibm-plex-mono" onClick={() => handleUpdate({ groupBy: undefined })}>
                    Eliminar
                  </button>
                )}
              </div>

              {!config.groupBy ? (
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {MOCK_ATTRIBUTES.slice(0, 4).map(attr => (
                    <Button
                      key={attr}
                      variant="ghost"
                      size="sm"
                      className="justify-start text-text h-11 px-4 rounded-lg border border-border-weak bg-background-weak/30 hover:bg-background-weak hover:border-border transition-all text-sm font-bold"
                      onClick={() => handleUpdate({ groupBy: attr })}
                    >
                      {attr}
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="space-y-4 p-4 bg-background-weak/50 rounded-lg border border-border-weak">
                  <div className="flex items-center justify-between text-base font-bold text-text">
                    {config.groupBy}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-weak font-medium tracking-tight">Incluir valores vacíos</span>
                    <Switch className="scale-100" />
                  </div>
                </div>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="w-full text-text-weak h-11 border border-dashed border-border-weak rounded-lg hover:bg-background-weak hover:border-border transition-all font-bold text-sm"
            >
              + Segmentar por
            </Button>
          </div>
        </div>

        {/* Visualization */}
        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-sm font-bold text-text-weaker uppercase tracking-wider font-ibm-plex-mono">Visualización</Label>
            <div className="p-5 rounded-xl border border-border-weak bg-background shadow-sm space-y-8">
              <Select value={config.visualization} onValueChange={(v) => handleUpdate({ visualization: v as VisualizationType })}>
                <SelectTrigger className="border-none p-0 h-auto shadow-none focus:ring-0 text-base font-bold hover:bg-background-weak rounded-md py-1 px-1 -ml-1 text-text-strong transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VISUALIZATIONS.map(v => (
                    <SelectItem key={v.value} value={v.value}>
                      <div className="flex items-center gap-2">
                        <v.icon className="w-4 h-4" />
                        {v.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-weak font-medium tracking-tight">Mostrar etiquetas de ejes</span>
                  <Switch className="scale-100" checked={config.showAxisLabels} onCheckedChange={(v) => handleUpdate({ showAxisLabels: v })} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-weak font-medium tracking-tight">Mostrar ceros</span>
                  <Switch className="scale-100" checked={config.showZeros} onCheckedChange={(v) => handleUpdate({ showZeros: v })} />
                </div>

                <Button variant="outline" size="sm" className="h-10 text-text-weak gap-3 border-border-weak bg-background-weak/50 hover:bg-background-weak transition-colors w-full justify-start text-sm">
                  Ordenado alfabéticamente
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 inset-x-0 p-4 bg-background border-t border-border-weak flex items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2">
          {onDelete && (
            <Button variant="ghost" size="icon" className="text-text-weaker hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all" onClick={onDelete}>
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onClose} className="text-text-weak font-medium text-sm">Cancelar</Button>
          <Button className="px-6 font-bold text-sm rounded-lg transition-all active:scale-95" onClick={() => onSave(config, title)}>
            {component ? 'Guardar' : 'Crear Insight'}
          </Button>
        </div>
      </div>
    </Card>
  )
}
