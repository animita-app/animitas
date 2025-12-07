export default function LocationPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold font-ibm-plex-mono">Ubicación</h1>
        <p className="text-muted-foreground text-sm">
          Confirma la ubicación exacta de la animita en el mapa.
        </p>
      </div>

      <div className="aspect-square w-full bg-muted rounded-lg flex items-center justify-center border">
        <p className="text-muted-foreground">Mapa Interactivo Placeholder</p>
      </div>
    </div>
  )
}
