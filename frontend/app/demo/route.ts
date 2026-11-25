import { NextResponse, type NextRequest } from 'next/server'
import { DEMO_COOKIE } from '@/lib/demo/flag'

// /demo turns demo mode on and lands on the map; /demo?reiniciar starts a clean demo; /demo?salir leaves.
// Only on a development server.
export function GET(request: NextRequest) {
  if (process.env.NODE_ENV !== 'development') return new NextResponse(null, { status: 404 })
  const params = request.nextUrl.searchParams
  // Back to the map at the address the visitor typed (localhost or a LAN IP). Bound to 0.0.0.0, the dev
  // server reports that as its own host, which would land the visitor on another origin without the cookie.
  const host = request.headers.get('host') ?? request.nextUrl.host
  const response = NextResponse.redirect(new URL('/map', `${request.nextUrl.protocol}//${host}`))
  if (params.has('salir')) {
    response.cookies.delete(DEMO_COOKIE)
    return response
  }
  const current = request.cookies.get(DEMO_COOKIE)?.value
  const session = current && !params.has('reiniciar') ? current : Date.now().toString(36)
  response.cookies.set(DEMO_COOKIE, session, { path: '/', maxAge: 60 * 60 * 24 * 30, sameSite: 'lax' })
  return response
}
