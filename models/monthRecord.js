module.exports = (sequelize, DataTypes) => {
  const MonthRecord = sequelize.define(
    'monthRecord',
    {
      date: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      time: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
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
