import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { story, title } = await req.json()

    if (!story || story.trim().length === 0) {
      return NextResponse.json({ insights: {} })
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: `Extract structured insights from this memorial/heritage site story. Return ONLY valid JSON, no markdown formatting.

Title: "${title}"
Story: "${story}"

Extract and return this exact structure (use null for missing data):
{
  "memorial": {
    "death_cause": string or null,
    "social_roles": string[] or null,
    "narrator_relation": string or null
  },
  "spiritual": {
    "rituals_mentioned": string[] or null,
    "offerings_mentioned": string[] or null
  },
  "patrimonial": {
    "form": string or null,
    "size": string or null,
    "antiquity_year": number or null
  }
}

Be concise. Extract only what's explicitly mentioned in the story.`
          }
        ],
        temperature: 0.3,
        max_tokens: 500
      })
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(
        { error: `OpenAI API error: ${error.error?.message || 'Unknown error'}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content || '{}'

    let insights = {}
    try {
      insights = JSON.parse(content)
    } catch (e) {
      return NextResponse.json(
        { error: 'Failed to parse insights response' },
        { status: 500 }
      )
    }

    return NextResponse.json({ insights })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Failed to extract insights: ${message}` },
      { status: 500 }
    )
  }
}
