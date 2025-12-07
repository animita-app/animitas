import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { text } = await req.json()
    // Default Voice ID provided by user
    const voiceId = 'cMKZRsVE5V7xf6qCp9fF'

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    let apiKey = process.env.ELEVENLABS_API_KEY

    // Fallback: Manual .env read for hot-loading in dev
    if (!apiKey) {
      try {
        const fs = await import('fs')
        const path = await import('path')
        const envPath = path.resolve(process.cwd(), '.env')
        if (fs.existsSync(envPath)) {
          const content = fs.readFileSync(envPath, 'utf8')
          const match = content.match(/ELEVENLABS_API_KEY=(.+)/)
          if (match) apiKey = match[1].trim()
        }
      } catch (err) { console.warn('Manual env read failed', err) }
    }

    if (!apiKey) {
      return NextResponse.json({ error: 'ElevenLabs API key not configured' }, { status: 500 })
    }

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        output_format: 'mp3_44100_128'
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json({ error: errorText }, { status: response.status })
    }

    return new NextResponse(response.body, {
      headers: {
        'Content-Type': 'audio/mpeg',
      },
    })
  } catch (error) {
    console.error('TTS Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
