import type { Metadata } from 'next'
import { CutoutText } from '@/components/cutout-text'
import { OBJECT_CREDITS, PEOPLE } from '@/lib/credits'

// Reachable by its address and by search engines, but not linked from inside the app.
export const metadata: Metadata = {
  title: 'Créditos',
  description: 'Quiénes hacen [ÁNIMA] y de dónde salen las fotos de sus objetos.',
  robots: { index: true, follow: true },
  alternates: { canonical: '/creditos' },
}

const list = (names: string[]) => (names.length > 1 ? `${names.slice(0, -1).join(', ')} y ${names.at(-1)}` : names[0])

export default function CreditsPage() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-xl flex-col gap-12 px-6 pt-28 pb-40">
      <div className="flex flex-col gap-3">
        <h1 className="sr-only">Créditos</h1>
        <CutoutText text="créditos" height={34} arc={20} className="self-start" />
      </div>

      <section aria-labelledby="credits-people" className="flex flex-col gap-3">
        <h2 id="credits-people" className="text-sm text-text">Quiénes</h2>
        <p className="text-pretty text-base leading-relaxed text-text-strong">
          [ÁNIMA] es un proyecto de {list(PEOPLE.authors)}. Nació como el proyecto de título de {list(PEOPLE.thesis)}, con {list(PEOPLE.advisors)} como profesores guía.
        </p>
      </section>

      <section aria-labelledby="credits-objects" className="flex flex-col gap-3">
        <h2 id="credits-objects" className="text-sm text-text">Fotos de los objetos</h2>
        <p className="text-pretty text-sm text-text-weak">
          Los objetos están recortados de estas imágenes de Wikimedia Commons y cada uno mantiene su licencia.
        </p>
        {/* APA 7: Autor. (Año). Título [Descripción]. Sitio. URL. Plus the license, as CC BY-SA asks. */}
        <ol className="flex flex-col gap-4">
          {OBJECT_CREDITS.map(c => (
            <li key={c.url} className="pl-8 -indent-8 text-pretty text-sm leading-relaxed text-text-strong">
              {c.author.endsWith('.') ? c.author : `${c.author}.`} ({c.year}). <cite>{c.title}</cite> [{c.kind}]. Wikimedia Commons.{' '}
              <a href={c.url} target="_blank" rel="noreferrer" className="break-words text-text underline decoration-border underline-offset-4 hover:decoration-text-strong">
                {c.url.replace('https://', '')}
              </a>
              . {c.license}. <span className="text-text-weak">({c.object})</span>
            </li>
          ))}
        </ol>
      </section>
    </main>
  )
}
