import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  console.log('[CANDLES] GET endpoint called')
  return NextResponse.json({
    error: 'Prisma removed - implement using Supabase'
  }, { status: 501 })
}
