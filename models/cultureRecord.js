module.exports = (sequelize, DataTypes) => {
  const CultureRecord = sequelize.define("cultureRecord", {
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

  CultureRecord.associate = (db) => {
    db.CultureRecord.belongsTo(db.User);
  };

  return CultureRecord;
};