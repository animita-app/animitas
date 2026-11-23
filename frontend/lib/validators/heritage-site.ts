import { z } from "zod";

export const ANIMITA_NAME_MIN = 3;

export const heritageSitePayloadSchema = z.object({
  name: z.string().trim().min(ANIMITA_NAME_MIN, "Escribe al menos 3 letras").max(120, "Usa 120 letras o menos"),
  story: z.string().trim().max(10000).optional().default(""),
  isPublic: z.boolean().default(true),
  location: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    address: z.string().min(1).max(255).optional(),
    cityRegion: z.string().min(1).max(255).optional(),
  }),
  images: z.array(z.string().url()).max(5).optional(),
});

export type HeritageSitePayload = z.infer<typeof heritageSitePayloadSchema>;
