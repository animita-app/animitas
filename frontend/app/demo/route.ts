import { NextResponse, type NextRequest } from 'next/server'
import { DEMO_COOKIE } from '@/lib/demo/flag'

// /demo turns demo mode on and lands on the map; /demo?reiniciar starts a clean demo; /demo?salir leaves.
// Only on a development server.
export function GET(request: NextRequest) {
  if (process.env.NODE_ENV !== 'development') return new NextResponse(null, { status: 404 })
  const params = request.nextUrl.searchParams
  const response = NextResponse.redirect(new URL('/map', request.url))
  if (params.has('salir')) {
    response.cookies.delete(DEMO_COOKIE)
    return response
  }
  const current = request.cookies.get(DEMO_COOKIE)?.value
  const session = current && !params.has('reiniciar') ? current : Date.now().toString(36)
  response.cookies.set(DEMO_COOKIE, session, { path: '/', maxAge: 60 * 60 * 24 * 30, sameSite: 'lax' })
  return response
}
