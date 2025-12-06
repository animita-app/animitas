import React from "react"

export function CommentsSection() {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold">Reflexiones</span>
        <span className="text-sm text-muted-foreground">Más recientes</span>
      </div>
      {/* Placeholder for list */}
      <div className="text-sm text-muted-foreground italic">
        No hay reflexiones aún. Sé el primero.
      </div>
    </div>
  )
}
