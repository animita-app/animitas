import { NextResponse } from 'next/server'

export async function GET() {
  console.log('[MEMORIALS-COUNT] GET endpoint called - use Supabase instead')

  return NextResponse.json({
    count: 0,
    message: 'Prisma removed - implement using Supabase'
  })
}
