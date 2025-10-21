import type { Database } from '@/lib/database.types'

export type User = Database['public']['Tables']['users']['Row']
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type UserUpdate = Database['public']['Tables']['users']['Update']

export type Memorial = Database['public']['Tables']['memorials']['Row']
export type MemorialInsert = Database['public']['Tables']['memorials']['Insert']
export type MemorialUpdate = Database['public']['Tables']['memorials']['Update']

export type Candle = Database['public']['Tables']['candles']['Row']
export type CandleInsert = Database['public']['Tables']['candles']['Insert']
export type CandleUpdate = Database['public']['Tables']['candles']['Update']
