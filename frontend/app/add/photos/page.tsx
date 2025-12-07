export default function PhotosPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold font-ibm-plex-mono">Fotos</h1>
        <p className="text-muted-foreground text-sm">
          Sube fotos de la animita para que todos puedan identificarla.
        </p>
      </div>

      <div className="border-2 border-dashed border-border rounded-lg p-12 flex flex-col items-center justify-center gap-4 text-center cursor-pointer hover:bg-accent/5 transition-colors">
        <div className="size-16 rounded-full bg-accent/10 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-camera"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" /><circle cx="12" cy="13" r="3" /></svg>
        </div>
        <div>
          <p className="font-medium">Toca para subir fotos</p>
          <p className="text-xs text-muted-foreground">JPG, PNG</p>
        </div>
      </div>
    </div>
  )
}
