import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET(request: NextRequest, { params }: { params: Promise<{ param: string }> }) {
  const { param } = await params
  console.log('[USERS] GET endpoint called for user', param)
  return NextResponse.json({
    error: 'Prisma removed - implement using Supabase'
  }, { status: 501 })
}
