import { NextRequest, NextResponse } from 'next/server'
import { sendVerificationSMS } from '@/lib/twilio'
import { prisma } from '@/lib/prisma'

function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber } = await request.json()

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      )
    }

    const code = generateVerificationCode()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

    await prisma.verificationCode.create({
      data: {
        phone: phoneNumber,
        code,
        expiresAt,
      },
    })

    const result = await sendVerificationSMS(phoneNumber, code)

    return NextResponse.json({
      success: true,
      sid: result.sid,
      status: result.status,
    })
  } catch (error) {
    console.error('Send code error:', error)

    return NextResponse.json(
      {
        error: 'Failed to send verification code',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
