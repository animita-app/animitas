import { COLORS, LABELS } from '@/lib/map-style'

export type LayerType = 'context' | 'data' | 'analysis'
export type GISOperation = 'buffer' | 'intersect' | 'dissolve' | 'clip' | 'spatialJoin'
export type ComponentType = 'bar_chart' | 'histogram' | 'statistic'
export type StatType = 'count' | 'sum' | 'avg' | 'min' | 'max'

export interface Layer {
  id: string
  label: string
  type: LayerType
  geometry: 'point' | 'line' | 'polygon' | 'heatmap'
  color: string
  visible: boolean
  opacity: number
  source?: 'search' | 'system'
  data?: any
  components?: Component[]
  gradient?: string
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
export const ANIMITAS_METRICS: Component[] = [
  {
    id: 'default-stat',
    type: 'statistic',
    title: 'Total animitas',
    visible: true,
    config: { stat: 'count' }
  },
  {
    id: 'death-cause-chart',
    type: 'bar_chart',
    title: 'Causa de muerte',
    visible: true,
    config: { horizontalAxis: 'death_cause', groupBy: 'typology', stat: 'count' }
  },
  {
    id: 'antiquity-hist',
    type: 'histogram',
    title: 'Antigüedad (Años)',
    visible: true,
    config: { horizontalAxis: 'antiquity_year', bins: 50, verticalAxis: 'count' }
  }
]

export const INITIAL_LAYERS: Layer[] = [
  {
    id: 'animitas',
    label: LABELS.animitas,
    type: 'data',
    geometry: 'point',
    color: COLORS.animitas,
    visible: true,
    opacity: 100,
    components: ANIMITAS_METRICS
  },
  // Transporte y riesgo vial
  { id: 'critical_points', label: LABELS.contextLayers.critical_points, type: 'context', geometry: 'heatmap', color: COLORS.context.critical_points, visible: false, opacity: 100, components: [] },
  { id: 'highways', label: LABELS.contextLayers.highways, type: 'context', geometry: 'line', color: COLORS.context.highways, visible: false, opacity: 100, components: [] },
  { id: 'urban_streets', label: LABELS.contextLayers.urban_streets, type: 'context', geometry: 'line', color: COLORS.context.urban_streets, visible: false, opacity: 100, components: [] },
  { id: 'traffic_lights', label: LABELS.contextLayers.traffic_lights, type: 'context', geometry: 'point', color: COLORS.context.traffic_lights, visible: false, opacity: 100, components: [] },

  // Servicios críticos
  { id: 'hospitals', label: LABELS.contextLayers.hospitals, type: 'context', geometry: 'point', color: COLORS.context.hospitals, visible: false, opacity: 100, components: [] },
  { id: 'cemeteries', label: LABELS.contextLayers.cemeteries, type: 'context', geometry: 'point', color: COLORS.context.cemeteries, visible: false, opacity: 100, components: [] },
  { id: 'police', label: LABELS.contextLayers.police, type: 'context', geometry: 'point', color: COLORS.context.police, visible: false, opacity: 100, components: [] },
  { id: 'fire_station', label: LABELS.contextLayers.fire_station, type: 'context', geometry: 'point', color: COLORS.context.fire_station, visible: false, opacity: 100, components: [] },

  // Sociabilidad
  { id: 'churches', label: LABELS.contextLayers.churches, type: 'context', geometry: 'point', color: COLORS.context.churches, visible: false, opacity: 100, components: [] },
  { id: 'schools', label: LABELS.contextLayers.schools, type: 'context', geometry: 'point', color: COLORS.context.schools, visible: false, opacity: 100, components: [] },
  { id: 'universities', label: LABELS.contextLayers.universities, type: 'context', geometry: 'point', color: COLORS.context.universities, visible: false, opacity: 100, components: [] },
  { id: 'bars', label: LABELS.contextLayers.bars, type: 'context', geometry: 'point', color: COLORS.context.bars, visible: false, opacity: 100, components: [] },

]

export const MOCK_ATTRIBUTES = ['typology', 'death_cause', 'social_roles', 'antiquity_year', 'size']
