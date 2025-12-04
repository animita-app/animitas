import React, { useMemo, useState } from 'react'
import { useSpatialContext } from '@/contexts/spatial-context'
import { BarChart, Bar, Cell } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Layer, Component, ANIMITAS_METRICS } from '../../paywall/types'
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
  // @ts-ignore
  const { filteredData, filters, toggleFilter, activeArea, syntheticSites } = useSpatialContext()

  // Get data source based on layer type
  const data = useMemo(() => {
    // console.log('LayerMetrics: selectedLayer', selectedLayer)
    if (selectedLayer.id === 'animitas') {
      // Use SEED_SITES + syntheticSites filtered ONLY by activeArea (spatial), ignoring attribute filters
      // This ensures charts show all available options in the current area, even when an attribute filter is active.
      const allSites = [...SEED_SITES, ...(syntheticSites || [])]
      let baseData = allSites

      if (activeArea) {
        baseData = baseData.filter(site => {
          const pt = point([site.location.lng, site.location.lat])
          return booleanPointInPolygon(pt, activeArea as any)
        })
      }

      // Map data to include flattened properties for charts
      return baseData.map(site => ({
        ...site,
        death_cause: site.death_cause || site.insights?.memorial?.death_cause || 'unknown',
        typology: site.typology || 'unknown',
        antiquity_year: site.insights?.patrimonial?.antiquity_year || 0,
        size: site.insights?.patrimonial?.size || 'unknown'
      }))
    }
    // For other layers, we might not have data readily available in this context yet
    return []
  }, [selectedLayer, activeArea, syntheticSites]) // Added syntheticSites dependency

  // Define default components for animitas if none are provided
  const componentsToRender = useMemo(() => {
    if (selectedLayer.id === 'animitas' && (!selectedLayer.components || selectedLayer.components.length === 0)) {
      return ANIMITAS_METRICS
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

function StatisticCard({ component, data: rawData }: { component: Component, data: any[] }) {
  const { config } = component
  const { filteredData } = useSpatialContext()

  // Use filteredData from context to reflect all active filters
  const data = filteredData

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

  // Neutral color palette (expanded)
  const NEUTRAL_COLORS = [
    '#171717', // neutral-900
    '#262626', // neutral-800
    '#404040', // neutral-700
    '#525252', // neutral-600
    '#737373', // neutral-500
    '#a3a3a3', // neutral-400
    '#d4d4d4', // neutral-300
    '#e5e5e5', // neutral-200
    '#f5f5f5', // neutral-100
  ]

  // Blue color palette (expanded)
  const BLUE_COLORS = [
    '#1e3a8a', // blue-900
    '#1e40af', // blue-800
    '#1d4ed8', // blue-700
    '#2563eb', // blue-600
    '#3b82f6', // blue-500
    '#60a5fa', // blue-400
    '#93c5fd', // blue-300
    '#bfdbfe', // blue-200
    '#dbeafe', // blue-100
  ]

  // @ts-ignore
  const horizontalAxis = config.horizontalAxis || config.verticalAxis
  // @ts-ignore
  const groupBy = config.groupBy

  // Filter data by all OTHER filters (cross-filtering)
  const chartData = useMemo(() => {
    return data.filter(item => {
      return Object.entries(filters).every(([key, values]) => {
        if (key === horizontalAxis) return true // Ignore self
        if (!values || values.length === 0) return true
        return values.includes(String(item[key]))
      })
    })
  }, [data, filters, horizontalAxis])

  const { rows, segmentColors } = useMemo(() => {
    if (!data.length) return { rows: [], segmentColors: {} }

    if (!horizontalAxis) return { rows: [], segmentColors: {} }

    // 1. Identify ALL possible rows from the full dataset (to prevent hiding)
    const allRowNames = new Set<string>()
    data.forEach(item => {
      const key = String(item[horizontalAxis] || 'Unknown')
      allRowNames.add(key)
    })

    // 2. Group filtered data by Horizontal Axis
    const rowGroups: Record<string, any[]> = {}
    chartData.forEach(item => {
      const key = String(item[horizontalAxis] || 'Unknown')
      if (!rowGroups[key]) rowGroups[key] = []
      rowGroups[key].push(item)
    })

    const allSegmentNames = new Set<string>()

    // 3. Process each possible row
    const processedRows = Array.from(allRowNames).map((rowName) => {
      const rowItems = rowGroups[rowName] || []
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
    }).sort((a, b) => b.total - a.total) // Sort by total desc

    // 4. Assign colors to segments (pre-calculate both palettes)
    const sortedSegments = Array.from(allSegmentNames).sort()
    const neutralColors: Record<string, string> = {}
    const blueColors: Record<string, string> = {}

    sortedSegments.forEach((name, i) => {
      neutralColors[name] = NEUTRAL_COLORS[i % NEUTRAL_COLORS.length]
      blueColors[name] = BLUE_COLORS[i % BLUE_COLORS.length]
    })

    return { rows: processedRows, segmentColors: { neutral: neutralColors, blue: blueColors } }

  }, [data, chartData, config, horizontalAxis, groupBy])

  if (rows.length === 0) return null

  // Calculate max total for scaling
  const maxTotal = Math.max(...rows.map(r => r.total))



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
  const { filters, setFilter } = useSpatialContext()

  // @ts-ignore
  const axis = config.horizontalAxis

  const chartData = useMemo(() => {
    // Filter data by all OTHER filters (cross-filtering)
    const filteredData = data.filter(item => {
      return Object.entries(filters).every(([key, values]) => {
        if (key === axis) return true // Ignore self
        if (!values || values.length === 0) return true
        return values.includes(String(item[key]))
      })
    })

    if (!filteredData.length) return []

    // @ts-ignore
    const binsCount = config.bins || 20

    if (!axis) return []

    const values = filteredData.map(d => Number(d[axis])).filter(v => !isNaN(v))
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

  }, [data, config, axis, filters])

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
                        <span className="!font-normal">{data.name}</span>
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
              onClick={(entry, index) => {
                const bin = chartData[index]
                if (!bin) return

                // Find items in this bin
                const itemsInBin = data.filter((d: any) => {
                  const val = Number(d[axis])
                  return val >= bin.min && val < bin.max
                })

                // Get unique values for the filter attribute (e.g. antiquity_year)
                // Since histogram bins are ranges, we filter by the exact values present in the bin
                const values = Array.from(new Set(itemsInBin.map((d: any) => String(d[axis])))) as string[]

                // Check if currently filtered by these values
                const currentFilters = filters[axis] || []
                const isSelected = currentFilters.length > 0 && values.every(v => currentFilters.includes(v))

                if (isSelected) {
                  // Clear filter for this axis
                  setFilter(axis, [])
                } else {
                  // Set filter to values in this bin
                  setFilter(axis, values)
                }
              }}
            >
              {chartData.map((entry, index) => {
                // Determine if this bin is active based on filters
                // A bin is active if ANY of its possible values are in the filter
                // But strictly speaking, if we filter by a range, we want to highlight the bin that corresponds to it.
                // Here we check if the filter values overlap with the bin range.

                const currentFilters = filters[axis] || []
                const isAnyFilterActive = currentFilters.length > 0

                let isActive = false
                if (isAnyFilterActive) {
                  // Check if any value in the bin is selected
                  // We need to know which values are in this bin from the source data
                  // Re-calculating here might be expensive but let's try a simpler check:
                  // If the filter contains values that would fall into this bin.
                  const binMin = entry.min
                  const binMax = entry.max

                  // Check if any filtered value is within [min, max)
                  isActive = currentFilters.some(valStr => {
                    const val = Number(valStr)
                    return !isNaN(val) && val >= binMin && val < binMax
                  })
                }

                const isAnyActive = isAnyFilterActive

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
        <div className="flex justify-between text-xs text-muted-foreground font-normal">
          <span>{Math.round(minValue)}</span>
          <span>{Math.round(maxValue)}</span>
        </div>
      </div>
    </div>
  )
}
