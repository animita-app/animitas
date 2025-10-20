import { useEffect, useState } from 'react'
import { View, StyleSheet, Alert } from 'react-native'
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'
import { router } from 'expo-router'

import { useLocation } from '@/contexts/LocationContext'
import { useAnimitas } from '@/hooks/useAnimitas'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ErrorView } from '@/components/ui/ErrorView'
import { AnimitaMarker } from '@/components/map/AnimitaMarker'
import { MapControls } from '@/components/map/MapControls'
import { FloatingActionButton } from '@/components/ui/FloatingActionButton'
import { useTheme } from '@/contexts/ThemeContext'
import type { Animita } from '@/types/animita'

const SANTIAGO_REGION = {
  latitude: -33.4372,
  longitude: -70.6506,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
}

export default function MapScreen() {
  const { colors } = useTheme()
  const { location, hasPermission, requestPermission } = useLocation()
  const [mapRegion, setMapRegion] = useState(SANTIAGO_REGION)
  const [showUserLocation, setShowUserLocation] = useState(false)

  // Fetch animitas in current region
  const {
    data: animitas,
    isLoading,
    error,
    refetch
  } = useAnimitas({
    bbox: [
      mapRegion.longitude - mapRegion.longitudeDelta,
      mapRegion.latitude - mapRegion.latitudeDelta,
      mapRegion.longitude + mapRegion.longitudeDelta,
      mapRegion.latitude + mapRegion.latitudeDelta,
    ]
  })

  useEffect(() => {
    if (location && hasPermission) {
      setMapRegion({
        ...mapRegion,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      })
      setShowUserLocation(true)
    }
  }, [location, hasPermission])

  const handleLocationRequest = async () => {
    if (!hasPermission) {
      const granted = await requestPermission()
      if (!granted) {
        Alert.alert(
          'Permisos de ubicación',
          'Para mostrar tu ubicación en el mapa, necesitamos acceso a tu ubicación.',
          [{ text: 'OK' }]
        )
      }
    }
  }

  const handleMarkerPress = (animita: Animita) => {
    router.push(`/animita/${animita.id}`)
  }

  const handleCameraPress = () => {
    router.push('/camera')
  }

  const handleRegionChangeComplete = (region: typeof mapRegion) => {
    setMapRegion(region)
    // Refetch animitas when region changes significantly
    refetch()
  }

  if (isLoading && !animitas) {
    return (
      <View style={[styles.container, styles.centered]}>
        <LoadingSpinner size="large" />
      </View>
    )
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ErrorView
          message="Error al cargar las animitas"
          onRetry={() => refetch()}
        />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        region={mapRegion}
        onRegionChangeComplete={handleRegionChangeComplete}
        showsUserLocation={showUserLocation}
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
        loadingEnabled={true}
        loadingIndicatorColor={colors.primary}
        mapType="standard"
      >
        {animitas?.map((animita) => (
          <AnimitaMarker
            key={animita.id}
            animita={animita}
            onPress={() => handleMarkerPress(animita)}
          />
        ))}
      </MapView>

      <MapControls
        onLocationPress={handleLocationRequest}
        onRefreshPress={() => refetch()}
        hasLocationPermission={hasPermission}
        isLoading={isLoading}
      />

      <FloatingActionButton
        icon="camera"
        onPress={handleCameraPress}
        style={styles.fab}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
})