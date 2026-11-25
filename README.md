# Animitas

A collaborative map of Chile's animitas: the roadside shrines that remember someone who died at that spot. Anyone can find one on the map, read its story, light a candle and leave a comment. Signed-in people can add a new one from their phone with a photo and the GPS location.

## Authors

Animitas is a project by **Joaquín Stephens** and **Felipe Mandiola**.

It started as the university thesis project (proyecto de título) of **Felipe Mandiola**, **Vicente Pino** and **Manuel Larraín**, which mapped intangible cultural heritage across Chile. It later narrowed down to what it is today: a place only for animitas.

## What's here

- `frontend/`: the web app (Next.js, Tailwind CSS v4, shadcn/ui, Mapbox). It works on phones first and can be installed as an app from the browser.
- `supabase/migrations/`: the database schema (animitas, candles, comments and profiles, with row level security). `supabase/legacy/` keeps the migrations from the thesis-era heritage platform, for reference only.
- `mobile/`: the start of a native app (Expo). Not in use yet.

## Run it locally

1. Copy `frontend/.env.example` to `frontend/.env.local` and fill in your own Mapbox token and Supabase URL and anon key. Never commit `.env.local`.
2. Install and start:

   ```sh
   cd frontend
   npm install
   npm run dev
   ```

3. Open http://localhost:3000.

Checks: `npx tsc --noEmit`, `npm run lint` and `npx jest`, all from `frontend/`.

## Database

The app reads and writes through Supabase. To set up a new project, apply the migration with the Supabase CLI (`supabase link` and then `supabase db push`). The tables keep the `heritage_*` names from the thesis era; the code names them once, in `frontend/lib/animitas.ts`.

## License

All rights belong to Joaquín Stephens and Felipe Mandiola.
