import { z } from 'zod'

export const heritageSitePayloadSchema = z.object({
  name: z.string().min(3).max(120),
  story: z.string().min(10).max(5000),
  isPublic: z.boolean().default(true),
  location: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    address: z.string().min(1).max(255),
    cityRegion: z.string().min(1).max(255)
  }),
  images: z.array(z.string().url()).max(5).optional()
})

export type HeritageSitePayload = z.infer<typeof heritageSitePayloadSchema>
