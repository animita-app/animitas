import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { image } = await req.json()

  if (!image) {
    return NextResponse.json({ error: 'Image URL is required' }, { status: 400 })
  }

  try {
    await prisma.user.update({
      where: { id: (session.user as any).id },
      data: { image },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to update profile picture', error)
    return NextResponse.json({ error: 'Failed to update profile picture' }, { status: 500 })
  }
}
