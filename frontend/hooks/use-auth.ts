import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Session, User } from '@supabase/supabase-js'

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const getSession = async () => {
      try {
        const {
          data: { session },
          error: err,
        } = await supabase.auth.getSession()

        if (err) throw err

        setSession(session)
        setUser(session?.user || null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setLoading(false)
      }
    }

    getSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      setUser(session?.user || null)
    })

    return () => subscription?.unsubscribe()
  }, [])

  return {
    session,
    user,
    loading,
    error,
    isAuthenticated: !!session,
  }
}
