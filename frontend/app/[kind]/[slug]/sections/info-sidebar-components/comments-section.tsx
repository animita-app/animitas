import React from "react"
import { CommentInput } from "./comment-input"

export function CommentsSection() {
  return (
    <div className="space-y-4">
      <div className="sr-only flex items-center justify-between">
        <span className="text-sm font-semibold">Comentarios</span>
        <span className="text-sm text-muted-foreground">Más recientes</span>
      </div>

      <CommentInput />
    </div>
  )
}
