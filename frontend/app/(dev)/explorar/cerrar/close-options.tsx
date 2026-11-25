'use client'

import { CutoutText } from '@/components/cutout-text'
import { PenCross } from '@/components/road-signs'

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

// A strip of masking tape holding the sheet down, with an X scrawled on it: peel it to close.
function Tape() {
  return (
    <span aria-hidden className="relative block h-7 w-16 rotate-12 bg-[#e9dcb8]/90 shadow-[0_1px_2px_rgb(28_24_20_/_0.25)] [clip-path:polygon(3%_8%,97%_0%,100%_92%,0%_100%)]">
      <PenCross className="absolute inset-0 m-auto size-5" />
    </span>
  )
}

const OPTIONS = [
  { key: 'no-entrar', name: 'Señal "No entrar"', why: 'Señal chilena real de calle cerrada; se entiende como "no sigas".', mark: <NoEntrar /> },
  { key: 'cerrar', name: 'Palabra recortada', why: 'Igual que los nombres de la repisa: dice lo que hace.', mark: <CutoutText text="cerrar" height={20} /> },
  { key: 'cinta', name: 'Cinta de papel', why: 'La hoja está pegada con cinta; la despegas para cerrarla.', mark: <Tape /> },
  { key: 'lapiz', name: 'X de lápiz pasta (hoy)', why: 'El mismo lápiz de los círculos del mapa.', mark: <PenCross className="size-8" /> },
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
