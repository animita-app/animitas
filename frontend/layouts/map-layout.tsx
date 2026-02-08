import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Legend } from '../components/paywall/legend'
import { LayerDetail } from '../components/map/layers/layer-detail'
import { SearchPanel } from '../components/paywall/search'
import { ActiveAreaBanner } from '../components/paywall/active-area-banner'
import { Toolbar } from '../components/paywall/toolbar'
import { Layer, HeritageSiteProperty, GISOperation } from '../components/paywall/types'
import { Header } from '@/components/headers/header'
import { useUser } from '@/contexts/user-context'
import { useSpatialContext } from '@/contexts/spatial-context'
import { ROLES } from '@/types/roles'
import { useIsMobile } from '../hooks/use-mobile'
import { Drawer, DrawerContentFloating, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'

import { cn } from "@/lib/utils"
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight } from 'lucide-react'

interface MapLayoutProps {
  layers: Layer[]
  elements: Layer[]
  selectedLayer: Layer | null
  activeAreaLabel: string | null
  activeProperties: HeritageSiteProperty[]
  searchSuggestions: any[]
  showProfileMarkers: boolean

  onLayerSelect: (layer: Layer) => void
  onLayerVisibilityChange: (id: string, isElement: boolean) => void
  onClearActiveArea: () => void
  onLayerUpdate: (layer: Layer) => void
  onPropertyToggle: (property: HeritageSiteProperty, visible: boolean) => void
  onGISOperationSelect: (operation: GISOperation) => void
  onElementRemove: (id: string) => void
  onCloseLayerDetail: () => void
  onSearch: (query: string) => void
  onSelectResult: (location: any) => void
  onResetView?: () => void
  onToggleProfile?: () => void
  onExport: (format: string, scope?: 'viewport' | 'all') => void
  onGenerateSynthetic: () => void


  onSearchLoading?: (loading: boolean) => void
  hasMoved?: boolean
}

