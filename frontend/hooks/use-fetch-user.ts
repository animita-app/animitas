import { useEffect, useState } from 'react'

interface UseUserResult {
  user: User | null
  loading: boolean
  error: string | null
}

export function useFetchUser(username: string | null): UseUserResult {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!username) {
      setLoading(false)
      return
    }

    const fetchUser = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`/api/users/${username}`)

        if (!response.ok) {
          throw new Error('Usuario no encontrado')
        }

        const userData = await response.json()
        setUser(userData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading user')
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [username])

  return { user, loading, error }
}
