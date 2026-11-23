import type { MetadataRoute } from 'next'
import { BRAND_BLUE } from '@/lib/app-icon'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Animitas',
    short_name: 'Animitas',
    description: 'Un mapa colaborativo de las animitas de Chile y sus historias.',
    lang: 'es-CL',
    start_url: '/map',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#fcfcfc',
    theme_color: BRAND_BLUE,
    icons: [
      { src: '/pwa-icon/192', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/pwa-icon/512', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/pwa-icon/512-maskable', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
