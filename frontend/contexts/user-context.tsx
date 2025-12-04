import React, { createContext, useContext, useState, ReactNode } from 'react'
import { User, UserRole, ROLES } from '@/types/roles'
import { CURRENT_USER } from '@/constants/users'

interface UserContextType {
  currentUser: User | null
  role: UserRole
  setUser: (user: User | null) => void
  setRole: (role: UserRole) => void // For dev/testing purposes
  isLoading: boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  // Mock initial user
  const [currentUser, setCurrentUser] = useState<User | null>(CURRENT_USER)

  const [isLoading, setIsLoading] = useState(false)

  const setRole = (newRole: UserRole) => {
    if (currentUser) {
      setCurrentUser({ ...currentUser, role: newRole })
    }
  }

  return (
    <UserContext.Provider value={{
      currentUser,
      role: currentUser?.role || ROLES.DEFAULT,
      setUser: setCurrentUser,
      setRole,
      isLoading
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
