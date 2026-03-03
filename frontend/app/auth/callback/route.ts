import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('username, display_name')
          .eq('id', user.id)
          .maybeSingle()

        if (!profile) {
          const displayName = user.user_metadata?.name || user.email?.split('@')[0] || 'Usuario'
          await supabase.from('user_profiles').insert({
            id: user.id,
            display_name: displayName,
            role: 'default'
          })
          return NextResponse.redirect(`${origin}/auth?onboarding=true`)
        }

        if (!profile.username) {
          return NextResponse.redirect(`${origin}/auth?onboarding=true&step=${profile.display_name ? 'username' : 'name'}`)
        }
      }

      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
