import { apiFetch } from './api'

export interface Memorial {
  id: string
  name: string
  lat: number
  lng: number
  story: string | null
  isPublic: boolean
  createdAt: string
  updatedAt: string
  createdBy?: {
    id: string
    username: string | null
    displayName: string | null
  }
  _count?: {
    people: number
    candles: number
    testimonies: number
    images: number
  }
}

export interface MemorialWithDetails extends Memorial {
  people: Array<{
    id: string
    name: string
    image: string | null
    birthDate: string | null
    deathDate: string | null
  }>
  candles: Array<{
    id: string
    message: string | null
    litAt: string
    expiresAt: string
    isActive: boolean
  }>
  testimonies: Array<{
    id: string
    content: string
    images: string[]
    isPublic: boolean
    user: {
      username: string | null
      displayName: string | null
    }
  }>
  images: Array<{
    id: string
    url: string
  }>
}

export async function fetchMemorials(params?: {
  page?: number
  limit?: number
  search?: string
}): Promise<{ memorials: Memorial[]; total: number }> {
  const query = new URLSearchParams()
  if (params?.page) query.append('page', String(params.page))
  if (params?.limit) query.append('limit', String(params.limit))
  if (params?.search) query.append('search', params.search)

  return apiFetch(`/memorials?${query.toString()}`)
}

export async function fetchMemorialById(id: string): Promise<MemorialWithDetails> {
  return apiFetch(`/memorials/${id}`)
}

export async function createMemorial(data: {
  name: string
  lat: number
  lng: number
  story?: string
  isPublic?: boolean
}): Promise<Memorial> {
  const response = await fetch('/api/memorials', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })

  if (!response.ok) throw new Error('Failed to create memorial')
  return response.json()
}

export async function updateMemorial(
  id: string,
  data: Partial<Memorial>
): Promise<Memorial> {
  const response = await fetch(`/api/memorials/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })

  if (!response.ok) throw new Error('Failed to update memorial')
  return response.json()
}

export async function deleteMemorial(id: string): Promise<void> {
  const response = await fetch(`/api/memorials/${id}`, {
    method: 'DELETE'
  })

  if (!response.ok) throw new Error('Failed to delete memorial')
}

export async function lightCandle(memorialId: string, data: {
  duration: 'ONE_DAY' | 'THREE_DAYS' | 'SEVEN_DAYS'
  message?: string
}): Promise<any> {
  const response = await fetch('/api/candles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      memorialId,
      ...data
    })
  })

  if (!response.ok) throw new Error('Failed to light candle')
  return response.json()
}

export async function addTestimony(memorialId: string, data: {
  content: string
  images?: string[]
  isPublic?: boolean
}): Promise<any> {
  const response = await fetch('/api/testimonies', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      memorialId,
      ...data
    })
  })

  if (!response.ok) throw new Error('Failed to add testimony')
  return response.json()
}

export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export function formatMemorialLocation(memorial: Memorial): string {
  return `${memorial.lat.toFixed(3)}, ${memorial.lng.toFixed(3)}`
}

export function isMemorialOwner(memorial: Memorial, userId: string | null | undefined): boolean {
  if (!userId) return false
  return memorial.createdBy?.id === userId
}

export function sortMemorialsByDistance(
  memorials: Memorial[],
  lat: number,
  lng: number
): Memorial[] {
  return [...memorials].sort((a, b) => {
    const distA = calculateDistance(lat, lng, a.lat, a.lng)
    const distB = calculateDistance(lat, lng, b.lat, b.lng)
    return distA - distB
  })
}

export function getMemorialStats(memorial: MemorialWithDetails): {
  totalCandles: number
  totalTestimonies: number
  totalImages: number
  activeCandleCount: number
} {
  return {
    totalCandles: memorial._count?.candles || memorial.candles?.length || 0,
    totalTestimonies: memorial._count?.testimonies || memorial.testimonies?.length || 0,
    totalImages: memorial._count?.images || memorial.images?.length || 0,
    activeCandleCount: memorial.candles?.filter((c) => c.isActive).length || 0
  }
}
