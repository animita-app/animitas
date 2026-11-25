import type { Metadata } from 'next'
import { CutoutText } from '@/components/cutout-text'
import { OBJECT_CREDITS } from '@/lib/credits'

export const metadata: Metadata = {
  title: 'Créditos',
  description: 'De dónde salen las fotos de los objetos.',
}

const LINK = 'text-text-strong underline decoration-border underline-offset-4 hover:decoration-text-strong'

export default function CreditsPage() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-lg flex-col gap-10 px-6 pt-28 pb-40">
      <div className="flex flex-col gap-3">
        <h1 className="sr-only">Créditos</h1>
        <CutoutText text="créditos" height={34} arc={20} className="self-start" />
        <p className="text-pretty text-sm text-text-weak">
          Los objetos están recortados de fotos de Wikimedia Commons y cada uno mantiene su licencia.
        </p>
      </div>

      <section aria-labelledby="credits-objects" className="flex flex-col gap-3">
        <h2 id="credits-objects" className="text-sm font-medium text-text-strong">Objetos</h2>
        <ul className="flex flex-col gap-2 text-sm">
          {OBJECT_CREDITS.map(c => (
            <li key={c.url} className="flex flex-wrap gap-x-2">
              <span className="text-text-weak">{c.object}</span>
              <a href={c.url} target="_blank" rel="noreferrer" className={LINK}>{c.author}</a>
              <span className="text-text-weak">({c.license})</span>
            </li>
          ))}
        </ul>
      </section>

    </main>
  )
}
