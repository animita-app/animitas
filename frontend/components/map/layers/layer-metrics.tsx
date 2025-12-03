import React, { useMemo, useState } from 'react'
import { useSpatialContext } from '@/contexts/spatial-context'
import { BarChart, Bar, Cell } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Layer, Component } from '../types'
import { SEED_SITES } from '@/constants/sites'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import booleanPointInPolygon from '@turf/boolean-point-in-polygon'
import { point } from '@turf/helpers'

interface LayerMetricsProps {
  selectedLayer: Layer
}

export function LayerMetrics({ selectedLayer }: LayerMetricsProps) {
  // Get data source based on layer type
  const { filteredData, filters, toggleFilter, activeArea } = useSpatialContext()

  // Get data source based on layer type
  const data = useMemo(() => {
    console.log('LayerMetrics: selectedLayer', selectedLayer)
    if (selectedLayer.id === 'animitas') {
      // Use SEED_SITES filtered ONLY by activeArea (spatial), ignoring attribute filters
      // This ensures charts show all available options in the current area, even when an attribute filter is active.
      let baseData = SEED_SITES

      if (activeArea) {
        baseData = baseData.filter(site => {
          const pt = point([site.location.lng, site.location.lat])
          return booleanPointInPolygon(pt, activeArea as any)
        })
      }

      // Map data to include flattened properties for charts
      return baseData.map(site => ({
        ...site,
        death_cause: site.insights?.memorial?.death_cause || 'unknown',
        typology: site.typology || 'unknown',
        antiquity_year: site.insights?.patrimonial?.antiquity_year || 0,
        size: site.insights?.patrimonial?.size || 'unknown'
      }))
    }
    // For other layers, we might not have data readily available in this context yet
    return []
  }, [selectedLayer, activeArea]) // Removed filteredData dependency, added activeArea

  // Define default components for animitas if none are provided
  const componentsToRender = useMemo(() => {
    if (selectedLayer.id === 'animitas' && (!selectedLayer.components || selectedLayer.components.length === 0)) {
      return [
        {
          id: 'count-stat',
          type: 'statistic',
          title: 'Total Animitas',
          visible: true,
          config: { stat: 'count' }
        },
        {
          id: 'death-cause-chart',
          type: 'bar_chart',
          title: 'Causa de Muerte',
          visible: true,
          config: { horizontalAxis: 'death_cause', groupBy: 'typology', stat: 'count' }
        },
        {
          id: 'antiquity-hist',
          type: 'histogram',
          title: 'Antigüedad (Años)',
          visible: true,
          config: { horizontalAxis: 'antiquity_year', bins: 50 }
        }
      ] as Component[]
    }
    return selectedLayer.components || []
  }, [selectedLayer, filteredData])

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

  if (componentsToRender.length === 0) {
    return (
      <div className="text-center text-muted-foreground text-sm">
        No hay componentes.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {componentsToRender.map(renderComponent)}
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
    <div className="space-y-2 pt-2">
      <Label>
        {component.title || 'Estadística'}
      </Label>
      <div className="space-y-1 text-sm">
        <div
          className="text-3xl text-black font-medium font-ibm-plex-mono"
          style={{ fontFeatureSettings: 'zero 1' }}
        >
          {value}
        </div>
        {/* @ts-ignore */}
        <p className="sr-only text-muted-foreground">{config.stat} {config.attribute ? `de ${config.attribute}` : ''}</p>
      </div>
    </div>
  )
}

import { MultiProgress, ProgressSegment } from '@/components/ui/multi-progress'
import { COLORS } from '@/lib/map-style'

// ...

function BarChartCard({ component, data }: { component: Component, data: any[] }) {
  const { config } = component
  const { filters, toggleFilter } = useSpatialContext()

  // Neutral color palette (default)
  const NEUTRAL_COLORS = [
    '#000000', // neutral-900
    '#1F1F1F', // neutral-800
    '#3A3A3A', // neutral-700
    '#595959', // neutral-600
    '#808080', // neutral-500
    '#B3B3B3', // neutral-400
    '#D9D9D9', // neutral-300
    '#F0F0F0', // neutral-200
  ]

  // Blue color palette (active)
  const BLUE_COLORS = [
    '#0000ee', // blue-900
    '#3333F2', // blue-800
    '#6666F5', // blue-700
    '#9999F7', // blue-600
    '#B3B3F9', // blue-500
    '#CCCCFB', // blue-400
    '#E6E6FD', // blue-300
    '#F5F5FE', // blue-200
  ]

  const { rows, segmentColors } = useMemo(() => {
    // Note: We use the FULL data (unfiltered by this chart's attributes) to calculate totals/segments?
    // Actually, 'data' passed here is already filtered by ALL filters in context.
    // If we want to show the distribution relative to the current selection, this is correct.
    // But if we want to show the distribution of the *whole* dataset while highlighting the selection,
    // we would need the unfiltered data.
    // However, standard behavior for these dashboards is usually "drill down", so showing filtered data is fine.
    // BUT, if we filter by "Accidente", then only "Accidente" row will show up.
    // The user might want to see all rows but with "Accidente" selected/highlighted.
    // The current `filteredData` in context applies ALL filters.
    // To support "selection" without hiding others, we might need `unfilteredData` or handle filtering differently.
    // Given the user said "update the data accordingly", maybe they want drill down.
    // But for a "filter" UI, usually you see all options.
    // Let's assume for now we work with what we have. If rows disappear, it's because they are filtered out.
    // To fix this, we would need to separate "data for calculation" vs "data for display" or move filtering to the component level (which we are doing via context).

    // Actually, if I filter by "Accidente", `filteredData` only has "Accidente".
    // So the chart will only show one bar.
    // This might be what is expected for "metrics of the current view".

    if (!data.length) return { rows: [], segmentColors: {} }

    // @ts-ignore
    const horizontalAxis = config.horizontalAxis || config.verticalAxis
    // @ts-ignore
    const groupBy = config.groupBy

    if (!horizontalAxis) return { rows: [], segmentColors: {} }

    // 1. Group by Horizontal Axis (Rows)
    const rowGroups: Record<string, any[]> = {}
    const allSegmentNames = new Set<string>()

    data.forEach(item => {
      const key = String(item[horizontalAxis] || 'Unknown')
      if (!rowGroups[key]) rowGroups[key] = []
      rowGroups[key].push(item)
    })

    // 2. Process each row
    const processedRows = Object.entries(rowGroups).map(([rowName, rowItems]) => {
      let segments: { name: string, value: number }[] = []

      if (groupBy) {
        const segGroups: Record<string, number> = {}
        rowItems.forEach(item => {
          const segKey = String(item[groupBy] || 'Unknown')
          segGroups[segKey] = (segGroups[segKey] || 0) + 1
          allSegmentNames.add(segKey)
        })
        segments = Object.entries(segGroups).map(([name, value]) => ({ name, value }))
      } else {
        segments = [{ name: rowName, value: rowItems.length }]
        allSegmentNames.add(rowName)
      }

      // Sort segments by value desc
      segments.sort((a, b) => b.value - a.value)

      return {
        name: rowName,
        total: rowItems.length,
        segments
      }
    }).sort((a, b) => b.total - a.total).slice(0, 10)

    // 3. Assign colors to segments (pre-calculate both palettes)
    const sortedSegments = Array.from(allSegmentNames).sort()
    const neutralColors: Record<string, string> = {}
    const blueColors: Record<string, string> = {}

    sortedSegments.forEach((name, i) => {
      neutralColors[name] = NEUTRAL_COLORS[i % NEUTRAL_COLORS.length]
      blueColors[name] = BLUE_COLORS[i % BLUE_COLORS.length]
    })

    return { rows: processedRows, segmentColors: { neutral: neutralColors, blue: blueColors } }

  }, [data, config])

  if (rows.length === 0) return null

  // Calculate max total for scaling
  const maxTotal = Math.max(...rows.map(r => r.total))

  // @ts-ignore
  const horizontalAxis = config.horizontalAxis || config.verticalAxis
  // @ts-ignore
  const groupBy = config.groupBy

  return (
    <div className="space-y-4 py-2">
      <Label>
        {component.title || 'Gráfico de Barras'}
      </Label>

      <div className="space-y-4">
        {rows.map((row) => {
          // Check if row is active (if filtering by horizontal axis)
          const isRowActive = filters[horizontalAxis]?.includes(row.name)
          const isAnyRowActive = filters[horizontalAxis] && filters[horizontalAxis].length > 0

          // Generate segments for MultiProgress
          const progressSegments: ProgressSegment[] = row.segments.map(seg => {
            const isSegActive = !filters[groupBy] || filters[groupBy].includes(seg.name)

            // Use blue colors if row is active, otherwise neutral
            // @ts-ignore
            const color = isRowActive ? segmentColors.blue[seg.name] : segmentColors.neutral[seg.name]

            return {
              value: seg.value,
              color: color,
              label: seg.name,
              isActive: isRowActive && isSegActive
            }
          })

          return (
            <div
              key={row.name}
              className={cn(
                "space-y-1.5 transition-opacity",
                isAnyRowActive && !isRowActive && "opacity-50"
              )}
            >
              <div
                className={cn(
                  "flex justify-between text-xs cursor-pointer",
                  isRowActive ? "text-accent" : "text-foreground"
                )}
                onClick={() => toggleFilter(horizontalAxis, row.name)}
              >
                <span className="font-normal truncate" title={row.name}>{row.name}</span>
                <span className={cn(isRowActive ? "text-accent" : "text-muted-foreground")}>{row.total}</span>
              </div>
              <MultiProgress
                segments={progressSegments}
                total={maxTotal}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

function HistogramCard({ component, data }: { component: Component, data: any[] }) {
  const { config } = component
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null)
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null)
  const { filters, toggleFilter } = useSpatialContext()

  // @ts-ignore
  const axis = config.horizontalAxis

  const chartData = useMemo(() => {
    if (!data.length) return []

    // @ts-ignore
    const binsCount = config.bins || 20

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

  }, [data, config, axis])

  const chartConfig = {
    value: {
      label: "Cantidad",
      color: "hsl(var(--primary))",
    },
  }

  if (chartData.length === 0) return null

  const minValue = chartData[0].min
  const maxValue = chartData[chartData.length - 1].max

  return (
    <div className="space-y-4 py-2">
      <Label>
        {component.title || 'Histograma'}
      </Label>
      <div className="space-y-2">
        <ChartContainer config={chartConfig} className="h-14 w-full">
          <BarChart
            data={chartData}
            margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
            onMouseMove={(state) => {
              if (state.activeTooltipIndex !== undefined) {
                setHoveredIndex(state.activeTooltipIndex)
              } else {
                setHoveredIndex(null)
              }
            }}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <ChartTooltip
              cursor={false}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload
                  // Match MultiProgress tooltip style: dark bg, white text
                  return (
                    <div className="z-50 overflow-hidden rounded-md bg-black text-white px-3 py-1.5 text-sm shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2">
                      <div className="flex gap-4 justify-between items-center text-xs">
                        <span className="font-normal">{data.name}</span>
                        <span className="font-ibm-plex-mono opacity-80">
                          {data.value}
                        </span>
                      </div>
                    </div>
                  )
                }
                return null
              }}
            />
            <Bar
              dataKey="value"
              radius={[0, 0, 0, 0]}
              onClick={(data, index) => {
                setSelectedIndex(index === selectedIndex ? null : index)
                console.log('Histogram bar clicked:', data)
              }}
            >
              {chartData.map((entry, index) => {
                const isActive = selectedIndex === index
                const isAnyActive = selectedIndex !== null

                let fill = '#000000' // Default black
                if (isActive) fill = '#0000ee' // Active blue

                let opacity = 1
                if (isAnyActive && !isActive) opacity = 0.3 // Lower opacity for others

                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={fill}
                    fillOpacity={opacity}
                    className="transition-all duration-200 cursor-pointer"
                  />
                )
              })}
            </Bar>
          </BarChart>
        </ChartContainer>
        <div className="flex justify-between text-xs text-muted-foreground font-medium">
          <span>{Math.round(minValue)}</span>
          <span>{Math.round(maxValue)}</span>
        </div>
      </div>
    </div>
  )
}
