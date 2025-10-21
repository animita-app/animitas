import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const publicRoutes = ['/auth', '/api/auth/register', '/api/auth/send-code', '/api/auth/check-phone', '/api/auth/check-username']
const authRoutes = ['/auth']
const protectedRoutes = ['/create-memorial']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  const isPublicRoute = publicRoutes.includes(pathname)
  const isAuthRoute = authRoutes.includes(pathname)

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (isAuthRoute) {
    if (session) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return supabaseResponse
  }

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )

  if (!session && isProtectedRoute) {
    let callbackUrl = pathname
    if (request.nextUrl.search) {
      callbackUrl += request.nextUrl.search
    }
    const encodedCallbackUrl = encodeURIComponent(callbackUrl)
    return NextResponse.redirect(new URL(`/auth?callbackUrl=${encodedCallbackUrl}`, request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg).*)',
  ],
}
