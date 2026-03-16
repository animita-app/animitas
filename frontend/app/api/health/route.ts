import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const checks = {
      supabase: false,
      environment: false,
    }

    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      checks.environment = true
    }

    try {
      const supabase = await createClient()
      const { data } = await supabase.from('heritage_sites').select('count', { count: 'exact', head: true })
      checks.supabase = true
    } catch {
      checks.supabase = false
    }

    const allHealthy = Object.values(checks).every(Boolean)

    return NextResponse.json(
      {
        status: allHealthy ? 'healthy' : 'degraded',
        checks,
        timestamp: new Date().toISOString(),
      },
      { status: allHealthy ? 200 : 503 }
    )
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: 'Health check failed',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    )
  }
}
