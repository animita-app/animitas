import type { MetadataRoute } from 'next'

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
    background_color: '#efe9dd',
    theme_color: '#efe9dd',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
