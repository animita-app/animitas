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

    console.log('[COMPLETE-SIGNUP] Looking up user in database by phone')
    const existingDbUser = await prisma.user.findUnique({
      where: { phone },
    })

    console.log('[COMPLETE-SIGNUP] Database user lookup:', {
      userId: existingDbUser?.id,
      phone: existingDbUser?.phone,
    })

    let userId: string

    if (existingDbUser?.id) {
      console.log('[COMPLETE-SIGNUP] Found existing user in database:', existingDbUser.id)
      userId = existingDbUser.id

      console.log('[COMPLETE-SIGNUP] Updating user metadata in Supabase with displayName and username')
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

      console.log('[COMPLETE-SIGNUP] User metadata updated successfully')
    } else {
      console.log('[COMPLETE-SIGNUP] User not found in database, skipping auth metadata update')
      console.log('[COMPLETE-SIGNUP] Will create/update user in database in next step')
      userId = ''
    }

    if (!userId) {
      console.log('[COMPLETE-SIGNUP] No userId found, attempting to get from Supabase')
      const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers()

      const supabaseUser = users?.find(u => u.phone === phone)

      if (supabaseUser?.id) {
        console.log('[COMPLETE-SIGNUP] Found user in Supabase:', supabaseUser.id)
        userId = supabaseUser.id
      } else {
        console.error('[COMPLETE-SIGNUP] Could not find user ID in Supabase or database')
        throw new Error('Could not find user ID')
      }
    }

    console.log('[COMPLETE-SIGNUP] Upserting user in database with userId:', userId)
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
    console.error('[COMPLETE-SIGNUP] Error:', error)
    console.error('[COMPLETE-SIGNUP] Error message:', error instanceof Error ? error.message : String(error))
    console.error('[COMPLETE-SIGNUP] Error stack:', error instanceof Error ? error.stack : 'no stack')
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to complete signup' },
      { status: 500 }
    )
  }
}
