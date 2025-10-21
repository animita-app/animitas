import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username')

    if (!username || username.length < 3) {
      return NextResponse.json({ taken: false })
    }

    const existingUser = await prisma.user.findUnique({
      where: { username },
    })

    return NextResponse.json({
      taken: !!existingUser,
    })
  } catch (error) {
    return NextResponse.json({ taken: false })
  }
}
