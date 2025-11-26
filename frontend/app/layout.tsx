import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'
import { CreateMemorialButton } from '@/components/create-memorial-button'

export const metadata: Metadata = {
  title: 'ánima',
  description: 'Plataforma de memoriales digitales para animitas chilenas. Prende velas virtuales y comparte testimonios.',
  keywords: ['animitas', 'Chile', 'memoria', 'velas digitales', 'memorial', 'espiritualidad popular'],
  authors: [{
    name: 'Felipe Mandiola',
    url: 'https://felipemandiola.com'
  }],
  openGraph: {
    title: 'Animitas',
    description: 'Memoriales digitales interactivos de animitas chilenas',
    type: 'website',
    locale: 'es_CL',
    siteName: 'Animitas',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Animitas',
    description: 'Memoriales digitales interactivos',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        <div className="pointer-events-none fixed inset-0 z-50 mix-blend-overlay opacity-[0.15]">
          <svg className="h-full w-full opacity-100" preserveAspectRatio="none">
            <filter id="noise">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.8"
                numOctaves="4"
                stitchTiles="stitch"
              />
            </filter>
            <rect width="100%" height="100%" filter="url(#noise)" />
          </svg>
        </div>
        <Providers>
          {children}
          {/* <CreateMemorialButton /> */}
        </Providers>
      </body>
    </html>
  )
}
