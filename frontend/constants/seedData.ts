import { USERS, FAKE_USERS } from './users'

export { FAKE_USERS }

// Raw seed data from JSON
const RAW_SEED_DATA = {
  "seedPeople": [
    {
      "id": "seed-person-cabo-gomez",
      "name": "Cabo Antonio Gómez",
      "birthDate": null,
      "deathDate": null,
      "birthPlace": "Arica, Chile",
      "deathPlace": "Arica, Chile",
      "verified": false
    },
    {
      "id": "seed-person-hermogenes-san-martin",
      "name": "Hermógenes San Martín",
      "birthDate": null,
      "deathDate": null,
      "birthPlace": "Chile",
      "deathPlace": "Iquique, Chile",
      "verified": false
    },
    {
      "id": "seed-person-evaristo-montt",
      "name": "Evaristo Montt",
      "birthDate": null,
      "deathDate": null,
      "birthPlace": "Antofagasta, Chile",
      "deathPlace": "Antofagasta, Chile",
      "verified": false
    },
    {
      "id": "seed-person-elvirita-guillen",
      "name": "Elvirita Guillén",
      "birthDate": null,
      "deathDate": null,
      "birthPlace": "Antofagasta, Chile",
      "deathPlace": "Antofagasta, Chile",
      "verified": false
    },
    {
      "id": "seed-person-adrianitas",
      "name": "Las Adrianitas",
      "birthDate": null,
      "deathDate": null,
      "birthPlace": "Copiapó, Chile",
      "deathPlace": "Copiapó, Chile",
      "verified": false
    },
    {
      "id": "seed-person-el-quisco",
      "name": "Finado de El Quisco",
      "birthDate": null,
      "deathDate": null,
      "birthPlace": "El Quisco, Región de Valparaíso, Chile",
      "deathPlace": "El Quisco, Chile",
      "verified": false
    },
    {
      "id": "seed-person-luis-castillo",
      "name": "Luis Castillo",
      "birthDate": null,
      "deathDate": null,
      "birthPlace": "Ovalle, Chile",
      "deathPlace": "Ovalle, Chile",
      "verified": false
    },
    {
      "id": "seed-person-emile-dubois",
      "name": "Emile Dubois",
      "birthDate": "1887-01-01",
      "deathDate": "1907-08-15",
      "birthPlace": "París, Francia",
      "deathPlace": "Valparaíso, Chile",
      "verified": true
    },
    {
      "id": "seed-person-borja-street",
      "name": "Finado de la calle Borja",
      "birthDate": null,
      "deathDate": null,
      "birthPlace": "Santiago, Chile",
      "deathPlace": "Santiago, Chile",
      "verified": false
    },
    {
      "id": "seed-person-luis-mesa-bell",
      "name": "Luis Mesa Bell",
      "birthDate": null,
      "deathDate": null,
      "birthPlace": "Santiago, Chile",
      "deathPlace": "Santiago, Chile",
      "verified": false
    },
    {
      "id": "seed-person-alicia-bon",
      "name": "Alicia Bon",
      "birthDate": null,
      "deathDate": null,
      "birthPlace": "Santiago, Chile",
      "deathPlace": "Santiago, Chile",
      "verified": false
    },
    {
      "id": "seed-person-la-marinita",
      "name": "La Marinita",
      "birthDate": null,
      "deathDate": null,
      "birthPlace": null,
      "deathPlace": null,
      "verified": false
    },
    {
      "id": "seed-person-cuadra-osorio",
      "name": "Finado de Cuadra y Osorio",
      "birthDate": null,
      "deathDate": null,
      "birthPlace": "Santiago, Chile",
      "deathPlace": "Santiago, Chile",
      "verified": false
    },
    {
      "id": "seed-person-la-malvina",
      "name": "La Malvina",
      "birthDate": null,
      "deathDate": null,
      "birthPlace": "San Bernardo, Chile",
      "deathPlace": "San Bernardo, Chile",
      "verified": false
    },
    {
      "id": "seed-person-lucrecia",
      "name": "Lucrecia",
      "birthDate": null,
      "deathDate": null,
      "birthPlace": "Doñihue, Chile",
      "deathPlace": "Doñihue, Chile",
      "verified": false
    },
    {
      "id": "seed-person-felipe-curico",
      "name": "Felipe",
      "birthDate": null,
      "deathDate": null,
      "birthPlace": "Curicó, Chile",
      "deathPlace": "Curicó, Chile",
      "verified": false
    },
    {
      "id": "seed-person-el-pepe",
      "name": "El Pepe",
      "birthDate": null,
      "deathDate": null,
      "birthPlace": "San Fernando, Chile",
      "deathPlace": "San Fernando, Chile",
      "verified": false
    },
    {
      "id": "seed-person-juanita-ibanez",
      "name": "Juanita Ibáñez",
      "birthDate": null,
      "deathDate": null,
      "birthPlace": "Linares, Chile",
      "deathPlace": "Linares, Chile",
      "verified": false
    },
    {
      "id": "seed-person-servandito",
      "name": "Servandito",
      "birthDate": null,
      "deathDate": null,
      "birthPlace": "Linares, Chile",
      "deathPlace": "Linares, Chile",
      "verified": false
    },
    {
      "id": "seed-person-manriquez",
      "name": "Manríquez",
      "birthDate": null,
      "deathDate": null,
      "birthPlace": "Talca, Chile",
      "deathPlace": "Talca, Chile",
      "verified": false
    },
    {
      "id": "seed-person-raimundo",
      "name": "Raimundo",
      "birthDate": null,
      "deathDate": null,
      "birthPlace": "Chillán, Chile",
      "deathPlace": "Chillán, Chile",
      "verified": false
    },
    {
      "id": "seed-person-canaquita",
      "name": "El Canaquita",
      "birthDate": null,
      "deathDate": null,
      "birthPlace": "San Carlos, Chile",
      "deathPlace": "San Carlos, Chile",
      "verified": false
    },
    {
      "id": "seed-person-estudiantes-chillan",
      "name": "Animita de Estudiantes",
      "birthDate": null,
      "deathDate": null,
      "birthPlace": "Chillán, Chile",
      "deathPlace": "Chillán, Chile",
      "verified": false
    },
    {
      "id": "seed-person-petronila-neira",
      "name": "Petronila Neira",
      "birthDate": null,
      "deathDate": null,
      "birthPlace": "Concepción, Chile",
      "deathPlace": "Concepción, Chile",
      "verified": false
    },
    {
      "id": "seed-person-serafin-rodriguez",
      "name": "Serafín Rodríguez",
      "birthDate": null,
      "deathDate": null,
      "birthPlace": "Valdivia, Chile",
      "deathPlace": "Valdivia, Chile",
      "verified": false
    },
    {
      "id": "seed-person-emilio-inostroza",
      "name": "Emilio Inostroza",
      "birthDate": null,
      "deathDate": null,
      "birthPlace": "Temuco, Chile",
      "deathPlace": "Temuco, Chile",
      "verified": false
    },
    {
      "id": "seed-person-palma-osorno",
      "name": "Palma",
      "birthDate": null,
      "deathDate": null,
      "birthPlace": "Osorno, Chile",
      "deathPlace": "Osorno, Chile",
      "verified": false
    },
    {
      "id": "seed-person-la-pampa-osorno",
      "name": "La Pampa",
      "birthDate": null,
      "deathDate": null,
      "birthPlace": "Osorno, Chile",
      "deathPlace": "Osorno, Chile",
      "verified": false
    },
    {
      "id": "seed-person-los-quemaitocs",
      "name": "Los Quemaítocs",
      "birthDate": null,
      "deathDate": null,
      "birthPlace": "Osorno, Chile",
      "deathPlace": "Osorno, Chile",
      "verified": false
    },
    {
      "id": "seed-person-fructuoso-soto",
      "name": "Fructuoso Soto",
      "birthDate": null,
      "deathDate": null,
      "birthPlace": "Puerto Montt, Chile",
      "deathPlace": "Puerto Montt, Chile",
      "verified": false
    },
    {
      "id": "seed-person-valeriano-chiloe",
      "name": "Valeriano",
      "birthDate": null,
      "deathDate": null,
      "birthPlace": "Chiloé, Chile",
      "deathPlace": "Chiloé, Chile",
      "verified": false
    },
    {
      "id": "seed-person-el-indio-desconocido",
      "name": "El Indio Desconocido",
      "birthDate": null,
      "deathDate": null,
      "birthPlace": "Punta Arenas, Chile",
      "deathPlace": "Punta Arenas, Chile",
      "verified": false
    }
  ],
  "seedMemorials": [
    {
      "id": "seed-memorial-cabo-gomez",
      "name": "Animita del Cabo Gómez",
      "lat": -18.4783,
      "lng": -70.3128,
      "story": "Animita popular ubicada en Arica dedicada al conocido como 'Cabo Gómez'. Lugar de ofrendas y plegarias por la protección en los viajes y trabajo. Datos locales recogidos de tradición oral y reportes de viajeros; coordenadas aproximadas (centro de Arica).",
      "images": [],
      "isPublic": true,
      "personIds": ["seed-person-cabo-gomez"],
      "createdById": "seed-user-investigadora",
      "verified": false
    },
    {
      "id": "seed-memorial-hermogenes-san-martin",
      "name": "Animita de Hermógenes San Martín",
      "lat": -20.2307,
      "lng": -70.1350,
      "story": "Animita en Iquique vinculada al recuerdo de Hermógenes San Martín, venerada por habitantes del sector y transeúntes. Coordenadas aproximadas (Iquique centro).",
      "images": [],
      "isPublic": true,
      "personIds": ["seed-person-hermogenes-san-martin"],
      "createdById": "seed-user-investigadora",
      "verified": false
    },
    {
      "id": "seed-memorial-evaristo-montt",
      "name": "Animita de Evaristo Montt",
      "lat": -23.6509,
      "lng": -70.3975,
      "story": "Animita en Antofagasta conocida localmente como la de Evaristo Montt. Lugar de ofrendas, flores y velas. Información básica y coordenadas aproximadas (centro Antofagasta).",
      "images": [],
      "isPublic": true,
      "personIds": ["seed-person-evaristo-montt"],
      "createdById": "seed-user-equipo",
      "verified": false
    },
    {
      "id": "seed-memorial-adrianitas",
      "name": "Animita de las Adrianitas",
      "lat": -27.3668,
      "lng": -70.3324,
      "story": "Animita en Copiapó conocida como 'las Adrianitas', vinculada a varias jóvenes recordadas por la comunidad. Coordenadas aproximadas (centro Copiapó).",
      "images": [],
      "isPublic": true,
      "personIds": ["seed-person-adrianitas"],
      "createdById": "seed-user-investigadora",
      "verified": false
    },
    {
      "id": "seed-memorial-el-quisco",
      "name": "Animita de El Quisco",
      "lat": -33.4171,
      "lng": -71.6348,
      "story": "Animita ubicada en El Quisco (región de Valparaíso). Sitio de devoción playera y ofrendas. Coordenadas aproximadas (centro El Quisco).",
      "images": [],
      "isPublic": true,
      "personIds": ["seed-person-el-quisco"],
      "createdById": "seed-user-equipo",
      "verified": false
    },
    {
      "id": "seed-memorial-luis-castillo",
      "name": "Animita de Luis Castillo",
      "lat": -30.5936,
      "lng": -71.2007,
      "story": "Animita referida en Ovalle a Luis Castillo, punto local de ofrendas. Coordenadas aproximadas (Ovalle centro).",
      "images": [],
      "isPublic": true,
      "personIds": ["seed-person-luis-castillo"],
      "createdById": "seed-user-investigadora",
      "verified": false
    },
    {
      "id": "seed-memorial-borja",
      "name": "Animita de la calle Borja",
      "lat": -33.4440,
      "lng": -70.6506,
      "story": "Animita ubicada en Santiago (sector calle Borja). Tradición local de dejar velas y ofrendas. Coordenadas aproximadas (Santiago).",
      "images": [],
      "isPublic": true,
      "personIds": ["seed-person-borja-street"],
      "createdById": "seed-user-equipo",
      "verified": false
    },
    {
      "id": "seed-memorial-la-marinita",
      "name": "Animita de la Marinita",
      "lat": -33.0000,
      "lng": -71.0000,
      "story": "Animita conocida localmente como 'la Marinita'. Datos de ubicación y biografía locales; coordenadas genéricas hasta verificación.",
      "images": [],
      "isPublic": true,
      "personIds": ["seed-person-la-marinita"],
      "createdById": "seed-user-investigadora",
      "verified": false
    },
    {
      "id": "seed-memorial-la-malvina",
      "name": "Animita de La Malvina",
      "lat": -33.6069,
      "lng": -70.7126,
      "story": "Animita en San Bernardo conocida como 'La Malvina'. Lugar de devoción local. Coordenadas aproximadas (San Bernardo centro).",
      "images": [],
      "isPublic": true,
      "personIds": ["seed-person-la-malvina"],
      "createdById": "seed-user-investigadora",
      "verified": false
    },
    {
      "id": "seed-memorial-lucrecia",
      "name": "Animita de Lucrecia",
      "lat": -34.2530,
      "lng": -70.9226,
      "story": "Animita en Doñihue (Región de O'Higgins) dedicada a Lucrecia. Ofrendas y votivas frecuentes. Coordenadas aproximadas.",
      "images": [],
      "isPublic": true,
      "personIds": ["seed-person-lucrecia"],
      "createdById": "seed-user-equipo",
      "verified": false
    },
    {
      "id": "seed-memorial-felipe-curico",
      "name": "Animita de Felipe (Curicó)",
      "lat": -34.9853,
      "lng": -71.2405,
      "story": "Animita en Curicó recordada como la de 'Felipe'. Tradición local de velas y monedas. Coordenadas aproximadas (Curicó).",
      "images": [],
      "isPublic": true,
      "personIds": ["seed-person-felipe-curico"],
      "createdById": "seed-user-investigadora",
      "verified": false
    },
    {
      "id": "seed-memorial-el-pepe",
      "name": "Animita de El Pepe",
      "lat": -34.5833,
      "lng": -70.9894,
      "story": "Animita en San Fernando conocida como 'El Pepe'. Lugar de devoción popular. Coordenadas aproximadas.",
      "images": [],
      "isPublic": true,
      "personIds": ["seed-person-el-pepe"],
      "createdById": "seed-user-equipo",
      "verified": false
    },
    {
      "id": "seed-memorial-juanita-ibanez",
      "name": "Animita de Juanita Ibáñez",
      "lat": -35.8397,
      "lng": -71.5950,
      "story": "Animita en Linares dedicada a Juanita Ibáñez. Ofrendas de vecinos y visitantes. Coordenadas aproximadas (Linares).",
      "images": [],
      "isPublic": true,
      "personIds": ["seed-person-juanita-ibanez"],
      "createdById": "seed-user-investigadora",
      "verified": false
    },
    {
      "id": "seed-memorial-manriquez",
      "name": "Animita de Manríquez",
      "lat": -35.4268,
      "lng": -71.6554,
      "story": "Animita de Talca en memoria de Manríquez. Ofrendas y velas regularmente. Coordenadas aproximadas (Talca).",
      "images": [],
      "isPublic": true,
      "personIds": ["seed-person-manriquez"],
      "createdById": "seed-user-investigadora",
      "verified": false
    },
    {
      "id": "seed-memorial-raimundo",
      "name": "Animita de Raimundo",
      "lat": -36.6068,
      "lng": -72.1034,
      "story": "Animita en Chillán conocida como 'Raimundo'. Tradición local de dejar ofrendas por favores concedidos.",
      "images": [],
      "isPublic": true,
      "personIds": ["seed-person-raimundo"],
      "createdById": "seed-user-equipo",
      "verified": false
    },
    {
      "id": "seed-memorial-canaquita",
      "name": "Animita del Canaquita",
      "lat": -36.4226,
      "lng": -71.9777,
      "story": "Animita ubicada en San Carlos, conocida como 'El Canaquita'. Lugar de devoción local.",
      "images": [],
      "isPublic": true,
      "personIds": ["seed-person-canaquita"],
      "createdById": "seed-user-investigadora",
      "verified": false
    },
    {
      "id": "seed-memorial-petronila-neira",
      "name": "Animita de Petronila Neira",
      "lat": -36.8201,
      "lng": -73.0444,
      "story": "Animita en Concepción dedicada a Petronila Neira. Sitio de ofrendas y plegarias. Coordenadas aproximadas (Concepción).",
      "images": [],
      "isPublic": true,
      "personIds": ["seed-person-petronila-neira"],
      "createdById": "seed-user-investigadora",
      "verified": false
    },
    {
      "id": "seed-memorial-serafin-rodriguez",
      "name": "Animita de Serafín Rodríguez",
      "lat": -39.8148,
      "lng": -73.2459,
      "story": "Animita en Valdivia dedicada a Serafín Rodríguez. Lugar de recuerdo y ofrendas locales.",
      "images": [],
      "isPublic": true,
      "personIds": ["seed-person-serafin-rodriguez"],
      "createdById": "seed-user-investigadora",
      "verified": false
    },
    {
      "id": "seed-memorial-emilio-inostroza",
      "name": "Animita de Emilio Inostroza",
      "lat": -38.7369,
      "lng": -72.5904,
      "story": "Animita en Temuco dedicada a Emilio Inostroza. Lugar de plegarias y ofrendas.",
      "images": [],
      "isPublic": true,
      "personIds": ["seed-person-emilio-inostroza"],
      "createdById": "seed-user-equipo",
      "verified": false
    },
    {
      "id": "seed-memorial-palma-osorno",
      "name": "Animita de Palma",
      "lat": -40.5741,
      "lng": -73.1331,
      "story": "Animita en Osorno conocida como 'de Palma'. Ofrendas y velas frecuentes.",
      "images": [],
      "isPublic": true,
      "personIds": ["seed-person-palma-osorno"],
      "createdById": "seed-user-investigadora",
      "verified": false
    },
    {
      "id": "seed-memorial-fructuoso-soto",
      "name": "Animita de Fructuoso Soto",
      "lat": -41.4743,
      "lng": -72.9369,
      "story": "Animita en Puerto Montt dedicada a Fructuoso Soto. Lugar de devoción y plegarias.",
      "images": [],
      "isPublic": true,
      "personIds": ["seed-person-fructuoso-soto"],
      "createdById": "seed-user-equipo",
      "verified": false
    },
    {
      "id": "seed-memorial-valeriano-chiloe",
      "name": "Animita de Valeriano",
      "lat": -42.6000,
      "lng": -73.8000,
      "story": "Animita en Chiloé dedicada a Valeriano. Coordenadas aproximadas (isla grande de Chiloé).",
      "images": [],
      "isPublic": true,
      "personIds": ["seed-person-valeriano-chiloe"],
      "createdById": "seed-user-investigadora",
      "verified": false
    },
    {
      "id": "seed-memorial-el-indio-desconocido",
      "name": "Animita de El Indio Desconocido",
      "lat": -53.1638,
      "lng": -70.9171,
      "story": "Animita en Punta Arenas conocida como 'El Indio Desconocido', venerada por pobladores locales y viajeros.",
      "images": [],
      "isPublic": true,
      "personIds": ["seed-person-el-indio-desconocido"],
      "createdById": "seed-user-equipo",
      "verified": false
    }
  ]
}

