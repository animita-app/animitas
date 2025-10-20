const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const seedUsers = [
  {
    id: 'seed-user-equipo',
    phone: '+56912345678',
    displayName: 'Equipo Animita',
    email: 'equipo@animitas.cl',
    role: 'ADMIN',
    profilePicture: 'https://example.org/images/equipo-animitas.jpg',
    image: 'https://example.org/images/equipo-animitas.jpg',
    phoneVerified: new Date()
  },
  {
    id: 'seed-user-investigadora',
    phone: '+56987654321',
    displayName: 'Investigadora Patrimonial',
    email: 'investigadora@animitas.cl',
    role: 'PREMIUM',
    profilePicture: 'https://example.org/images/investigadora.jpg',
    image: 'https://example.org/images/investigadora.jpg',
    phoneVerified: new Date()
  }
]

const seedPeople = [
  {
    id: 'seed-person-cabo-gomez',
    name: 'Cabo Antonio Gómez',
    birthDate: null,
    deathDate: null,
    birthPlace: 'Arica, Chile',
    deathPlace: 'Arica, Chile'
  },
  {
    id: 'seed-person-hermogenes-san-martin',
    name: 'Hermógenes San Martín',
    birthDate: null,
    deathDate: null,
    birthPlace: 'Chile',
    deathPlace: 'Iquique, Chile'
  },
  {
    id: 'seed-person-evaristo-montt',
    name: 'Evaristo Montt',
    birthDate: null,
    deathDate: null,
    birthPlace: 'Antofagasta, Chile',
    deathPlace: 'Antofagasta, Chile'
  },
  {
    id: 'seed-person-elvirita-guillen',
    name: 'Elvirita Guillén',
    birthDate: null,
    deathDate: null,
    birthPlace: 'Antofagasta, Chile',
    deathPlace: 'Antofagasta, Chile'
  },
  {
    id: 'seed-person-adrianitas',
    name: 'Las Adrianitas',
    birthDate: null,
    deathDate: null,
    birthPlace: 'Copiapó, Chile',
    deathPlace: 'Copiapó, Chile'
  },
  {
    id: 'seed-person-el-quisco',
    name: 'Finado de El Quisco',
    birthDate: null,
    deathDate: null,
    birthPlace: 'El Quisco, Región de Valparaíso, Chile',
    deathPlace: 'El Quisco, Chile'
  },
  {
    id: 'seed-person-luis-castillo',
    name: 'Luis Castillo',
    birthDate: null,
    deathDate: null,
    birthPlace: 'Ovalle, Chile',
    deathPlace: 'Ovalle, Chile'
  },
  {
    id: 'seed-person-emile-dubois',
    name: 'Emile Dubois',
    birthDate: new Date('1887-01-01T00:00:00Z'),
    deathDate: new Date('1907-08-15T00:00:00Z'),
    birthPlace: 'París, Francia',
    deathPlace: 'Valparaíso, Chile'
  },
  {
    id: 'seed-person-borja-street',
    name: 'Finado de la calle Borja',
    birthDate: null,
    deathDate: null,
    birthPlace: 'Santiago, Chile',
    deathPlace: 'Santiago, Chile'
  },
  {
    id: 'seed-person-luis-mesa-bell',
    name: 'Luis Mesa Bell',
    birthDate: null,
    deathDate: null,
    birthPlace: 'Santiago, Chile',
    deathPlace: 'Santiago, Chile'
  },
  {
    id: 'seed-person-alicia-bon',
    name: 'Alicia Bon',
    birthDate: null,
    deathDate: null,
    birthPlace: 'Santiago, Chile',
    deathPlace: 'Santiago, Chile'
  },
  {
    id: 'seed-person-la-marinita',
    name: 'La Marinita',
    birthDate: null,
    deathDate: null,
    birthPlace: null,
    deathPlace: null
  },
  {
    id: 'seed-person-cuadra-osorio',
    name: 'Finado de Cuadra y Osorio',
    birthDate: null,
    deathDate: null,
    birthPlace: 'Santiago, Chile',
    deathPlace: 'Santiago, Chile'
  },
  {
    id: 'seed-person-la-malvina',
    name: 'La Malvina',
    birthDate: null,
    deathDate: null,
    birthPlace: 'San Bernardo, Chile',
    deathPlace: 'San Bernardo, Chile'
  },
  {
    id: 'seed-person-lucrecia',
    name: 'Lucrecia',
    birthDate: null,
    deathDate: null,
    birthPlace: 'Doñihue, Chile',
    deathPlace: 'Doñihue, Chile'
  },
  {
    id: 'seed-person-felipe-curico',
    name: 'Felipe',
    birthDate: null,
    deathDate: null,
    birthPlace: 'Curicó, Chile',
    deathPlace: 'Curicó, Chile'
  },
  {
    id: 'seed-person-el-pepe',
    name: 'El Pepe',
    birthDate: null,
    deathDate: null,
    birthPlace: 'San Fernando, Chile',
    deathPlace: 'San Fernando, Chile'
  },
  {
    id: 'seed-person-juanita-ibanez',
    name: 'Juanita Ibáñez',
    birthDate: null,
    deathDate: null,
    birthPlace: 'Linares, Chile',
    deathPlace: 'Linares, Chile'
  },
  {
    id: 'seed-person-servandito',
    name: 'Servandito',
    birthDate: null,
    deathDate: null,
    birthPlace: 'Linares, Chile',
    deathPlace: 'Linares, Chile'
  },
  {
    id: 'seed-person-manriquez',
    name: 'Manríquez',
    birthDate: null,
    deathDate: null,
    birthPlace: 'Talca, Chile',
    deathPlace: 'Talca, Chile'
  },
  {
    id: 'seed-person-raimundo',
    name: 'Raimundo',
    birthDate: null,
    deathDate: null,
    birthPlace: 'Chillán, Chile',
    deathPlace: 'Chillán, Chile'
  },
  {
    id: 'seed-person-canaquita',
    name: 'El Canaquita',
    birthDate: null,
    deathDate: null,
    birthPlace: 'San Carlos, Chile',
    deathPlace: 'San Carlos, Chile'
  },
  {
    id: 'seed-person-estudiantes-chillan',
    name: 'Animita de Estudiantes',
    birthDate: null,
    deathDate: null,
    birthPlace: 'Chillán, Chile',
    deathPlace: 'Chillán, Chile'
  },
  {
    id: 'seed-person-petronila-neira',
    name: 'Petronila Neira',
    birthDate: null,
    deathDate: null,
    birthPlace: 'Concepción, Chile',
    deathPlace: 'Concepción, Chile'
  },
  {
    id: 'seed-person-ferrada-mardones',
    name: 'Ferrada y Mardones',
    birthDate: null,
    deathDate: null,
    birthPlace: null,
    deathPlace: null
  },
  {
    id: 'seed-person-serafin-rodriguez',
    name: 'Serafín Rodríguez',
    birthDate: null,
    deathDate: null,
    birthPlace: 'Valdivia, Chile',
    deathPlace: 'Valdivia, Chile'
  },
  {
    id: 'seed-person-emilio-inostroza',
    name: 'Emilio Inostroza',
    birthDate: null,
    deathDate: null,
    birthPlace: 'Temuco, Chile',
    deathPlace: 'Temuco, Chile'
  },
  {
    id: 'seed-person-palma-osorno',
    name: 'Palma',
    birthDate: null,
    deathDate: null,
    birthPlace: 'Osorno, Chile',
    deathPlace: 'Osorno, Chile'
  },
  {
    id: 'seed-person-la-pampa-osorno',
    name: 'La Pampa',
    birthDate: null,
    deathDate: null,
    birthPlace: 'Osorno, Chile',
    deathPlace: 'Osorno, Chile'
  },
  {
    id: 'seed-person-los-quemaitocs',
    name: 'Los Quemaítocs',
    birthDate: null,
    deathDate: null,
    birthPlace: 'Osorno, Chile',
    deathPlace: 'Osorno, Chile'
  },
  {
    id: 'seed-person-fructuoso-soto',
    name: 'Fructuoso Soto',
    birthDate: null,
    deathDate: null,
    birthPlace: 'Puerto Montt, Chile',
    deathPlace: 'Puerto Montt, Chile'
  },
  {
    id: 'seed-person-valeriano-chiloe',
    name: 'Valeriano',
    birthDate: null,
    deathDate: null,
    birthPlace: 'Chiloé, Chile',
    deathPlace: 'Chiloé, Chile'
  },
  {
    id: 'seed-person-el-indio-desconocido',
    name: 'El Indio Desconocido',
    birthDate: null,
    deathDate: null,
    birthPlace: 'Punta Arenas, Chile',
    deathPlace: 'Punta Arenas, Chile'
  }
]

