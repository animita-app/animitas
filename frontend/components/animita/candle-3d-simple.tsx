'use client'

import { useEffect, useRef } from 'react'

type CandleStyle = {
  standStyle: string
  stickStyle: string
  flameStyle: string
  backgroundColor: string
}

const STAND_STYLES = {
  classic: '#8B7355',
  modern: '#2C2C2C',
  vintage: '#C9A961',
  minimal: '#E8E8E8',
}

const STICK_STYLES = {
  smooth: '#FFF8DC',
  textured: '#FFFACD',
  ivory: '#FFFFF0',
  natural: '#F5E6D3',
}

const FLAME_STYLES = {
  warm: { inner: '#FFF4E6', outer: '#FF6B35' },
  cool: { inner: '#E8F4F8', outer: '#4A90E2' },
  bright: { inner: '#FFFEF0', outer: '#FFD700' },
  soft: { inner: '#FFF9F0', outer: '#FF8C42' },
}

const BACKGROUND_STYLES = {
  plain: '#1a1a1a',
  warm: 'linear-gradient(180deg, #2C1810 0%, #1a1a1a 100%)',
  cool: 'linear-gradient(180deg, #1a2332 0%, #1a1a1a 100%)',
  twilight: 'linear-gradient(180deg, #4A2C4A 0%, #1a1a1a 100%)',
}

export function Candle3D({ candleStyle }: { candleStyle: CandleStyle }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>()

  const standColor = STAND_STYLES[candleStyle.standStyle as keyof typeof STAND_STYLES] || STAND_STYLES.classic
  const stickColor = STICK_STYLES[candleStyle.stickStyle as keyof typeof STICK_STYLES] || STICK_STYLES.smooth
  const flameColors = FLAME_STYLES[candleStyle.flameStyle as keyof typeof FLAME_STYLES] || FLAME_STYLES.warm
  const bgStyle = BACKGROUND_STYLES[candleStyle.backgroundColor as keyof typeof BACKGROUND_STYLES] || BACKGROUND_STYLES.plain

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio, 2)
    canvas.width = 200 * dpr
    canvas.height = 280 * dpr
    ctx.scale(dpr, dpr)

    const centerX = 100
    let time = 0

    function drawCandle() {
      if (!ctx || !canvas) return

      ctx.clearRect(0, 0, 200, 280)

      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
      ctx.shadowBlur = 10
      ctx.shadowOffsetY = 5

      ctx.fillStyle = standColor
      ctx.beginPath()
      ctx.ellipse(centerX, 240, 35, 8, 0, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = standColor
      ctx.fillRect(centerX - 30, 235, 60, 10)

      ctx.shadowBlur = 0
      ctx.shadowOffsetY = 0

      const gradient = ctx.createLinearGradient(centerX - 25, 0, centerX + 25, 0)
      gradient.addColorStop(0, adjustBrightness(stickColor, -20))
      gradient.addColorStop(0.5, stickColor)
      gradient.addColorStop(1, adjustBrightness(stickColor, -20))

      ctx.fillStyle = gradient
      ctx.fillRect(centerX - 25, 130, 50, 110)

      ctx.fillStyle = stickColor
      ctx.beginPath()
      ctx.ellipse(centerX, 130, 25, 8, 0, 0, Math.PI * 2)
      ctx.fill()

      const flicker = Math.sin(time * 8) * 2 + Math.sin(time * 15) * 1
      const flameHeight = 45 + flicker
      const flameWidth = 20 + Math.cos(time * 10) * 2

      const flameGradient = ctx.createRadialGradient(
        centerX,
        130 - flameHeight / 2,
        0,
        centerX,
        130 - flameHeight / 2,
        flameWidth
      )
      flameGradient.addColorStop(0, flameColors.inner)
      flameGradient.addColorStop(0.5, flameColors.outer)
      flameGradient.addColorStop(1, 'rgba(255, 107, 53, 0)')

      ctx.fillStyle = flameGradient
      ctx.beginPath()
      ctx.ellipse(centerX, 130 - 15, flameWidth, flameHeight, 0, Math.PI, 0, true)
      ctx.fill()

      ctx.fillStyle = flameColors.inner
      ctx.globalAlpha = 0.6
      ctx.beginPath()
      ctx.arc(centerX, 130 - 20, 8, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalAlpha = 1

      time += 0.016
      rafRef.current = requestAnimationFrame(drawCandle)
    }

    drawCandle()

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [standColor, stickColor, flameColors])

  return (
    <div className="relative h-[280px] w-full" style={{ background: bgStyle }}>
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  )
}

function adjustBrightness(color: string, amount: number): string {
  const hex = color.replace('#', '')
  const r = Math.max(0, Math.min(255, parseInt(hex.slice(0, 2), 16) + amount))
  const g = Math.max(0, Math.min(255, parseInt(hex.slice(2, 4), 16) + amount))
  const b = Math.max(0, Math.min(255, parseInt(hex.slice(4, 6), 16) + amount))
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

export { STAND_STYLES, STICK_STYLES, FLAME_STYLES, BACKGROUND_STYLES }
