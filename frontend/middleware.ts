import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Routes that require specific roles
const PROTECTED_ROUTES: { prefix: string; minRole: string }[] = [
  { prefix: '/admin', minRole: 'superadmin' },
  { prefix: '/editor', minRole: 'editor' },
]

// Routes that require any authenticated user
const AUTH_REQUIRED_ROUTES = ['/add']

const ROLE_HIERARCHY: Record<string, number> = {
  default: 0,
  editor: 1,
  superadmin: 2,
}

export async function middleware(request: NextRequest) {
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
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refreshing the auth token
  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  // Check if route requires authentication
  const needsAuth = AUTH_REQUIRED_ROUTES.some(r => pathname.startsWith(r)) ||
    pathname.includes('/edit')

  // Check if route requires a specific role
  const protectedRoute = PROTECTED_ROUTES.find(r => pathname.startsWith(r.prefix))

  if (needsAuth || protectedRoute) {
    if (!user) {
      // Redirect unauthenticated users to login
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = '/login'
      loginUrl.searchParams.set('next', pathname)
      return NextResponse.redirect(loginUrl)
    }

    if (protectedRoute) {
      // Check role from profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      const userLevel = ROLE_HIERARCHY[profile?.role ?? 'default'] ?? 0
      const requiredLevel = ROLE_HIERARCHY[protectedRoute.minRole] ?? 0

      if (userLevel < requiredLevel) {
        // Redirect unauthorized users to home
        const homeUrl = request.nextUrl.clone()
        homeUrl.pathname = '/'
        return NextResponse.redirect(homeUrl)
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
