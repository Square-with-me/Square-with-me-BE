module.exports = (sequelize, DataTypes) => {
  const SportsRecord = sequelize.define("sportsRecord", {
    time: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    day: {
      type: DataTypes.STRING(6),
      allowNull: false,
    }
  }, {
    charset: "utf8",
    collate: "utf8_general_ci",
  });

  SportsRecord.associate = (db) => {
    db.SportsRecord.belongsTo(db.User);
  };

  return SportsRecord;
};