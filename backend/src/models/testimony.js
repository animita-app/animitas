const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  if (sequelize.models.Testimony) {
    return sequelize.models.Testimony;
  }

  const Testimony = sequelize.define('Testimony', {
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
    candle_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    has_candle: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    is_public: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
  }, {
    tableName: 'testimonies',
    indexes: [
      {
        name: 'idx_testimonies_memorial',
        fields: ['memorial_id'],
      },
      {
        name: 'idx_testimonies_user',
        fields: ['user_id'],
      },
    ],
  });

  return Testimony;
};
