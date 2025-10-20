'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { useRef, useMemo } from 'react'
import * as THREE from 'three'

type CandleStyle = {
  standStyle: string
  stickStyle: string
  flameStyle: string
  backgroundColor: string
}

const STAND_STYLES = {
  classic: { color: '#8B7355', metalness: 0.3, roughness: 0.7 },
  modern: { color: '#2C2C2C', metalness: 0.8, roughness: 0.2 },
  vintage: { color: '#C9A961', metalness: 0.6, roughness: 0.4 },
  minimal: { color: '#E8E8E8', metalness: 0.1, roughness: 0.9 },
}

const STICK_STYLES = {
  smooth: { color: '#FFF8DC', roughness: 0.6 },
  textured: { color: '#FFFACD', roughness: 0.9 },
  ivory: { color: '#FFFFF0', roughness: 0.4 },
  natural: { color: '#F5E6D3', roughness: 0.7 },
}

const FLAME_STYLES = {
  warm: { inner: '#FFF4E6', outer: '#FF6B35', intensity: 1.2 },
  cool: { inner: '#E8F4F8', outer: '#4A90E2', intensity: 1.0 },
  bright: { inner: '#FFFEF0', outer: '#FFD700', intensity: 1.5 },
  soft: { inner: '#FFF9F0', outer: '#FF8C42', intensity: 0.9 },
}

const BACKGROUND_STYLES = {
  plain: '#1a1a1a',
  warm: 'linear-gradient(180deg, #2C1810 0%, #1a1a1a 100%)',
  cool: 'linear-gradient(180deg, #1a2332 0%, #1a1a1a 100%)',
  twilight: 'linear-gradient(180deg, #4A2C4A 0%, #1a1a1a 100%)',
}

function Flame({ style }: { style: string }) {
  const flameRef = useRef<THREE.Mesh>(null)
  const { inner, outer, intensity } = FLAME_STYLES[style as keyof typeof FLAME_STYLES]

  useFrame(({ clock }) => {
    if (!flameRef.current) return
    const t = clock.getElapsedTime()
    flameRef.current.scale.y = 1 + Math.sin(t * 8) * 0.08 + Math.sin(t * 15) * 0.04
    flameRef.current.scale.x = 1 + Math.cos(t * 10) * 0.05
    flameRef.current.scale.z = 1 + Math.cos(t * 10) * 0.05
  })

  const flameGeometry = useMemo(() => {
    const points = []
    for (let i = 0; i <= 20; i++) {
      const t = i / 20
      const radius = Math.sin(t * Math.PI) * 0.15
      points.push(new THREE.Vector2(radius, t * 0.5))
    }
    return new THREE.LatheGeometry(points, 16)
  }, [])

  return (
    <group position={[0, 1.3, 0]}>
      <mesh ref={flameRef} geometry={flameGeometry}>
        <meshBasicMaterial color={outer} transparent opacity={0.7} />
      </mesh>
      <pointLight position={[0, 0.2, 0]} color={inner} intensity={intensity} distance={3} />
    </group>
  )
}

function CandleStick({ stickStyle, standStyle }: { stickStyle: string; standStyle: string }) {
  const stickProps = STICK_STYLES[stickStyle as keyof typeof STICK_STYLES]
  const standProps = STAND_STYLES[standStyle as keyof typeof STAND_STYLES]

  return (
    <>
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.2, 1, 32]} />
        <meshStandardMaterial color={stickProps.color} roughness={stickProps.roughness} />
      </mesh>

      <mesh position={[0, 0.05, 0]} castShadow>
        <cylinderGeometry args={[0.28, 0.32, 0.1, 32]} />
        <meshStandardMaterial
          color={standProps.color}
          metalness={standProps.metalness}
          roughness={standProps.roughness}
        />
      </mesh>
    </>
  )
}

function Scene({ candleStyle }: { candleStyle: CandleStyle }) {
  return (
    <>
      <ambientLight intensity={0.3} />
      <CandleStick stickStyle={candleStyle.stickStyle} standStyle={candleStyle.standStyle} />
      <Flame style={candleStyle.flameStyle} />
    </>
  )
}

export function Candle3D({ candleStyle }: { candleStyle: CandleStyle }) {
  const bgStyle = BACKGROUND_STYLES[candleStyle.backgroundColor as keyof typeof BACKGROUND_STYLES]

  return (
    <div className="relative h-[280px] w-full" style={{ background: bgStyle }}>
      <Canvas camera={{ position: [0, 1, 2.5], fov: 50 }} gl={{ alpha: true }}>
        <Scene candleStyle={candleStyle} />
      </Canvas>
    </div>
  )
}

export { STAND_STYLES, STICK_STYLES, FLAME_STYLES, BACKGROUND_STYLES }
