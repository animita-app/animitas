import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useUser } from '@/contexts/user-context'
import { ROLES } from '@/types/roles'
import {
  Layer,
  Component,
  ComponentType,
  GISOperation,
  HeritageSiteProperty
} from '../../paywall/types'
import { MetricForm } from './metric-form'
import { StyleTab } from './tabs/style-tab'
import { MetricsTab } from './tabs/metrics-tab'
import { AnalysisTab } from './tabs/analysis-tab'

import { cn } from "@/lib/utils"
import { useIsMobile } from '../../../hooks/use-mobile'

interface LayerDetailProps {
  selectedLayer: Layer
  onClose: () => void
  onUpdateLayer: (layer: Layer) => void
  activeProperties: HeritageSiteProperty[]
  onPropertyToggle: (property: HeritageSiteProperty, visible: boolean) => void
  onGISOperationSelect?: (operation: GISOperation, params?: any) => void
  onElementRemove?: (id: string) => void
  className?: string
}

export function LayerDetail({
  selectedLayer,
  onClose,
  onUpdateLayer,
  activeProperties,
  onPropertyToggle,
  onGISOperationSelect,
  onElementRemove,
  className
}: LayerDetailProps) {
  const router = useRouter()
  const isMobile = useIsMobile()
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
  const [showLimitAlert, setShowLimitAlert] = useState(false)

  const { role } = useUser()

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

      const currentComponents = selectedLayer.components || []

      // Pro Plan Limit Check
      if (role === ROLES.PRO) {
        if (currentComponents.length >= 3) {
          setShowLimitAlert(true)
          // Keep form open
          return
        }
      }

      const updatedLayer = {
        ...selectedLayer,
        components: [...currentComponents, newComponent]
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
    closeComponentForm()
  }

  // Mobile View: Component Form replaces Layer Detail
  if (isMobile && (isCreatingComponent || editingComponent)) {
    return (
      <MetricForm
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
        className="static w-full h-full border-none shadow-none !p-0 !m-0"
      />
    )
  }

  return (
    <>
      <Card className={cn("absolute top-0 right-0 w-80 !p-0 !gap-0 flex flex-col shadow-md border-border-weak animate-in slide-in-from-right duration-300 fade-in max-h-full pointer-events-auto", className)}>
        <CardHeader className={cn("px-4 pr-2 border-b border-border-weak !py-1.5 h-12 items-center flex flex-row justify-between space-y-0 shrink-0", selectedLayer.id === 'heritage_sites' ? 'border-b-0' : '')}>
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
              className="sr-only md:not-sr-only !h-8 !w-8 ml-1"
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
          className="flex-1 flex flex-col min-h-0"
        >
          {selectedLayer.id === 'heritage_sites' && (
            <TabsList className="shrink-0 pt-0">
              <TabsTrigger value="style">Estilo</TabsTrigger>
              <TabsTrigger value="metrics">Métricas</TabsTrigger>
              <TabsTrigger value="analysis">Análisis</TabsTrigger>
            </TabsList>
          )}

          <ScrollArea className="flex-1">
            <TabsContent value="style" className="m-0 h-full">
              <StyleTab
                layer={selectedLayer}
                activeProperties={activeProperties}
                onPropertyToggle={onPropertyToggle}
                onUpdateLayer={onUpdateLayer}
              />
            </TabsContent>

            {selectedLayer.id === 'heritage_sites' && (
              <>
                <TabsContent value="metrics" className="m-0 h-full">
                  <MetricsTab
                    selectedLayer={selectedLayer}
                    onOpenForm={openComponentForm}
                    onRemove={removeComponent}
                  />
                </TabsContent>

                <TabsContent value="analysis" className="m-0 h-full">
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

      {!isMobile && (isCreatingComponent || editingComponent) && (
        <MetricForm
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

      <AlertDialog open={showLimitAlert} onOpenChange={setShowLimitAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Límite de métricas alcanzado</AlertDialogTitle>
            <AlertDialogDescription>
              El plan Pro permite un máximo de 3 métricas activas simultáneamente. Actualiza al plan Institucional para agregar más.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Entendido</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              setShowLimitAlert(false)
              router.push('/pricing')
            }}>
              Mejorar Plan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
