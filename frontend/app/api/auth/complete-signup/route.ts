import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { supabase } from '@/lib/supabase'
import { cookies } from 'next/headers'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { phone, displayName, username } = await request.json()

    console.log('[COMPLETE-SIGNUP] Request received:', {
      phone,
      displayName,
      username: username || 'not provided',
    })

    if (!phone || !displayName) {
      return NextResponse.json(
        { error: 'Missing required fields: phone, displayName' },
        { status: 400 }
      )
    }

    if (username) {
      console.log('[COMPLETE-SIGNUP] Checking if username exists:', username)
      const existingUsername = await prisma.user.findUnique({
        where: { username },
      })

      if (existingUsername) {
        console.log('[COMPLETE-SIGNUP] Username already taken:', username)
        return NextResponse.json(
          { error: 'Username already taken' },
          { status: 409 }
        )
      }
    }

    console.log('[COMPLETE-SIGNUP] Getting authenticated session')
    const cookieStore = await cookies()
    const supabaseClient = supabase

    const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession()

    console.log('[COMPLETE-SIGNUP] Session response:', {
      userId: session?.user?.id,
      phone: session?.user?.phone,
      error: sessionError,
    })

    if (sessionError || !session?.user) {
      console.error('[COMPLETE-SIGNUP] Failed to get session:', sessionError)
      return NextResponse.json(
        { error: 'Failed to get authenticated session' },
        { status: 401 }
      )
    }

    const authUser = session.user

    console.log('[COMPLETE-SIGNUP] Upserting user in database')
    const user = await prisma.user.upsert({
      where: { phone },
      update: {
        displayName,
        username: username || undefined,
      },
      create: {
        id: authUser.id,
        phone,
        displayName,
        username: username || undefined,
      },
    })

    console.log('[COMPLETE-SIGNUP] User successfully updated/created:', {
      id: user.id,
      phone: user.phone,
      username: user.username,
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        phone: user.phone,
        displayName: user.displayName,
        username: user.username,
      },
    })
  } catch (error) {
    console.error('Error in /api/auth/complete-signup:', error)
    return NextResponse.json(
      { error: 'Failed to complete signup' },
      { status: 500 }
    )
  }
}
