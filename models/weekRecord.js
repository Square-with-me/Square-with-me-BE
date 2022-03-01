module.exports = (sequelize, DataTypes) => {
  const WeekRecord = sequelize.define(
    "weekRecord",
    {
      mon: {
        type: DataTypes.STRING(10),
        default: "00-00-00",
      },
      tue: {
        type: DataTypes.STRING(10),
        default: "00-00-00",
      },
      wed: {
        type: DataTypes.STRING(10),
        default: "00-00-00",
      },
      thur: {
        type: DataTypes.STRING(10),
        default: "00-00-00",
      },
      fri: {
        type: DataTypes.STRING(10),
        default: "00-00-00",
      },
      sat: {
        type: DataTypes.STRING(10),
        default: "00-00-00",
      },
      sun: {
        type: DataTypes.STRING(10),
        default: "00-00-00",
      },
      do: {
        type: DataTypes.STRING(10),
        default: "00-00-00",
      },
      share: {
        type: DataTypes.STRING(10),
        default: "00-00-00",
      },
      talk: {
        type: DataTypes.STRING(10),
        default: "00-00-00",
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
