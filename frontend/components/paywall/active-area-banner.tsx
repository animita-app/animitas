import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface ActiveAreaBannerProps {
  label: string | null
  onClear: () => void
}

export function ActiveAreaBanner({ label, onClear }: ActiveAreaBannerProps) {
  const isVisible = !!label

  return (
    <div
      className={cn(
        "absolute top-3 left-1/2 -translate-x-1/2 z-20 pointer-events-auto transition-all duration-500 ease-in-out",
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-[200%] opacity-0"
      )}
    >
      <Card className="bg-black text-white flex-row p-2 pl-3 flex items-center gap-1 shadow-md border-neutral-700">
        <span className="text-sm text-muted-foreground font-normal">Área activa:</span>
        <span className="text-sm font-normal text-white">{label}</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 text-muted-foreground ml-1 hover:bg-neutral-800"
          onClick={() => {
            onClear()
          }}
        >
          <X className="h-3 w-3" />
        </Button>
      </Card>
    </div>
  )
}