export interface MockStory {
  id: string;
  type: 'image' | 'video';
  src: string;
  user: { username: string; avatar: string };
  isLive: boolean;
  viewed: boolean;
}

export function generateMockStories(count = 5): MockStory[] {
  const userKeys = Object.keys(FAKE_USERS).filter(k => k !== 'current-user')
  const shuffledUsers = userKeys.sort(() => 0.5 - Math.random())

  // Ensure we have at least one video for the live story
  const mediaPool = [
    { type: 'video', src: '/stories/IMG_6247.mp4' },
    { type: 'image', src: '/stories/IMG_6250.webp' },
    { type: 'image', src: '/stories/IMG_6250%202.webp' },
    { type: 'image', src: '/stories/IMG_6260.webp' },
    { type: 'image', src: '/stories/IMG_6267.webp' },
  ] as const

  // Select one video to be the live story
  const liveVideoIndex = mediaPool.findIndex(m => m.type === 'video')

  return Array.from({ length: count }).map((_, i) => {
    const userKey = shuffledUsers[i % shuffledUsers.length]
    const user = FAKE_USERS[userKey]

    // If we run out of unique media, cycle through
    const media = mediaPool[i % mediaPool.length]

    // Only the specific video is live
    const isLive = media.type === 'video'

    return {
      id: `story-${i}-${Date.now()}`,
      type: media.type as 'image' | 'video',
      src: media.src,
      user: user,
      isLive: isLive,
      viewed: false
    };
  });
};
