import type { Animita, Sticker, Petition } from '@/types/mock'

export const SEED_ANIMITAS: Animita[] = [
  {
    id: "animita-de-astrid",
    name: "Animita de Astrid",
    lat: -33.5617032,
    lng: -70.8373234,
    story: "Astrid Soto, \"La Niña Hermosa\", murió en 1998 en un accidente en la Ruta 78. Su familia puso una animita con peluches en su memoria, que se convirtió en lugar de devoción popular. Tras su traslado en 2020, sigue siendo visitada por quienes piden favores y cumplen promesas.",
    deathDate: "1998-01-01",
    birthDate: "1980-01-01",
    biography: "Astrid Soto fue conocida como 'La Niña Hermosa'. Su animita se convirtió en un sitio de peregrinación donde muchas personas acuden a pedir favores y hacer promesas en su memoria.",
    images: [
      "https://lqkwpjkibpkfoilfpfxz.supabase.co/storage/v1/object/public/base/animitas/images/animita-de-astrid/astrid.jpg",
      "https://lqkwpjkibpkfoilfpfxz.supabase.co/storage/v1/object/public/base/animitas/images/animita-de-astrid/astrid2.jpg",
      "https://lqkwpjkibpkfoilfpfxz.supabase.co/storage/v1/object/public/base/animitas/images/animita-de-astrid/astrid3.jpg",
    ],
    material: [
      { id: "s1", type: "flower", date: "2025-10-21", userId: "user-1", message: "Por siempre en nuestros corazones" },
      { id: "s2", type: "rose", date: "2025-10-20", userId: "user-2", message: null },
      { id: "s3", type: "candle", date: "2025-10-19", userId: "user-3", message: "Descansa en paz" },
      { id: "s4", type: "heart", date: "2025-10-18", userId: "user-4", message: null },
    ] as any,
    peticiones: [
      { id: "p1", texto: "Que encuentre paz eternal", fecha: "2025-10-21", duracion: "7 dias", estado: "activa" },
      { id: "p2", texto: "Protege a su familia", fecha: "2025-10-20", duracion: "3 dias", estado: "activa" },
      { id: "p3", texto: "Que su memoria viva siempre", fecha: "2025-10-10", duracion: "7 dias", estado: "cumplida" },
    ] as any,
    createdAt: "2025-10-21",
    isPublic: true,
  },
  {
    id: "animita-de-emile-dubois",
    name: "Animita de Emile Dubois",
    lat: -33.0275463,
    lng: -71.6478226,
    story: "Emile Dubois, nacido en Francia en 1867 como Luis Amadeo Brihier Lacroix, fue un aventurero que vivió por toda Sudamérica. Se ganó fama como \"el artista del crimen\" tras varios asesinatos en Chile y Valparaíso, muchos vinculados a robos. Capturado y encarcelado, siempre alegó su inocencia y se defendió solo en el juicio, mostrando una calma y valentía que impactaron al público. Se casó horas antes de ser fusilado en 1907, y su audacia y tragedia lo convirtieron en leyenda. Su animita es visitada por quienes buscan protección ante injusticias y milagros.",
    deathDate: "1907-01-01",
    birthDate: "1867-01-01",
    biography: "Emile Dubois fue un francés aventurero que se convirtió en una figura legendaria en Chile. Su vida fue marcada por controversia, pero su animita se convirtió en un lugar donde muchas personas acuden a pedir protección ante injusticias.",
    images: [
      "https://lqkwpjkibpkfoilfpfxz.supabase.co/storage/v1/object/public/base/animitas/images/animita-de-emile-dubois/CleanShot%202025-10-20%20at%2022.49.02@2x.png",
      "https://lqkwpjkibpkfoilfpfxz.supabase.co/storage/v1/object/public/base/animitas/images/animita-de-emile-dubois/CleanShot%202025-10-20%20at%2022.49.06@2x.png",
    ],
    material: [
      { id: "s5", type: "rose", date: "2025-10-21", userId: "user-5", message: "Leyenda viva" },
      { id: "s6", type: "heart", date: "2025-10-19", userId: "user-6", message: null },
      { id: "s7", type: "candle", date: "2025-10-17", userId: "user-7", message: "Justicia divina" },
    ] as any,
    peticiones: [
      { id: "p4", texto: "Protege a los injustamente acusados", fecha: "2025-10-21", duracion: "7 dias", estado: "activa" },
      { id: "p5", texto: "Que la verdad prevalezca", fecha: "2025-10-15", duracion: "3 dias", estado: "cumplida" },
    ] as any,
    createdAt: "2025-10-21",
    isPublic: true,
  },
  {
    id: "animita-de-romualdito",
    name: "Animita de Romualdito",
    lat: -33.4520189,
    lng: -70.6803072,
    story: "Romualdito es una de las animitas más antiguas de Santiago. Hay muchas historias sobre quién era y cómo murió. Algunos dicen que era un campesino que andaba de paso, otros que era un joven con alguna discapacidad, un niño pequeño asesinado, o un hombre enfermo que fue atacado. La versión que más se cree es que era un mecánico de 41 años que, en 1933, fue apuñalado durante un asalto. Aunque murió adulto, muchos devotos lo recuerdan y veneran como si fuera un niño.",
    deathDate: "1933-01-01",
    birthDate: "1892-01-01",
    biography: "Romualdito es una figura misteriosa en la historia de Santiago. Su identidad exacta sigue siendo un misterio, pero lo que es cierto es que su animita se ha convertido en uno de los lugares más devotos de la capital, donde miles de personas han acudido a pedir milagros y cumplir promesas.",
    images: [
      "https://lqkwpjkibpkfoilfpfxz.supabase.co/storage/v1/object/public/base/animitas/images/animita-de-romualdito/CleanShot%202025-10-20%20at%2022.25.38@2x.png",
      "https://lqkwpjkibpkfoilfpfxz.supabase.co/storage/v1/object/public/base/animitas/images/animita-de-romualdito/CleanShot%202025-10-20%20at%2022.25.45@2x.png",
      "https://lqkwpjkibpkfoilfpfxz.supabase.co/storage/v1/object/public/base/animitas/images/animita-de-romualdito/CleanShot%202025-10-20%20at%2022.25.52@2x.png",
      "https://lqkwpjkibpkfoilfpfxz.supabase.co/storage/v1/object/public/base/animitas/images/animita-de-romualdito/CleanShot%202025-10-20%20at%2022.26.07@2x.png",
    ],
    material: [
      { id: "s8", type: "flower", date: "2025-10-21", userId: "user-8", message: "Misterio y devoción" },
      { id: "s9", type: "candle", date: "2025-10-20", userId: "user-9", message: null },
      { id: "s10", type: "heart", date: "2025-10-19", userId: "user-10", message: "Milagros concedidos" },
      { id: "s11", type: "rose", date: "2025-10-18", userId: "user-11", message: null },
      { id: "s12", type: "flower", date: "2025-10-16", userId: "user-12", message: "Por la gracia recibida" },
    ] as any,
    peticiones: [
      { id: "p6", texto: "Concede el milagro que necesito", fecha: "2025-10-21", duracion: "7 dias", estado: "activa" },
      { id: "p7", texto: "Guía mi camino", fecha: "2025-10-19", duracion: "3 dias", estado: "activa" },
      { id: "p8", texto: "Devuelve la salud", fecha: "2025-10-12", duracion: "7 dias", estado: "cumplida" },
      { id: "p9", texto: "Protege mi familia", fecha: "2025-10-09", duracion: "1 dia", estado: "expirada" },
    ] as any,
    createdAt: "2025-10-21",
    isPublic: true,
  },
]

export const SEED_MOCK_STICKERS: Sticker[] = []

export const SEED_MOCK_PETITIONS: Petition[] = []
