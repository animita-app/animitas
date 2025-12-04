import type { Metadata } from 'next'
import { Geist, Geist_Mono, IBM_Plex_Mono } from 'next/font/google'
import './globals.css'
import 'mapbox-gl/dist/mapbox-gl.css'
import { Providers } from './providers'
import { cn } from '@/lib/utils'
import { Toaster } from '@/components/ui/sonner'


const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
  display: 'swap',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
})

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-ibm-plex-mono',
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={cn(geist.variable, geistMono.variable, ibmPlexMono.variable)}>
      <body className="overflow-hidden">
        <Providers>
          {children}
          {/* <CreateMemorialButton /> */}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
