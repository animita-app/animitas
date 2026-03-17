import React from 'react'
import { Layer } from './types'
import { LayerItem } from './layers/layer-item'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { LayerMetrics } from './layers/layer-metrics'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { cn } from "@/lib/utils"
import { useSpatialContext } from '@/contexts/map-filters-context'
import { useHeritageTaxonomy } from '@/hooks/use-heritage-taxonomy'
import { Badge } from '@/components/ui/badge'

interface LegendProps {
  layers: Layer[]
  elements: Layer[]
  selectedLayerId?: string
  onLayerClick: (layer: Layer) => void
  onToggleVisibility: (id: string, isElement: boolean) => void
  className?: string
}

export function Legend({
  layers,
  elements,
  onLayerClick,
  onToggleVisibility,
  className
}: LegendProps) {
  const { filters, toggleFilter } = useSpatialContext()
  const { categories, kinds } = useHeritageTaxonomy()
  const allItems = [...layers, ...elements]

  // Categorize layers
  const heritageSitesLayer = layers.find(l => l.id === 'heritage_sites')

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
    !['heritage_sites', 'heatmap', ...transportLayers.map(tl => tl.id), ...serviceLayers.map(sl => sl.id), ...socialLayers.map(sl => sl.id)].includes(l.id)
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
    <Card className={cn("max-h-full pointer-events-auto w-80 !p-0 !gap-0 shadow-md border-border-weak flex flex-col", className)}>
      <CardHeader className="sr-only">
        <CardTitle>Capas</CardTitle>
      </CardHeader>

      <div className="p-2 border-b border-border-weak space-y-2">
        {kinds.length > 0 && (
          <div>
            <p className="text-xs font-medium text-text-weak mb-2">Tipo</p>
            <div className="flex flex-wrap gap-1.5">
              {kinds.map((kind) => {
                const isActive = filters.kind?.includes(kind.slug)
                return (
                  <Badge
                    key={kind.id}
                    variant={isActive ? 'default' : 'outline'}
                    className={cn(
                      "cursor-pointer text-xs transition-colors",
                      isActive
                        ? "bg-accent text-primary-foreground"
                        : "text-text hover:bg-background-weak"
                    )}
                    onClick={() => toggleFilter('kind', kind.slug)}
                  >
                    {kind.name}
                  </Badge>
                )
              })}
            </div>
          </div>
        )}

        {categories.length > 0 && (
          <div>
            <p className="text-xs font-medium text-text-weak mb-2">Categoría</p>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((category) => {
                const isActive = filters.category?.includes(category.slug)
                return (
                  <Badge
                    key={category.id}
                    variant={isActive ? 'default' : 'outline'}
                    className={cn(
                      "cursor-pointer text-xs transition-colors",
                      isActive
                        ? "bg-accent text-primary-foreground"
                        : "text-text hover:bg-background-weak"
                    )}
                    onClick={() => toggleFilter('category', category.slug)}
                  >
                    {category.name}
                  </Badge>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="p-2 space-y-1">
          {/* Heritage Sites (Always at top) */}
          {heritageSitesLayer && renderLayerItem(heritageSitesLayer)}

          <Separator className="my-2" />

          <Accordion type="multiple" className="w-full space-y-1">
            <AccordionItem value="transport" className="border-none">
              <AccordionTrigger className="py-1 px-2 hover:bg-muted/50 rounded-md text-sm font-medium">
                Transporte y riesgo vial
              </AccordionTrigger>
              <AccordionContent className="pl-5.5">
                <div className="text-black space-y-1">
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
                <div className="text-black space-y-1">
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
                <div className="text-black space-y-1">
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
