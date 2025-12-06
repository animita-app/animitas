import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { text, voice = 'alloy' } = await req.json()

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    let apiKey = process.env.OPENAI_API_KEY

    // Fallback: Manual .env read for hot-loading in dev
    if (!apiKey) {
      try {
        const fs = await import('fs')
        const path = await import('path')
        const envPath = path.resolve(process.cwd(), '.env')
        if (fs.existsSync(envPath)) {
          const content = fs.readFileSync(envPath, 'utf8')
          const match = content.match(/OPENAI_API_KEY=(.+)/)
          if (match) apiKey = match[1].trim()
        }
      } catch (err) { console.warn('Manual env read failed', err) }
    }

    if (!apiKey) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 })
    }

    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini-tts',
        input: text,
        voice: voice,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      return NextResponse.json({ error }, { status: response.status })
    }

    // Return the audio stream directly
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
