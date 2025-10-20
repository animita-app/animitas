import { createContext, useContext, ReactNode } from 'react'
import { useColorScheme } from '@/hooks/useColorScheme'

export interface Colors {
  primary: string
  primaryDark: string
  secondary: string
  background: string
  surface: string
  text: string
  textSecondary: string
  border: string
  success: string
  warning: string
  error: string
  info: string
}

export interface Theme {
  colors: Colors
  isDark: boolean
}

const lightColors: Colors = {
  primary: '#e4762f',
  primaryDark: '#d55f25',
  secondary: '#6c757d',
  background: '#ffffff',
  surface: '#f8f9fa',
  text: '#212529',
  textSecondary: '#6c757d',
  border: '#dee2e6',
  success: '#28a745',
  warning: '#ffc107',
  error: '#dc3545',
  info: '#17a2b8',
}

const darkColors: Colors = {
  primary: '#e4762f',
  primaryDark: '#d55f25',
  secondary: '#adb5bd',
  background: '#1a1d20',
  surface: '#212529',
  text: '#f8f9fa',
  textSecondary: '#adb5bd',
  border: '#495057',
  success: '#28a745',
  warning: '#ffc107',
  error: '#dc3545',
  info: '#17a2b8',
}

const ThemeContext = createContext<Theme | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'

  const theme: Theme = {
    colors: isDark ? darkColors : lightColors,
    isDark,
  }

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): Theme {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}