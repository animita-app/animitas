export type AnimitaType = 'animita'

export type AnimitaStatus = 'draft' | 'published'

export type DetectionSource =
  | 'yolo_model'
  | 'manual_upload'
  | 'community'
  | 'street_view'

export interface Animita {
  id: string
  latitude: number
  longitude: number
  type: AnimitaType
  status: AnimitaStatus
  confidence?: number
  image_url: string
  detection_source: DetectionSource
  story?: string
  heat_score: number
  last_candle_at?: string
  created_at: string
  updated_at: string
  metadata: {
    description?: string
    comuna?: string
    verified_by_community?: boolean
    additional_notes?: string
    [key: string]: any
  }
}

export interface AnimitaFilters {
  bbox?: [number, number, number, number] // [west, south, east, north]
  status?: AnimitaStatus | AnimitaStatus[]
  detection_source?: DetectionSource | DetectionSource[]
  confidence_min?: number
  date_from?: string
  date_to?: string
  limit?: number
  offset?: number
}

export interface AnimitaResponse {
  success: boolean
  data: Animita[]
  pagination: {
    total: number
    limit: number
    offset: number
    has_more: boolean
  }
  filters_applied: AnimitaFilters
}

export interface CommunityReport {
  id: string
  memorial_id: string
  report_type: 'correction' | 'verification' | 'flag' | 'additional_info'
  notes?: string
  created_at: string
}

export interface Candle {
  id: string
  memorial_id: string
  user_id?: string | null
  status: 'active' | 'expired' | 'extinguished'
  message?: string
  lit_at: string
  expires_at: string
  metadata: Record<string, any>
}

export interface Testimony {
  id: string
  memorial_id: string
  user_id?: string | null
  candle_id?: string | null
  content: string
  has_candle: boolean
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface AnimitaDetail extends Animita {
  reports?: CommunityReport[]
  candles?: Candle[]
  testimonies?: Testimony[]
}

export interface DetectionRequest {
  image_url?: string
  image_base64?: string
  latitude: number
  longitude: number
  notes?: string
  metadata?: Record<string, any>
}

export interface DetectionResponse {
  success: boolean
  data: {
    id: string
    animita: Animita
  }
  message: string
}

export interface VerificationRequest {
  action: 'verify' | 'reject' | 'correct'
  notes?: string
  reporter_session?: string
}

export interface VerificationResponse {
  success: boolean
  message: string
  data: {
    animita: Animita
    report_id: string
  }
}

export interface StatsResponse {
  success: boolean
  data: {
    total_memorials: number
    published_memorials: number
    by_type: Record<AnimitaType, number>
    by_status: Record<AnimitaStatus, number>
    recent_activity: number
    coverage_area: string
  }
}
