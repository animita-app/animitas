

export default function AssetsGalleryPage() {
  const assets = [
    { type: 'video', src: '/assets/demo.mp4', alt: 'Demo Video' },
    { type: 'image', src: '/assets/screenshot-1.png', alt: 'UI Screenshot' }
  ]

  return (
    <div className="container py-12 space-y-8">
      <div>
        <h1 className="text-2xl font-ibm-plex-mono font-bold uppercase tracking-tight">Assets</h1>
        <p className="text-muted-foreground">Portfolio and presentation media.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assets.map((asset, i) => (
          <div key={i} className="border border-border p-4 rounded-lg bg-card">
            <h3 className="font-medium mb-2">{asset.alt}</h3>
            {/* Logic to be connected with real files later */}
            <div className="aspect-video bg-muted flex items-center justify-center text-sm text-muted-foreground">
              {asset.src}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
