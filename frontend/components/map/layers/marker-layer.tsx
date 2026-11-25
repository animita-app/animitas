'use client'

import { animitaHref } from '@/lib/routes'
import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import { Animita } from '@/types/animita'
import { MapMarker } from '../map-marker'
import { CutoutText } from '@/components/cutout-text'
import { cn } from '@/lib/utils'

// Ballpoint blue: the brand's #00e as real ink looks once it has soaked into paper, a little dull and
// darker. Mapbox can't read CSS variables, so it's written out.
const PEN_INK = '#2c3f8c'
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

// The stroke as the pen actually moved: the shaken points smoothed into a dense line.
function smooth(pts: Pt[]): Pt[] {
  const out: Pt[] = [pts[0]]
  let from = pts[0]
  for (let i = 1; i < pts.length; i++) {
    const ctrl = pts[i]
    const to: Pt = i < pts.length - 1 ? [(pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2] : pts[i]
    for (let k = 1; k <= 8; k++) {
      const t = k / 8
      const u = 1 - t
      out.push([u * u * from[0] + 2 * u * t * ctrl[0] + t * t * to[0], u * u * from[1] + 2 * u * t * ctrl[1] + t * t * to[1]])
    }
    from = to
  }
  return out
}

// A ballpoint never runs true: the line wanders a little to each side as the hand moves, and the ink
// thins and thickens with the pressure. Each version of a mark wanders differently.
function wander(line: Pt[], width: number, rand: () => number) {
  const [f1, f2, p1, p2, q1] = [0.09 + rand() * 0.05, 0.23 + rand() * 0.1, rand() * 6.3, rand() * 6.3, rand() * 6.3]
  let s = 0
  return line.map(([x, y], i) => {
    const [px, py] = line[Math.max(i - 1, 0)]
    const [nx, ny] = line[Math.min(i + 1, line.length - 1)]
    if (i > 0) s += Math.hypot(x - px, y - py)
    const len = Math.hypot(nx - px, ny - py) || 1
    const off = width * 0.42 * (Math.sin(s * f1 + p1) * 0.65 + Math.sin(s * f2 + p2) * 0.35)
    const pressure = 0.78 + 0.32 * (0.5 + 0.5 * Math.sin(s * 0.06 + q1))
    return { x: x - ((ny - py) / len) * off, y: y + ((nx - px) / len) * off, pressure }
  })
}

function drawCrisp(ctx: CanvasRenderingContext2D, { pts, width, blobs }: Stroke, rand: () => number) {
  const line = wander(smooth(pts), width, rand)
  ctx.lineCap = ctx.lineJoin = 'round'
  ctx.strokeStyle = ctx.fillStyle = PEN_INK
  for (let i = 1; i < line.length; i++) {
    const a = line[i - 1]
    const b = line[i]
    ctx.globalAlpha = 0.6 + 0.24 * b.pressure
    ctx.lineWidth = width * b.pressure
    ctx.beginPath()
    ctx.moveTo(a.x, a.y)
    ctx.lineTo(b.x, b.y)
    ctx.stroke()
  }
  ctx.globalAlpha = 0.85
  ;[line[0], line[line.length - 1]].forEach(({ x, y }, i) => {
    ctx.beginPath()
    ctx.arc(x, y, blobs[i], 0, Math.PI * 2)
    ctx.fill()
  })
  ctx.globalAlpha = 1
}

// Ink creeping into the paper along its fibres: no blur, just fine hairs that leave the line here and
// there, and the odd spot where the ball skipped and dropped extra ink. Real ballpoint bleed is sparse
// and crisp, not a glow.
function drawBleed(ctx: CanvasRenderingContext2D, { pts, width }: Stroke, rand: () => number) {
  const line = wander(smooth(pts), width, rand)
  ctx.save()
  ctx.strokeStyle = ctx.fillStyle = PEN_INK
  ctx.lineCap = 'round'
  for (let i = 1; i < line.length - 1; i++) {
    if (rand() > 0.32) continue
    const { x, y } = line[i]
    const a = rand() * Math.PI * 2
    const len = width * (0.6 + rand() * 1.4)
    ctx.globalAlpha = 0.18 + rand() * 0.22
    ctx.lineWidth = 0.35 + rand() * 0.35
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len)
    ctx.stroke()
  }
  for (let k = 0; k < 2; k++) {
    if (rand() > 0.6) continue
    const { x, y, pressure } = line[Math.floor(rand() * line.length)]
    ctx.globalAlpha = 0.55
    ctx.beginPath()
    ctx.arc(x, y, width * 0.45 * pressure, 0, Math.PI * 2)
    ctx.fill()
  }
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

// Marks are drawn at this many pixels per unit, so they stay sharp when the map scales them up close in.
const INK_RES = 4

function paint(size: number, draw: (ctx: CanvasRenderingContext2D) => void) {
  const { ctx } = canvasFor(size * INK_RES)
  ctx.scale(INK_RES, INK_RES)
  draw(ctx)
  return ctx.getImageData(0, 0, size * INK_RES, size * INK_RES)
}

// One take of a mark: its bleed underneath and its wandering line on top. Each take wanders differently.
function inkVersion({ size, strokes, dot, seed }: Drawing, version: string) {
  const rand = rng(seed * 31 + 5 + INK_VERSIONS.indexOf(version) * 6)
  return paint(size, ctx => {
    strokes.forEach(st => drawBleed(ctx, st, rand))
    strokes.forEach(st => drawCrisp(ctx, st, rand))
    if (!dot) return
    ctx.fillStyle = PEN_INK
    ctx.globalAlpha = 0.9
    ctx.beginPath()
    ctx.arc(dot[0] + (rand() - 0.5) * 0.8, dot[1] + (rand() - 0.5) * 0.8, dot[2], 0, Math.PI * 2)
    ctx.fill()
    ctx.globalAlpha = 1
  })
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

// A single animita: a small loop drawn round a dot pressed in its middle.
function penMark(): Drawing {
  const rand = rng(7)
  const size = 40
  return { size, strokes: [shake(loop(size / 2, size / 2, 12, rand), 2.2, rand)], dot: [size / 2 + 0.5, size / 2 - 0.5, 4], seed: 7 }
}

// Image ids: `count-12-a` and `pen-mark-a`, one per take (a, b, c).
function drawInk(id: string) {
  const [, base, version] = id.match(/^(count-\d+|pen-mark)-(a|b|c)$/) ?? []
  if (!base) return null
  return inkVersion(base === MARK ? penMark() : circledCount(base.slice(6)), version)
}


const COUNT_IMAGE = (version: string) => ['concat', 'count-', ['to-string', ['get', 'point_count']], `-${version}`] as any

const stillInk = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

// Only paint opacity changes, which the map redraws without laying anything out again.
// Line boil, as in hand-drawn animation: a few takes of the same mark swapped on a slow beat, so the
// pen line quietly shifts now and then. Swaps are cuts, not fades.
const INK_VERSIONS = ['a', 'b', 'c']
const INK_TICK_MS = 700

// Clicking a cluster flies in until it splits. Mapbox deletes `features` from the event as soon as the
// handler returns, and the expansion zoom arrives later, so everything needed is read up front.
export function zoomIntoCluster(map: mapboxgl.Map, sourceId: string) {
  return (e: { features?: mapboxgl.MapboxGeoJSONFeature[] }) => {
    const feature = e.features?.[0]
    if (!feature) return
    const clusterId = feature.properties?.cluster_id
    const center = (feature.geometry as GeoJSON.Point).coordinates as [number, number]
    const source = map.getSource(sourceId) as mapboxgl.GeoJSONSource | undefined
    source?.getClusterExpansionZoom(clusterId, (err, zoom) => {
      if (err || zoom == null) return
      map.flyTo({ center, zoom, speed: 1.2, curve: 1, essential: true, duration: 500 })
    })
  }
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
    // Follows the open animita: its name stays while its sheet is open and leaves with it.
    setLockedId(selectedSite?.id ?? null)
    setActiveId(selectedSite?.id ?? null)
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
    // Grows as you get close, so a single animita still reads as a mark on the street.
    const pointSize = ['interpolate', ['linear'], ['zoom'], 3, 0.75, 10, 1.1, 14, 1.8, 18, 2.6] as any
    const inkLayer = (id: string, filter: any, image: any, extra: Record<string, any> = {}, opacity = 1) => {
      if (map.getLayer(id)) return
      map.addLayer({
        id,
        type: 'symbol',
        source: sourceId,
        filter,
        layout: { 'icon-image': image, 'icon-allow-overlap': true, 'icon-ignore-placement': true, ...extra },
        paint: { 'icon-opacity': opacity, 'icon-opacity-transition': { duration: 0, delay: 0 } },
      })
    }
    INK_VERSIONS.forEach((v, k) => {
      const suffix = k ? `-${v}` : ''
      inkLayer(`clusters${suffix}`, ['has', 'point_count'], COUNT_IMAGE(v), {}, k ? 0 : 1)
      inkLayer(`${sourceId}-inner${suffix}`, POINT_FILTER, `${MARK}-${v}`, { 'icon-rotate': tilt, 'icon-size': pointSize }, k ? 0 : 1)
    })
    setLayersReady(true)

    isInitialized.current = true
  }, [map, isMapReady, sourceId])

  // Draws each pen mark, by hand, the first time the map needs it, and keeps its line boiling.
  useEffect(() => {
    if (!map || !isMapReady) return
    const onMissing = (e: { id: string }) => {
      if (map.hasImage(e.id)) return
      const image = drawInk(e.id)
      if (image) map.addImage(e.id, image, { pixelRatio: 2 * INK_RES })
    }
    map.on('styleimagemissing', onMissing)
    // Layers may have asked for their images before this listener existed; asking again draws them.
    const takes = INK_VERSIONS.map((v, k) => (k ? [`clusters-${v}`, `${sourceId}-inner-${v}`] : ['clusters', `${sourceId}-inner`]))
    for (const id of takes.flat()) {
      if (map.getLayer(id)) map.setLayoutProperty(id, 'icon-image', map.getLayoutProperty(id, 'icon-image'))
    }
    let shown = 0
    const boil = () => {
      shown = (shown + 1) % takes.length
      takes.forEach((ids, k) => ids.forEach(id => {
        if (map.getLayer(id)) map.setPaintProperty(id, 'icon-opacity', k === shown ? 1 : 0)
      }))
    }
    const tick = stillInk() ? undefined : setInterval(boil, INK_TICK_MS)
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

    // The point under the pointer grows a little in place (one mark, never two); pressing it gives a bit.
    const markLayers = INK_VERSIONS.map((v, k) => (k ? `${sourceId}-inner-${v}` : `${sourceId}-inner`))
    let hovered = ''
    let down = false
    const sizeFor = () => ['interpolate', ['linear'], ['zoom'],
      3, ['case', ['==', ['get', 'id'], hovered], down ? 0.85 : 1, 0.75],
      10, ['case', ['==', ['get', 'id'], hovered], down ? 1.25 : 1.4, 1.1],
      14, ['case', ['==', ['get', 'id'], hovered], down ? 2 : 2.2, 1.8],
      18, ['case', ['==', ['get', 'id'], hovered], down ? 2.8 : 3.1, 2.6],
    ] as any
    const resize = () => markLayers.forEach(id => { if (map.getLayer(id)) map.setLayoutProperty(id, 'icon-size', sizeFor()) })
    const reach = (id: string) => { hovered = id; resize() }
    const press = (isDown: boolean) => { down = isDown; resize() }

    const onPointEnter = (e: mapboxgl.MapMouseEvent & { features?: mapboxgl.MapboxGeoJSONFeature[] }) => {
      if (!e.features?.length) return
      const id = e.features[0].properties?.id
      if (id) {
        cancelClose()
        setActiveId(id)
        reach(String(id))
        map.getCanvas().style.cursor = 'pointer'
      }
    }

    const onPointLeave = () => {
      scheduleClose()
      reach('')
      press(false)
      map.getCanvas().style.cursor = ''
    }

    const onPointDown = () => press(true)
    const onPointUp = () => press(false)

    const onClusterClick = zoomIntoCluster(map, sourceId)

    const onClusterEnter = () => { map.getCanvas().style.cursor = 'pointer' }
    const onClusterLeave = () => { map.getCanvas().style.cursor = '' }

    layersToClick.forEach(layerId => {
      if (map.getLayer(layerId)) {
        map.on('click', layerId, onPointClick)
        map.on('mouseenter', layerId, onPointEnter)
        map.on('mouseleave', layerId, onPointLeave)
        map.on('mousedown', layerId, onPointDown)
        map.on('mouseup', layerId, onPointUp)
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
            map.off('mousedown', layerId, onPointDown)
            map.off('mouseup', layerId, onPointUp)
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
