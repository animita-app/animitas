import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { supabaseAdmin } from '@/lib/supabase'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { phone, displayName, username, image, code } =
      await request.json()

    console.log('[COMPLETE-SIGNUP] Request received:', {
      phone,
      displayName,
      username: username || 'not provided',
      image: image ? 'provided' : 'not provided',
      code: code ? '***' : 'missing',
    })

    if (!phone || !displayName || !code) {
      return NextResponse.json(
        { error: 'Missing required fields: phone, displayName, code' },
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

    console.log('[COMPLETE-SIGNUP] Creating auth user with Supabase')
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: phone,
      password: code,
      user_metadata: {
        displayName,
        username: username || null,
        image: image || null,
        phone,
      },
    })

    console.log('[COMPLETE-SIGNUP] Supabase response:', {
      userId: authUser.user?.id,
      error: authError,
    })

    if (authError || !authUser.user) {
      console.error('[COMPLETE-SIGNUP] Auth creation failed:', {
        error: authError,
        user: authUser.user ? 'exists' : 'missing',
      })
      return NextResponse.json(
        { error: authError?.message || 'Failed to create auth user' },
        { status: 500 }
      )
    }

    console.log('[COMPLETE-SIGNUP] Upserting user in database')
    const user = await prisma.user.upsert({
      where: { phone },
      update: {
        displayName,
        username: username || undefined,
        image: image || undefined,
        email: phone,
      },
      create: {
        id: authUser.user.id,
        phone,
        displayName,
        username: username || undefined,
        image: image || undefined,
        email: phone,
      },
    })

    console.log('[COMPLETE-SIGNUP] User successfully created:', {
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
        image: user.image,
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
