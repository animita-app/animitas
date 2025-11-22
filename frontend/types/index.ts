export interface User {
  id: string
  username: string | null
  displayName: string | null
  image: string | null
  email?: string | null
  created_at?: string
}

export interface Memorial {
  id: string
  name: string
  lat: number
  lng: number
  story: string | null
  isPublic: boolean
  createdAt: string
}

export interface Candle {
  id: string
  message: string | null
  litAt: string
  expiresAt: string
  isActive: boolean
}
