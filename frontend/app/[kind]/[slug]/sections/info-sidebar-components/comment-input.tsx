import React, { useState } from "react"
import {
  InputGroup,
  InputGroupTextarea,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
} from "@/components/ui/input-group"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { ArrowUp, Plus } from "lucide-react"
import { useUser } from "@/contexts/user-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  SpeechInput,
  SpeechInputRecordButton,
} from "@/components/ui/speech-input"
import { getScribeToken } from "@/app/actions/get-scribe-token"

export function CommentInput() {
  const { currentUser } = useUser()
  const [text, setText] = useState("")
  const [placeholder, setPlaceholder] = useState("Deja un comentario")

  React.useEffect(() => {
    const words = ["comentario", "reflexión", "pensamiento", "agradecimiento"]
    let wordIndex = 0
    let charIndex = 0
    let isDeleting = false
    let timeoutId: NodeJS.Timeout

    const type = () => {
      const currentWord = words[wordIndex]
      const shouldDelete = isDeleting

      setPlaceholder(`Deja un ${currentWord.substring(0, charIndex)}${shouldDelete ? "" : "|"}`)

      if (!shouldDelete && charIndex === currentWord.length) {
        isDeleting = true
        timeoutId = setTimeout(type, 1500) // Wait before deleting
      } else if (shouldDelete && charIndex === 0) {
        isDeleting = false
        wordIndex = (wordIndex + 1) % words.length
        timeoutId = setTimeout(type, 500) // Wait before typing next word
      } else {
        const speed = shouldDelete ? 50 : 100
        charIndex = shouldDelete ? charIndex - 1 : charIndex + 1
        timeoutId = setTimeout(type, speed)
      }
    }

    timeoutId = setTimeout(type, 100)

    return () => clearTimeout(timeoutId)
  }, [])

  return (
    <div className="flex items-start gap-3">
      <Avatar className="w-6 h-6">
        <AvatarImage src={currentUser?.avatarUrl} />
        <AvatarFallback>{currentUser?.name?.[0]}</AvatarFallback>
      </Avatar>

      <div className="flex-1">
        <InputGroup className="relative">
          {!text && (
            <div className="absolute inset-0 py-3 px-3 text-sm text-muted-foreground pointer-events-none z-10 font-normal">
              {placeholder.slice(0, -1)}
              <span className="text-accent/100 ring-0">|</span>
            </div>
          )}
          <InputGroupTextarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="z-0"
          />
          <InputGroupAddon align="block-end" className="w-full justify-end items-end z-20 relative">
            {/* <SpeechInput
              getToken={getScribeToken}
              onStop={(data) => setText((prev) => (prev + " " + data.transcript).trim())}
              size="icon-xs"
            >
              <SpeechInputRecordButton />
            </SpeechInput> */}
            <InputGroupButton
              variant="default"
              size="sm"
              disabled={!text}
            >
              Comentar
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </div>
    </div>
  )
}
