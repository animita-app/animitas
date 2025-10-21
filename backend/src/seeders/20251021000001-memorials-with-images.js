/**
 * Seed - Memorials with Custom Images
 *
 * Provides 10 sample Chilean animitas with custom Unsplash images.
 * Each memorial has 2 images for carousel display.
 */

const { v4: uuidv4 } = require('uuid');
const { literal } = require('sequelize');

const SRID = 4326;

const memorialsWithImages = [
  {
    name: 'Animita del Cabo Gómez',
    coordinates: [-70.2988, -18.4861],
    city: 'Arica',
    story: 'Memorial dedicado a Cabo Gómez, víctima de la injusticia.',
    images: [
      'https://images.unsplash.com/photo-1517457373614-b7152f800fd1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    name: 'Animita de Hermógenes San Martín',
    coordinates: [-70.1425, -20.2208],
    city: 'Iquique',
    story: 'Recordamos a Hermógenes San Martín.',
    images: [
      'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1511379938547-c1f69b13d835?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    name: 'Animita de Evaristo Montt',
    coordinates: [-70.4025, -23.6345],
    city: 'Antofagasta',
    story: 'Memorial para Evaristo Montt.',
    images: [
      'https://images.unsplash.com/photo-1585241307979-d19e1f836b57?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1514903991192-caa3b3b21b87?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    name: 'Animita de Elvirita Guillén',
    coordinates: [-70.4050, -23.6360],
    city: 'Antofagasta',
    story: 'En memoria de Elvirita Guillén.',
    images: [
      'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1525257450953-65ea266cacc0?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    name: 'Animita de las Adrianitas',
    coordinates: [-70.3344, -27.3627],
    city: 'Copiapó',
    story: 'Recordamos a las Adrianitas.',
    images: [
      'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    name: 'Animita de el Quisco',
    coordinates: [-71.3388, -29.9533],
    city: 'Coquimbo',
    story: 'Memorial dedicado al Quisco.',
    images: [
      'https://images.unsplash.com/photo-1500595046891-1dac0f82f0e7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    name: 'Animita de Luis Castillo',
    coordinates: [-71.1994, -30.6037],
    city: 'Ovalle',
    story: 'En memoria de Luis Castillo.',
    images: [
      'https://images.unsplash.com/photo-1493514789991-586cb221d7d7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1496867594519-2c55fb83c665?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    name: 'Animita de Emile Dubois',
    coordinates: [-71.6270, -33.0472],
    city: 'Valparaíso',
    story: 'Recordamos a Emile Dubois.',
    images: [
      'https://images.unsplash.com/photo-1504711331084-f26051221c3a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    name: 'Animita de la calle Borja',
    coordinates: [-70.6694, -33.4372],
    city: 'Santiago',
    story: 'Animita ubicada en la calle Borja.',
    images: [
      'https://images.unsplash.com/photo-1505142468610-359e7d316be0?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1504681869696-d977e3b33640?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    name: 'Animita de Luis Mesa Bell',
    coordinates: [-70.6750, -33.4400],
    city: 'Santiago',
    story: 'Memorial para Luis Mesa Bell.',
    images: [
      'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80'
    ]
  },
];

module.exports = {
  up: async (queryInterface) => {
    const timestamp = new Date();
    const userId = uuidv4();

    await queryInterface.bulkInsert('users', [{
      id: userId,
      email: 'icarus@animitas.cl',
      display_name: 'Felipe Mandiola',
      phone: '+56956784477',
      account_type: 'free',
      free_candles_remaining: 10,
      candles_reset_at: timestamp,
      metadata: JSON.stringify({ source: 'seed' }),
      created_at: timestamp,
      updated_at: timestamp,
    }]);

    const memorialIds = [];

    for (const memorialData of memorialsWithImages) {
      const memorialId = uuidv4();
      memorialIds.push({ id: memorialId, images: memorialData.images });

      await queryInterface.bulkInsert('memorials', [{
        id: memorialId,
        type: 'animita',
        name: memorialData.name,
        description: memorialData.city,
        story: memorialData.story,
        location: literal(`ST_GeomFromText('POINT(${memorialData.coordinates[0]} ${memorialData.coordinates[1]})', ${SRID})`),
        status: 'published',
        detection_source: 'manual_upload',
        created_by_id: userId,
        metadata: JSON.stringify({ city: memorialData.city }),
        created_at: timestamp,
        updated_at: timestamp,
      }]);
    }

    const images = [];
    for (const memorial of memorialIds) {
      for (let i = 0; i < memorial.images.length; i++) {
        images.push({
          id: uuidv4(),
          memorial_id: memorial.id,
          image_url: memorial.images[i],
          source_type: 'unsplash',
          is_primary: i === 0,
          created_at: timestamp,
          updated_at: timestamp,
        });
      }
    }

    if (images.length > 0) {
      await queryInterface.bulkInsert('memorial_images', images);
    }
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('memorial_images', {
      source_type: 'unsplash',
    });

    await queryInterface.bulkDelete('memorials', {
      detection_source: 'manual_upload',
    });

    await queryInterface.bulkDelete('users', {
      email: 'icarus@animitas.cl',
    });
  },
};
