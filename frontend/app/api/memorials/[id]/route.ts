import { NextResponse } from 'next/server'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  console.log('[MEMORIAL-BY-ID] GET endpoint called for memorial', id)

  return NextResponse.json({
    error: 'Prisma removed - implement using Supabase',
    memorial: null
  }, { status: 501 })
}
