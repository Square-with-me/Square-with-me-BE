module.exports = (sequelize, DataTypes) => {
  const MonthRecord = sequelize.define(
    'monthRecord',
    {
      title: {
        type: DataTypes.STRING(30),
        unique: true,
        allowNull: false,
      },
      isSecret: {
        type: DataTypes.BOOLEAN,
        default: false,
      },
      pwd: {
        type: DataTypes.STRING(100),
        allowNull: true,
      }
    },
    {
      charset: 'utf8',
      collate: 'utf8_general_ci',
    },
  );

  MonthRecord.associate = (db) => {
    db.MonthRecord.belongsTo(db.User);
  };

  return MonthRecord;
};
