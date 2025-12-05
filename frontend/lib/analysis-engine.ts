import { HeritageSite } from '@/types/mock'
import * as turf from '@turf/turf'
import { Feature, Point, Polygon } from 'geojson'

export interface AnalysisResult {
  animitasInside: number
  contextCounts: Record<string, number>
  density: number
  nearestNeighborAvg: number
  typologyDistribution: Record<string, number>
  charts: {
    density: ChartData
    context: ChartData
    distance: ChartData
    typology: ChartData
  }
}

export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string | string[]
  }[]
}

export function getAnimitaDensity(animitas: HeritageSite[]): ChartData {
  // Mock density calculation over time/space
  return {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Densidad (animitas/km²)',
        data: [12, 19, 3, 5, 2, 3],
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  }
}

export function getContextCounts(animitas: HeritageSite[], contextLayers: any): ChartData {
  // Mock context counts
  return {
    labels: ['Iglesias', 'Colegios', 'Bares', 'Comisarías'],
    datasets: [
      {
        label: 'Cercanía a hitos',
        data: [5, 10, 8, 2],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
      },
    ],
  }
}

export function getDistanceHistogram(animitas: HeritageSite[]): ChartData {
  return {
    labels: ['0-100m', '100-500m', '500-1km', '>1km'],
    datasets: [
      {
        label: 'Distancia a nearest highway',
        data: [15, 20, 10, 5],
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
      },
    ],
  }
}

export function getTypologyDistribution(animitas: HeritageSite[]): ChartData {
  const counts: Record<string, number> = {}
  animitas.forEach(a => {
    const t = a.typology || 'Desconocida'
    counts[t] = (counts[t] || 0) + 1
  })

  return {
    labels: Object.keys(counts),
    datasets: [{
      label: 'Tipología',
      data: Object.values(counts),
      backgroundColor: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']
    }]
  }
}
