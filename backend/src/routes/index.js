/**
 * Animitas Mapper - API Routes
 *
 * Configuración de rutas principales de la API.
 */

const express = require('express');
const router = express.Router();

// Import route handlers
const animitasRoutes = require('./animitas');
const detectionsRoutes = require('./detections');
const statsRoutes = require('./stats');
const typesRoutes = require('./types');

// API Info endpoint
router.get('/', (req, res) => {
  res.json({
    name: 'Animitas Mapper API',
    version: '1.0.0',
    description: 'API para el archivo digital de animitas en Chile',
    endpoints: {
      animitas: '/animitas',
      detections: '/detections',
      stats: '/stats',
      types: '/types'
    },
    documentation: '/docs',
    health: '/health'
  });
});

// Route handlers
router.use('/animitas', animitasRoutes);
router.use('/detections', detectionsRoutes);
router.use('/stats', statsRoutes);
router.use('/types', typesRoutes);

module.exports = router;