
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { SEED_HERITAGE_SITES } from '@/constants/heritage-sites';

export async function GET(req: Request) {
  const VOICE_ID = 'cMKZRsVE5V7xf6qCp9fF';
  const OUTPUT_DIR = path.resolve(process.cwd(), 'public/audio/stories');

  // Manual Env Read
  let apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    try {
      const envPath = path.resolve(process.cwd(), '.env');
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8');
        const match = content.match(/ELEVENLABS_API_KEY=(.+)/);
        if (match) apiKey = match[1].trim();
      }
    } catch (err) { console.warn('Manual env read failed', err); }
  }

  if (!apiKey) {
    return NextResponse.json({ error: 'No API Key' }, { status: 500 });
  }

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const results = [];

  for (const site of SEED_HERITAGE_SITES) {
    if (!site.story) continue;

    const filePath = path.join(OUTPUT_DIR, `${site.id}.mp3`);
    if (fs.existsSync(filePath)) {
      results.push({ id: site.id, status: 'skipped (exists)' });
      continue;
    }

    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/stream`, {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: site.story,
          model_id: 'eleven_multilingual_v2',
          output_format: 'mp3_44100_128'
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        results.push({ id: site.id, status: 'error', error: err });
        continue;
      }

      const arrayBuffer = await response.arrayBuffer();
      fs.writeFileSync(filePath, Buffer.from(arrayBuffer));
      results.push({ id: site.id, status: 'generated' });

      // Delay to avoid rate limits? ElevenLabs rate limits are usually high enough for small batches, but safeguards help.
      await new Promise(r => setTimeout(r, 500));

    } catch (error: any) {
      results.push({ id: site.id, status: 'error', error: error.message });
    }
  }

  return NextResponse.json({ success: true, results });
}
