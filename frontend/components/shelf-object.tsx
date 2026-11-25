import Image from 'next/image'
import { CutoutText } from '@/components/cutout-text'
import { cn } from '@/lib/utils'

// A real object standing on the page. Its name only shows, in cut-out letters, when you reach for it.
// Goes inside a `.shelf-item` link or button, which carries the accessible name.
export function ShelfObject({ src, label, size, active, labelSide = 'top' }: { src: string; label: string; size: string; active?: boolean; labelSide?: 'top' | 'bottom' }) {
  return (
    <>
      <span className={cn('shelf-label pointer-events-none absolute left-1/2 w-max -translate-x-1/2', labelSide === 'top' ? 'bottom-full -mb-2 origin-bottom' : 'top-full mt-1 origin-top')}>
        <CutoutText text={label} height={24} arc={labelSide === 'top' ? 80 : 0} />
      </span>
      <Image
        src={src}
        alt=""
        width={160}
        height={160}
        draggable={false}
        className={cn('w-auto object-contain drop-shadow-[0_4px_4px_rgb(28_24_20_/_0.35)]', size, !active && 'shelf-idle')}
      />
    </>
  )
}

