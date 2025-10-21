import { NextRequest, NextResponse } from 'next/server'
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

    console.log('[COMPLETE-SIGNUP] Looking up user in Supabase by phone')
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers()

    console.log('[COMPLETE-SIGNUP] List users response:', {
      totalUsers: users?.length,
      error: listError,
    })

    const normalizedPhone = phone.replace(/^\+/, '')
    console.log('[COMPLETE-SIGNUP] Searching for phone:', normalizedPhone, 'original:', phone)

    const supabaseUser = users?.find(u => {
      const authPhone = (u.phone || '').replace(/^\+/, '')
      return authPhone === normalizedPhone
    })

    if (users && users.length > 0) {
      console.log('[COMPLETE-SIGNUP] Available auth users:', users.map(u => ({ id: u.id, phone: u.phone })))
    }

    if (!supabaseUser) {
      console.error('[COMPLETE-SIGNUP] User not found in Supabase')
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const userId = supabaseUser.id

    console.log('[COMPLETE-SIGNUP] Found user:', userId)
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

    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        phone: supabaseUser.phone,
        displayName,
        username: username || null,
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