const personImages = {
  'seed-person-cabo-gomez': 'https://res.cloudinary.com/disu440uf/image/upload/v1760990381/seed-images/DSCN6074.jpg',
  'seed-person-hermogenes-san-martin': 'https://res.cloudinary.com/disu440uf/image/upload/v1760990382/seed-images/91bcfbb43f59b82ba7a516edf8b65d70.jpg',
  'seed-person-evaristo-montt': 'https://res.cloudinary.com/disu440uf/image/upload/v1760990384/seed-images/evaristo-montt.jpg',
  'seed-person-elvirita-guillen': 'https://res.cloudinary.com/disu440uf/image/upload/v1760990386/seed-images/1351109931-8.jpg',
  'seed-person-adrianitas': 'https://res.cloudinary.com/disu440uf/image/upload/v1760990389/seed-images/Revista-Letra-Brava-Revista-Mujer-Atacama-Letra-Brava-Turismo-Atacama-Cementerio-Copiap%25C3%25B3-3.jpg',
  'seed-person-el-quisco': 'https://res.cloudinary.com/disu440uf/image/upload/v1760990516/seed-images/wqcsbfbzeayzwv2azj4d.jpg',
  'seed-person-luis-castillo': 'https://res.cloudinary.com/disu440uf/image/upload/v1760990517/seed-images/wvcurudlfhda9dhiowes.jpg',
  'seed-person-emile-dubois': 'https://res.cloudinary.com/disu440uf/image/upload/v1760990392/seed-images/Emile_Dubois_1867-1907.jpg',
  'seed-person-borja-street': 'https://res.cloudinary.com/disu440uf/image/upload/v1760990521/seed-images/zsvv1auhmo79zjzay6vi.jpg',
  'seed-person-luis-mesa-bell': 'https://res.cloudinary.com/disu440uf/image/upload/v1760990394/seed-images/luis_mesa_bell.jpg',
  'seed-person-alicia-bon': 'https://res.cloudinary.com/disu440uf/image/upload/v1760990395/seed-images/1byn_alicia.jpg',
  'seed-person-la-marinita': 'https://res.cloudinary.com/disu440uf/image/upload/v1760990525/seed-images/sb1bmmopgncu66q1tu6q.jpg',
  'seed-person-cuadra-osorio': 'https://res.cloudinary.com/disu440uf/image/upload/v1760990526/seed-images/qk4bouusybobbwjpgyuz.jpg',
  'seed-person-la-malvina': 'https://res.cloudinary.com/disu440uf/image/upload/v1760990527/seed-images/wmn0ntqqezsxeqd4ujuj.jpg',
  'seed-person-lucrecia': 'https://res.cloudinary.com/disu440uf/image/upload/v1760990529/seed-images/vmpmj2kze4ozbbfuqkoh.jpg',
  'seed-person-felipe-curico': 'https://res.cloudinary.com/disu440uf/image/upload/v1760990530/seed-images/zkucy35vhagxt0oi0mbw.jpg',
  'seed-person-el-pepe': 'https://res.cloudinary.com/disu440uf/image/upload/v1760990532/seed-images/sstvnonlc0mvnen7jfsu.jpg',
  'seed-person-juanita-ibanez': 'https://res.cloudinary.com/disu440uf/image/upload/v1760990533/seed-images/qptcelhiodowf1qrpqp2.jpg',
  'seed-person-servandito': 'https://res.cloudinary.com/disu440uf/image/upload/v1760990534/seed-images/zgzdyhsqa1mmtrf1igz9.jpg',
  'seed-person-manriquez': 'https://res.cloudinary.com/disu440uf/image/upload/v1760990535/seed-images/yys7oq2f65nfkjcfihoe.jpg',
  'seed-person-raimundo': 'https://res.cloudinary.com/disu440uf/image/upload/v1760990536/seed-images/c9hgriwswr9bpi6ost8j.jpg',
  'seed-person-canaquita': 'https://res.cloudinary.com/disu440uf/image/upload/v1760990406/seed-images/pexels-photo-614810.jpg',
  'seed-person-estudiantes-chillan': 'https://res.cloudinary.com/disu440uf/image/upload/v1760990407/seed-images/pexels-photo-1704488.jpg',
  'seed-person-petronila-neira': 'https://res.cloudinary.com/disu440uf/image/upload/v1760990408/seed-images/pexels-photo-1170979.jpg',
  'seed-person-ferrada-mardones': 'https://res.cloudinary.com/disu440uf/image/upload/v1760990409/seed-images/pexels-photo-733872.jpg',
  'seed-person-serafin-rodriguez': 'https://res.cloudinary.com/disu440uf/image/upload/v1760990410/seed-images/pexels-photo-458766.jpg',
  'seed-person-emilio-inostroza': 'https://res.cloudinary.com/disu440uf/image/upload/v1760990411/seed-images/pexels-photo-220453.jpg',
  'seed-person-palma-osorno': 'https://res.cloudinary.com/disu440uf/image/upload/v1760990412/seed-images/pexels-photo-774909.jpg',
  'seed-person-la-pampa-osorno': 'https://res.cloudinary.com/disu440uf/image/upload/v1760990415/seed-images/pexels-photo-1445527.jpg',
  'seed-person-los-quemaitocs': 'https://res.cloudinary.com/disu440uf/image/upload/v1760990416/seed-images/pexels-photo-2050979.jpg',
  'seed-person-fructuoso-soto': 'https://res.cloudinary.com/disu440uf/image/upload/v1760990417/seed-images/pexels-photo-1181424.jpg',
  'seed-person-valeriano-chiloe': 'https://res.cloudinary.com/disu440uf/image/upload/v1760990418/seed-images/pexels-photo-139829.jpg',
  'seed-person-el-indio-desconocido': 'https://res.cloudinary.com/disu440uf/image/upload/v1760990419/seed-images/pexels-photo-2379005.jpg'
}

