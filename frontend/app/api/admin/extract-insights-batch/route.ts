import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const supabase = createAdminClient()

    const { data: sites, error } = await supabase
      .from('heritage_sites')
      .select('id, title, story')
      .is('insights', null)
      .not('story', 'is', null)

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch sites', details: error },
        { status: 400 }
      )
    }

    if (!sites || sites.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No sites with null insights found',
        processedCount: 0,
        results: [],
      })
    }

    const results = []
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    for (const site of sites) {
      try {
        const response = await fetch(`${baseUrl}/api/extract-insights`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            story: site.story,
            title: site.title,
          }),
        })

        if (!response.ok) {
          results.push({
            siteId: site.id,
            status: 'error',
            error: `API returned ${response.status}`,
          })
          continue
        }

        const { insights } = await response.json()

        const { error: updateError } = await supabase
          .from('heritage_sites')
          .update({ insights })
          .eq('id', site.id)

        if (updateError) {
          results.push({
            siteId: site.id,
            status: 'error',
            error: `Failed to update: ${updateError.message}`,
          })
          continue
        }

        results.push({
          siteId: site.id,
          status: 'success',
          insights,
        })
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        results.push({
          siteId: site.id,
          status: 'error',
          error: message,
        })
      }
    }

    const successCount = results.filter((r) => r.status === 'success').length
    const errorCount = results.filter((r) => r.status === 'error').length

    return NextResponse.json({
      success: true,
      processedCount: sites.length,
      successCount,
      errorCount,
      results,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Failed to process batch: ${message}` },
      { status: 500 }
    )
  }
}
