"use client"

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { User, UserRole, ROLES } from '@/types/roles'
import { createClient } from '@/lib/supabase/client'

interface UserContextType {
  currentUser: User | null
  role: UserRole
  setUser: (user: User | null) => void
  isLoading: boolean
  isAuthenticated: boolean
  isEditor: boolean
  isSuperadmin: boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [role, setRoleState] = useState<UserRole>(ROLES.DEFAULT)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    const fetchUserProfile = async (userId: string) => {
      try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 5000)

        const { data, error } = await supabase
          .from('user_profiles')
          .select('id, display_name, username, image, role')
          .eq('id', userId)
          .single()

        clearTimeout(timeout)

        if (error) throw error
        if (data) {
          setRoleState(data.role as UserRole)
          setCurrentUser({
            id: data.id,
            name: data.display_name || 'Usuario',
            email: '',
            role: data.role as UserRole,
            username: data.username,
            avatarUrl: data.image
          })
        }
      } catch (err) {
        setCurrentUser(null)
        setRoleState(ROLES.DEFAULT)
      }
      setIsLoading(false)
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user.id)
      } else {
        setCurrentUser(null)
        setRoleState(ROLES.DEFAULT)
        setIsLoading(false)
      }
    }).catch(() => {
      setIsLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        fetchUserProfile(session.user.id)
      } else {
        setCurrentUser(null)
        setRoleState(ROLES.DEFAULT)
        setIsLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <UserContext.Provider value={{
      currentUser,
      role,
      setUser: setCurrentUser,
      isLoading,
      isAuthenticated: !!currentUser,
      isEditor: role === 'editor' || role === 'superadmin',
      isSuperadmin: role === 'superadmin',
    }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
