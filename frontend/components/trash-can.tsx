import Image from 'next/image'
import { cn } from '@/lib/utils'

// A real galvanized trash can, its lid a separate cut-out that tips open on its hinge when something
// comes close.
export function TrashCan({ open, className }: { open: boolean; className?: string }) {
  return (
    <span aria-hidden className={cn('relative flex w-24 flex-col drop-shadow-[0_6px_6px_rgb(28_24_20_/_0.35)]', className)}>
      <Image
        src="/cutouts/trash-lid.png"
        alt=""
        width={218}
        height={144}
        draggable={false}
        style={{ transformOrigin: '6% 88%' }}
        className={cn(
          'relative z-10 h-auto w-full transition-[rotate,translate] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-reduce:transition-none',
          open && '-translate-y-2 -rotate-[32deg]'
        )}
      />
      <Image src="/cutouts/trash-body.png" alt="" width={218} height={208} draggable={false} className="-mt-px h-auto w-full" />
    </span>
  )
}
