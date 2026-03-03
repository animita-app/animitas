"use client"

import React, { createContext, useContext, useState, ReactNode, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { User, UserRole, ROLES } from '@/types/roles'
import { createClient } from '@/lib/supabase/client'

interface UserContextType {
  currentUser: User | null
  role: UserRole
  setUser: (user: User | null) => void
  setRole: (role: UserRole) => void
  isLoading: boolean
  researchMode: boolean
  setResearchMode: (enabled: boolean) => void
  isAuthenticated: boolean
  isEditor: boolean
  isSuperadmin: boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

function UrlRoleSynchronizer() {
  const searchParams = useSearchParams()
  const { role, setRole } = useUser()

  useEffect(() => {
    const roleParam = searchParams.get('role')
    if (roleParam && Object.values(ROLES).includes(roleParam as UserRole) && role !== roleParam) {
      setRole(roleParam as UserRole)
    }
  }, [searchParams, setRole, role])

  return null
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [role, setRoleState] = useState<UserRole>(ROLES.DEFAULT)
  const [isLoading, setIsLoading] = useState(true)
  const [researchMode, setResearchMode] = useState(false)

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

    if (typeof window !== 'undefined') {
      const savedResearchMode = localStorage.getItem('research_mode') === 'true'
      setResearchMode(savedResearchMode)
    }

    return () => subscription.unsubscribe()
  }, [])

  const setRole = async (newRole: UserRole) => {
    if (!currentUser) return
    const supabase = createClient()
    const { error } = await supabase
      .from('user_profiles')
      .update({ role: newRole })
      .eq('id', currentUser.id)

    if (!error) {
      setRoleState(newRole)
      setCurrentUser(prev => prev ? { ...prev, role: newRole } : null)
    }
  }

  const handleSetResearchMode = (enabled: boolean) => {
    setResearchMode(enabled)
    if (typeof window !== 'undefined') {
      localStorage.setItem('research_mode', String(enabled))
    }
  }

  return (
    <UserContext.Provider value={{
      currentUser,
      role,
      setUser: setCurrentUser,
      setRole,
      isLoading,
      researchMode,
      setResearchMode: handleSetResearchMode,
      isAuthenticated: !!currentUser,
      isEditor: role === 'editor' || role === 'superadmin',
      isSuperadmin: role === 'superadmin',
    }}>

      <Suspense fallback={null}>
        <UrlRoleSynchronizer />
      </Suspense>
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
