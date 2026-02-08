'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Loader2, Camera, MapPin } from 'lucide-react'

export default function StreetViewDetectPage() {
  const [location, setLocation] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  const [results, setResults] = useState<any[]>([])

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!location.trim()) return

    setIsScanning(true)
    // Mock simulation of scanning delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Mock results
    setResults([
      { id: 1, confidence: 0.95, imageUrl: 'https://images.unsplash.com/photo-1596276856038-f860fb8f9219', lat: -33.45, lng: -70.66 },
      { id: 2, confidence: 0.82, imageUrl: 'https://images.unsplash.com/photo-1596276856038-f860fb8f9219', lat: -33.46, lng: -70.67 },
    ])
    setIsScanning(false)
  }

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Detección Automática</h1>
        <p className="text-muted-foreground">
          Utiliza visión por computador para encontrar animitas en Google Street View.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuración de Búsqueda</CardTitle>
          <CardDescription>
            Ingresa una ubicación o coordenadas para comenzar el barrido.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleScan} className="flex gap-4">
            <div className="flex-1 relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Ej: Ruta 68, km 15"
                className="pl-9"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                aria-label="Ubicación de búsqueda"
              />
            </div>
            <Button type="submit" disabled={isScanning}>
              {isScanning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Escaneando...
                </>
              ) : (
                <>
                  <Camera className="mr-2 h-4 w-4" />
                  Iniciar Escaneo
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((result) => (
            <Card key={result.id} className="overflow-hidden">
              <div className="relative aspect-video bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={result.imageUrl}
                  alt={`Detección posible de animita con confianza ${result.confidence}`}
                  className="object-cover w-full h-full"
                />
                <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 text-xs rounded-full">
                  {(result.confidence * 100).toFixed(0)}% Confianza
                </div>
              </div>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {result.lat}, {result.lng}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
