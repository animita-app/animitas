import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET() {
  try {

    const supabase = createAdminClient()

    const [{ data: categories, error: catError }, { data: kinds, error: kindError }] = await Promise.all([
      supabase.from('heritage_categories').select('*').order('sort_order'),
      supabase.from('heritage_kinds').select('*').eq('enabled', true).order('sort_order')
    ])

    if (catError) {
      return NextResponse.json({ error: 'Failed to fetch categories', details: catError }, { status: 400 })
    }

    if (kindError) {
      return NextResponse.json({ error: 'Failed to fetch kinds', details: kindError }, { status: 400 })
    }

    return NextResponse.json({ categories, kinds })
  } catch (error) {
    return NextResponse.json({ error: 'Unexpected error', details: String(error) }, { status: 500 })
  }
}
