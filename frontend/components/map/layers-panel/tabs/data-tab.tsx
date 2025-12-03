import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Layer, Component } from '../types'
import { SEED_SITES } from '@/constants/sites'
import { ChartBarDecreasing, ChartColumn, ListOrdered } from 'lucide-react'

interface DataTabProps {
  selectedLayer: Layer
}

export function DataTab({ selectedLayer }: DataTabProps) {
  // Get data source based on layer type
  const data = useMemo(() => {
    if (selectedLayer.id === 'animitas') {
      return SEED_SITES.map(site => ({
        ...site,
        // Flatten nested properties for easier access
        death_cause: site.insights?.memorial?.death_cause || 'unknown',
        typology: site.typology || 'unknown',
        antiquity_year: site.insights?.patrimonial?.antiquity_year || 0,
        size: site.insights?.patrimonial?.size || 'unknown'
      }))
    }
    // For other layers, we might not have data readily available in this context yet
    return []
  }, [selectedLayer])

  const renderComponent = (component: Component) => {
    if (!component.visible) return null

    switch (component.type) {
      case 'statistic':
        return <StatisticCard key={component.id} component={component} data={data} />
      case 'bar_chart':
        return <BarChartCard key={component.id} component={component} data={data} />
      case 'histogram':
        return <HistogramCard key={component.id} component={component} data={data} />
      default:
        return null
    }
  }

  if (!selectedLayer.components || selectedLayer.components.length === 0) {
    return (
      <div className="text-center text-muted-foreground text-sm">
        No hay componentes.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {selectedLayer.components.map(renderComponent)}
    </div>
  )
}

// --- Sub-components ---

function StatisticCard({ component, data }: { component: Component, data: any[] }) {
  const { config } = component

  const value = useMemo(() => {
    if (!data.length) return 0

    // @ts-ignore
    const stat = config.stat
    // @ts-ignore
    const attr = config.attribute

    if (stat === 'count') return data.length

    if (!attr) return 0

    const values = data.map(d => Number(d[attr]) || 0)

    switch (stat) {
      case 'sum': return values.reduce((a, b) => a + b, 0)
      case 'avg': return (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1)
      case 'min': return Math.min(...values)
      case 'max': return Math.max(...values)
      default: return 0
    }
  }, [data, config])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {component.title || 'Estadística'}
        </CardTitle>
        <ListOrdered className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {/* @ts-ignore */}
        <p className="text-xs text-muted-foreground capitalize">
          {/* @ts-ignore */}
          {config.stat} {config.attribute ? `de ${config.attribute}` : ''}
        </p>
      </CardContent>
    </Card>
  )
}

function BarChartCard({ component, data }: { component: Component, data: any[] }) {
  const { config } = component

  const chartData = useMemo(() => {
    if (!data.length) return []

    // @ts-ignore
    const groupBy = config.groupBy
    // @ts-ignore
    const stat = config.stat
    // @ts-ignore
    const vertAxis = config.verticalAxis // Attribute to calculate stat on (optional for count)

    if (!groupBy) return []

    const groups: Record<string, number[]> = {}

    data.forEach(item => {
      const key = String(item[groupBy] || 'Unknown')
      if (!groups[key]) groups[key] = []

      const val = vertAxis ? (Number(item[vertAxis]) || 0) : 1
      groups[key].push(val)
    })

    return Object.entries(groups).map(([name, values]) => {
      let value = 0
      switch (stat) {
        case 'count': value = values.length; break; // If vertAxis is not set, count items. If set, count items (same).
        case 'sum': value = values.reduce((a, b) => a + b, 0); break;
        case 'avg': value = values.reduce((a, b) => a + b, 0) / values.length; break;
        default: value = values.length;
      }
      return { name, value }
    }).sort((a, b) => b.value - a.value).slice(0, 10) // Top 10

  }, [data, config])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {component.title || 'Gráfico de Barras'}
        </CardTitle>
        <ChartBarDecreasing className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 20, top: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" hide />
            <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 10 }} interval={0} />
            <Tooltip
              contentStyle={{ fontSize: '12px', borderRadius: '6px' }}
              cursor={{ fill: 'transparent' }}
            />
            <Bar dataKey="value" fill="currentColor" radius={[0, 4, 4, 0]} className="fill-primary" barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

function HistogramCard({ component, data }: { component: Component, data: any[] }) {
  const { config } = component

  const chartData = useMemo(() => {
    if (!data.length) return []

    // @ts-ignore
    const axis = config.horizontalAxis
    // @ts-ignore
    const binsCount = config.bins || 10

    if (!axis) return []

    const values = data.map(d => Number(d[axis])).filter(v => !isNaN(v))
    if (!values.length) return []

    const min = Math.min(...values)
    const max = Math.max(...values)
    const range = max - min
    const step = range / binsCount

    const bins = Array.from({ length: binsCount }, (_, i) => ({
      name: `${Math.round(min + i * step)}-${Math.round(min + (i + 1) * step)}`,
      min: min + i * step,
      max: min + (i + 1) * step,
      value: 0
    }))

    values.forEach(v => {
      const binIndex = Math.min(Math.floor((v - min) / step), binsCount - 1)
      if (binIndex >= 0) bins[binIndex].value++
    })

    return bins

  }, [data, config])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {component.title || 'Histograma'}
        </CardTitle>
        <ChartColumn className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip
              contentStyle={{ fontSize: '12px', borderRadius: '6px' }}
              cursor={{ fill: 'rgba(0,0,0,0.1)' }}
            />
            <Bar dataKey="value" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