const seedMemorials = [
  {
    id: 'seed-memorial-cabo-gomez',
    name: 'Animita del Cabo Gómez',
    lat: -18.4783,
    lng: -70.3128,
    story: 'Animita popular ubicada en Arica dedicada al conocido como \'Cabo Gómez\'. Lugar de ofrendas y plegarias por la protección en los viajes y trabajo. Datos locales recogidos de tradición oral y reportes de viajeros; coordenadas aproximadas (centro de Arica).',
    isPublic: true,
    personIds: ['seed-person-cabo-gomez'],
    createdById: 'seed-user-investigadora'
  },
  {
    id: 'seed-memorial-hermogenes-san-martin',
    name: 'Animita de Hermógenes San Martín',
    lat: -20.2307,
    lng: -70.1350,
    story: 'Animita en Iquique vinculada al recuerdo de Hermógenes San Martín, venerada por habitantes del sector y transeúntes. Coordenadas aproximadas (Iquique centro).',
    isPublic: true,
    personIds: ['seed-person-hermogenes-san-martin'],
    createdById: 'seed-user-investigadora'
  },
  {
    id: 'seed-memorial-evaristo-montt',
    name: 'Animita de Evaristo Montt',
    lat: -23.6509,
    lng: -70.3975,
    story: 'Animita en Antofagasta conocida localmente como la de Evaristo Montt. Lugar de ofrendas, flores y velas. Información básica y coordenadas aproximadas (centro Antofagasta).',
    isPublic: true,
    personIds: ['seed-person-evaristo-montt'],
    createdById: 'seed-user-equipo'
  },
  {
    id: 'seed-memorial-elvirita-guillen',
    name: 'Animita de Elvirita Guillén',
    lat: -23.6458,
    lng: -70.4032,
    story: 'Animita dedicada a Elvirita Guillén en Antofagasta. Tradición local de dejar flores y fotos. Coordenadas aproximadas (Antofagasta).',
    isPublic: true,
    personIds: ['seed-person-elvirita-guillen'],
    createdById: 'seed-user-equipo'
  },
  {
    id: 'seed-memorial-adrianitas',
    name: 'Animita de las Adrianitas',
    lat: -27.3668,
    lng: -70.3324,
    story: 'Animita en Copiapó conocida como \'las Adrianitas\', vinculada a varias jóvenes recordadas por la comunidad. Coordenadas aproximadas (centro Copiapó).',
    isPublic: true,
    personIds: ['seed-person-adrianitas'],
    createdById: 'seed-user-investigadora'
  },
  {
    id: 'seed-memorial-el-quisco',
    name: 'Animita de El Quisco',
    lat: -33.4171,
    lng: -71.6348,
    story: 'Animita ubicada en El Quisco (región de Valparaíso). Sitio de devoción playera y ofrendas. Coordenadas aproximadas (centro El Quisco).',
    isPublic: true,
    personIds: ['seed-person-el-quisco'],
    createdById: 'seed-user-equipo'
  },
  {
    id: 'seed-memorial-luis-castillo',
    name: 'Animita de Luis Castillo',
    lat: -30.5936,
    lng: -71.2007,
    story: 'Animita referida en Ovalle a Luis Castillo, punto local de ofrendas. Coordenadas aproximadas (Ovalle centro).',
    isPublic: true,
    personIds: ['seed-person-luis-castillo'],
    createdById: 'seed-user-investigadora'
  },
  {
    id: 'seed-memorial-emile-dubois',
    name: 'Animita de Emile Dubois',
    lat: -33.0429,
    lng: -71.6277,
    story: 'Emile Dubois fue un joven francés que llegó a Chile y murió en Valparaíso en 1907. Su animita es una de las más visitadas del país; se le atribuyen favores, especialmente en asuntos de amor y trabajo. (Datos verificados públicamente).',
    isPublic: true,
    personIds: ['seed-person-emile-dubois'],
    createdById: 'seed-user-investigadora'
  },
  {
    id: 'seed-memorial-borja',
    name: 'Animita de la calle Borja',
    lat: -33.4440,
    lng: -70.6506,
    story: 'Animita ubicada en Santiago (sector calle Borja). Tradición local de dejar velas y ofrendas. Coordenadas aproximadas (Santiago).',
    isPublic: true,
    personIds: ['seed-person-borja-street'],
    createdById: 'seed-user-equipo'
  },
  {
    id: 'seed-memorial-luis-mesa-bell',
    name: 'Animita de Luis Mesa Bell',
    lat: -33.4489,
    lng: -70.6693,
    story: 'Animita en Santiago dedicada a Luis Mesa Bell, conocida por vecinos y transeúntes. Coordenadas aproximadas (Santiago).',
    isPublic: true,
    personIds: ['seed-person-luis-mesa-bell'],
    createdById: 'seed-user-investigadora'
  },
  {
    id: 'seed-memorial-alicia-bon',
    name: 'Animita de Alicia Bon',
    lat: -33.4500,
    lng: -70.6666,
    story: 'Animita en Santiago dedicada a Alicia Bon. Lugar de ofrendas florales y velas. Coordenadas aproximadas.',
    isPublic: true,
    personIds: ['seed-person-alicia-bon'],
    createdById: 'seed-user-equipo'
  },
  {
    id: 'seed-memorial-la-marinita',
    name: 'Animita de la Marinita',
    lat: -33.0000,
    lng: -71.0000,
    story: 'Animita conocida localmente como \'la Marinita\'. Datos de ubicación y biografía locales; coordenadas genéricas hasta verificación.',
    isPublic: true,
    personIds: ['seed-person-la-marinita'],
    createdById: 'seed-user-investigadora'
  },
  {
    id: 'seed-memorial-cuadra-osorio',
    name: 'Animita de Cuadra y Osorio',
    lat: -33.4500,
    lng: -70.6667,
    story: 'Animita en Santiago, intersección Cuadra y Osorio. Tradición vecinal de ofrendas. Coordenadas aproximadas.',
    isPublic: true,
    personIds: ['seed-person-cuadra-osorio'],
    createdById: 'seed-user-equipo'
  },
  {
    id: 'seed-memorial-la-malvina',
    name: 'Animita de La Malvina',
    lat: -33.6069,
    lng: -70.7126,
    story: 'Animita en San Bernardo conocida como \'La Malvina\'. Lugar de devoción local. Coordenadas aproximadas (San Bernardo centro).',
    isPublic: true,
    personIds: ['seed-person-la-malvina'],
    createdById: 'seed-user-investigadora'
  },
  {
    id: 'seed-memorial-lucrecia',
    name: 'Animita de Lucrecia',
    lat: -34.2530,
    lng: -70.9226,
    story: 'Animita en Doñihue (Región de O\'Higgins) dedicada a Lucrecia. Ofrendas y votivas frecuentes. Coordenadas aproximadas.',
    isPublic: true,
    personIds: ['seed-person-lucrecia'],
    createdById: 'seed-user-equipo'
  },
  {
    id: 'seed-memorial-felipe-curico',
    name: 'Animita de Felipe (Curicó)',
    lat: -34.9853,
    lng: -71.2405,
    story: 'Animita en Curicó recordada como la de \'Felipe\'. Tradición local de velas y monedas. Coordenadas aproximadas (Curicó).',
    isPublic: true,
    personIds: ['seed-person-felipe-curico'],
    createdById: 'seed-user-investigadora'
  },
  {
    id: 'seed-memorial-el-pepe',
    name: 'Animita de El Pepe',
    lat: -34.5833,
    lng: -70.9894,
    story: 'Animita en San Fernando conocida como \'El Pepe\'. Lugar de devoción popular. Coordenadas aproximadas.',
    isPublic: true,
    personIds: ['seed-person-el-pepe'],
    createdById: 'seed-user-equipo'
  },
  {
    id: 'seed-memorial-juanita-ibanez',
    name: 'Animita de Juanita Ibáñez',
    lat: -35.8397,
    lng: -71.5950,
    story: 'Animita en Linares dedicada a Juanita Ibáñez. Ofrendas de vecinos y visitantes. Coordenadas aproximadas (Linares).',
    isPublic: true,
    personIds: ['seed-person-juanita-ibanez'],
    createdById: 'seed-user-investigadora'
  },
  {
    id: 'seed-memorial-servandito',
    name: 'Animita de Servandito',
    lat: -35.8421,
    lng: -71.5887,
    story: 'Animita en Linares conocida como \'Servandito\'. Sitio de ofrendas. Coordenadas aproximadas.',
    isPublic: true,
    personIds: ['seed-person-servandito'],
    createdById: 'seed-user-equipo'
  },
  {
    id: 'seed-memorial-manriquez',
    name: 'Animita de Manríquez',
    lat: -35.4268,
    lng: -71.6554,
    story: 'Animita de Talca en memoria de Manríquez. Ofrendas y velas regularmente. Coordenadas aproximadas (Talca).',
    isPublic: true,
    personIds: ['seed-person-manriquez'],
    createdById: 'seed-user-investigadora'
  },
  {
    id: 'seed-memorial-raimundo',
    name: 'Animita de Raimundo',
    lat: -36.6068,
    lng: -72.1034,
    story: 'Animita en Chillán conocida como \'Raimundo\'. Tradición local de dejar ofrendas por favores concedidos.',
    isPublic: true,
    personIds: ['seed-person-raimundo'],
    createdById: 'seed-user-equipo'
  },
  {
    id: 'seed-memorial-canaquita',
    name: 'Animita del Canaquita',
    lat: -36.4226,
    lng: -71.9777,
    story: 'Animita ubicada en San Carlos, conocida como \'El Canaquita\'. Lugar de devoción local.',
    isPublic: true,
    personIds: ['seed-person-canaquita'],
    createdById: 'seed-user-investigadora'
  },
  {
    id: 'seed-memorial-estudiantes-chillan',
    name: 'Animita de Estudiantes',
    lat: -36.6092,
    lng: -72.0971,
    story: 'Animita en Chillán denominada \'de Estudiantes\', frecuentada por jóvenes y familias.',
    isPublic: true,
    personIds: ['seed-person-estudiantes-chillan'],
    createdById: 'seed-user-equipo'
  },
  {
    id: 'seed-memorial-petronila-neira',
    name: 'Animita de Petronila Neira',
    lat: -36.8201,
    lng: -73.0444,
    story: 'Animita en Concepción dedicada a Petronila Neira. Sitio de ofrendas y plegarias. Coordenadas aproximadas (Concepción).',
    isPublic: true,
    personIds: ['seed-person-petronila-neira'],
    createdById: 'seed-user-investigadora'
  },
  {
    id: 'seed-memorial-ferrada-mardones',
    name: 'Animita de Ferrada y Mardones',
    lat: -36.8235,
    lng: -73.0489,
    story: 'Animita conocida localmente como \'Ferrada y Mardones\'. Falta documentación pública; coordenadas genéricas (Concepción área).',
    isPublic: true,
    personIds: ['seed-person-ferrada-mardones'],
    createdById: 'seed-user-equipo'
  },
  {
    id: 'seed-memorial-serafin-rodriguez',
    name: 'Animita de Serafín Rodríguez',
    lat: -39.8148,
    lng: -73.2459,
    story: 'Animita en Valdivia dedicada a Serafín Rodríguez. Lugar de recuerdo y ofrendas locales.',
    isPublic: true,
    personIds: ['seed-person-serafin-rodriguez'],
    createdById: 'seed-user-investigadora'
  },
  {
    id: 'seed-memorial-emilio-inostroza',
    name: 'Animita de Emilio Inostroza',
    lat: -38.7369,
    lng: -72.5904,
    story: 'Animita en Temuco dedicada a Emilio Inostroza. Lugar de plegarias y ofrendas.',
    isPublic: true,
    personIds: ['seed-person-emilio-inostroza'],
    createdById: 'seed-user-equipo'
  },
  {
    id: 'seed-memorial-palma-osorno',
    name: 'Animita de Palma',
    lat: -40.5741,
    lng: -73.1331,
    story: 'Animita en Osorno conocida como \'de Palma\'. Ofrendas y velas frecuentes.',
    isPublic: true,
    personIds: ['seed-person-palma-osorno'],
    createdById: 'seed-user-investigadora'
  },
  {
    id: 'seed-memorial-la-pampa-osorno',
    name: 'Animita de La Pampa',
    lat: -40.5794,
    lng: -73.1278,
    story: 'Animita ubicada en Osorno en un sector conocido como \'La Pampa\'. Tradición local de devoción.',
    isPublic: true,
    personIds: ['seed-person-la-pampa-osorno'],
    createdById: 'seed-user-equipo'
  },
  {
    id: 'seed-memorial-los-quemaitocs',
    name: 'Animita de los Quemaítocs',
    lat: -40.5686,
    lng: -73.1407,
    story: 'Animita en Osorno llamada \'los Quemaítocs\' (nombre local). Necesita verificación histórica.',
    isPublic: true,
    personIds: ['seed-person-los-quemaitocs'],
    createdById: 'seed-user-investigadora'
  },
  {
    id: 'seed-memorial-fructuoso-soto',
    name: 'Animita de Fructuoso Soto',
    lat: -41.4743,
    lng: -72.9369,
    story: 'Animita en Puerto Montt dedicada a Fructuoso Soto. Lugar de devoción y plegarias.',
    isPublic: true,
    personIds: ['seed-person-fructuoso-soto'],
    createdById: 'seed-user-equipo'
  },
  {
    id: 'seed-memorial-valeriano-chiloe',
    name: 'Animita de Valeriano',
    lat: -42.6000,
    lng: -73.8000,
    story: 'Animita en Chiloé dedicada a Valeriano. Coordenadas aproximadas (isla grande de Chiloé).',
    isPublic: true,
    personIds: ['seed-person-valeriano-chiloe'],
    createdById: 'seed-user-investigadora'
  },
  {
    id: 'seed-memorial-el-indio-desconocido',
    name: 'Animita de El Indio Desconocido',
    lat: -53.1638,
    lng: -70.9171,
    story: 'Animita en Punta Arenas conocida como \'El Indio Desconocido\', venerada por pobladores locales y viajeros.',
    isPublic: true,
    personIds: ['seed-person-el-indio-desconocido'],
    createdById: 'seed-user-equipo'
  }
]

