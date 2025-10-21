import { auth } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

const publicRoutes = ['/auth', '/api/auth/register']
const authRoutes = ['/auth']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const session = await auth()

  const isPublic = publicRoutes.includes(pathname)
  const isAuthRoute = authRoutes.includes(pathname)
  const isApiRoute = pathname.startsWith('/api')

  if (isPublic && !isApiRoute) {
    if (session && isAuthRoute) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return NextResponse.next()
  }

  if (!session && !isPublic && !isApiRoute) {
    const authUrl = new URL('/auth', request.url)
    authUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(authUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg).*)',
  ],
}
