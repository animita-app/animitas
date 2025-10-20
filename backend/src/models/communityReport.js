const { DataTypes } = require('sequelize');

const REPORT_TYPES = ['correction', 'verification', 'flag', 'additional_info'];

module.exports = (sequelize) => {
  if (sequelize.models.CommunityReport) {
    return sequelize.models.CommunityReport;
  }

  const CommunityReport = sequelize.define('CommunityReport', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    memorial_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    reporter_session: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    report_type: {
      type: DataTypes.ENUM(...REPORT_TYPES),
      allowNull: false,
    },
    suggested_type: {
      type: DataTypes.ENUM('animita'),
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    processed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    processed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    tableName: 'community_reports',
  });

  return CommunityReport;
};
