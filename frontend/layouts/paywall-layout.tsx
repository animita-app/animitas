import { Legend } from '../components/paywall/legend'
import { LayerDetail } from '../components/map/layers/layer-detail'
import { SearchPanel } from '../components/paywall/search'
import { ActiveAreaBanner } from '../components/map/active-area-banner'
import { Toolbar } from '../components/paywall/toolbar'
import { Layer, AnimitaProperty, GISOperation } from '../components/paywall/types'
import { TopHeader } from '@/components/headers/top-header'

interface PaywallLayoutProps {
  layers: Layer[]
  elements: Layer[]
  selectedLayer: Layer | null
  activeAreaLabel: string | null
  activeProperties: AnimitaProperty[]
  searchSuggestions: any[]
  showProfileMarkers: boolean

  onLayerSelect: (layer: Layer) => void
  onLayerVisibilityChange: (id: string, isElement: boolean) => void
  onClearActiveArea: () => void
  onLayerUpdate: (layer: Layer) => void
  onPropertyToggle: (property: AnimitaProperty, visible: boolean) => void
  onGISOperationSelect: (operation: GISOperation) => void
  onElementRemove: (id: string) => void
  onCloseLayerDetail: () => void
  onSearch: (query: string) => void
  onSelectResult: (location: any) => void
  onResetView: () => void
  onToggleProfile: () => void
  onExport: (format: string, scope?: 'viewport' | 'all') => void
  onGenerateSynthetic: () => void
}

export function PaywallLayout({
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
  onGenerateSynthetic
}: PaywallLayoutProps) {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col *:pointer-events-auto">
      <ActiveAreaBanner
        label={activeAreaLabel}
        onClear={onClearActiveArea}
      />

      <div className="absolute inset-4 z-10 space-y-4">
        <TopHeader onExport={onExport} />

        <div className="relative flex-1">
          <Legend
            layers={layers}
            elements={elements}
            selectedLayerId={selectedLayer?.id}
            onLayerClick={onLayerSelect}
            onToggleVisibility={onLayerVisibilityChange}
          />


          <div className="absolute right-0 top-0">
            {selectedLayer ? (
              <LayerDetail
                selectedLayer={selectedLayer}
                onClose={onCloseLayerDetail}
                onUpdateLayer={onLayerUpdate}
                activeProperties={activeProperties}
                onPropertyToggle={onPropertyToggle}
                onGISOperationSelect={onGISOperationSelect}
                onElementRemove={onElementRemove}
              />
            ) : (
              <SearchPanel
                onSearch={onSearch}
                searchResults={searchSuggestions}
                onSelectResult={onSelectResult}
              />
            )}
          </div>
        </div>

      </div>
      <Toolbar
        onResetView={onResetView}
        onToggleProfile={onToggleProfile}
        showProfile={showProfileMarkers}
        onExport={onExport}
        onGenerateSynthetic={onGenerateSynthetic}
      />
    </div>
  )
}
