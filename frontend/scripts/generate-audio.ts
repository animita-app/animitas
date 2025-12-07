
import fs from 'fs';
import path from 'path';
import 'dotenv/config';
import { SEED_HERITAGE_SITES } from '../constants/heritage-sites';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = 'cMKZRsVE5V7xf6qCp9fF';
const OUTPUT_DIR = path.resolve(__dirname, '../public/audio/stories');

if (!ELEVENLABS_API_KEY) {
  console.error('Error: ELEVENLABS_API_KEY is not set in .env');
  process.exit(1);
}

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function generateAudio(site: any) {
  const filePath = path.join(OUTPUT_DIR, `${site.id}.mp3`);

  if (fs.existsSync(filePath)) {
    console.log(`Audio for ${site.id} already exists. Skipping.`);
    return;
  }

  if (!site.story) {
    console.log(`No story for ${site.id}. Skipping.`);
    return;
  }

  console.log(`Generating audio for ${site.id}...`);

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/stream`, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: site.story,
        model_id: 'eleven_multilingual_v2',
        output_format: 'mp3_44100_128'
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} ${errorText}`);
    }

    const buffer = await response.arrayBuffer();
    fs.writeFileSync(filePath, Buffer.from(buffer));
    console.log(`Saved ${site.id}.mp3`);

  } catch (error) {
    console.error(`Failed to generate audio for ${site.id}:`, error);
  }
}

async function main() {
  console.log(`Found ${SEED_HERITAGE_SITES.length} sites.`);
  for (const site of SEED_HERITAGE_SITES) {
    await generateAudio(site);
  }
}

main();
