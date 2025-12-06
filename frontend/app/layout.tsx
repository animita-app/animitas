import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import localFont from 'next/font/local'
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

export const metadata: Metadata = {
  title: '[ÁNIMA] — una infraestructura para el patrimonio y la memoria del territorio.',
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
  modal
}: {
  children: React.ReactNode
  modal: React.ReactNode
}) {
  return (
    <html lang="es" className={cn(geist.variable, geistMono.variable, ibmPlexMono.variable)}>
      <body className="overflow-hidden">
        <Providers>
          {children}
          {modal}
          {/* <CreateMemorialButton /> */}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
