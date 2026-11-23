"use client"

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, ImagePlus, Link2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { useUser } from '@/contexts/user-context'
import { useMobileScrollThreshold } from '@/hooks/use-mobile'

interface GalleryHeaderProps {
  site: any
  onEditGallery: () => void
}

export function GalleryHeader({ site, onEditGallery }: GalleryHeaderProps) {
  const { currentUser, isEditor } = useUser()
  const isOverThreshold = useMobileScrollThreshold()
  const [hasCopied, setHasCopied] = useState(false)
  const canEdit = isEditor || currentUser?.id === site.creator_id

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setHasCopied(true)
    setTimeout(() => setHasCopied(false), 2000)
  }

  const overlayButton = cn(
    "transition-colors duration-300",
    isOverThreshold
      ? "bg-background-weaker text-text-strong hover:bg-background-weaker/80"
      : "bg-black/40 backdrop-blur-sm hover:bg-black/50 text-white md:bg-background-weaker md:hover:bg-background-weaker/80 md:backdrop-blur-none md:text-text-strong"
  )

  return (
    <div className={cn(
      "md:bg-background-weak border-b fixed md:absolute h-14 inset-x-0 top-0 z-40 flex items-center justify-between px-3 pointer-events-none transition-colors duration-300",
      isOverThreshold ? "bg-background/90 backdrop-blur-md border-border" : "border-transparent bg-transparent"
    )}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button size="icon-sm" variant="ghost" aria-label="Volver" className={cn("pointer-events-auto", overlayButton)} asChild>
            <Link href="/map">
              <ArrowLeft className="-translate-x-px" />
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">Volver</TooltipContent>
      </Tooltip>

      <div className="flex items-center gap-2 pointer-events-auto">
        {canEdit && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon-sm" variant="ghost" aria-label="Editar fotos" className={overlayButton} onClick={onEditGallery}>
                <ImagePlus />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Editar fotos</TooltipContent>
          </Tooltip>
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon-sm"
              variant="ghost"
              aria-label={hasCopied ? "Enlace copiado" : "Copiar enlace"}
              className={cn(overlayButton, hasCopied && "text-success md:text-success")}
              onClick={handleCopyLink}
            >
              <span className="grid">
                <Link2 className={cn("[grid-area:1/1] transition-[opacity,filter,scale] duration-300 ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-opacity", hasCopied && "opacity-0 blur-[4px] scale-25")} />
                <CheckCircle2 className={cn("[grid-area:1/1] transition-[opacity,filter,scale] duration-300 ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-opacity", !hasCopied && "opacity-0 blur-[4px] scale-25")} />
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>{hasCopied ? "Copiado" : "Copiar enlace"}</TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}
