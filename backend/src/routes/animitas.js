/**
 * Animitas Mapper - Animitas Routes
 *
 * Endpoints para gestionar animitas: listado, detalle, verificación, reportes.
 */

const express = require('express');
const { body, query, param, validationResult } = require('express-validator');
const router = express.Router();

const {
  Animita,
  CommunityReport,
  Candle,
  Testimony,
} = require('../models');
const logger = require('../utils/logger');
const { asyncHandler } = require('../utils/asyncHandler');

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  next();
};

/**
 * GET /api/v1/animitas
 * Lista animitas con filtros opcionales
 */
router.get('/', [
  query('bbox').optional().matches(/^-?\d+\.?\d*,-?\d+\.?\d*,-?\d+\.?\d*,-?\d+\.?\d*$/)
    .withMessage('bbox debe tener formato: west,south,east,north'),
  query('status').optional().isIn([
    'draft', 'published'
  ]).withMessage('Estado inválido'),
  query('confidence_min').optional().isFloat({ min: 0, max: 1 })
    .withMessage('confidence_min debe ser entre 0 y 1'),
  query('date_from').optional().isISO8601()
    .withMessage('date_from debe ser fecha ISO válida'),
  query('date_to').optional().isISO8601()
    .withMessage('date_to debe ser fecha ISO válida'),
  query('limit').optional().isInt({ min: 1, max: 1000 })
    .withMessage('limit debe ser entre 1 y 1000'),
  query('offset').optional().isInt({ min: 0 })
    .withMessage('offset debe ser mayor o igual a 0'),
  handleValidationErrors
], asyncHandler(async (req, res) => {
  const {
    bbox,
    status,
    confidence_min,
    date_from,
    date_to,
    limit = 100,
    offset = 0
  } = req.query;

  // Build where conditions
  const whereConditions = {};

  if (status) {
    whereConditions.status = Array.isArray(status) ? status : [status];
  }

  if (confidence_min) {
    whereConditions.confidence = { [require('sequelize').Op.gte]: parseFloat(confidence_min) };
  }

  if (date_from || date_to) {
    whereConditions.created_at = {};
    if (date_from) {
      whereConditions.created_at[require('sequelize').Op.gte] = new Date(date_from);
    }
    if (date_to) {
      whereConditions.created_at[require('sequelize').Op.lte] = new Date(date_to);
    }
  }

  let animitas;
  let total;

  if (bbox) {
    // Bounding box query
    const [west, south, east, north] = bbox.split(',').map(parseFloat);

    animitas = await Animita.findByBoundingBox(west, south, east, north, {
      where: whereConditions,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    // Get total count for pagination
    const allInBbox = await Animita.findByBoundingBox(west, south, east, north, {
      where: whereConditions,
      attributes: ['id']
    });
    total = allInBbox.length;

  } else {
    // Regular query
    const result = await Animita.findAndCountAll({
      where: whereConditions,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    animitas = result.rows;
    total = result.count;
  }

  // Convert to public JSON
  const publicAnimitas = animitas.map(animita => animita.toPublicJSON());

  res.json({
    success: true,
    data: publicAnimitas,
    pagination: {
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
      has_more: parseInt(offset) + parseInt(limit) < total
    },
    filters_applied: {
      bbox: bbox || null,
      status: status || null,
      confidence_min: confidence_min || null,
      date_range: date_from || date_to ? { from: date_from, to: date_to } : null
    }
  });
}));

/**
 * GET /api/v1/animitas/:id
 * Obtener detalles de una animita específica
 */
router.get('/:id', [
  param('id').isUUID().withMessage('ID debe ser UUID válido'),
  handleValidationErrors
], asyncHandler(async (req, res) => {
  const { id } = req.params;

  const animita = await Animita.findByPk(id, {
    include: [
      {
        model: CommunityReport,
        as: 'reports',
        attributes: ['id', 'report_type', 'suggested_type', 'notes', 'created_at'],
        order: [['created_at', 'DESC']],
        limit: 10
      },
      {
        model: Candle,
        as: 'candles',
        required: false,
        separate: true,
        limit: 20,
        order: [['expires_at', 'DESC']]
      },
      {
        model: Testimony,
        as: 'testimonies',
        required: false,
        separate: true,
        limit: 20,
        order: [['created_at', 'DESC']]
      }
    ]
  });

  if (!animita) {
    return res.status(404).json({
      success: false,
      message: 'Animita no encontrada'
    });
  }

  res.json({
    success: true,
    data: {
      ...animita.toPublicJSON(),
      reports: animita.reports || []
    }
  });
}));

/**
 * POST /api/v1/animitas/:id/verify
 * Verificar o corregir una animita
 */
router.post('/:id/verify', [
  param('id').isUUID().withMessage('ID debe ser UUID válido'),
  body('action').isIn(['verify', 'reject', 'correct'])
    .withMessage('Acción debe ser: verify, reject, correct'),
  body('notes').optional().isLength({ max: 500 })
    .withMessage('Notas no pueden exceder 500 caracteres'),
  body('reporter_session').optional().isLength({ min: 10, max: 100 })
    .withMessage('Session ID inválido'),
  handleValidationErrors
], asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { action, notes, reporter_session } = req.body;

  const animita = await Animita.findByPk(id);

  if (!animita) {
    return res.status(404).json({
      success: false,
      message: 'Animita no encontrada'
    });
  }

  // Create community report
  const report = await CommunityReport.create({
    memorial_id: id,
    reporter_session: reporter_session || `anon_${Date.now()}`,
    report_type: action === 'correct' ? 'correction' : 'verification',
    suggested_type: null,
    notes: notes || null
  });

  // Update animita status based on action
  let newStatus = animita.status;

  switch (action) {
    case 'verify':
      newStatus = 'published';
      break;
    case 'reject':
      newStatus = 'draft';
      break;
    case 'correct':
      newStatus = 'draft';
      break;
  }

  animita.status = newStatus;
  await animita.save();

  logger.info(`Animita ${id} ${action}ed by ${reporter_session}`);

  res.json({
    success: true,
    message: `Animita ${action}ed successfully`,
    data: {
      animita: animita.toPublicJSON(),
      report_id: report.id
    }
  });
}));

/**
 * POST /api/v1/animitas/:id/report
 * Reportar una animita (información adicional, problemas, etc.)
 */
router.post('/:id/report', [
  param('id').isUUID().withMessage('ID debe ser UUID válido'),
  body('report_type').isIn(['flag', 'additional_info', 'correction'])
    .withMessage('Tipo de reporte inválido'),
  body('notes').isLength({ min: 10, max: 1000 })
    .withMessage('Notas deben tener entre 10 y 1000 caracteres'),
  handleValidationErrors
], asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { report_type, notes } = req.body;

  const animita = await Animita.findByPk(id);

  if (!animita) {
    return res.status(404).json({
      success: false,
      message: 'Animita no encontrada'
    });
  }

  const report = await CommunityReport.create({
    memorial_id: id,
    reporter_session: `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    report_type,
    suggested_type: null,
    notes
  });

  logger.info(`New report created for animita ${id}: ${report_type}`);

  res.status(201).json({
    success: true,
    message: 'Reporte creado exitosamente',
    data: {
      report_id: report.id,
      memorial_id: id
    }
  });
}));

/**
 * GET /api/v1/animitas/nearby
 * Encontrar animitas cercanas a una ubicación
 */
router.get('/nearby', [
  query('lat').isFloat({ min: -90, max: 90 })
    .withMessage('Latitud debe ser entre -90 y 90'),
  query('lng').isFloat({ min: -180, max: 180 })
    .withMessage('Longitud debe ser entre -180 y 180'),
  query('radius').optional().isInt({ min: 1, max: 50000 })
    .withMessage('Radio debe ser entre 1 y 50000 metros'),
  query('limit').optional().isInt({ min: 1, max: 50 })
    .withMessage('Límite debe ser entre 1 y 50'),
  handleValidationErrors
], asyncHandler(async (req, res) => {
  const { lat, lng, radius = 1000, limit = 10 } = req.query;

  const nearbyAnimitas = await Animita.findNearby(
    parseFloat(lat),
    parseFloat(lng),
    parseInt(radius),
    { limit: parseInt(limit) }
  );

  res.json({
    success: true,
    data: nearbyAnimitas.map(animita => animita.toPublicJSON()),
    search_params: {
      latitude: parseFloat(lat),
      longitude: parseFloat(lng),
      radius_meters: parseInt(radius),
      limit: parseInt(limit)
    }
  });
}));

module.exports = router;
