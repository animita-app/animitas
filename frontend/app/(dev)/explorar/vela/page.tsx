import { notFound } from 'next/navigation'
import Image from 'next/image'

// Dev-only: fifteen real candles cut from Commons photos, side by side next to the candle row, to pick one.
const OPTIONS = [
  { name: 'Vela en la oscuridad', note: 'Prendida, cera naranja derretida', credit: 'Paolo Costa Baldi, CC BY-SA 3.0' },
  { name: 'Farol de cementerio rojo', note: 'Tapa dorada, como las de las tumbas', credit: 'Kritzolina, CC BY-SA 4.0' },
  { name: 'Faroles de tumba (dos)', note: 'Vidrio blanco con tapa calada, prendidos', credit: 'Trogain, CC BY-SA 4.0' },
  { name: 'Farol de tumba grande', note: 'Vidrio blanco y tapa metálica', credit: 'Trogain, CC BY-SA 4.0' },
  { name: 'Vela corta prendida', note: 'Cabo de vela naranja', credit: 'MinhVN1863, CC BY-SA 4.0' },
  { name: 'Cabo de vela oscuro', note: 'Muy gastada, llama alta', credit: 'Sveca u mraku, CC BY-SA 3.0' },
  { name: 'Velón blanco apagado', note: 'Sin llama: el apagado más claro', credit: 'Thesp3akerguy10, CC BY-SA 4.0' },
  { name: 'Velón rojo', note: 'Encomendada a Santa Rosa de Lima', credit: 'Guillermo Carlos Gómez, CC BY-SA 4.0' },
  { name: 'Vela de té', note: 'Vista desde arriba, encendida', credit: 'Alejandrocentelles12, CC BY-SA 4.0' },
  { name: 'Vela delgada', note: 'Llama limpia, cera café', credit: 'Sal4zare dek, CC BY-SA 4.0' },
  { name: 'Veladora en ofrenda', note: 'En una vasija de greda negra', credit: 'JMndz, CC BY-SA 4.0' },
  { name: 'Veladora morada', note: 'Vidrio acanalado, de altar', credit: 'Kerena14, CC BY-SA 3.0' },
  { name: 'Vela de té en lata', note: 'Desde arriba, luz cálida', credit: 'Valley2city, CC BY-SA 3.0' },
  { name: 'Lata quemada', note: 'Vela consumida, ya apagada', credit: 'PikiWiki Israel, CC BY 2.5' },
  { name: 'Vela de bistró', note: 'Cera roja chorreada', credit: 'Andrew Fogg, CC BY 2.0' },
]

export default function ExploreCandlePage() {
  if (process.env.NODE_ENV !== 'development') notFound()
  return (
    <main className="mx-auto grid max-w-6xl grid-cols-1 gap-x-10 gap-y-12 px-6 pt-24 pb-40 sm:grid-cols-2 lg:grid-cols-3">
      <h1 className="sr-only">Opciones de vela</h1>
      {OPTIONS.map((o, i) => (
        <section key={o.name} className="flex flex-col gap-3">
          <div className="flex items-center gap-4">
            <Image
              src={`/explorar/velas/${String(i + 1).padStart(2, '0')}.png`}
              alt=""
              width={200}
              height={200}
              className="h-16 w-auto drop-shadow-[0_4px_4px_rgb(28_24_20_/_0.3)]"
            />
            <div className="flex flex-col gap-0.5">
              <span className="text-sm text-text-strong">3 velas prendidas</span>
              <span className="text-sm text-text-weak">Prende la tuya</span>
            </div>
          </div>
          <p className="text-sm text-text-strong">{i + 1}. {o.name}</p>
          <p className="text-xs text-text-weak">{o.note}. {o.credit}</p>
        </section>
      ))}
    </main>
  )
}
