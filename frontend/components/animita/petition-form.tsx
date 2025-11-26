'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { X } from 'lucide-react'
import { Dialog, DialogContent, DialogClose, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { addPetition } from '@/lib/localStorage'
import { FAKE_USERS } from '@/constants/seedData'


interface PetitionFormProps {
  animitaId: string
  animitaName: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onPetitionAdded?: () => void
}

export function PetitionForm({ animitaId, animitaName, open, onOpenChange, onPetitionAdded }: PetitionFormProps) {
  const user = FAKE_USERS['current-user']
  const [texto, setTexto] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = async () => {
    if (!texto.trim()) return

    setIsSubmitting(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      addPetition(animitaId, texto)
      setTexto('')
      onOpenChange(false)
      onPetitionAdded?.()
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className='!p-2 bg-transparent border-transparent max-w-none h-full max-h-svh flex flex-col gap-2 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-200'
        overlayClassName="bg-black/100"
        onOpenAutoFocus={(e) => {
          e.preventDefault()
          // Focus the textarea after a short delay to ensure it's rendered
          setTimeout(() => {
            textareaRef.current?.focus()
          }, 100)
        }}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Publicar reflexión</DialogTitle>
          <DialogDescription>Publica tu reflexión en {animitaName}</DialogDescription>
        </DialogHeader>
        {/* Header */}
        <div className="flex items-center justify-between h-fit shrink-0">
          <DialogClose asChild>
            <Button variant="default" size="icon" className="rounded-full bg-neutral-800 hover:bg-neutral-700">
              <X className="w-5 h-5" />
            </Button>
          </DialogClose>

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !texto.trim()}
            size="sm"
            variant="outline"
            className="rounded-full bg-white min-w-[90px]"
          >
            {isSubmitting ? 'Publicando...' : 'Publicar'}
          </Button>
        </div>

        <div className="p-4 bg-background rounded-xl border flex-1 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatar} alt={user.username} />
              <AvatarFallback>Yo</AvatarFallback>
            </Avatar>
            <div className="flex flex-col space-y-1">
              <span className="text-sm font-medium leading-none lowercase">{user.username}</span>
              <span className="text-xs text-muted-foreground uppercase">EN {animitaName}</span>
            </div>
          </div>

          <Textarea
            ref={textareaRef}
            autoFocus
            placeholder="Deja tu reflexión..."
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 resize-none text-base border-none focus-visible:ring-0 p-0 shadow-none placeholder:text-muted-foreground/50 h-full"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
