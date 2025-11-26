  import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getInitials(name?: string | null): string {
  if (!name) return '?'
  const words = name.trim().split(/\s+/)
  if (words.length === 1) return words[0].charAt(0).toUpperCase()
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase()
}

export function formatDate(date: string | Date | null, formatStr = 'MMM dd, yyyy'): string {
  if (!date) return '-'
  try {
    const parsed = typeof date === 'string' ? parseISO(date) : date
    return format(parsed, formatStr)
  } catch {
    return '-'
  }
}

export function formatDateRelative(date: string | Date | null): string {
  if (!date) return '-'
  try {
    const parsed = typeof date === 'string' ? parseISO(date) : date
    return formatDistanceToNow(parsed, { addSuffix: true, locale: es })
  } catch {
    return '-'
  }
}

export function formatPhoneNumber(phone: string | null): string {
  if (!phone) return '-'
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 9) return `+56 ${cleaned.slice(0, 1)} ${cleaned.slice(1, 5)} ${cleaned.slice(5)}`
  return phone
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('es-CL').format(num)
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

export function capitalize(text: string): string {
  if (!text) return ''
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message)
  }
  return 'An unexpected error occurred'
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^(\+?56)?[0-9]{9}$/
  const cleaned = phone.replace(/\D/g, '')
  return phoneRegex.test(phone) || cleaned.length === 9
}

export function isValidUsername(username: string): boolean {
  return /^[a-zA-Z0-9_-]{3,20}$/.test(username)
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11)
}

export function getCoordinatesDelta(lat1: number, lng1: number, lat2: number, lng2: number): {
  latDelta: number
  lngDelta: number
} {
  return {
    latDelta: Math.abs(lat1 - lat2),
    lngDelta: Math.abs(lng1 - lng2)
  }
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @returns distance in kilometers
 */
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1)
  const dLng = toRadians(lng2 - lng1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c

  return distance
}

/**
 * Calculate bearing (angle) from one coordinate to another
 * @returns bearing in degrees (0° = North, 90° = East, 180° = South, 270° = West)
 */
export function calculateBearing(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLng = toRadians(lng2 - lng1)
  const y = Math.sin(dLng) * Math.cos(toRadians(lat2))
  const x = Math.cos(toRadians(lat1)) * Math.sin(toRadians(lat2)) -
    Math.sin(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.cos(dLng)

  const bearing = toDegrees(Math.atan2(y, x))
  return (bearing + 360) % 360 // Normalize to 0-360
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

function toDegrees(radians: number): number {
  return radians * (180 / Math.PI)
}
