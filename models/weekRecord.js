module.exports = (sequelize, DataTypes) => {
  const WeekRecord = sequelize.define(
    "weekRecord",
    {
      mon: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      tue: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      wed: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      thur: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      fri: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      sat: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      sun: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      beauty: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      sports: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      study: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      counsel: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      culture: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      etc: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      }
    },
    {
      charset: "utf8",
      collate: "utf8_general_ci",
    },
  );

  WeekRecord.associate = (db) => {
    db.WeekRecord.belongsTo(db.User);
  };

  return WeekRecord;
};
