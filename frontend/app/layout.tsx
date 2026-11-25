import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import localFont from 'next/font/local'
import './globals.css'
import 'mapbox-gl/dist/mapbox-gl.css'
import { Providers } from './providers'
import { cn } from '@/lib/utils'
import { Toaster } from '@/components/ui/sonner'
import { Header } from '@/components/headers/header'


const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
  display: 'swap',
  adjustFontFallback: false,
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
  adjustFontFallback: false,
})

const ibmPlexMono = localFont({
  src: [
    {
      path: './fonts/IBMPlexMono-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/IBMPlexMono-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: './fonts/IBMPlexMono-SemiBold.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: './fonts/IBMPlexMono-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#fcfcfc',
}

export const metadata: Metadata = {
  applicationName: 'Animitas',
  appleWebApp: {
    capable: true,
    title: 'Animitas',
    statusBarStyle: 'default',
  },
  title: {
    template: '%s – [ÁNIMA]',
    default: '[ÁNIMA]',
  },
  description: 'Un mapa colaborativo de las animitas de Chile y sus historias.',
  keywords: ['animitas', 'Chile', 'memoria', 'mapa'],
  authors: [
    { name: 'Joaquín Stephens' },
    { name: 'Felipe Mandiola', url: 'https://felipemandiola.com' },
  ],
  openGraph: {
    title: 'Animitas',
    description: 'Un mapa colaborativo de las animitas de Chile y sus historias.',
    type: 'website',
    locale: 'es_CL',
    siteName: 'Animitas',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Animitas',
    description: 'Un mapa colaborativo de las animitas de Chile y sus historias.',
  },
}

export default function RootLayout({
  children,
  modal,
}: {
  children: React.ReactNode
  modal: React.ReactNode
}) {
  return (
    <html lang="es" className={cn(geist.variable, geistMono.variable, ibmPlexMono.variable)} data-scroll-behavior="smooth">
      <body className="overflow-x-hidden w-full min-h-svh">
        <Providers>
          <Header />
          {children}
          {modal}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
