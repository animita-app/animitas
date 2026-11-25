import { createBrowserClient } from '@supabase/ssr'
import { isDemo } from '@/lib/demo/flag'
import { createDemoClient } from '@/lib/demo/client'

export const createClient = () => {
  const client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  return isDemo() ? createDemoClient(client) : client
}
