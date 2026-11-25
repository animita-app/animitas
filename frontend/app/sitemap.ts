import type { MetadataRoute } from 'next'

// On Vercel the production address comes from the platform; NEXT_PUBLIC_SITE_URL overrides it.
const SITE = process.env.NEXT_PUBLIC_SITE_URL
  ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000')

// /creditos isn't linked from the app, so it's listed here for search engines to find.
export default function sitemap(): MetadataRoute.Sitemap {
  return ['/map', '/list', '/creditos'].map(path => ({ url: `${SITE}${path}` }))
}
