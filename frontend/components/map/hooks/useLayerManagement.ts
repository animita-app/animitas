import { useState, useEffect } from 'react'
import mapboxgl from 'mapbox-gl'
import { Layer, INITIAL_LAYERS } from '../../paywall/types'

interface UseLayerManagementProps {
  map: mapboxgl.Map | null
  setActiveLayers: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
}

export function useLayerManagement({ map, setActiveLayers }: UseLayerManagementProps) {
  const [layers, setLayers] = useState<Layer[]>(INITIAL_LAYERS)
  const [elements, setElements] = useState<Layer[]>([])
  const [selectedLayer, setSelectedLayer] = useState<Layer | null>(null)

  // Load/Save Layers
  useEffect(() => {
    const savedLayers = localStorage.getItem('animita-layers')
    if (savedLayers) {
      try {
        const parsed = JSON.parse(savedLayers)
        const merged = INITIAL_LAYERS.map(initLayer => {
          const saved = parsed.find((l: Layer) => l.id === initLayer.id)
          return saved ? { ...initLayer, ...saved } : initLayer
        })
        setLayers(merged)
      } catch (e) {
        console.error('Failed to parse saved layers', e)
        setLayers(INITIAL_LAYERS)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('animita-layers', JSON.stringify(layers))
  }, [layers])

  const getHeatmapGradient = (name: string) => {
    switch (name) {
      case 'green-red':
        return [
          'interpolate',
          ['linear'],
          ['heatmap-density'],
          0, 'rgba(0,255,0,0)',
          0.2, 'rgb(0,255,0)',
          0.5, 'rgb(255,255,0)',
          1, 'rgb(255,0,0)'
        ]
      case 'blue-purple':
        return [
          'interpolate',
          ['linear'],
          ['heatmap-density'],
          0, 'rgba(0,0,255,0)',
          0.2, 'rgb(0,0,255)',
          0.5, 'rgb(128,0,128)',
          1, 'rgb(255,0,255)'
        ]
      case 'magma':
        return [
          'interpolate',
          ['linear'],
          ['heatmap-density'],
          0, 'rgba(0,0,0,0)',
          0.2, 'rgb(0,0,0)',
          0.5, 'rgb(255,0,0)',
          1, 'rgb(255,255,0)'
        ]
      default: // default blue-red
        return [
          'interpolate',
          ['linear'],
          ['heatmap-density'],
          0, 'rgba(33,102,172,0)',
          0.2, 'rgb(103,169,207)',
          0.4, 'rgb(209,229,240)',
          0.6, 'rgb(253,219,199)',
          0.8, 'rgb(239,138,98)',
          1, 'rgb(178,24,43)'
        ]
    }
  }

  const handleLayerColorChange = (id: string, color: string) => {
    if (!map) return

    // Update point layers
    if (map.getLayer(`${id}-inner`)) {
      map.setPaintProperty(`${id}-inner`, 'circle-color', color)
    }
    if (map.getLayer(`${id}-outer`)) {
      map.setPaintProperty(`${id}-outer`, 'circle-stroke-color', color)
    }

    // Update line layers
    if (map.getLayer(id) && (map.getLayer(id) as any).type === 'line') {
      map.setPaintProperty(id, 'line-color', color)
    }

    // Update polygon layers
    if (map.getLayer(`${id}-poly`)) {
      map.setPaintProperty(`${id}-poly`, 'fill-color', color)
      map.setPaintProperty(`${id}-poly`, 'fill-outline-color', color)
    }
  }

  const handleLayerVisibilityChange = (id: string, isElement: boolean) => {
    if (isElement) {
      const element = elements.find(e => e.id === id)
      if (element) {
        const newVisibility = !element.visible
        setElements(prev => prev.map(e => e.id === id ? { ...e, visible: newVisibility } : e))

        if (map && map.getLayer(id)) {
          map.setLayoutProperty(id, 'visibility', newVisibility ? 'visible' : 'none')
        }
        if (map && map.getLayer(`${id}-fill`)) {
          map.setLayoutProperty(`${id}-fill`, 'visibility', newVisibility ? 'visible' : 'none')
        }
        if (map && map.getLayer(`${id}-outline`)) {
          map.setLayoutProperty(`${id}-outline`, 'visibility', newVisibility ? 'visible' : 'none')
        }
      }
    } else {
      const layer = layers.find(l => l.id === id)
      if (layer) {
        const newVisibility = !layer.visible
        setLayers(prev => prev.map(l => l.id === id ? { ...l, visible: newVisibility } : l))

        if (map && map.getLayer(id)) {
          map.setLayoutProperty(id, 'visibility', newVisibility ? 'visible' : 'none')
        }

        const contextLayers = [
          'churches', 'cemeteries', 'bars',
          'highways', 'urban_streets', 'traffic_lights',
          'hospitals', 'police', 'fire_station', 'schools', 'universities',
          'critical_points'
        ]

        if (contextLayers.includes(id)) {
          setActiveLayers(prev => ({ ...prev, [id]: newVisibility }))
        }

        if (['highways', 'urban_streets'].includes(id)) {
          if (map && map.getLayer(id)) {
            map.setLayoutProperty(id, 'visibility', newVisibility ? 'visible' : 'none')
          }
        } else if (id === 'critical_points') {
          if (map && map.getLayer(`${id}-heatmap`)) {
            map.setLayoutProperty(`${id}-heatmap`, 'visibility', newVisibility ? 'visible' : 'none')
          }
        } else {
          if (map && map.getLayer(`${id}-outer`)) {
            map.setLayoutProperty(`${id}-outer`, 'visibility', newVisibility ? 'visible' : 'none')
          }
          if (map && map.getLayer(`${id}-inner`)) {
            map.setLayoutProperty(`${id}-inner`, 'visibility', newVisibility ? 'visible' : 'none')
          }
          if (map && map.getLayer(`${id}-poly`)) {
            map.setLayoutProperty(`${id}-poly`, 'visibility', newVisibility ? 'visible' : 'none')
          }
        }

        if (id === 'animitas') {
          setActiveLayers(prev => ({ ...prev, animitas: newVisibility }))
        }
      }
    }
  }

  const handleLayerUpdate = (updatedLayer: Layer) => {
    if (updatedLayer.source === 'search') {
      setElements(prev => prev.map(e => e.id === updatedLayer.id ? updatedLayer : e))
    } else {
      setLayers(prev => prev.map(l => l.id === updatedLayer.id ? updatedLayer : l))
    }
    setSelectedLayer(updatedLayer)

    handleLayerColorChange(updatedLayer.id, updatedLayer.color)

    if (updatedLayer.geometry === 'heatmap' && map) {
      const gradient = getHeatmapGradient(updatedLayer.gradient || 'default')
      if (map.getLayer(`${updatedLayer.id}-heatmap`)) {
        map.setPaintProperty(`${updatedLayer.id}-heatmap`, 'heatmap-color', gradient as any)
      }
    }
  }

  const handleLayerSelect = (layer: Layer) => {
    setSelectedLayer(layer)
  }

  return {
    layers,
    setLayers,
    elements,
    setElements,
    selectedLayer,
    setSelectedLayer,
    handleLayerVisibilityChange,
    handleLayerUpdate,
    handleLayerSelect
  }
}
