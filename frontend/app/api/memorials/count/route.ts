import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'

export async function GET() {
  const count = await prisma.memorial.count({
    where: {
      isPublic: true
    }
  })

  return NextResponse.json({ count })
}
