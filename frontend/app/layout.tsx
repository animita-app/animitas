import type { Metadata } from 'next'
import { IBM_Plex_Mono } from 'next/font/google'
import './globals.css'
import MainLayout from './main-layout'
import { Providers } from './providers'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'


const ibmPlexMono = IBM_Plex_Mono({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

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

export default async function RootLayout({
  children,
  modal,
}: {
  children: React.ReactNode
  modal: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  return (
    <html lang="es">
      <body className={ibmPlexMono.className}>
        <div className="pointer-events-none fixed inset-0 z-[999999]">
          <svg className="h-full w-full" preserveAspectRatio="none">
            <filter id="mono-noise-filter">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.75"
                numOctaves="5"
                stitchTiles="stitch"
                result="noise"
              />
              <feColorMatrix
                in="noise"
                type="matrix"
                values="0.299 0.587 0.114 0 0  0.299 0.587 0.114 0 0  0.299 0.587 0.114 0 0  0 0 0 1 0"
              />
            </filter>
            <rect width="100%" height="100%" filter="url(#mono-noise-filter)" fill="#000000" opacity="35%" />
          </svg>
        </div>
        <Providers session={session} modal={modal}>
          {children}
        </Providers>
      </body>
    </html>
  )
}