const seedCandles = [
  {
    id: 'seed-candle-cabo-gomez-1',
    memorialId: 'seed-memorial-cabo-gomez',
    userId: 'seed-user-equipo',
    duration: 'SEVEN_DAYS',
    message: 'Gracias Cabo Gómez por cuidar mis viajes.',
    isActive: true,
    litAtOffsetHours: -24,
    expiresAtOffsetHours: 144
  },
  {
    id: 'seed-candle-hermogenes-1',
    memorialId: 'seed-memorial-hermogenes-san-martin',
    userId: 'seed-user-investigadora',
    duration: 'THREE_DAYS',
    message: 'San Martín, cuida a mi familia.',
    isActive: true,
    litAtOffsetHours: -12,
    expiresAtOffsetHours: 60
  },
  {
    id: 'seed-candle-evaristo-1',
    memorialId: 'seed-memorial-evaristo-montt',
    userId: 'seed-user-equipo',
    duration: 'SEVEN_DAYS',
    message: 'Por protección en el trabajo.',
    isActive: true,
    litAtOffsetHours: -6,
    expiresAtOffsetHours: 162
  },
  {
    id: 'seed-candle-elvirita-1',
    memorialId: 'seed-memorial-elvirita-guillen',
    userId: 'seed-user-investigadora',
    duration: 'ONE_DAY',
    message: 'Elvirita, ayuda a mi familia.',
    isActive: true,
    litAtOffsetHours: -3,
    expiresAtOffsetHours: 21
  },
  {
    id: 'seed-candle-adrianitas-1',
    memorialId: 'seed-memorial-adrianitas',
    userId: 'seed-user-equipo',
    duration: 'SEVEN_DAYS',
    message: 'Por la memoria de las Adrianitas.',
    isActive: true,
    litAtOffsetHours: -48,
    expiresAtOffsetHours: 120
  },
  {
    id: 'seed-candle-elquisco-1',
    memorialId: 'seed-memorial-el-quisco',
    userId: 'seed-user-investigadora',
    duration: 'THREE_DAYS',
    message: 'Protege nuestras costas.',
    isActive: true,
    litAtOffsetHours: -8,
    expiresAtOffsetHours: 64
  },
  {
    id: 'seed-candle-luis-castillo-1',
    memorialId: 'seed-memorial-luis-castillo',
    userId: 'seed-user-equipo',
    duration: 'SEVEN_DAYS',
    message: 'Luis Castillo, acompaña mi trabajo.',
    isActive: true,
    litAtOffsetHours: -10,
    expiresAtOffsetHours: 158
  },
  {
    id: 'seed-candle-emile-1',
    memorialId: 'seed-memorial-emile-dubois',
    userId: 'seed-user-equipo',
    duration: 'SEVEN_DAYS',
    message: 'Gracias Emile por ayudarme a encontrar trabajo. Tu luz sigue brillando.',
    isActive: true,
    litAtOffsetHours: -12,
    expiresAtOffsetHours: 156
  },
  {
    id: 'seed-candle-borja-1',
    memorialId: 'seed-memorial-borja',
    userId: 'seed-user-investigadora',
    duration: 'THREE_DAYS',
    message: 'Por la protección en el barrio.',
    isActive: true,
    litAtOffsetHours: -6,
    expiresAtOffsetHours: 66
  },
  {
    id: 'seed-candle-luis-mesa-1',
    memorialId: 'seed-memorial-luis-mesa-bell',
    userId: 'seed-user-equipo',
    duration: 'ONE_DAY',
    message: 'Por ayuda en lo familiar.',
    isActive: true,
    litAtOffsetHours: -2,
    expiresAtOffsetHours: 22
  },
  {
    id: 'seed-candle-alicia-bon-1',
    memorialId: 'seed-memorial-alicia-bon',
    userId: 'seed-user-investigadora',
    duration: 'THREE_DAYS',
    message: 'Alicia Bon, acoge nuestras plegarias.',
    isActive: true,
    litAtOffsetHours: -4,
    expiresAtOffsetHours: 68
  },
  {
    id: 'seed-candle-la-marinita-1',
    memorialId: 'seed-memorial-la-marinita',
    userId: 'seed-user-equipo',
    duration: 'THREE_DAYS',
    message: 'La Marinita, bendice este hogar.',
    isActive: true,
    litAtOffsetHours: -5,
    expiresAtOffsetHours: 67
  },
  {
    id: 'seed-candle-cuadra-osorio-1',
    memorialId: 'seed-memorial-cuadra-osorio',
    userId: 'seed-user-investigadora',
    duration: 'SEVEN_DAYS',
    message: 'Gracias por la protección del barrio.',
    isActive: true,
    litAtOffsetHours: -36,
    expiresAtOffsetHours: 132
  },
  {
    id: 'seed-candle-la-malvina-1',
    memorialId: 'seed-memorial-la-malvina',
    userId: 'seed-user-equipo',
    duration: 'ONE_DAY',
    message: 'La Malvina, acompaña a mi familia.',
    isActive: true,
    litAtOffsetHours: -1,
    expiresAtOffsetHours: 23
  },
  {
    id: 'seed-candle-lucrecia-1',
    memorialId: 'seed-memorial-lucrecia',
    userId: 'seed-user-investigadora',
    duration: 'SEVEN_DAYS',
    message: 'Por la salud de los niños.',
    isActive: true,
    litAtOffsetHours: -20,
    expiresAtOffsetHours: 148
  },
  {
    id: 'seed-candle-felipe-curico-1',
    memorialId: 'seed-memorial-felipe-curico',
    userId: 'seed-user-equipo',
    duration: 'THREE_DAYS',
    message: 'Por la guía en el trabajo.',
    isActive: true,
    litAtOffsetHours: -7,
    expiresAtOffsetHours: 65
  },
  {
    id: 'seed-candle-el-pepe-1',
    memorialId: 'seed-memorial-el-pepe',
    userId: 'seed-user-investigadora',
    duration: 'ONE_DAY',
    message: 'El Pepe, cuida a mi familia.',
    isActive: true,
    litAtOffsetHours: -2,
    expiresAtOffsetHours: 22
  },
  {
    id: 'seed-candle-juanita-1',
    memorialId: 'seed-memorial-juanita-ibanez',
    userId: 'seed-user-equipo',
    duration: 'SEVEN_DAYS',
    message: 'Juanita Ibáñez, bendice nuestros caminos.',
    isActive: true,
    litAtOffsetHours: -14,
    expiresAtOffsetHours: 154
  },
  {
    id: 'seed-candle-servandito-1',
    memorialId: 'seed-memorial-servandito',
    userId: 'seed-user-investigadora',
    duration: 'THREE_DAYS',
    message: 'Servandito, acompaña a los jóvenes.',
    isActive: true,
    litAtOffsetHours: -9,
    expiresAtOffsetHours: 63
  },
  {
    id: 'seed-candle-manriquez-1',
    memorialId: 'seed-memorial-manriquez',
    userId: 'seed-user-equipo',
    duration: 'SEVEN_DAYS',
    message: 'Manríquez, por la familia.',
    isActive: true,
    litAtOffsetHours: -30,
    expiresAtOffsetHours: 138
  },
  {
    id: 'seed-candle-raimundo-1',
    memorialId: 'seed-memorial-raimundo',
    userId: 'seed-user-investigadora',
    duration: 'THREE_DAYS',
    message: 'Raimundo, cuida a los viajeros.',
    isActive: true,
    litAtOffsetHours: -11,
    expiresAtOffsetHours: 61
  },
  {
    id: 'seed-candle-canaquita-1',
    memorialId: 'seed-memorial-canaquita',
    userId: 'seed-user-equipo',
    duration: 'SEVEN_DAYS',
    message: 'Por protección en el campo.',
    isActive: true,
    litAtOffsetHours: -26,
    expiresAtOffsetHours: 142
  },
  {
    id: 'seed-candle-estudiantes-1',
    memorialId: 'seed-memorial-estudiantes-chillan',
    userId: 'seed-user-investigadora',
    duration: 'ONE_DAY',
    message: 'Por éxito en los estudios.',
    isActive: true,
    litAtOffsetHours: -3,
    expiresAtOffsetHours: 21
  },
  {
    id: 'seed-candle-petronila-1',
    memorialId: 'seed-memorial-petronila-neira',
    userId: 'seed-user-equipo',
    duration: 'SEVEN_DAYS',
    message: 'Petronila Neira, cuida a los nuestros.',
    isActive: true,
    litAtOffsetHours: -18,
    expiresAtOffsetHours: 150
  },
  {
    id: 'seed-candle-ferrada-1',
    memorialId: 'seed-memorial-ferrada-mardones',
    userId: 'seed-user-investigadora',
    duration: 'THREE_DAYS',
    message: 'Por la memoria de Ferrada y Mardones.',
    isActive: true,
    litAtOffsetHours: -4,
    expiresAtOffsetHours: 68
  },
  {
    id: 'seed-candle-serafin-1',
    memorialId: 'seed-memorial-serafin-rodriguez',
    userId: 'seed-user-equipo',
    duration: 'SEVEN_DAYS',
    message: 'Serafín Rodríguez, acompáñanos.',
    isActive: true,
    litAtOffsetHours: -22,
    expiresAtOffsetHours: 146
  },
  {
    id: 'seed-candle-emilio-inostroza-1',
    memorialId: 'seed-memorial-emilio-inostroza',
    userId: 'seed-user-investigadora',
    duration: 'THREE_DAYS',
    message: 'Emilio, por la familia y el trabajo.',
    isActive: true,
    litAtOffsetHours: -7,
    expiresAtOffsetHours: 65
  },
  {
    id: 'seed-candle-palma-1',
    memorialId: 'seed-memorial-palma-osorno',
    userId: 'seed-user-equipo',
    duration: 'ONE_DAY',
    message: 'Palma, bendice esta casa.',
    isActive: true,
    litAtOffsetHours: -2,
    expiresAtOffsetHours: 22
  },
  {
    id: 'seed-candle-la-pampa-1',
    memorialId: 'seed-memorial-la-pampa-osorno',
    userId: 'seed-user-investigadora',
    duration: 'THREE_DAYS',
    message: 'Por las personas del sector La Pampa.',
    isActive: true,
    litAtOffsetHours: -6,
    expiresAtOffsetHours: 66
  },
  {
    id: 'seed-candle-los-quemaitocs-1',
    memorialId: 'seed-memorial-los-quemaitocs',
    userId: 'seed-user-equipo',
    duration: 'SEVEN_DAYS',
    message: 'Por la memoria de los Quemaítocs.',
    isActive: true,
    litAtOffsetHours: -40,
    expiresAtOffsetHours: 128
  },
  {
    id: 'seed-candle-fructuoso-1',
    memorialId: 'seed-memorial-fructuoso-soto',
    userId: 'seed-user-investigadora',
    duration: 'SEVEN_DAYS',
    message: 'Fructuoso, cuida a mi familia.',
    isActive: true,
    litAtOffsetHours: -15,
    expiresAtOffsetHours: 153
  },
  {
    id: 'seed-candle-valeriano-1',
    memorialId: 'seed-memorial-valeriano-chiloe',
    userId: 'seed-user-equipo',
    duration: 'THREE_DAYS',
    message: 'Valeriano, acompaña a tu gente en Chiloé.',
    isActive: true,
    litAtOffsetHours: -9,
    expiresAtOffsetHours: 63
  },
  {
    id: 'seed-candle-el-indio-1',
    memorialId: 'seed-memorial-el-indio-desconocido',
    userId: 'seed-user-investigadora',
    duration: 'SEVEN_DAYS',
    message: 'Gracias por proteger a los viajeros del sur.',
    isActive: true,
    litAtOffsetHours: -48,
    expiresAtOffsetHours: 120
  }
]

