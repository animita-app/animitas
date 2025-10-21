import type { Database } from '@/lib/database.types'

declare global {
  type User = Database['public']['Tables']['users']['Row']
  type UserInsert = Database['public']['Tables']['users']['Insert']
  type UserUpdate = Database['public']['Tables']['users']['Update']

  type Memorial = Database['public']['Tables']['memorials']['Row']
  type MemorialInsert = Database['public']['Tables']['memorials']['Insert']
  type MemorialUpdate = Database['public']['Tables']['memorials']['Update']

  type Candle = Database['public']['Tables']['candles']['Row']
  type CandleInsert = Database['public']['Tables']['candles']['Insert']
  type CandleUpdate = Database['public']['Tables']['candles']['Update']
}

export {}
