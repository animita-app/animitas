const { DataTypes } = require('sequelize');

const CANDLE_STATUSES = ['active', 'expired', 'extinguished'];

module.exports = (sequelize) => {
  if (sequelize.models.Candle) {
    return sequelize.models.Candle;
  }

  const Candle = sequelize.define('Candle', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    memorial_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    message: {
      type: DataTypes.STRING(280),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(...CANDLE_STATUSES),
      allowNull: false,
      defaultValue: 'active',
    },
    lit_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    relit_from_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
  }, {
    tableName: 'candles',
    indexes: [
      {
        name: 'idx_candles_memorial_active',
        fields: ['memorial_id'],
        where: {
          status: 'active',
        },
      },
      {
        name: 'idx_candles_expires_at',
        fields: ['expires_at'],
      },
    ],
  });

  Candle.prototype.isActive = function isActive() {
    return this.status === 'active' && this.expires_at > new Date();
  };

  return Candle;
};
