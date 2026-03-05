
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { createClient } from '@/lib/supabase/server';

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

  // Fetch from Supabase
  const supabase = await createClient();
  const { data: sites, error } = await supabase
    .from('heritage_sites')
    .select('id, story')
    .not('story', 'is', null);

  if (error || !sites) {
    return NextResponse.json({ error: 'Failed to fetch sites from Supabase' }, { status: 500 });
  }

  const results = [];

  for (const site of sites) {
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
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          }
        }),
      });

      if (!response.ok) {
        results.push({ id: site.id, status: 'failed', error: response.statusText });
        continue;
      }

      const buffer = await response.arrayBuffer();
      fs.writeFileSync(filePath, Buffer.from(buffer));
      results.push({ id: site.id, status: 'generated' });
    } catch (err: any) {
      results.push({ id: site.id, status: 'error', message: err.message });
    }
  }

  console.log(`Processed ${sites.length} sites. Generated: ${results.filter(r => r.status === 'generated').length}`);

  return NextResponse.json({ success: true, results });
}
