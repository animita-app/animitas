import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { supabase, supabaseAdmin } from '@/lib/supabase'

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

    console.log('[COMPLETE-SIGNUP] Getting authenticated user from Supabase')
    const { data: { user: authUser }, error: authError } = await supabase.auth.admin.getUserById('')

    console.log('[COMPLETE-SIGNUP] Auth user lookup response:', {
      userId: authUser?.id,
      phone: authUser?.phone,
      error: authError,
    })

    let userId: string

    if (authUser?.id) {
      userId = authUser.id
      console.log('[COMPLETE-SIGNUP] Using existing auth user ID:', userId)
    } else {
      console.log('[COMPLETE-SIGNUP] No session user, checking if user exists in Supabase')
      const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers()

      const existingAuthUser = users?.find(u => u.phone === phone)

      if (existingAuthUser) {
        console.log('[COMPLETE-SIGNUP] Found existing auth user:', existingAuthUser.id)
        userId = existingAuthUser.id
      } else {
        console.log('[COMPLETE-SIGNUP] Creating new auth user in Supabase')
        const { data: newAuthUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          phone,
          phone_confirm: true,
          user_metadata: {
            displayName,
            username: username || null,
          },
        })

        console.log('[COMPLETE-SIGNUP] Create user response:', {
          userId: newAuthUser.user?.id,
          error: createError,
        })

        if (createError || !newAuthUser.user?.id) {
          console.error('[COMPLETE-SIGNUP] Failed to create auth user:', createError)
          throw new Error('Failed to create auth user')
        }

        userId = newAuthUser.user.id
      }
    }

    console.log('[COMPLETE-SIGNUP] Upserting user in database')
    const user = await prisma.user.upsert({
      where: { phone },
      update: {
        displayName,
        username: username || undefined,
      },
      create: {
        id: userId,
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
