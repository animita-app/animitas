"use client"

import React, { createContext, useContext, useState, ReactNode, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { User, UserRole, ROLES } from '@/types/roles'

interface UserContextType {
  currentUser: User | null
  role: UserRole
  setUser: (user: User | null) => void
  setRole: (role: UserRole) => void // For dev/testing purposes
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
    if (
      roleParam &&
      Object.values(ROLES).includes(roleParam as UserRole) &&
      role !== roleParam
    ) {
      setRole(roleParam as UserRole)
    }
  }, [searchParams, setRole, role])

  return null
}

import { createClient } from '@/lib/supabase/client'

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [role, setRoleState] = useState<UserRole>(ROLES.DEFAULT)
  const [isLoading, setIsLoading] = useState(true)
  const [researchMode, setResearchMode] = useState(false)

  const fetchProfile = async (userId: string) => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (data) {
      setRoleState(data.role as UserRole)
      setResearchMode(data.research_mode || false)
      setCurrentUser({
        id: data.id,
        name: data.full_name || 'Usuario',
        email: '', // Not stored in profiles by default
        role: data.role as UserRole,
        avatarUrl: data.avatar_url
      })
    }
  }

  useEffect(() => {
    const supabase = createClient()

    // 1. Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id).finally(() => setIsLoading(false))
      } else {
        setIsLoading(false)
      }
    })

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await fetchProfile(session.user.id)
      } else {
        setCurrentUser(null)
        setRoleState(ROLES.DEFAULT)
        setResearchMode(false)
      }
      setIsLoading(false)
    })

    // 3. Load local research mode preference as fallback
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
      .from('profiles')
      .update({ role: newRole })
      .eq('id', currentUser.id)

    if (!error) {
      setRoleState(newRole)
      setCurrentUser(prev => prev ? { ...prev, role: newRole } : null)
    }
  }

  const handleSetResearchMode = async (enabled: boolean) => {
    setResearchMode(enabled)
    if (typeof window !== 'undefined') {
      localStorage.setItem('research_mode', String(enabled))
    }

    if (currentUser) {
      const supabase = createClient()
      await supabase
        .from('profiles')
        .update({ research_mode: enabled })
        .eq('id', currentUser.id)
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
