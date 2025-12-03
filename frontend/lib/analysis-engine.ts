import { Site } from '@/types/mock'
import { computeAnimitaInsights } from './gis-engine'

export interface ChartData {
  labels: string[]
  values: number[]
}

export interface AnalysisResult {
  density: ChartData
  contextCounts: ChartData
  distanceHistogram: ChartData
  typologyDistribution: ChartData
}

export function getAnimitaDensity(animitas: Site[]): ChartData {
  // Simple mock density calculation (e.g., by commune or grid)
  // For now, we'll just return a dummy distribution
  return {
    labels: ['Norte', 'Centro', 'Sur', 'Costa', 'Cordillera'],
    values: [12, 45, 23, 15, 8]
  }
}

export function getContextCounts(animitas: Site[], contextLayers: any): ChartData {
  // Use GIS engine to compute real counts if possible, or mock for now
  // In a real scenario, we'd iterate over animitas and count nearby features

  // Mock data based on context layers presence
  return {
    labels: ['Iglesias', 'Cementerios', 'Bares', 'Comercio'],
    values: [
      contextLayers.churches?.features.length || 0,
      contextLayers.cemeteries?.features.length || 0,
      contextLayers.bars?.features.length || 0,
      contextLayers.convenience?.features.length || 0
    ]
  }
}

export function getDistanceHistogram(animitas: Site[]): ChartData {
  // Mock histogram of distances to nearest road
  return {
    labels: ['0-10m', '10-50m', '50-100m', '100m+'],
    values: [15, 30, 10, 5]
  }
}

export function getTypologyDistribution(animitas: Site[]): ChartData {
  const counts: Record<string, number> = {}

  animitas.forEach(site => {
    const type = site.typology || 'unknown'
    counts[type] = (counts[type] || 0) + 1
  })

  return {
    labels: Object.keys(counts),
    values: Object.values(counts)
  }
}

export function runFullAnalysis(animitas: Site[], contextLayers: any): AnalysisResult {
  return {
    density: getAnimitaDensity(animitas),
    contextCounts: getContextCounts(animitas, contextLayers),
    distanceHistogram: getDistanceHistogram(animitas),
    typologyDistribution: getTypologyDistribution(animitas)
  }
}
