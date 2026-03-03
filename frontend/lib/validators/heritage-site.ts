import { z } from 'zod'

export const heritageSitePayloadSchema = z.object({
  name: z.string().min(3).max(120),
  story: z.string().min(10).max(10000),
  isPublic: z.boolean().default(true),
  kind: z.string().default('animita'),
  categories: z.array(z.string()).optional(),
  location: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    address: z.string().min(1).max(255).optional(),
    cityRegion: z.string().min(1).max(255).optional()
  }),
  images: z.array(z.string().url()).max(5).optional(),
  insights: z.record(z.any()).optional()
})

export type HeritageSitePayload = z.infer<typeof heritageSitePayloadSchema>
