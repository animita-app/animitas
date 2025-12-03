import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Component, ComponentType, MOCK_ATTRIBUTES } from './types'

interface ComponentFormProps {
  component: Component | null // null means creating new
  formType: ComponentType
  formTitle: string
  formConfig: any
  onTypeChange: (type: ComponentType) => void
  onTitleChange: (title: string) => void
  onConfigChange: (config: any) => void
  onClose: () => void
  onSave: () => void
  onDelete?: () => void
}

export function ComponentForm({
  component,
  formType,
  formTitle,
  formConfig,
  onTypeChange,
  onTitleChange,
  onConfigChange,
  onClose,
  onSave,
  onDelete
}: ComponentFormProps) {
  return (
    <Card className="fixed top-4 right-4 mr-82 w-80 z-10 flex flex-col shadow-xl !p-0 !gap-0 bg-background animate-in fade-in-0 zoom-in-95 slide-in-from-right-5 duration-200">
      <CardHeader className="px-4 pr-2 border-b border-border-weak !py-1.5 h-12 items-center flex flex-row justify-between space-y-0 shrink-0">
        <CardTitle className="text-sm">
          {component ? 'Editar' : 'Nuevo'}
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X />
        </Button>
      </CardHeader>

      <div className="flex-1 overflow-hidden relative flex flex-col">
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={formType} onValueChange={(v) => onTypeChange(v as ComponentType)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="statistic">Estadística</SelectItem>
                  <SelectItem value="bar_chart">Gráfico de Barras</SelectItem>
                  <SelectItem value="histogram">Histograma</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                value={formTitle}
                onChange={(e) => onTitleChange(e.target.value)}
                placeholder="Título"
              />
            </div>

            {/* Statistic Config */}
            {formType === 'statistic' && (
              <div className="space-y-2">
                <Label>Estadística</Label>
                <Select
                  value={formConfig.stat}
                  onValueChange={(v) => onConfigChange({ ...formConfig, stat: v })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="w-[--radix-select-trigger-width]">
                    <SelectItem value="count">Conteo</SelectItem>
                    <SelectItem value="sum">Suma</SelectItem>
                    <SelectItem value="avg">Promedio</SelectItem>
                    <SelectItem value="min">Mínimo</SelectItem>
                    <SelectItem value="max">Máximo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Histogram Config */}
            {formType === 'histogram' && (
              <>
                <div className="space-y-2">
                  <Label>Eje Horizontal</Label>
                  <Select
                    value={formConfig.horizontalAxis}
                    onValueChange={(v) => onConfigChange({ ...formConfig, horizontalAxis: v })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccionar atributo" />
                    </SelectTrigger>
                    <SelectContent className="w-[--radix-select-trigger-width]">
                      {MOCK_ATTRIBUTES.map(attr => (
                        <SelectItem key={attr} value={attr}>{attr}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Bins</Label>
                  <Input
                    type="number"
                    value={formConfig.bins}
                    onChange={(e) => onConfigChange({ ...formConfig, bins: parseInt(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Eje Vertical</Label>
                  <Select
                    value={formConfig.verticalAxis}
                    onValueChange={(v) => onConfigChange({ ...formConfig, verticalAxis: v })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="w-[--radix-select-trigger-width]">
                      <SelectItem value="count">Conteo</SelectItem>
                      <SelectItem value="sum">Suma</SelectItem>
                      <SelectItem value="avg">Promedio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* Bar Chart Config */}
            {formType === 'bar_chart' && (
              <>
                <div className="space-y-2">
                  <Label>Eje Horizontal</Label>
                  <Select
                    value={formConfig.horizontalAxis}
                    onValueChange={(v) => onConfigChange({ ...formConfig, horizontalAxis: v })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent className="w-[--radix-select-trigger-width]">
                      {MOCK_ATTRIBUTES.map(attr => (
                        <SelectItem key={attr} value={attr}>{attr}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Agrupar por</Label>
                  <Select
                    value={formConfig.groupBy}
                    onValueChange={(v) => onConfigChange({ ...formConfig, groupBy: v })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent className="w-[--radix-select-trigger-width]">
                      {MOCK_ATTRIBUTES.map(attr => (
                        <SelectItem key={attr} value={attr}>{attr}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>



                <div className="space-y-2">
                  <Label>Estadística</Label>
                  <Select
                    value={formConfig.stat}
                    onValueChange={(v) => onConfigChange({ ...formConfig, stat: v })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="w-[--radix-select-trigger-width]">
                      <SelectItem value="count">Conteo</SelectItem>
                      <SelectItem value="sum">Suma</SelectItem>
                      <SelectItem value="avg">Promedio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-2 border-t flex gap-2 shrink-0 bg-background">
          {component && onDelete ? (
            <Button variant="destructive" className="flex-1" onClick={onDelete}>
              Eliminar
            </Button>
          ) : (
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancelar
            </Button>
          )}
          <Button className="flex-1" onClick={onSave}>
            {component ? 'Guardar' : 'Crear'}
          </Button>
        </div>
      </div>
    </Card>
  )
}
