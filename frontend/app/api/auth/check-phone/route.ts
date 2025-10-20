import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json()

    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { phone },
    })

    return NextResponse.json({
      exists: !!user,
    })
  } catch (error) {
    console.error('Check phone error:', error)
    return NextResponse.json({ exists: false })
  }
}
