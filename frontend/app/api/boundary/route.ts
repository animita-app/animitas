import { NextResponse, type NextRequest } from 'next/server'

// The outline of a Chilean comuna, city or region, from OpenStreetMap's Nominatim. Asked from the server
// so it carries an identifying User-Agent (Nominatim's policy) and the browser never hits rate limits;
// outlines don't change, so the response is cached for a day.
export async function GET(request: NextRequest) {
  const place = request.nextUrl.searchParams.get('q')?.trim()
  if (!place) return NextResponse.json({ geometry: null }, { status: 400 })
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(place)}&countrycodes=cl&format=json&polygon_geojson=1&polygon_threshold=0.002&limit=3`
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'animitas-map/1.0 (https://github.com/animita-app/animitas)', 'Accept-Language': 'es' },
      next: { revalidate: 86400 },
    })
    if (!res.ok) return NextResponse.json({ geometry: null })
    const results: { geojson?: { type: string } }[] = await res.json()
    const found = results.find(r => r.geojson?.type === 'Polygon' || r.geojson?.type === 'MultiPolygon')
    return NextResponse.json({ geometry: found?.geojson ?? null }, { headers: { 'Cache-Control': 'public, max-age=86400' } })
  } catch {
    return NextResponse.json({ geometry: null })
  }
}
