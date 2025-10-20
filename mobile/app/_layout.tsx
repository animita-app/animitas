import { useEffect } from 'react'
import { useFonts } from 'expo-font'
import { SplashScreen, Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import FlashMessage from 'react-native-flash-message'

import { useColorScheme } from '@/hooks/useColorScheme'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { LocationProvider } from '@/contexts/LocationContext'
import { OfflineProvider } from '@/contexts/OfflineContext'

// Prevent the splash screen from auto-hiding before asset loading is complete
SplashScreen.preventAutoHideAsync()

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
})

export default function RootLayout() {
  const colorScheme = useColorScheme()
  const [loaded] = useFonts({
    // Load custom fonts here if needed
  })

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync()
    }
  }, [loaded])

  if (!loaded) {
    return null
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LocationProvider>
          <OfflineProvider>
            <Stack
              screenOptions={{
                headerStyle: {
                  backgroundColor: '#e4762f',
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                  fontWeight: 'bold',
                },
              }}
            >
              <Stack.Screen
                name="(tabs)"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="camera"
                options={{
                  title: 'Capturar Animita',
                  presentation: 'modal'
                }}
              />
              <Stack.Screen
                name="animita/[id]"
                options={{
                  title: 'Detalle de Animita',
                  presentation: 'modal'
                }}
              />
              <Stack.Screen
                name="upload"
                options={{
                  title: 'Subir Foto',
                  presentation: 'modal'
                }}
              />
            </Stack>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
            <FlashMessage position="top" />
          </OfflineProvider>
        </LocationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}