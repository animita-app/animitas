export async function searchLocation(query: string, accessToken: string) {
  if (!query) return []
  try {
    const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`
    const params = new URLSearchParams({
      access_token: accessToken,
      country: 'CL',
      types: 'region,district,place,locality,neighborhood,address,poi',
      limit: '5',
      language: 'es'
    })

    const response = await fetch(`${endpoint}?${params}`)
    const data = await response.json()

    return data.features || []
  } catch (error) {
    return []
  }
}

export async function reverseGeocode(lng: number, lat: number, accessToken: string): Promise<{ address: string; cityRegion: string } | null> {
  try {
    const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json`
    const params = new URLSearchParams({
      access_token: accessToken,
      types: 'address,place,locality',
      language: 'es',
      country: 'CL',
      limit: '1'
    })

    const response = await fetch(`${endpoint}?${params}`)
    const data = await response.json()

    if (!data.features || data.features.length === 0) return null

    const feature = data.features[0]
    const address = feature.place_name || ''

    const cityRegion = feature.context
      ?.find((ctx: any) => ctx.id.match(/^(place|locality)\./))
      ?.text || ''

    return { address, cityRegion }
  } catch (error) {
    return null
  }
}
