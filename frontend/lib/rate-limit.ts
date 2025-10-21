import { NextResponse } from 'next/server'

interface RateLimitStore {
  [key: string]: { count: number; resetTime: number }
}

const store: RateLimitStore = {}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { success: boolean; response?: NextResponse } {
  const now = Date.now()
  const record = store[key]

  if (!record || now > record.resetTime) {
    store[key] = { count: 1, resetTime: now + windowMs }
    return { success: true }
  }

  if (record.count >= limit) {
    return {
      success: false,
      response: NextResponse.json(
        {
          error: 'Too many requests. Please try again later.',
          retryAfter: Math.ceil((record.resetTime - now) / 1000),
        },
        { status: 429 }
      ),
    }
  }

  record.count++
  return { success: true }
}

export function cleanupExpiredLimits(): void {
  const now = Date.now()
  for (const key in store) {
    if (store[key].resetTime < now) {
      delete store[key]
    }
  }
}
