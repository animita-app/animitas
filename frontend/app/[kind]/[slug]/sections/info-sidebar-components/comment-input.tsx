import React from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Paperclip } from "lucide-react"

export function CommentInput() {
  return (
    <div className="p-4 border-t bg-background">
      <div className="relative rounded-xl border bg-muted/30 focus-within:ring-1 focus-within:ring-ring focus-within:bg-background transition-all">
        <Textarea
          placeholder="Escribe una reflexión..."
          className="min-h-[44px] w-full resize-none border-0 bg-transparent py-3 px-4 text-sm placeholder:text-muted-foreground focus-visible:ring-0"
        />
        <div className="flex items-center justify-between px-3 pb-2 pt-0">
          <Button size="icon" variant="ghost" className="text-muted-foreground hover:text-foreground">
            <Paperclip />
          </Button>
          <Button size="sm" className="text-sm px-3">
            Publicar
          </Button>
        </div>
      </div>
    </div>
  )
}
