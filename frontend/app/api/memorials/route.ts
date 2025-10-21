import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    console.log('[MEMORIALS] GET endpoint called - data should be fetched from Supabase')

    return NextResponse.json({
      memorials: [],
      message: 'Memorials data should be fetched from Supabase. Update this endpoint to use Supabase client.'
    })
  } catch (error) {
    console.error('Error in /api/memorials:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
