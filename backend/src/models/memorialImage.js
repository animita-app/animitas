const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  if (sequelize.models.MemorialImage) {
    return sequelize.models.MemorialImage;
  }

  const MemorialImage = sequelize.define('MemorialImage', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    memorial_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    url: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        isUrl: true,
      },
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  }, {
    tableName: 'memorial_images',
    timestamps: true, // Keep timestamps for images
    indexes: [
      {
        name: 'idx_memorial_images_memorial_id',
        fields: ['memorial_id'],
      },
    ],
  });

  return MemorialImage;
};