const memorialImages = {
  'seed-memorial-cabo-gomez': [
    'https://res.cloudinary.com/disu440uf/image/upload/v1760990551/seed-images/vowl7uebeogbrzrzt9ym.jpg'
  ],
  'seed-memorial-hermogenes-san-martin': [
    'https://res.cloudinary.com/disu440uf/image/upload/v1760990552/seed-images/asyn4tswal0rwluk2pfg.jpg'
  ],
  'seed-memorial-evaristo-montt': [
    'https://res.cloudinary.com/disu440uf/image/upload/v1760990551/seed-images/vowl7uebeogbrzrzt9ym.jpg'
  ],
  'seed-memorial-elvirita-guillen': [
    'https://res.cloudinary.com/disu440uf/image/upload/v1760990552/seed-images/asyn4tswal0rwluk2pfg.jpg',
    'https://res.cloudinary.com/disu440uf/image/upload/v1760990553/seed-images/rdadyan7wzazisldcwde.jpg'
  ],
  'seed-memorial-adrianitas': [
    'https://res.cloudinary.com/disu440uf/image/upload/v1760990555/seed-images/rfyvghf9cdw3srd6pi9s.jpg'
  ],
  'seed-memorial-el-quisco': [
    'https://res.cloudinary.com/disu440uf/image/upload/v1760990556/seed-images/rc9xlobvm2okpdcx2hrd.jpg'
  ],
  'seed-memorial-luis-castillo': [
    'https://res.cloudinary.com/disu440uf/image/upload/v1760990557/seed-images/odbjh81hvuwj7dh4ayds.jpg'
  ],
  'seed-memorial-emile-dubois': [
    'https://res.cloudinary.com/disu440uf/image/upload/v1760990557/seed-images/odbjh81hvuwj7dh4ayds.jpg',
    'https://res.cloudinary.com/disu440uf/image/upload/v1760990559/seed-images/kxoqa2bfdekazslwjouq.jpg'
  ],
  'seed-memorial-borja': [
    'https://res.cloudinary.com/disu440uf/image/upload/v1760990560/seed-images/nabgbil7iaeo92nq4bgj.jpg'
  ],
  'seed-memorial-luis-mesa-bell': [
    'https://res.cloudinary.com/disu440uf/image/upload/v1760990551/seed-images/vowl7uebeogbrzrzt9ym.jpg'
  ],
  'seed-memorial-alicia-bon': [
    'https://res.cloudinary.com/disu440uf/image/upload/v1760990552/seed-images/asyn4tswal0rwluk2pfg.jpg'
  ],
  'seed-memorial-la-marinita': [
    'https://res.cloudinary.com/disu440uf/image/upload/v1760990556/seed-images/rc9xlobvm2okpdcx2hrd.jpg'
  ],
  'seed-memorial-cuadra-osorio': [
    'https://res.cloudinary.com/disu440uf/image/upload/v1760990555/seed-images/rfyvghf9cdw3srd6pi9s.jpg'
  ],
  'seed-memorial-la-malvina': [
    'https://res.cloudinary.com/disu440uf/image/upload/v1760990560/seed-images/nabgbil7iaeo92nq4bgj.jpg',
    'https://res.cloudinary.com/disu440uf/image/upload/v1760990552/seed-images/asyn4tswal0rwluk2pfg.jpg'
  ],
  'seed-memorial-lucrecia': [
    'https://res.cloudinary.com/disu440uf/image/upload/v1760990556/seed-images/rc9xlobvm2okpdcx2hrd.jpg'
  ],
  'seed-memorial-felipe-curico': [
    'https://res.cloudinary.com/disu440uf/image/upload/v1760990555/seed-images/rfyvghf9cdw3srd6pi9s.jpg'
  ],
  'seed-memorial-el-pepe': [
    'https://res.cloudinary.com/disu440uf/image/upload/v1760990552/seed-images/asyn4tswal0rwluk2pfg.jpg'
  ],
  'seed-memorial-juanita-ibanez': [
    'https://res.cloudinary.com/disu440uf/image/upload/v1760990557/seed-images/odbjh81hvuwj7dh4ayds.jpg'
  ],
  'seed-memorial-servandito': [
    'https://res.cloudinary.com/disu440uf/image/upload/v1760990551/seed-images/vowl7uebeogbrzrzt9ym.jpg'
  ],
  'seed-memorial-manriquez': [
    'https://res.cloudinary.com/disu440uf/image/upload/v1760990559/seed-images/kxoqa2bfdekazslwjouq.jpg'
  ],
  'seed-memorial-raimundo': [
    'https://res.cloudinary.com/disu440uf/image/upload/v1760990552/seed-images/asyn4tswal0rwluk2pfg.jpg'
  ],
  'seed-memorial-canaquita': [
    'https://res.cloudinary.com/disu440uf/image/upload/v1760990556/seed-images/rc9xlobvm2okpdcx2hrd.jpg'
  ],
  'seed-memorial-estudiantes-chillan': [
    'https://res.cloudinary.com/disu440uf/image/upload/v1760990555/seed-images/rfyvghf9cdw3srd6pi9s.jpg'
  ],
  'seed-memorial-petronila-neira': [
    'https://res.cloudinary.com/disu440uf/image/upload/v1760990552/seed-images/asyn4tswal0rwluk2pfg.jpg'
  ],
  'seed-memorial-ferrada-mardones': [
    'https://res.cloudinary.com/disu440uf/image/upload/v1760990557/seed-images/odbjh81hvuwj7dh4ayds.jpg'
  ],
  'seed-memorial-serafin-rodriguez': [
    'https://res.cloudinary.com/disu440uf/image/upload/v1760990560/seed-images/nabgbil7iaeo92nq4bgj.jpg'
  ],
  'seed-memorial-emilio-inostroza': [
    'https://res.cloudinary.com/disu440uf/image/upload/v1760990559/seed-images/kxoqa2bfdekazslwjouq.jpg'
  ],
  'seed-memorial-palma-osorno': [
    'https://res.cloudinary.com/disu440uf/image/upload/v1760990552/seed-images/asyn4tswal0rwluk2pfg.jpg'
  ],
  'seed-memorial-la-pampa-osorno': [
    'https://res.cloudinary.com/disu440uf/image/upload/v1760990556/seed-images/rc9xlobvm2okpdcx2hrd.jpg'
  ],
  'seed-memorial-los-quemaitocs': [
    'https://res.cloudinary.com/disu440uf/image/upload/v1760990555/seed-images/rfyvghf9cdw3srd6pi9s.jpg'
  ],
  'seed-memorial-fructuoso-soto': [
    'https://res.cloudinary.com/disu440uf/image/upload/v1760990552/seed-images/asyn4tswal0rwluk2pfg.jpg'
  ],
  'seed-memorial-valeriano-chiloe': [
    'https://res.cloudinary.com/disu440uf/image/upload/v1760990557/seed-images/odbjh81hvuwj7dh4ayds.jpg'
  ],
  'seed-memorial-el-indio-desconocido': [
    'https://res.cloudinary.com/disu440uf/image/upload/v1760990551/seed-images/vowl7uebeogbrzrzt9ym.jpg',
    'https://res.cloudinary.com/disu440uf/image/upload/v1760990559/seed-images/kxoqa2bfdekazslwjouq.jpg'
  ]
}

