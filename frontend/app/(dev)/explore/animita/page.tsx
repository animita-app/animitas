import { notFound } from 'next/navigation'
import { EB_Garamond, Caveat, Instrument_Serif } from 'next/font/google'
import { getAnimita } from '@/lib/animitas-server'
import { cn } from '@/lib/utils'
import { VersionPicker } from './version-picker'
import { Plaque } from './versions/plaque'
import { Altar } from './versions/altar'
import { Vigil } from './versions/vigil'
import './explore.css'

const garamond = EB_Garamond({ subsets: ['latin'], variable: '--font-plaque', display: 'swap' })
const caveat = Caveat({ subsets: ['latin'], variable: '--font-note', display: 'swap' })
const instrument = Instrument_Serif({ subsets: ['latin'], weight: '400', variable: '--font-vigil', display: 'swap' })

const VERSIONS = {
  plaque: Plaque,
  altar: Altar,
  vigil: Vigil,
} as const

type Slug = keyof typeof VERSIONS

export default async function ExploreAnimita({ searchParams }: { searchParams: Promise<{ v?: string; slug?: string }> }) {
  if (process.env.NODE_ENV === 'production') notFound()
  const { v, slug } = await searchParams
  const animita = await getAnimita(slug ?? 'romualdito')
  if (!animita) notFound()

  const current: Slug = v && v in VERSIONS ? (v as Slug) : 'plaque'
  const Version = VERSIONS[current]

  return (
    <div className={cn(garamond.variable, caveat.variable, instrument.variable, 'explore min-h-svh')}>
      <Version animita={animita} />
      <VersionPicker current={current} slug={slug} />
    </div>
  )
}
