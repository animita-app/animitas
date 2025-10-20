/**
 * Animitas Mapper - Database Models
 *
 * Configuración de Sequelize y modelos de base de datos.
 */

const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

// Database configuration
const sequelize = new Sequelize(process.env.DATABASE_URL || 'postgresql://animitas_user:animitas_password@localhost:5432/animitas_db', {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ?
    (msg) => logger.debug(msg) : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    timestamps: true,
    underscored: true,
    paranoid: false,
  },
});

// Import models
const Memorial = require('./memorial')(sequelize);
const Animita = require('./animita')(sequelize);
const User = require('./user')(sequelize);
const Candle = require('./candle')(sequelize);
const Testimony = require('./testimony')(sequelize);
const MemorialImage = require('./memorialImage')(sequelize);

const communityReportPath = path.join(__dirname, 'communityReport.js');
const detectionJobPath = path.join(__dirname, 'detectionJob.js');

const CommunityReport = fs.existsSync(communityReportPath)
  ? require('./communityReport')(sequelize)
  : undefined;

const DetectionJob = fs.existsSync(detectionJobPath)
  ? require('./detectionJob')(sequelize)
  : undefined;

// Define associations
if (CommunityReport) {
  Memorial.hasMany(CommunityReport, {
    foreignKey: 'memorial_id',
    as: 'reports',
  });

  CommunityReport.belongsTo(Memorial, {
    foreignKey: 'memorial_id',
    as: 'memorial',
  });

  Animita.hasMany(CommunityReport, {
    foreignKey: 'memorial_id',
    as: 'reports',
  });

  CommunityReport.belongsTo(Animita, {
    foreignKey: 'memorial_id',
    as: 'animita',
  });
}

Memorial.hasMany(Candle, {
  foreignKey: 'memorial_id',
  as: 'candles',
});

Candle.belongsTo(Memorial, {
  foreignKey: 'memorial_id',
  as: 'memorial',
});

Memorial.hasMany(Testimony, {
  foreignKey: 'memorial_id',
  as: 'testimonies',
});

Testimony.belongsTo(Memorial, {
  foreignKey: 'memorial_id',
  as: 'memorial',
});

User.hasMany(Candle, {
  foreignKey: 'user_id',
  as: 'candles',
});

Candle.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

User.hasMany(Testimony, {
  foreignKey: 'user_id',
  as: 'testimonies',
});

Testimony.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

Candle.hasMany(Testimony, {
  foreignKey: 'candle_id',
  as: 'testimonies',
});

Testimony.belongsTo(Candle, {
  foreignKey: 'candle_id',
  as: 'candle',
});

Memorial.hasMany(MemorialImage, {
  foreignKey: 'memorial_id',
  as: 'images',
});

MemorialImage.belongsTo(Memorial, {
  foreignKey: 'memorial_id',
  as: 'memorial',
});

// Export models and sequelize instance
module.exports = {
  sequelize,
  Memorial,
  Animita,
  User,
  Candle,
  Testimony,
  MemorialImage,
  CommunityReport,
  DetectionJob,
};
