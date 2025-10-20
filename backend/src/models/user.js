const { DataTypes } = require('sequelize');

const ACCOUNT_TYPES = ['free', 'supporter', 'researcher'];

module.exports = (sequelize) => {
  if (sequelize.models.User) {
    return sequelize.models.User;
  }

  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    display_name: {
      type: DataTypes.STRING(120),
      allowNull: true,
    },
    account_type: {
      type: DataTypes.ENUM(...ACCOUNT_TYPES),
      allowNull: false,
      defaultValue: 'free',
    },
    free_candles_remaining: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 3,
    },
    candles_reset_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
  }, {
    tableName: 'users',
  });

  return User;
};
