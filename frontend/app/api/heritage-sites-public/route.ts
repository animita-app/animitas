import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET() {
  try {

    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('heritage_sites')
      .select('*')
      .eq('status', 'published')

    if (error) {
      console.error('[Heritage Sites API] Error:', error)
      return NextResponse.json({ error: 'Failed to fetch sites', details: error }, { status: 400 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('[Heritage Sites API] Unexpected error:', error)
    return NextResponse.json({ error: 'Unexpected error', details: String(error) }, { status: 500 })
  }
}