const seedTestimonies = [
  {
    id: 'seed-testimony-emile-dubois-1',
    memorialId: 'seed-memorial-emile-dubois',
    userId: 'seed-user-investigadora',
    content:
      'Gracias Emile por ayudarme a encontrar trabajo a pesar de las dificultades. Cumpliste y aquí está mi promesa, sigo iluminando tu animita.',
    images: ['https://res.cloudinary.com/disu440uf/image/upload/v1760990560/seed-images/nabgbil7iaeo92nq4bgj.jpg'],
    isPublic: true
  },
  {
    id: 'seed-testimony-juanita-ibanez-1',
    memorialId: 'seed-memorial-juanita-ibanez',
    userId: 'seed-user-equipo',
    content:
      'Juanita, intercediste por mi hermana en el hospital y salió bien de su operación. Gracias por tu cariño y por acompañarnos.',
    images: ['https://res.cloudinary.com/disu440uf/image/upload/v1760990564/seed-images/bvgrdcorpwzyetmmjsst.jpg'],
    isPublic: true
  },
  {
    id: 'seed-testimony-emilio-inostroza-1',
    memorialId: 'seed-memorial-emilio-inostroza',
    userId: 'seed-user-investigadora',
    content:
      'Emilio, llegué a tu animita porque necesitaba protección en la ruta y escuchaste. Aquí están las flores y velas que prometí.',
    images: ['https://res.cloudinary.com/disu440uf/image/upload/v1760990565/seed-images/mlf4kbjcaqur26pt4w3c.jpg'],
    isPublic: true
  },
  {
    id: 'seed-testimony-palma-1',
    memorialId: 'seed-memorial-palma-osorno',
    userId: 'seed-user-equipo',
    content:
      'Palma querida, gracias por acompañar a mi familia cuando estuvimos lejos. Cumplimos trayendo luces y mantitas.',
    images: ['https://res.cloudinary.com/disu440uf/image/upload/v1760990566/seed-images/dyzfjv69lpnmxgopmbig.jpg'],
    isPublic: true
  },
  {
    id: 'seed-testimony-la-malvina-1',
    memorialId: 'seed-memorial-la-malvina',
    userId: 'seed-user-investigadora',
    content:
      'Malvina, siempre escuchas a las mamás del barrio. Estas flores y velas son por el favor concedido a mi hijo.',
    images: [
      'https://res.cloudinary.com/disu440uf/image/upload/v1760990567/seed-images/utzma41n9uuo81bwjhv7.jpg',
      'https://res.cloudinary.com/disu440uf/image/upload/v1760990569/seed-images/aa0aq5gfb7ruo8bfmmsx.jpg'
    ],
    isPublic: true
  }
]

