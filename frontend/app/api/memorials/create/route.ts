import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  console.log('[MEMORIAL-CREATE] POST endpoint called')
  return NextResponse.json({
    error: 'Prisma removed - implement using Supabase'
  }, { status: 501 })
}
