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
} from "../../paywall/types"
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
    <Card className="absolute top-0 right-100 w-[380px] h-full z-50 flex flex-col bg-white border-none shadow-2xl animate-in slide-in-from-right-10 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 p-1 px-1.5 rounded-md hover:bg-neutral-100 cursor-pointer text-neutral-500 font-medium text-sm">
            <Clock className="w-4 h-4" />
            <span>Insight</span>
            <ChevronDown className="w-3 h-3 opacity-50" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="w-8 h-8 text-neutral-400" onClick={onClose}>
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
            className="text-xl font-bold border-none px-0 h-auto focus-visible:ring-0 bg-transparent placeholder:text-neutral-300"
            placeholder="Nombre del insight..."
          />

          <div className="space-y-4">
            {/* Data Source */}
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Origen de datos</Label>
              <div className="flex items-center justify-between p-2 rounded-lg border border-neutral-200 bg-neutral-50/50">
                <div className="flex items-center gap-2 text-sm font-medium text-neutral-700">
                  <div className="w-5 h-5 rounded bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Database className="w-3 h-3" />
                  </div>
                  <span>{layerLabel}</span>
                </div>
                <ChevronDown className="w-4 h-4 text-neutral-400" />
              </div>
            </div>

            {/* Filters */}
            <div className="space-y-2">
              <div className="flex flex-col gap-2">
                {config.filters?.map((filter) => (
                  <div key={filter.id} className="flex items-center gap-2 group">
                    <div className="flex-1 flex items-center bg-neutral-50 border border-neutral-200 rounded-lg overflow-hidden h-9">
                      <div className="px-2 border-r border-neutral-200 flex items-center h-full bg-white min-w-[80px]">
                        <FilterIcon className="w-3 h-3 text-neutral-400 mr-2" />
                        <span className="text-xs font-medium">{filter.attribute}</span>
                      </div>
                      <div className="px-2 border-r border-neutral-200 text-[10px] uppercase font-bold text-neutral-400 bg-neutral-50 flex items-center">
                        contiene
                      </div>
                      <input
                        className="flex-1 bg-transparent border-none px-3 text-sm focus:outline-none"
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
                      className="w-8 h-8 opacity-0 group-hover:opacity-100 text-neutral-400"
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
                className="text-neutral-500 h-8 border border-dashed border-neutral-300 rounded-lg hover:bg-neutral-50"
                onClick={addFilter}
              >
                <Plus className="w-3 h-3 mr-2" />
                Añadir filtro
              </Button>
            </div>
          </div>
        </div>

        {/* Metric Selection */}
        <div className="p-4 rounded-xl border border-neutral-200 bg-white shadow-sm space-y-4">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Métrica</Label>
              <Select value={config.metric} onValueChange={(v) => handleUpdate({ metric: v as StatType })}>
                <SelectTrigger className="border-none p-0 h-auto shadow-none focus:ring-0 text-sm font-semibold hover:bg-neutral-50 rounded-md py-1 px-1 -ml-1 text-neutral-900 transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {METRICS.map(m => (
                    <SelectItem key={m.value} value={m.value}>
                      <div className="flex items-center gap-2">
                        <m.icon className="w-3.5 h-3.5" />
                        {m.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {config.metric !== 'count' && (
              <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                <Label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Atributo a medir</Label>
                <Select value={config.attribute} onValueChange={(v) => handleUpdate({ attribute: v })}>
                  <SelectTrigger className="flex items-center gap-2 p-2 rounded-lg border border-neutral-100 bg-neutral-50/50 h-9 transition-all hover:border-neutral-200">
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
        <div className="p-4 rounded-xl border border-neutral-200 bg-white shadow-sm space-y-4">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Agrupado por</Label>
                {config.groupBy && (
                  <button className="text-[11px] text-neutral-400 hover:text-red-500 transition-colors" onClick={() => handleUpdate({ groupBy: undefined })}>
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
                      className="justify-start text-neutral-600 h-9 px-3 rounded-lg border border-neutral-100 bg-neutral-50/30 hover:bg-neutral-50 hover:border-neutral-200 transition-all text-[12px] font-medium"
                      onClick={() => handleUpdate({ groupBy: attr })}
                    >
                      <Layers className="w-3 h-3 mr-2 text-neutral-400" />
                      {attr}
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="space-y-3 p-3 bg-neutral-50/50 rounded-lg border border-neutral-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="w-3.5 h-3.5 text-neutral-400" />
                      <span className="text-sm font-semibold text-neutral-700">{config.groupBy}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-500 font-medium tracking-tight">Incluir valores vacíos</span>
                    <Switch className="scale-75" />
                  </div>
                </div>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="w-full text-neutral-500 h-9 border border-dashed border-neutral-200 rounded-lg hover:bg-neutral-50 hover:border-neutral-300 transition-all font-medium text-xs"
            >
              <Plus className="w-3 h-3 mr-2" />
              Segmentar por
            </Button>
          </div>
        </div>

        {/* Visualization */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Visualización</Label>
            <div className="p-4 rounded-xl border border-neutral-200 bg-white shadow-sm space-y-6">
              <Select value={config.visualization} onValueChange={(v) => handleUpdate({ visualization: v as VisualizationType })}>
                <SelectTrigger className="border-none p-0 h-auto shadow-none focus:ring-0 text-sm font-semibold hover:bg-neutral-50 rounded-md py-1 px-1 -ml-1 text-neutral-900 transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VISUALIZATIONS.map(v => (
                    <SelectItem key={v.value} value={v.value}>
                      <div className="flex items-center gap-2">
                        <v.icon className="w-3.5 h-3.5" />
                        {v.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-500 font-medium tracking-tight">Mostrar etiquetas de ejes</span>
                  <Switch className="scale-75" checked={config.showAxisLabels} onCheckedChange={(v) => handleUpdate({ showAxisLabels: v })} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-500 font-medium tracking-tight">Mostrar ceros</span>
                  <Switch className="scale-75" checked={config.showZeros} onCheckedChange={(v) => handleUpdate({ showZeros: v })} />
                </div>

                <Button variant="outline" size="sm" className="h-8 text-neutral-600 gap-2 border-neutral-200 bg-neutral-50/50 hover:bg-neutral-100 transition-colors w-full justify-start text-[11px]">
                  <ArrowDownNarrowWide className="w-3 h-3" />
                  Ordenado alfabéticamente
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 inset-x-0 p-4 bg-white border-t border-neutral-100 flex items-center justify-between gap-3 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
        <div className="flex items-center gap-2">
          {onDelete && (
            <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" onClick={onDelete}>
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onClose} className="text-neutral-500 font-medium text-sm">Cancelar</Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 font-bold text-sm rounded-lg shadow-md shadow-blue-200 transition-all active:scale-95" onClick={() => onSave(config, title)}>
            {component ? 'Guardar' : 'Crear Insight'}
          </Button>
        </div>
      </div>
    </Card>
  )
}