export function MapLayout({
  layers,
  elements,
  selectedLayer,
  activeAreaLabel,
  activeProperties,
  searchSuggestions,
  showProfileMarkers,
  onLayerSelect,
  onLayerVisibilityChange,
  onClearActiveArea,
  onLayerUpdate,
  onPropertyToggle,
  onGISOperationSelect,
  onElementRemove,
  onCloseLayerDetail,
  onSearch,
  onSelectResult,
  onResetView,
  onToggleProfile,
  onExport,
  onGenerateSynthetic,
  onSearchLoading,
  hasMoved
}: MapLayoutProps) {
  const { role, researchMode } = useUser()
  const pathname = usePathname()
  const isDefault = role === ROLES.DEFAULT
  const isMobile = useIsMobile()
  const [snap, setSnap] = useState<number | string | null>(0.06)

  const showResearchUI = researchMode || !isDefault // fallback if we want to preserve old behavior or just use researchMode
  // Actually, let's strictly follow the "Research Mode" toggle.
  // If toggled OFF, hide research UI even for editors.
  const researchVisible = researchMode


  const heritageLayer = layers.find(l => l.id === 'heritage_sites')
  const componentCount = heritageLayer?.components?.length || 0



  if (isMobile) {
    return (
      <div className="absolute inset-0 pointer-events-none flex flex-col">
        <ActiveAreaBanner
          label={activeAreaLabel}
          onClear={() => {
            onClearActiveArea()
            setTimeout(() => {
              onResetView?.()
            }, 100)
          }}
        />

        <div className="absolute top-0 inset-x-0 z-10 pointer-events-none">
          <Header
            className="pointer-events-auto"
            variant={'gis'}
            onExport={onExport}
            componentCount={componentCount}
            onResetView={onResetView}
          />
        </div>


        {researchVisible && (
          <Drawer
            snapPoints={[0.06, 1]}
            activeSnapPoint={snap}
            setActiveSnapPoint={setSnap}
            open={true}
            modal={snap === 1}
            onOpenChange={(open) => {
              if (!open) {
                setSnap(0.06)
              }
            }}
          >
            <DrawerHeader className="sr-only">
              <DrawerTitle>Detalle de Capa</DrawerTitle>
              <DrawerDescription>Detalle de Capa</DrawerDescription>
            </DrawerHeader>
            <DrawerContentFloating
              className={cn("w-screen", snap === 1 && "drawer-expanded")}
              onHandleClick={() => setSnap(1)}
              showOverlay={snap === 1}
            >
              <div className="flex-1 overflow-y-auto w-full px-0 pb-0">
                {selectedLayer ? (
                  <LayerDetail
                    selectedLayer={selectedLayer}
                    onClose={() => {
                      onCloseLayerDetail()
                      setSnap(0.06)
                    }}
                    onUpdateLayer={onLayerUpdate}
                    activeProperties={activeProperties}
                    onPropertyToggle={onPropertyToggle}
                    onGISOperationSelect={onGISOperationSelect}
                    onElementRemove={onElementRemove}
                    className="w-full h-auto border-none shadow-none static slide-in-from-right-0 animate-none p-0 !bg-transparent"
                  />
                ) : (
                  <Legend
                    layers={layers}
                    elements={elements}
                    selectedLayerId={undefined}
                    onLayerClick={(l) => {
                      onLayerSelect(l)
                      setSnap(1)
                    }}
                    onToggleVisibility={onLayerVisibilityChange}
                    className="w-full h-auto border-none shadow-none p-0 !bg-transparent"
                  />
                )}
              </div>
            </DrawerContentFloating>
          </Drawer>
        )}

        <div className={cn(
          "transition-opacity duration-500",
          "opacity-100"
        )}>
          <Toolbar
            onResetView={hasMoved ? onResetView : undefined}
            onToggleProfile={onToggleProfile}
            showProfile={showProfileMarkers}
            onExport={onExport}
            onGenerateSynthetic={onGenerateSynthetic}
            isFree={isDefault}
          />
        </div>

      </div>
    )
  }

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col">
      <ActiveAreaBanner
        label={activeAreaLabel}
        onClear={() => {
          onClearActiveArea()
          setTimeout(() => {
            if (onResetView) {
              onResetView()
            } else {
              console.warn('[MapLayout] onResetView is undefined')
            }
          }, 100)
        }}
      />

      <div className="absolute inset-4 z-10 flex flex-col gap-4 pointer-events-none">
        <div className="pointer-events-auto">
          {pathname !== '/pricing' && (
            <Header
              variant={'gis'}
              onExport={onExport}
              componentCount={componentCount}
              className="!p-0"
              onResetView={onResetView}
            />
          )}
        </div>

        <div className={cn(
          "relative flex-1 min-h-0 pointer-events-none transition-opacity duration-500",
          (researchVisible) ? "opacity-100" : "opacity-0 pointer-events-none"
        )}>
          {researchVisible && (
            <Legend
              layers={layers}
              elements={elements}
              selectedLayerId={selectedLayer?.id}
              onLayerClick={onLayerSelect}
              onToggleVisibility={onLayerVisibilityChange}
            />
          )}


          {selectedLayer ? (
            researchVisible && (
              <LayerDetail
                selectedLayer={selectedLayer}
                onClose={onCloseLayerDetail}
                onUpdateLayer={onLayerUpdate}
                activeProperties={activeProperties}
                onPropertyToggle={onPropertyToggle}
                onGISOperationSelect={onGISOperationSelect}
                onElementRemove={onElementRemove}
              />
            )
          ) : (
            <div className="absolute right-0 top-0 pointer-events-auto max-h-full flex flex-col">
              <SearchPanel
                onSearch={onSearch}
                searchResults={searchSuggestions}
                onSelectResult={onSelectResult}
                onLoadingChange={onSearchLoading}
              />
            </div>
          )}
        </div>
      </div>

      <div className={cn(
        "transition-opacity duration-500",
        "opacity-100"
      )}>
        <Toolbar
          onResetView={hasMoved ? onResetView : undefined}
          onToggleProfile={onToggleProfile}
          showProfile={showProfileMarkers}
          onExport={onExport}
          onGenerateSynthetic={onGenerateSynthetic}
          isFree={isDefault}
        />
      </div>


    </div>
  )
}
