/**
 * Memorial Model (MVP)
 *
 * Minimal schema for roadside shrines (animitas) during MVP. Keeps only the
 * attributes required for map display, basic metadata, and sourcing.
 */

const { DataTypes } = require('sequelize');

const GEO_SRID = 4326;

const MEMORIAL_TYPES = ['animita'];

const MEMORIAL_STATUSES = ['draft', 'published'];

const DETECTION_SOURCES = ['manual_upload', 'community', 'yolo_model', 'street_view'];

module.exports = (sequelize) => {
  if (sequelize.models.Memorial) {
    return sequelize.models.Memorial;
  }

  const Memorial = sequelize.define('Memorial', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    type: {
      type: DataTypes.ENUM(...MEMORIAL_TYPES),
      allowNull: false,
      defaultValue: 'animita',
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    story: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Narrative or historical context of the memorial.',
    },
    location: {
      type: DataTypes.GEOMETRY('POINT', GEO_SRID),
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Location is required',
        },
        isValidGeometry(value) {
          if (!value || value.type !== 'Point' || !Array.isArray(value.coordinates)) {
            throw new Error('Location must be a valid GeoJSON Point');
          }

          const [longitude, latitude] = value.coordinates;
          if (
            Number.isNaN(longitude) ||
            Number.isNaN(latitude) ||
            latitude < -90 ||
            latitude > 90 ||
            longitude < -180 ||
            longitude > 180
          ) {
            throw new Error('Location coordinates must be within valid latitude/longitude ranges');
          }
        },
      },
    },
    latitude: {
      type: DataTypes.VIRTUAL,
      get() {
        const location = this.getDataValue('location');
        return location ? location.coordinates[1] : null;
      },
    },
    longitude: {
      type: DataTypes.VIRTUAL,
      get() {
        const location = this.getDataValue('location');
        return location ? location.coordinates[0] : null;
      },
    },
    locality: {
      type: DataTypes.STRING(120),
      allowNull: true,
    },
    region: {
      type: DataTypes.STRING(120),
      allowNull: true,
    },
    country_code: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: 'CL',
    },
    
    detection_source: {
      type: DataTypes.ENUM(...DETECTION_SOURCES),
      allowNull: false,
      defaultValue: 'manual_upload',
    },
    confidence: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: {
        min: {
          args: [0],
          msg: 'Confidence must be between 0 and 1',
        },
        max: {
          args: [1],
          msg: 'Confidence must be between 0 and 1',
        },
      },
    },
    status: {
      type: DataTypes.ENUM(...MEMORIAL_STATUSES),
      allowNull: false,
      defaultValue: 'draft',
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    heat_score: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    last_candle_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    tableName: 'memorials',
    indexes: [
      {
        name: 'idx_memorials_location',
        using: 'GIST',
        fields: ['location'],
      },
      {
        name: 'idx_memorials_status',
        fields: ['status'],
      },
    ],
  });

  Memorial.addScope('animita', {
    where: { type: 'animita' },
  });

  Memorial.addScope('published', {
    where: { status: 'published' },
  });

  Memorial.prototype.toPublicJSON = function toPublicJSON() {
    const serializeRelated = (records) => {
      if (!records) return undefined;
      return records.map((record) => (typeof record.toJSON === 'function' ? record.toJSON() : record));
    };

    return {
      id: this.id,
      type: this.type,
      name: this.name,
      description: this.description,
      latitude: this.latitude,
      longitude: this.longitude,
      locality: this.locality,
      region: this.region,
      country_code: this.country_code,
      image_url: this.image_url,
      story: this.story,
      detection_source: this.detection_source,
      status: this.status,
      confidence: this.confidence,
      heat_score: this.heat_score,
      last_candle_at: this.last_candle_at,
      metadata: this.metadata,
      created_at: this.created_at,
      updated_at: this.updated_at,
      candles: serializeRelated(this.candles),
      testimonies: serializeRelated(this.testimonies),
      reports: serializeRelated(this.reports),
    };
  };

  Memorial.findByBoundingBox = async function findByBoundingBox(west, south, east, north, options = {}) {
    return this.findAll({
      where: {
        location: sequelize.fn(
          'ST_Contains',
          sequelize.fn('ST_MakeEnvelope', west, south, east, north, GEO_SRID),
          sequelize.col('location')
        ),
        ...(options.where || {}),
      },
      ...options,
    });
  };

  Memorial.findNearby = async function findNearby(latitude, longitude, radiusMeters = 1000, options = {}) {
    return this.findAll({
      where: {
        location: sequelize.where(
          sequelize.fn(
            'ST_DWithin',
            sequelize.col('location'),
            sequelize.fn('ST_SetSRID', sequelize.fn('ST_MakePoint', longitude, latitude), GEO_SRID),
            radiusMeters
          ),
          true
        ),
        ...(options.where || {}),
      },
      order: [
        [
          sequelize.fn(
            'ST_DistanceSphere',
            sequelize.col('location'),
            sequelize.fn('ST_SetSRID', sequelize.fn('ST_MakePoint', longitude, latitude), GEO_SRID)
          ),
          'ASC',
        ],
      ],
      ...options,
    });
  };

  Memorial.getStatsByType = async function getStatsByType(options = {}) {
    return this.findAll({
      attributes: [
        'type',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('AVG', sequelize.col('confidence')), 'avg_confidence'],
      ],
      where: options.where || {},
      group: ['type'],
      order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
    });
  };

  return Memorial;
};
