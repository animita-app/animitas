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

// A pen drawing kept as its strokes, so the crisp ink and each version of the bleed line up exactly.
interface Drawing { size: number; strokes: Stroke[]; dot?: [number, number, number]; seed: number }

function paint(size: number, draw: (ctx: CanvasRenderingContext2D) => void) {
  const { ctx } = canvasFor(size)
  draw(ctx)
  return ctx.getImageData(0, 0, size, size)
}

function crispInk({ size, strokes, dot }: Drawing) {
  return paint(size, ctx => {
    strokes.forEach(st => drawCrisp(ctx, st))
    if (!dot) return
    ctx.fillStyle = PEN_INK
    ctx.globalAlpha = 0.9
    ctx.beginPath()
    ctx.arc(dot[0], dot[1], dot[2], 0, Math.PI * 2)
    ctx.fill()
    ctx.globalAlpha = 1
  })
}

// Two soaks of the same ink: the map fades between them so the bleed seems to keep spreading.
function bleedInk({ size, strokes, seed }: Drawing, version: string) {
  const rand = rng(seed * 31 + (version === 'a' ? 5 : 11))
  return paint(size, ctx => strokes.forEach(st => drawBleed(ctx, st, rand)))
}

// A cluster: the count written by hand and circled, like marking a spot on a printed map.
function circledCount(count: string): Drawing {
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
  return { size, strokes: [ring, ...digits], seed }
}

// A single animita: a small loop with a dot pressed in its middle.
function penMark(): Drawing {
  const rand = rng(7)
  const size = 40
  return { size, strokes: [shake(loop(size / 2, size / 2, 12, rand), 2.2, rand)], dot: [size / 2 + 0.5, size / 2 - 0.5, 4], seed: 7 }
}

// Image ids: `count-12` and `pen-mark` are the crisp ink, with `-bleed-a` / `-bleed-b` for each soak.
function drawInk(id: string) {
  const [, base, bleed] = id.match(/^(count-\d+|pen-mark)(?:-bleed-(a|b))?$/) ?? []
  if (!base) return null
  const drawing = base === MARK ? penMark() : circledCount(base.slice(6))
  return bleed ? bleedInk(drawing, bleed) : crispInk(drawing)
}

const COUNT_IMAGE = ['concat', 'count-', ['to-string', ['get', 'point_count']]] as any
const bleedOf = (image: any, version: string) => ['concat', image, `-bleed-${version}`] as any

const stillInk = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

// One full breath of the bleed, and how often its fade is stepped. Only paint opacity changes, which
// the map redraws without laying anything out again.
const INK_CYCLE_MS = 7000
const INK_TICK_MS = 120

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

    const tilt = ['*', ['-', ['%', ['coalesce', ['get', 'point_count'], ['length', ['to-string', ['get', 'title']]]], 9], 4], 4]
    const pointSize = ['interpolate', ['linear'], ['zoom'], 3, 0.75, 10, 1, 16, 1.4] as any
    const inkLayer = (id: string, filter: any, image: any, extra: Record<string, any> = {}, opacity = 1) => {
      if (map.getLayer(id)) return
      map.addLayer({
        id,
        type: 'symbol',
        source: sourceId,
        filter,
        layout: { 'icon-image': image, 'icon-allow-overlap': true, 'icon-ignore-placement': true, ...extra },
        paint: { 'icon-opacity': opacity },
      })
    }
    for (const v of ['a', 'b']) {
      inkLayer(`clusters-bleed-${v}`, ['has', 'point_count'], bleedOf(COUNT_IMAGE, v), {}, v === 'a' ? 1 : 0)
      inkLayer(`${sourceId}-bleed-${v}`, POINT_FILTER, `${MARK}-bleed-${v}`, { 'icon-rotate': tilt, 'icon-size': pointSize }, v === 'a' ? 1 : 0)
    }
    inkLayer('clusters', ['has', 'point_count'], COUNT_IMAGE)
    inkLayer(`${sourceId}-inner`, POINT_FILTER, MARK, { 'icon-rotate': tilt, 'icon-size': pointSize })
    setLayersReady(true)

    isInitialized.current = true
  }, [map, isMapReady, sourceId])

  // Draws each pen mark, by hand, the first time the map needs it, and lets its bleed breathe.
  useEffect(() => {
    if (!map || !isMapReady) return
    const onMissing = (e: { id: string }) => {
      if (map.hasImage(e.id)) return
      const image = drawInk(e.id)
      if (image) map.addImage(e.id, image, { pixelRatio: 2 })
    }
    map.on('styleimagemissing', onMissing)
    // Layers may have asked for their images before this listener existed; asking again draws them.
    for (const id of ['clusters', 'clusters-bleed-a', 'clusters-bleed-b', `${sourceId}-inner`, `${sourceId}-bleed-a`, `${sourceId}-bleed-b`]) {
      if (map.getLayer(id)) map.setLayoutProperty(id, 'icon-image', map.getLayoutProperty(id, 'icon-image'))
    }
    const bleedLayers = ['clusters', sourceId].flatMap(base => [`${base}-bleed-a`, `${base}-bleed-b`])
    const breathe = () => {
      const w = (1 - Math.cos((performance.now() / INK_CYCLE_MS) * Math.PI * 2)) / 2
      bleedLayers.forEach((id, k) => {
        if (map.getLayer(id)) map.setPaintProperty(id, 'icon-opacity', k % 2 ? w : 1 - w)
      })
    }
    const tick = stillInk() ? undefined : setInterval(breathe, INK_TICK_MS)
    return () => {
      map.off('styleimagemissing', onMissing)
      if (tick) clearInterval(tick)
    }
  }, [map, isMapReady, sourceId])

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
