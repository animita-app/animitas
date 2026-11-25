'use client'

import Image from 'next/image'
import { CutoutText } from '@/components/cutout-text'
import { CurveSign } from '@/components/road-signs'

// "No entrar": the red disc with a white bar that closes a street to traffic in Chile.
function NoEntrar() {
  return (
    <svg aria-hidden viewBox="0 0 100 100" className="size-10 drop-shadow-[0_3px_3px_rgb(28_24_20_/_0.4)]">
      <circle cx="50" cy="50" r="47" fill="#f4f1e8" />
      <circle cx="50" cy="50" r="43" fill="#c3291f" />
      <rect x="18" y="41" width="64" height="18" rx="2" fill="#f4f1e8" />
    </svg>
  )
}

// The red pin that holds the sheet to the page: pulling it out closes it.
function Pin() {
  return <Image src="/cutouts/pin-red.png" alt="" width={160} height={300} className="h-12 w-auto rotate-12 drop-shadow-[0_3px_3px_rgb(28_24_20_/_0.35)]" />
}

// A strip of plain masking tape across the corner, the word cut out on it.
function Tape() {
  return (
    <span aria-hidden className="flex h-8 w-24 rotate-12 items-center justify-center bg-background-weaker shadow-[0_1px_2px_rgb(28_24_20_/_0.25)] [clip-path:polygon(3%_8%,97%_0%,100%_92%,0%_100%)]">
      <CutoutText text="cerrar" height={14} />
    </span>
  )
}

// The same X from the letter pack, a single cut, like the other words of the app.
function CutX() {
  return <CutoutText text="x" height={30} />
}

const OPTIONS = [
  { key: 'no-entrar', name: 'Señal "No entrar"', why: 'Señal chilena real de calle cerrada; sigue los letreros de la app.', mark: <NoEntrar /> },
  { key: 'curva', name: 'Señal de curva (como volver)', why: 'La misma señal que ya usamos para volver: una sola forma de salir.', mark: <CurveSign className="size-11" /> },
  { key: 'chinche', name: 'La chinche roja', why: 'La hoja está clavada; sacas la chinche para soltarla.', mark: <Pin /> },
  { key: 'cinta', name: 'Cinta con "cerrar"', why: 'La hoja está pegada; despegas la cinta. Dice lo que hace.', mark: <Tape /> },
  { key: 'x', name: 'X recortada de revista', why: 'Una sola letra del pack, como los nombres.', mark: <CutX /> },
]

export function CloseOptions() {
  return (
    <main className="mx-auto grid max-w-5xl gap-10 px-6 pt-24 pb-24 md:grid-cols-2">
      <h1 className="sr-only">Opciones para cerrar</h1>
      {OPTIONS.map((o, i) => (
        <section key={o.key} className="flex flex-col gap-3">
          <div className="relative h-56 bg-background p-8 shadow-[0_0_48px_24px_var(--color-background)]">
            <span className="absolute top-3 right-3 cursor-pointer transition-[scale,rotate] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-110 hover:-rotate-6">{o.mark}</span>
            <CutoutText text="inicia sesión" height={26} />
            <p className="mt-3 text-sm text-text-weak">Para añadir animitas, prender velas y dejar recuerdos.</p>
          </div>
          <p className="text-sm text-text-strong">{i + 1}. {o.name}</p>
          <p className="text-sm text-text-weak">{o.why}</p>
        </section>
      ))}
    </main>
  )
}
