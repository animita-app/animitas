import { COLORS, LABELS } from '@/lib/map-style'

export type LayerType = 'context' | 'data' | 'analysis'
export type GISOperation = 'buffer' | 'intersect' | 'dissolve' | 'clip' | 'spatialJoin'
export type ComponentType = 'bar_chart' | 'histogram' | 'statistic'
export type StatType = 'count' | 'sum' | 'avg' | 'min' | 'max'

export interface Layer {
  id: string
  label: string
  type: LayerType
  geometry: 'point' | 'line' | 'polygon'
  color: string
  visible: boolean
  opacity: number
  source?: 'search' | 'system'
  data?: any
  components?: Component[]
}

export interface Component {
  id: string
  type: ComponentType
  title: string
  visible: boolean
  config: BarChartConfig | HistogramConfig | StatisticConfig
}

export interface BarChartConfig {
  verticalAxis: string
  groupBy: string
  horizontalAxis: string
  stat: StatType
}

export interface HistogramConfig {
  horizontalAxis: string
  bins: number
  verticalAxis: StatType
}

export interface StatisticConfig {
  stat: StatType
  attribute?: string
}

export type AnimitaProperty = 'typology' | 'death_cause' | 'social_roles'

export interface LayersPanelProps {
  className?: string
  onLayerChange?: (id: string, visible: boolean) => void
  onPropertyToggle?: (property: AnimitaProperty, visible: boolean) => void
  activeProperties?: AnimitaProperty[]
  onGISOperationSelect?: (operation: GISOperation, params?: any) => void
  elements?: Layer[]
  onElementVisibilityChange?: (id: string, visible: boolean) => void
  onElementRemove?: (id: string) => void
  onLayerClick?: (layer: Layer) => void
}

// Initial Data
export const INITIAL_LAYERS: Layer[] = [
  { id: 'animitas', label: LABELS.animitas, type: 'data', geometry: 'point', color: COLORS.animitas, visible: true, opacity: 100, components: [] },
  { id: 'iglesias', label: LABELS.contextLayers.churches, type: 'context', geometry: 'point', color: COLORS.context.churches, visible: false, opacity: 100, components: [] },
  { id: 'cementerios', label: LABELS.contextLayers.cemeteries, type: 'context', geometry: 'point', color: COLORS.context.cemeteries, visible: false, opacity: 100, components: [] },
  { id: 'bares', label: LABELS.contextLayers.bars, type: 'context', geometry: 'point', color: COLORS.context.bars, visible: false, opacity: 100, components: [] },
]

export const MOCK_ATTRIBUTES = ['typology', 'death_cause', 'social_roles', 'antiquity_year', 'size']
