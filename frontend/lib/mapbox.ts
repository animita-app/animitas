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
    console.error('Error searching location:', error)
    return []
  }
}
