// Demo mode lets anyone walk the whole app on a local dev server as a signed-in visitor, without an
// account and without writing to the database: everything they do is kept in their own browser.
// It only exists in development; production never reads the cookie.
export const DEMO_COOKIE = 'anima-demo'

export const DEMO_USER = {
  id: '00000000-0000-4000-8000-00000000d3e0',
  display_name: 'Visita',
  username: 'visita',
  image: null as string | null,
  role: 'editor',
}

export function demoSessionFromCookie(value: string | undefined) {
  if (process.env.NODE_ENV !== 'development') return null
  return value ? value : null
}

export function readDemoSession(): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(?:^|; )${DEMO_COOKIE}=([^;]+)`))
  return demoSessionFromCookie(match?.[1])
}

export const isDemo = () => readDemoSession() !== null
