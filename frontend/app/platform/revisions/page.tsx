"use client"

import React from "react"

export default function RevisionsPage() {
  return (
    <div className="flex flex-col h-screen bg-background">
      <main className="flex-1 p-8 pt-24">
        <h1 className="text-2xl font-bold mb-6">Revisiones Pendientes</h1>
        <div className="rounded-md border bg-card text-card-foreground shadow-sm p-8 flex flex-col items-center justify-center text-muted-foreground gap-2">
          <p>No hay revisiones pendientes por ahora.</p>
        </div>
      </main>
    </div>
  )
}
