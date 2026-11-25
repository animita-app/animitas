'use client'

import { animitaHref } from '@/lib/routes'
import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import { Animita } from '@/types/animita'
import { MapMarker } from '../map-marker'
import { CutoutText } from '@/components/cutout-text'
import { cn } from '@/lib/utils'

// Mapbox can't read CSS variables. Ballpoint blue, the pen someone circles a place with on a paper map.
const PEN_INK = '#1f3a8f'
const MARK = 'pen-mark'

// A little seeded randomness, so each count is always drawn the same way but no two look alike.
function rng(seed: number) {
  let t = seed + 0x6d2b79f5
  return () => {
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

type Pt = [number, number]

// One ballpoint stroke, shaken once so every layer drawn from it lines up: the crisp line with ink pooled
// where the pen landed and lifted, and the bleed that soaks around it.
interface Stroke { pts: Pt[]; width: number; blobs: [number, number] }

function shake(pts: Pt[], width: number, rand: () => number): Stroke {
  return {
    pts: pts.map(([x, y]): Pt => [x + (rand() - 0.5) * width * 0.6, y + (rand() - 0.5) * width * 0.6]),
    width,
    blobs: [width * (0.7 + rand() * 0.4), width * (0.7 + rand() * 0.4)],
  }
}

function trace(ctx: CanvasRenderingContext2D, pts: Pt[]) {
  ctx.beginPath()
  ctx.moveTo(...pts[0])
  for (let i = 1; i < pts.length - 1; i++) {
    const [x, y] = pts[i]
    const [nx, ny] = pts[i + 1]
    ctx.quadraticCurveTo(x, y, (x + nx) / 2, (y + ny) / 2)
  }
  ctx.lineTo(...pts[pts.length - 1])
}

function drawCrisp(ctx: CanvasRenderingContext2D, { pts, width, blobs }: Stroke) {
  ctx.lineCap = ctx.lineJoin = 'round'
  ctx.strokeStyle = ctx.fillStyle = PEN_INK
  ctx.globalAlpha = 0.9
  ctx.lineWidth = width
  trace(ctx, pts)
  ctx.stroke()
  ctx.globalAlpha = 0.85
  ;[pts[0], pts[pts.length - 1]].forEach(([x, y], i) => {
    ctx.beginPath()
    ctx.arc(x, y, blobs[i], 0, Math.PI * 2)
    ctx.fill()
  })
  ctx.globalAlpha = 1
}

// The bleed is drawn a few times, each soaked a little differently: the map eases between them so the
// ink seems to keep spreading into the paper.
function drawBleed(ctx: CanvasRenderingContext2D, { pts, width }: Stroke, rand: () => number) {
  const soak = 0.5 + rand() * 0.7
  const drift = (): Pt => [(rand() - 0.5) * width * 0.9, (rand() - 0.5) * width * 0.9]
  ctx.save()
  ctx.lineCap = ctx.lineJoin = 'round'
  ctx.strokeStyle = PEN_INK
  ctx.filter = `blur(${width * soak}px)`
  ctx.globalAlpha = 0.26 + rand() * 0.14
  ctx.lineWidth = width * (1.5 + soak * 0.6)
  const [dx, dy] = drift()
  trace(ctx, pts.map(([x, y]): Pt => [x + dx + (rand() - 0.5) * width * 0.5, y + dy + (rand() - 0.5) * width * 0.5]))
  ctx.stroke()
  ctx.restore()
}

const BLEED_FRAMES = 4

// A pen drawing the map can animate: the crisp ink stays put and the bleed under it slowly morphs.
// Every channel is the same blue, so composing is only adding alpha.
class InkImage {
  width: number
  height: number
  data: Uint8Array
  private crisp: Uint8ClampedArray
  private bleeds: Uint8ClampedArray[]
  private phase: number
  private frame = -1

  constructor(size: number, draw: (ctx: CanvasRenderingContext2D) => Stroke[], dots: (ctx: CanvasRenderingContext2D) => void, seed: number) {
    this.width = this.height = size
    const layer = (paint: (ctx: CanvasRenderingContext2D) => void) => {
      const { ctx } = canvasFor(size)
      paint(ctx)
      return ctx.getImageData(0, 0, size, size).data
    }
    let strokes: Stroke[] = []
    this.crisp = layer(ctx => { strokes = draw(ctx); strokes.forEach(st => drawCrisp(ctx, st)); dots(ctx) })
    const rand = rng(seed * 31 + 5)
    this.bleeds = Array.from({ length: BLEED_FRAMES }, () => layer(ctx => strokes.forEach(st => drawBleed(ctx, st, rand))))
    this.phase = rand() * BLEED_FRAMES
    this.data = new Uint8Array(size * size * 4)
    this.compose(this.phase)
  }

  private compose(t: number) {
    const k = Math.floor(t) % BLEED_FRAMES
    const a = this.bleeds[k]
    const b = this.bleeds[(k + 1) % BLEED_FRAMES]
    const f = t - Math.floor(t)
    const w = f * f * (3 - 2 * f)
    const [r, g, bl] = [1, 3, 5].map(i => parseInt(PEN_INK.slice(i, i + 2), 16))
    const out = this.data
    for (let i = 0; i < out.length; i += 4) {
      const ca = this.crisp[i + 3] / 255
      const ba = (a[i + 3] * (1 - w) + b[i + 3] * w) / 255
      out[i] = r
      out[i + 1] = g
      out[i + 2] = bl
      out[i + 3] = Math.round((ca + ba * (1 - ca)) * 255)
    }
  }

  // Called by the map before it paints; only recomposes when the bleed has moved on a step.
  render() {
    if (stillInk()) return false
    const t = performance.now() / INK_CYCLE_MS * BLEED_FRAMES + this.phase
    const frame = Math.floor(t * 20)
    if (frame === this.frame) return false
    this.frame = frame
    this.compose(t)
    return true
  }
}

const stillInk = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

// One full round of the bleed's slow breathing, and how often the map repaints to show it.
const INK_CYCLE_MS = 9000
const INK_TICK_MS = 120

// A loop drawn freehand: it starts somewhere, goes round a bit more than once and doesn't meet itself.
function loop(cx: number, cy: number, r: number, rand: () => number): Pt[] {
  const start = rand() * Math.PI * 2
  const turn = Math.PI * 2 * (1.08 + rand() * 0.22)
  const squash = 0.9 + rand() * 0.15
  const steps = 28
  return Array.from({ length: steps + 1 }, (_, i) => {
    const a = start + (turn * i) / steps
    const drift = 1 + (i / steps) * (rand() * 0.08 - 0.02)
    return [cx + Math.cos(a) * r * drift, cy + Math.sin(a) * r * squash * drift] as Pt
  })
}

// Single-stroke handwritten digits on a 10 × 16 grid.
const DIGIT_STROKES: Record<string, Pt[]> = {
  1: [[4.2, 3], [6, 1], [6, 15]],
  2: [[1, 5], [3, 1.5], [7, 1], [9, 4], [8, 7], [1, 15], [9.5, 14.5]],
  3: [[1, 3], [5, 1], [8.5, 3], [7.5, 6.5], [4, 7.8], [8.5, 9.5], [9, 13], [5, 15.5], [1, 13.5]],
  4: [[7, 15], [7, 1], [0.5, 11], [9.5, 11]],
  5: [[9, 1.2], [2, 1.5], [1.5, 7], [5, 6], [8.5, 8], [9, 12], [5.5, 15.5], [1, 13.5]],
  6: [[8, 1.5], [4, 3], [1.5, 8], [1.5, 12], [4, 15.3], [7.5, 14.5], [8.8, 11], [6.5, 8], [3, 8.5], [1.5, 11]],
  7: [[1, 1.5], [9.5, 1], [4.5, 15]],
  8: [[5, 7.8], [8, 5], [8, 2.5], [5, 1], [2, 2.5], [2, 5], [5, 7.8], [8.8, 11], [8, 14.5], [5, 15.5], [2, 14.5], [1.2, 11], [5, 7.8]],
  9: [[8.5, 6], [6, 8], [2.5, 7], [1.5, 4], [4, 1], [7.5, 1.5], [8.8, 5], [8, 11], [5, 15.5]],
  0: Array.from({ length: 19 }, (_, i): Pt => {
    const a = -Math.PI / 2 - 0.3 + (i / 18) * (Math.PI * 2 + 0.5)
    return [5 + Math.cos(a) * 4, 8 + Math.sin(a) * 7]
  }),
}

function canvasFor(size: number) {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  return { canvas, ctx: canvas.getContext('2d')! }
}

// A cluster: the count written by hand and circled, like marking a spot on a printed map.
function circledCount(count: string) {
  const seed = Number(count) * 97 + 13
  const rand = rng(seed)
  const digitH = 26
  const digitW = digitH * 0.62
  const textW = count.length * digitW + (count.length - 1) * 3
  const r = Math.max(textW, digitH) / 2 + 12 + Math.min(Number(count), 40) * 0.25
  const size = Math.ceil((r + 10) * 2)
  const c = size / 2
  const tilt = (rand() - 0.5) * 0.18
  const ring = shake(loop(c, c, r, rand), 2.4, rand)
  const digits = count.split('').map((d, i) => {
    const x0 = -textW / 2 + i * (digitW + 3)
    const pts = DIGIT_STROKES[d].map(([x, y]): Pt => {
      const px = x0 + (x / 10) * digitW
      const py = -digitH / 2 + (y / 16) * digitH + (rand() - 0.5) * 2
      return [c + px * Math.cos(tilt) - py * Math.sin(tilt), c + px * Math.sin(tilt) + py * Math.cos(tilt)]
    })
    return shake(pts, 2.6, rand)
  })
  return new InkImage(size, () => [ring, ...digits], () => {}, seed)
}

// A single animita: a small loop with a dot pressed in its middle.
function penMark() {
  const rand = rng(7)
  const size = 40
  const ring = shake(loop(size / 2, size / 2, 12, rand), 2.2, rand)
  return new InkImage(size, () => [ring], ctx => {
    ctx.fillStyle = PEN_INK
    ctx.globalAlpha = 0.9
    ctx.beginPath()
    ctx.arc(size / 2 + 0.5, size / 2 - 0.5, 4, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalAlpha = 1
  }, 7)
}

function addMarks(map: mapboxgl.Map) {
  if (!map.hasImage(MARK)) map.addImage(MARK, penMark(), { pixelRatio: 2 })
}

export interface MarkerLayerProps {
  map: mapboxgl.Map | null
  isMapReady: boolean
  data: any[]
  onSiteClick?: (id: string, feature: mapboxgl.MapboxGeoJSONFeature) => void
  sourceId?: string
  currentZoom: number
  visibleSites: Animita[]
  selectedSite: Animita | null
  onSiteSelect?: (site: Animita | null) => void
}

// Only nearby animitas group, and only until the map is close enough to tell them apart.
const CLUSTER_CONFIG = {
  cluster: true,
  clusterMaxZoom: 12,
  clusterRadius: 26,
}

const POINT_FILTER = ['!', ['has', 'point_count']] as any

export function MarkerLayer({
  map,
  isMapReady,
  data,
  onSiteClick,
  sourceId = 'memorials',
  currentZoom,
  visibleSites,
  selectedSite,
  onSiteSelect,
}: MarkerLayerProps) {
  const isInitialized = useRef(false)
  const [layersReady, setLayersReady] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(selectedSite?.id || null)
  const [lockedId, setLockedId] = useState<string | null>(selectedSite?.id || null)
  const lockedIdRef = useRef<string | null>(lockedId)
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    lockedIdRef.current = lockedId
  }, [lockedId])

  useEffect(() => {
    if (selectedSite?.id) {
      setLockedId(selectedSite.id)
      setActiveId(selectedSite.id)
    }
  }, [selectedSite?.id])

  const cancelClose = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }
  }, [])

  const scheduleClose = useCallback(() => {
    cancelClose()
    hoverTimeoutRef.current = setTimeout(() => {
      setActiveId(lockedIdRef.current)
    }, 300)
  }, [cancelClose])

  // 1. Initialize sources and layers
  useEffect(() => {
    if (!map || !isMapReady || isInitialized.current) return

    if (!map.getSource(sourceId)) {
      map.addSource(sourceId, {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
        promoteId: 'id',
        ...CLUSTER_CONFIG,
      })
    }

    addMarks(map)
    const tilt = ['*', ['-', ['%', ['coalesce', ['get', 'point_count'], ['length', ['to-string', ['get', 'title']]]], 9], 4], 4]

    if (!map.getLayer('clusters')) {
      map.addLayer({
        id: 'clusters',
        type: 'symbol',
        source: sourceId,
        filter: ['has', 'point_count'],
        layout: {
          'icon-image': ['concat', 'count-', ['to-string', ['get', 'point_count']]],
          'icon-allow-overlap': true,
          'icon-size': 1,
        },
      })
    }

    if (!map.getLayer(`${sourceId}-inner`)) {
      map.addLayer({
        id: `${sourceId}-inner`,
        type: 'symbol',
        source: sourceId,
        filter: POINT_FILTER,
        layout: {
          'icon-image': MARK,
          'icon-allow-overlap': true,
          'icon-rotate': tilt as any,
          'icon-size': ['interpolate', ['linear'], ['zoom'], 3, 0.75, 10, 1, 16, 1.4],
        },
      })
    }
    setLayersReady(true)

    isInitialized.current = true
  }, [map, isMapReady, sourceId])

  // Draws each cluster count, by hand, the first time the map needs it.
  useEffect(() => {
    if (!map || !isMapReady) return
    const drawCount = (e: { id: string }) => {
      if (!e.id.startsWith('count-') || map.hasImage(e.id)) return
      map.addImage(e.id, circledCount(e.id.slice(6)), { pixelRatio: 2 })
    }
    map.on('styleimagemissing', drawCount)
    // The bleed only moves when the map repaints; a slow tick keeps it breathing without running the
    // map at full frame rate. With reduced motion the ink stays still.
    const tick = stillInk() ? undefined : setInterval(() => map.triggerRepaint(), INK_TICK_MS)
    return () => {
      map.off('styleimagemissing', drawCount)
      if (tick) clearInterval(tick)
    }
  }, [map, isMapReady])

  // 2. Update point data
  useEffect(() => {
    if (!map || !isMapReady) return
    const source = map.getSource(sourceId) as mapboxgl.GeoJSONSource
    if (!source) return
    source.setData({
      type: 'FeatureCollection',
      features: data.map(site => ({
        type: 'Feature',
        id: site.id,
        geometry: { type: 'Point', coordinates: [site.location.lng, site.location.lat] },
        properties: site,
      })),
    } as any)
  }, [map, isMapReady, data, sourceId])

  // 4. Handle events
  useEffect(() => {
    if (!map || !isMapReady) return

    if (!layersReady) return
    const layersToClick = [`${sourceId}-inner`]

    const onPointClick = (e: mapboxgl.MapMouseEvent & { features?: mapboxgl.MapboxGeoJSONFeature[] }) => {
      e.originalEvent.stopPropagation()
      if (!e.features?.length) return
      const id = e.features[0].properties?.id
      if (id) {
        cancelClose()
        setActiveId(id)
        setLockedId(id)
        onSiteClick?.(id, e.features[0])
      }
    }

    const onPointEnter = (e: mapboxgl.MapMouseEvent & { features?: mapboxgl.MapboxGeoJSONFeature[] }) => {
      if (!e.features?.length) return
      const id = e.features[0].properties?.id
      if (id) {
        cancelClose()
        setActiveId(id)
        map.getCanvas().style.cursor = 'pointer'
      }
    }

    const onPointLeave = () => {
      scheduleClose()
      map.getCanvas().style.cursor = ''
    }

    const onClusterClick = (e: mapboxgl.MapMouseEvent & { features?: mapboxgl.MapboxGeoJSONFeature[] }) => {
      if (!e.features?.length) return
      const clusterId = e.features[0].properties?.cluster_id
      const source = map.getSource(sourceId) as mapboxgl.GeoJSONSource
      source.getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err || zoom == null) return
        map.flyTo({
          center: (e.features![0].geometry as any).coordinates,
          zoom,
          speed: 1.2,
          curve: 1,
          essential: true,
          duration: 500,
        })
      })
    }

    const onClusterEnter = () => { map.getCanvas().style.cursor = 'pointer' }
    const onClusterLeave = () => { map.getCanvas().style.cursor = '' }

    layersToClick.forEach(layerId => {
      if (map.getLayer(layerId)) {
        map.on('click', layerId, onPointClick)
        map.on('mouseenter', layerId, onPointEnter)
        map.on('mouseleave', layerId, onPointLeave)
      }
    })

    if (map.getLayer('clusters')) {
      map.on('click', 'clusters', onClusterClick)
      map.on('mouseenter', 'clusters', onClusterEnter)
      map.on('mouseleave', 'clusters', onClusterLeave)
    }

    return () => {
      layersToClick.forEach(layerId => {
        try {
          if (map.getStyle() && map.getLayer(layerId)) {
            map.off('click', layerId, onPointClick)
            map.off('mouseenter', layerId, onPointEnter)
            map.off('mouseleave', layerId, onPointLeave)
          }
        } catch (_) {}
      })
      try {
        if (map.getStyle() && map.getLayer('clusters')) {
          map.off('click', 'clusters', onClusterClick)
          map.off('mouseenter', 'clusters', onClusterEnter)
          map.off('mouseleave', 'clusters', onClusterLeave)
        }
      } catch (_) {}
    }
  }, [map, isMapReady, layersReady, onSiteClick, sourceId, cancelClose, scheduleClose])

  const sitesToRender = currentZoom >= 10 ? visibleSites : (selectedSite ? [selectedSite] : [])

  return (
    <>
      {map && sitesToRender.map(site => {
        if (!site.location) return null
        const href = animitaHref(site.slug || site.id)
        const isActive = activeId === site.id
        const topValue = 38 + ((Math.min(currentZoom, 22) - 10) * 1.25)

        return (
          <MapMarker
            key={site.id}
            map={map}
            coordinates={[site.location.lng, site.location.lat]}
            className="z-20"
          >
            <div className="flex flex-col items-center overflow-visible">
              <div
                onMouseEnter={cancelClose}
                onMouseLeave={scheduleClose}
                className={cn(
                  'transition-all duration-200 ease-out origin-top',
                  isActive
                    ? 'opacity-100 scale-100 pointer-events-auto'
                    : 'opacity-0 scale-95 pointer-events-none'
                )}
              >
                <Link
                  href={href}
                  prefetch={false}
                  aria-label={site.title || 'Animita'}
                  className="absolute left-1/2 -translate-x-1/2 z-50 flex flex-col items-center"
                  style={{ top: `${topValue}px` }}
                >
                  <span className="flex w-max max-w-72 flex-wrap justify-center gap-x-2 gap-y-1">
                    {(site.title || 'animita').split(/\s+/).map((word, i) => (
                      <CutoutText key={`${word}-${i}`} text={word} height={18} />
                    ))}
                  </span>
                </Link>
              </div>
            </div>
          </MapMarker>
        )
      })}
    </>
  )
}
