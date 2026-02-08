
import { SEED_HERITAGE_SITES } from '../constants/heritage-sites'
import fs from 'fs'
import path from 'path'

const OUT_FILE = path.join(process.cwd(), 'supabase/migrations/01_seed.sql')

const escape = (str: string | undefined | null) => {
  if (str === undefined || str === null) return 'NULL'
  return `'${str.replace(/'/g, "''")}'`
}

const json = (obj: any) => {
  if (obj === undefined || obj === null) return 'NULL'
  return `'${JSON.stringify(obj).replace(/'/g, "''")}'`
}

const generate = () => {
  let sql = `-- Seed data generated from SEED_HERITAGE_SITES

`

  for (const site of SEED_HERITAGE_SITES) {
    // We assume ID is a valid UUID or we let Postgres generate it if missing?
    // The seeds have string IDs like "animita-de-..."
    // If the schema expects UUID, we can't insert these strings.
    // OPTION A: Hash the string to a UUID.
    // OPTION B: Let Postgres generate UUID and store the slug.

    // Given the plan mentions slug is unique URL identifier, we should use the 'slug' field for the URL part.
    // The ID in database is UUID.
    // So we will NOT insert the 'id' from seed into the 'id' column (uuid).
    // We will let it auto-generate.
    // BUT we need to map relations if there were any. There are person_id links but they are strings too.

    // We will insert 'slug' = site.slug (or site.id if slug missing).

    const slug = site.slug || site.id

    // location is { lat, lng } -> PostGIS 'POINT(lng lat)'
    const point = `ST_SetSRID(ST_MakePoint(${site.location.lng}, ${site.location.lat}), 4326)`

    sql += `INSERT INTO public.heritage_sites (
      slug,
      kind,
      title,
      location,
      typology,
      images,
      story,
      insights,
      status,
      created_at
    ) VALUES (
      ${escape(slug)},
      ${escape(site.kind)},
      ${escape(site.title)},
      ${point},
      ${escape(site.typology)},
      ${json(site.images || [])},
      ${escape(site.story)},
      ${json(site.insights)},
      'published',
      ${escape(site.created_at || new Date().toISOString())}
    )
    ON CONFLICT (slug) DO NOTHING;

`
  }

  fs.writeFileSync(OUT_FILE, sql)
  console.log(`Generated ${OUT_FILE}`)
}

generate()
