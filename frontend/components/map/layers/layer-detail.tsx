import { useState } from 'react'
import { X, MoreHorizontal, Settings2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Layer,
  Component,
  ComponentType,
  GISOperation,
  AnimitaProperty
} from './types'
import { ComponentForm } from './component-form'
import { StyleTab } from './tabs/style-tab'
import { ComponentsTab } from './tabs/components-tab'
import { AnalysisTab } from './tabs/analysis-tab'

interface LayerDetailProps {
  selectedLayer: Layer
  onClose: () => void
  onUpdateLayer: (layer: Layer) => void
  activeProperties: AnimitaProperty[]
  onPropertyToggle: (property: AnimitaProperty, visible: boolean) => void
  onGISOperationSelect?: (operation: GISOperation, params?: any) => void
  onElementRemove?: (id: string) => void
}

export function LayerDetail({
  selectedLayer,
  onClose,
  onUpdateLayer,
  activeProperties,
  onPropertyToggle,
  onGISOperationSelect,
  onElementRemove
}: LayerDetailProps) {
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
      onUpdateLayer(updatedLayer)
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
      onUpdateLayer(updatedLayer)
    }

    closeComponentForm()
  }

  const removeComponent = (componentId: string) => {
    if (!selectedLayer) return

    const updatedLayer = {
      ...selectedLayer,
      components: (selectedLayer.components || []).filter(c => c.id !== componentId)
    }

    onUpdateLayer(updatedLayer)
  }

  const toggleComponentVisibility = (componentId: string) => {
    if (!selectedLayer) return

    const updatedLayer = {
      ...selectedLayer,
      components: (selectedLayer.components || []).map(c =>
        c.id === componentId ? { ...c, visible: !c.visible } : c
      )
    }

    onUpdateLayer(updatedLayer)
  }

  return (
    <>
      <Card className="absolute right-4 top-4 z-10 w-80 !p-0 !gap-0 flex flex-col shadow-xl border-border-weak animate-in slide-in-from-right duration-300 fade-in">
        <CardHeader className="px-4 pr-2 border-b border-border-weak !py-1.5 h-12 items-center flex flex-row justify-between space-y-0 shrink-0">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <CardTitle className="truncate text-sm">{selectedLayer.label}</CardTitle>
          </div>

          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
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
                      onClose()
                    }}
                  >
                    <Trash2 />
                    <span>Eliminar</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 ml-1"
              onClick={onClose}
            >
              <X />
            </Button>
          </div>
        </CardHeader>

        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            setActiveTab(value)
            closeComponentForm()
          }}
        >
          {selectedLayer.id === 'animitas' && (
            <TabsList>
              <TabsTrigger value="style">Estilo</TabsTrigger>
              <TabsTrigger value="components">Componentes</TabsTrigger>
              <TabsTrigger value="analysis">Análisis</TabsTrigger>
            </TabsList>
          )}

          <ScrollArea>
            <TabsContent value="style">
              <StyleTab
                selectedLayer={selectedLayer}
                activeProperties={activeProperties}
                onPropertyToggle={onPropertyToggle}
                onUpdateLayer={onUpdateLayer}
              />
            </TabsContent>

            {selectedLayer.id === 'animitas' && (
              <>
                <TabsContent value="components">
                  <ComponentsTab
                    selectedLayer={selectedLayer}
                    onOpenForm={openComponentForm}
                    onRemove={removeComponent}
                  />
                </TabsContent>

                <TabsContent value="analysis">
                  <AnalysisTab
                    gisOperation={gisOperation}
                    gisRadius={gisRadius}
                    onOperationChange={setGisOperation}
                    onRadiusChange={setGisRadius}
                    onExecute={() => onGISOperationSelect?.(gisOperation as GISOperation, { radius: gisRadius })}
                  />
                </TabsContent>
              </>
            )}
          </ScrollArea>
        </Tabs>
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
