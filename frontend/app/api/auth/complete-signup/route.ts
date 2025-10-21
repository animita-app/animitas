import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { phone, displayName, username } = await request.json()

    if (!phone || !displayName) {
      return NextResponse.json(
        { error: 'Missing required fields: phone, displayName' },
        { status: 400 }
      )
    }

    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers()

    const normalizedPhone = phone.replace(/^\+/, '')

    const supabaseUser = users?.find(u => {
      const authPhone = (u.phone || '').replace(/^\+/, '')
      return authPhone === normalizedPhone
    })

    if (!supabaseUser) {
      console.error('[COMPLETE-SIGNUP] User not found in Supabase')
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const userId = supabaseUser.id

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

    const { error: upsertError } = await supabaseAdmin
      .from('users')
      .upsert({
        id: userId,
        phone: supabaseUser.phone,
        display_name: displayName,
        username: username || null,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'id'
      })

    if (upsertError) {
      console.error('[COMPLETE-SIGNUP] Failed to create/update user profile:', upsertError)
      throw new Error('Failed to create user profile: ' + upsertError.message)
    }

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
