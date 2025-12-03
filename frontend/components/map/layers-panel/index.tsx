import { useState, useEffect } from 'react'
import { ChevronLeft, MoreHorizontal, Settings2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export * from './types'
import {
  Layer,
  Component,
  ComponentType,
  GISOperation,
  LayersPanelProps,
  INITIAL_LAYERS,
  AnimitaProperty
} from './types'
import { LayerItem } from './layer-item'
import { ComponentForm } from './component-form'
import { StyleTab } from './tabs/style-tab'
import { DataTab } from './tabs/data-tab'
import { ComponentsTab } from './tabs/components-tab'
import { AnalysisTab } from './tabs/analysis-tab'

export function LayersPanel({
  className,
  onLayerChange,
  onPropertyToggle,
  activeProperties = ['typology', 'death_cause'],
  onGISOperationSelect,
  elements = [],
  onElementVisibilityChange,
  onElementRemove,
  onLayerClick
}: LayersPanelProps) {
  // State
  const [layers, setLayers] = useState<Layer[]>(INITIAL_LAYERS)
  const [selectedLayer, setSelectedLayer] = useState<Layer | null>(null)
  const [activeTab, setActiveTab] = useState<string>('style')
  const [gisOperation, setGisOperation] = useState<GISOperation | ''>('')
  const [gisRadius, setGisRadius] = useState(0.5)

  // Component editing state
  const [editingComponent, setEditingComponent] = useState<Component | null>(null)
  const [isCreatingComponent, setIsCreatingComponent] = useState(false)
  const [componentFormType, setComponentFormType] = useState<ComponentType>('statistic')
  const [componentFormTitle, setComponentFormTitle] = useState('')
  const [componentFormConfig, setComponentFormConfig] = useState<any>({
    stat: 'count',
    bins: 10,
    verticalAxis: '',
    groupBy: '',
    horizontalAxis: '',
    attribute: ''
  })

  // Load from LocalStorage
  useEffect(() => {
    const savedLayers = localStorage.getItem('animita-layers')
    if (savedLayers) setLayers(JSON.parse(savedLayers))
  }, [])

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('animita-layers', JSON.stringify(layers))
  }, [layers])

  // Handlers
  const toggleVisibility = (id: string, isElement = false) => {
    if (isElement) {
      const element = elements.find(e => e.id === id)
      if (element) {
        onElementVisibilityChange?.(id, !element.visible)
      }
    } else {
      const layer = layers.find(l => l.id === id)
      if (layer) {
        const newVisibility = !layer.visible
        setLayers(prev => prev.map(l => l.id === id ? { ...l, visible: newVisibility } : l))
        onLayerChange?.(id, newVisibility)
      }
    }
  }

  const updateLayer = (updatedLayer: Layer) => {
    if (updatedLayer.source === 'search') {
      // Elements are managed by parent
    } else {
      setLayers(prev => prev.map(l => l.id === updatedLayer.id ? updatedLayer : l))
    }
    setSelectedLayer(updatedLayer)
  }

  const openComponentForm = (component?: Component) => {
    if (component) {
      setEditingComponent(component)
      setComponentFormType(component.type)
      setComponentFormTitle(component.title)
      setComponentFormConfig(component.config)
    } else {
      setIsCreatingComponent(true)
      setComponentFormType('statistic')
      setComponentFormTitle('')
      setComponentFormConfig({
        stat: 'count',
        bins: 10,
        verticalAxis: '',
        groupBy: '',
        horizontalAxis: '',
        attribute: ''
      })
    }
  }

  const closeComponentForm = () => {
    setEditingComponent(null)
    setIsCreatingComponent(false)
    setComponentFormTitle('')
    setComponentFormConfig({
      stat: 'count',
      bins: 10,
      verticalAxis: '',
      groupBy: '',
      horizontalAxis: '',
      attribute: ''
    })
  }

  const saveComponent = () => {
    if (!selectedLayer || !componentFormTitle) return

    if (editingComponent) {
      // Update existing component
      const updatedLayer = {
        ...selectedLayer,
        components: (selectedLayer.components || []).map(c =>
          c.id === editingComponent.id
            ? { ...c, type: componentFormType, title: componentFormTitle, config: componentFormConfig }
            : c
        )
      }
      updateLayer(updatedLayer)
    } else {
      // Create new component
      const newComponent: Component = {
        id: `component-${Date.now()}`,
        type: componentFormType,
        title: componentFormTitle,
        visible: true,
        config: componentFormConfig
      }

      const updatedLayer = {
        ...selectedLayer,
        components: [...(selectedLayer.components || []), newComponent]
      }
      updateLayer(updatedLayer)
    }

    closeComponentForm()
  }

  const removeComponent = (componentId: string) => {
    if (!selectedLayer) return

    const updatedLayer = {
      ...selectedLayer,
      components: (selectedLayer.components || []).filter(c => c.id !== componentId)
    }

    updateLayer(updatedLayer)
  }

  const toggleComponentVisibility = (componentId: string) => {
    if (!selectedLayer) return

    const updatedLayer = {
      ...selectedLayer,
      components: (selectedLayer.components || []).map(c =>
        c.id === componentId ? { ...c, visible: !c.visible } : c
      )
    }

    updateLayer(updatedLayer)
  }

  // Combine layers and elements for the list
  const allItems = [
    ...layers,
    ...elements
  ]

  return (
    <>
      <Card className="absolute right-4 top-4 z-10 w-80 !p-0 !gap-0 flex flex-col shadow-xl">
        <CardHeader className={cn(
          'px-4 pr-2 border-b border-border-weak !py-1.5 h-12 items-center flex flex-row justify-between space-y-0 shrink-0',
          !selectedLayer && 'sr-only'
        )}>
          {selectedLayer ? (
            <>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="-ml-2 w-8 h-8"
                  onClick={() => setSelectedLayer(null)}
                >
                  <ChevronLeft className="text-muted-foreground/80" />
                </Button>
                <CardTitle className="truncate flex-1 text-sm max-w-56">{selectedLayer.label}</CardTitle>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Settings2 />
                    <span>Atributos</span>
                  </DropdownMenuItem>
                  {selectedLayer.source === 'search' && (
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => {
                        onElementRemove?.(selectedLayer.id)
                        setSelectedLayer(null)
                      }}
                    >
                      <Trash2 className="text-destructive" />
                      <span>Eliminar</span>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <CardTitle className="text-sm">Capas</CardTitle>
          )}
        </CardHeader>

        <div className="flex-1 overflow-hidden relative">
          {selectedLayer ? (
            <Tabs
              value={activeTab}
              onValueChange={(value) => {
                setActiveTab(value)
                closeComponentForm()
              }}
            >
              <TabsList>
                <TabsTrigger value="style">Estilo</TabsTrigger>
                <TabsTrigger value="data">Datos</TabsTrigger>
                <TabsTrigger value="components">Componentes</TabsTrigger>
                <TabsTrigger value="analysis">Análisis</TabsTrigger>
              </TabsList>

              <ScrollArea className="flex-1">
                <TabsContent value="style" className="mt-0">
                  <StyleTab
                    selectedLayer={selectedLayer}
                    activeProperties={activeProperties}
                    onPropertyToggle={onPropertyToggle}
                    onUpdateLayer={updateLayer}
                  />
                </TabsContent>

                <TabsContent value="data" className="mt-0">
                  <DataTab selectedLayer={selectedLayer} />
                </TabsContent>

                <TabsContent value="components" className="mt-0">
                  <ComponentsTab
                    selectedLayer={selectedLayer}
                    onOpenForm={openComponentForm}
                    onToggleVisibility={toggleComponentVisibility}
                    onRemove={removeComponent}
                  />
                </TabsContent>

                <TabsContent value="analysis" className="mt-0">
                  <AnalysisTab
                    gisOperation={gisOperation}
                    gisRadius={gisRadius}
                    onOperationChange={setGisOperation}
                    onRadiusChange={setGisRadius}
                    onExecute={() => onGISOperationSelect?.(gisOperation as GISOperation, { radius: gisRadius })}
                  />
                </TabsContent>
              </ScrollArea>
            </Tabs>
          ) : (
            <ScrollArea className="h-full">
              <div className="p-3 pt-2 space-y-1">
                {allItems.map(item => (
                  <LayerItem
                    key={item.id}
                    layer={item}
                    isElement={item.source === 'search'}
                    onClick={() => {
                      setSelectedLayer(item)
                      onLayerClick?.(item)
                    }}
                    onToggleVisibility={(e) => {
                      e.stopPropagation()
                      toggleVisibility(item.id, item.source === 'search')
                    }}
                  />
                ))}

                {allItems.length === 0 && (
                  <div className="text-center text-muted-foreground text-sm">
                    No hay capas
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </div>
      </Card>

      {/* Component Form Side Panel */}
      {(isCreatingComponent || editingComponent) && (
        <ComponentForm
          component={editingComponent}
          formType={componentFormType}
          formTitle={componentFormTitle}
          formConfig={componentFormConfig}
          onTypeChange={setComponentFormType}
          onTitleChange={setComponentFormTitle}
          onConfigChange={setComponentFormConfig}
          onClose={closeComponentForm}
          onSave={saveComponent}
          onDelete={editingComponent ? () => removeComponent(editingComponent.id) : undefined}
        />
      )}
    </>
  )
}
