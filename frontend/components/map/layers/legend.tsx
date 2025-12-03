import React from 'react'
import { Layer } from './types'
import { LayerItem } from './layer-item'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

import { LayerMetrics } from './layer-metrics'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface LegendProps {
  layers: Layer[]
  elements: Layer[]
  selectedLayerId?: string
  onLayerClick: (layer: Layer) => void
  onToggleVisibility: (id: string, isElement: boolean) => void
}

export function Legend({
  layers,
  elements,
  onLayerClick,
  onToggleVisibility
}: LegendProps) {
  const allItems = [...layers, ...elements]

  // Categorize layers
  const animitasLayer = layers.find(l => l.id === 'animitas')

  const transportLayers = layers.filter(l =>
    ['critical_points', 'highways', 'urban_streets', 'traffic_lights'].includes(l.id)
  )

  const serviceLayers = layers.filter(l =>
    ['hospitals', 'cemeteries', 'police', 'fire_station'].includes(l.id)
  )

  const socialLayers = layers.filter(l =>
    ['churches', 'schools', 'universities', 'bars'].includes(l.id)
  )

  const otherLayers = layers.filter(l =>
    !['animitas', 'heatmap', ...transportLayers.map(tl => tl.id), ...serviceLayers.map(sl => sl.id), ...socialLayers.map(sl => sl.id)].includes(l.id)
  )

  const renderLayerItem = (layer: Layer) => (
    <div key={layer.id} className="flex flex-col">
      <LayerItem
        layer={layer}
        isSearchResult={layer.source === 'search'}
        onClick={() => onLayerClick(layer)}
        onToggleVisibility={(e: React.MouseEvent) => {
          e.stopPropagation()
          onToggleVisibility(layer.id, layer.source === 'search')
        }}
      />
      {layer.visible && layer.components && layer.components.length > 0 && (
        <div className="p-2 pt-1">
          <LayerMetrics selectedLayer={layer} />
        </div>
      )}
    </div>
  )

  return (
    <Card className="absolute left-4 top-4 z-10 w-80 !p-0 !gap-0 flex flex-col shadow-xl border-border-weak">
      <CardHeader className="sr-only">
        <CardTitle>Capas</CardTitle>
      </CardHeader>

      <ScrollArea className="h-full max-h-[calc(100vh-1rem)]">
        <div className="p-2 space-y-1">
          {/* Animitas (Always at top) */}
          {animitasLayer && renderLayerItem(animitasLayer)}

          <Separator className="my-2" />

          <Accordion type="multiple" className="w-full space-y-1">
            <AccordionItem value="transport" className="border-none">
              <AccordionTrigger className="py-1 px-2 hover:bg-muted/50 rounded-md text-sm font-medium">
                Transporte y riesgo vial
              </AccordionTrigger>
              <AccordionContent className="pl-5.5">
                <div className="space-y-1">
                  {transportLayers.map(renderLayerItem)}
                </div>
              </AccordionContent>
            </AccordionItem>

            <Separator className="my-1" />

            <AccordionItem value="services" className="border-none">
              <AccordionTrigger className="py-1 px-2 hover:bg-muted/50 rounded-md text-sm font-medium">
                Servicios críticos
              </AccordionTrigger>
              <AccordionContent className="pl-5.5">
                <div className="space-y-1">
                  {serviceLayers.map(renderLayerItem)}
                </div>
              </AccordionContent>
            </AccordionItem>

            <Separator className="my-1" />

            <AccordionItem value="social" className="border-none">
              <AccordionTrigger className="py-1 px-2 hover:bg-muted/50 rounded-md text-sm font-medium">
                Sociabilidad
              </AccordionTrigger>
              <AccordionContent className="pl-5.5">
                <div className="space-y-1">
                  {socialLayers.map(renderLayerItem)}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Other Layers */}
          {otherLayers.length > 0 && (
            <>
              <Separator className="my-2" />
              <div className="space-y-1">
                {otherLayers.map(renderLayerItem)}
              </div>
            </>
          )}

          {allItems.length === 0 && (
            <div className="text-center text-muted-foreground text-sm py-4">
              No hay capas
            </div>
          )}
        </div>
      </ScrollArea>
    </Card>
  )
}
