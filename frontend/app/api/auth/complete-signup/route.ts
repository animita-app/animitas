import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { supabaseAdmin } from '@/lib/supabase'

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

    console.log('[COMPLETE-SIGNUP] Looking up user by phone via admin API')
    const { data: existingAuthUser, error: lookupError } = await supabaseAdmin.auth.admin.getUserByPhoneNumber(phone)

    console.log('[COMPLETE-SIGNUP] User lookup response:', {
      userId: existingAuthUser?.user?.id,
      phone: existingAuthUser?.user?.phone,
      error: lookupError,
    })

    let userId: string

    if (existingAuthUser?.id) {
      console.log('[COMPLETE-SIGNUP] Found existing auth user:', existingAuthUser.id)
      userId = existingAuthUser.id

      console.log('[COMPLETE-SIGNUP] Updating user metadata with displayName and username')
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        user_metadata: {
          displayName,
          username: username || null,
        },
      })

      if (updateError) {
        console.error('[COMPLETE-SIGNUP] Failed to update user metadata:', updateError)
        throw new Error('Failed to update user metadata')
      }
    } else if (lookupError) {
      console.log('[COMPLETE-SIGNUP] User not found, creating new auth user')
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
    } else {
      console.error('[COMPLETE-SIGNUP] Unexpected state: user not found and no lookup error')
      throw new Error('Failed to find or create user')
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