async function main() {
  const now = new Date()

  const userIds = seedUsers.map((user) => user.id)
  const personIds = seedPeople.map((person) => person.id)
  const memorialIds = seedMemorials.map((memorial) => memorial.id)
  const candleIds = seedCandles.map((candle) => candle.id)
  const testimonyIds = seedTestimonies.map((testimony) => testimony.id)

  await prisma.testimony.deleteMany({})
  await prisma.candle.deleteMany({})
  await prisma.memorialPerson.deleteMany({})
  await prisma.memorial.deleteMany({})
  await prisma.person.deleteMany({})
  await prisma.user.deleteMany({})

  for (const user of seedUsers) {
    const { id, ...data } = user
    await prisma.user.create({
      data: {
        id,
        ...data
      }
    })
  }

  for (const person of seedPeople) {
    const { id, ...data } = person
    await prisma.person.create({
      data: {
        id,
        ...data,
        image: personImages[id] ?? null
      }
    })
  }

  for (const memorial of seedMemorials) {
    const { id, personIds, ...data } = memorial
    await prisma.memorial.create({
      data: {
        id,
        ...data,
        people: {
          create: personIds.map((personId) => ({
            person: {
              connect: { id: personId }
            }
          }))
        }
      }
    })
  }

  for (const [memorialId, imageUrls] of Object.entries(memorialImages)) {
    for (const url of imageUrls) {
      await prisma.memorialImage.create({
        data: {
          id: `${memorialId}-image-${Math.random().toString(36).substring(7)}`,
          memorialId,
          url
        }
      })
    }
  }

  for (const candle of seedCandles) {
    const { id, litAtOffsetHours, expiresAtOffsetHours, ...data } = candle
    const litAt = new Date(now.getTime() + litAtOffsetHours * 60 * 60 * 1000)
    const expiresAt = new Date(now.getTime() + expiresAtOffsetHours * 60 * 60 * 1000)

    await prisma.candle.create({
      data: {
        id,
        ...data,
        litAt,
        expiresAt
      }
    })
  }

  for (const testimony of seedTestimonies) {
    const { id, ...data } = testimony
    await prisma.testimony.create({
      data: {
        id,
        ...data
      }
    })
  }

  console.log('Database seeded with Chilean animitas 🇨🇱')
}

main()
  .catch((error) => {
    console.error('Error during Prisma seed', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })