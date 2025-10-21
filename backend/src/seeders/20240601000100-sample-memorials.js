/**
 * Seed - Minimal sample memorials for MVP
 *
 * Provides sample data aligned with core MVP flows:
 * - Memorials with history/heat
 * - Users with candle allowances
 * - Digital candles and testimonies
 */

const { literal } = require('sequelize');

const SRID = 4326;

const memorialId1 = '3f4b0f24-dfb4-4fd7-9c44-740249bca110';
const memorialId2 = '5cc28f01-9bc0-4760-a97e-0a90c9e0564d';
const userId1 = 'd7a91737-7e68-4de2-9b72-4f72b31f8f11';
const userId2 = 'ec1aca80-1aad-4cba-9e13-07d7a5f2c1f8';
const candleId1 = '9d9fdad6-8d44-4d46-92b4-31cdccb7901a';
const candleId2 = 'b4bc01e0-2a17-41d0-a29a-5e06aa868b47';
const testimonyId1 = '1d1fe06b-0127-4d35-b3aa-63b7beeac6c4';
const testimonyId2 = '8a404ac5-2bad-45e5-9d3e-9c9ffdf31e52';

module.exports = {
  up: async (queryInterface) => {
    const timestamp = new Date();

    await queryInterface.bulkInsert('users', [
      {
        id: userId1,
        email: 'hola@',
        display_name: 'Equipo Animita',
        account_type: 'free',
        free_candles_remaining: 1,
        candles_reset_at: timestamp,
        metadata: JSON.stringify({ source: 'seed' }),
        created_at: timestamp,
        updated_at: timestamp,
      },
    ]);

    await queryInterface.bulkInsert('memorials', [
      {
        id: memorialId1,
        type: 'animita',
        name: 'Animita de Mercedes Rojas',
        description: 'Altar comunitario levantado tras un accidente en 1998.',
        story: 'Vecinos cuentan que Mercedes cuida a quienes transitan por la avenida. Este altar se mantiene vivo con flores y cintas de agradecimiento.',
        location: literal(`ST_SetSRID(ST_MakePoint(-70.6505, -33.4691), ${SRID})`),
        locality: 'Santiago',
        region: 'Metropolitana',
        country_code: 'CL',
        image_url: 'https://example.org/images/animita-mercedes.jpg',
        detection_source: 'community',
        confidence: 0.92,
        status: 'published',
        metadata: JSON.stringify({
          notes: 'Vecinos mantienen flores frescas cada semana.',
        }),
        heat_score: 48,
        last_candle_at: timestamp,
        created_at: timestamp,
        updated_at: timestamp,
      },
      {
        id: memorialId2,
        type: 'animita',
        name: 'Animita Ruta 5 Km 118',
        description: 'Pequeña cruz con cintas reflectantes para viajeros nocturnos.',
        story: 'Transportistas atribuyen protección a esta animita; en invierno, conductores dejan termos y velas para quienes viajan de noche.',
        location: literal(`ST_SetSRID(ST_MakePoint(-71.2341, -34.9852), ${SRID})`),
        locality: 'San Fernando',
        region: "Libertador General Bernardo O'Higgins",
        country_code: 'CL',
        image_url: 'https://example.org/images/animita-ruta5.jpg',
        detection_source: 'manual_upload',
        confidence: 0.75,
        status: 'draft',
        metadata: JSON.stringify({
          hazards: ['Curva pronunciada', 'Poca iluminación'],
        }),
        heat_score: 12,
        last_candle_at: null,
        created_at: timestamp,
        updated_at: timestamp,
      },
    ]);

    const candleExpiry = new Date(timestamp.getTime() + (18 * 60 * 60 * 1000));

    await queryInterface.bulkInsert('candles', [
      {
        id: candleId1,
        memorial_id: memorialId1,
        user_id: userId1,
        message: 'Gracias por acompañar a mi familia este mes.',
        status: 'active',
        lit_at: new Date(timestamp.getTime() - (6 * 60 * 60 * 1000)),
        expires_at: candleExpiry,
        metadata: JSON.stringify({ origin: 'web' }),
        created_at: timestamp,
        updated_at: timestamp,
      },
      {
        id: candleId2,
        memorial_id: memorialId2,
        user_id: userId2,
        message: 'Por los viajeros nocturnos, que lleguen a salvo.',
        status: 'expired',
        lit_at: new Date(timestamp.getTime() - (3 * 24 * 60 * 60 * 1000)),
        expires_at: new Date(timestamp.getTime() - (24 * 60 * 60 * 1000)),
        metadata: JSON.stringify({ origin: 'mobile' }),
        created_at: timestamp,
        updated_at: timestamp,
      },
    ]);

    await queryInterface.bulkInsert('testimonies', [
      {
        id: testimonyId1,
        memorial_id: memorialId1,
        user_id: userId1,
        candle_id: candleId1,
        content: 'Mercedes nos ayudó a encontrar trabajo cuando más lo necesitábamos.',
        has_candle: true,
        metadata: JSON.stringify({ emotion: 'gratitude' }),
        created_at: timestamp,
        updated_at: timestamp,
      },
      {
        id: testimonyId2,
        memorial_id: memorialId2,
        user_id: null,
        candle_id: null,
        content: 'Siempre dejo una cinta cuando viajo al sur, me siento acompañada.',
        has_candle: false,
        metadata: JSON.stringify({ origin: 'anonymous' }),
        created_at: timestamp,
        updated_at: timestamp,
      },
    ]);
  },

  down: async (queryInterface) => {
    const { Op } = queryInterface.sequelize;

    await queryInterface.bulkDelete('testimonies', {
      id: {
        [Op.in]: [testimonyId1, testimonyId2],
      },
    });

    await queryInterface.bulkDelete('candles', {
      id: {
        [Op.in]: [candleId1, candleId2],
      },
    });

    await queryInterface.bulkDelete('memorials', {
      id: {
        [Op.in]: [memorialId1, memorialId2],
      },
    });

    await queryInterface.bulkDelete('users', {
      id: {
        [Op.in]: [userId1, userId2],
      },
    });
  },
};
