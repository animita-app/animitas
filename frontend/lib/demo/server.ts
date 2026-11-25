import { cookies } from 'next/headers'
import { DEMO_COOKIE, demoSessionFromCookie } from './flag'

export async function isDemoServer() {
  const store = await cookies()
  return demoSessionFromCookie(store.get(DEMO_COOKIE)?.value) !== null
}
