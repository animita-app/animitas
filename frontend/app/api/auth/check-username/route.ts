import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
    console.error('Check username error:', error)
    return NextResponse.json({ taken: false })
  }
}
