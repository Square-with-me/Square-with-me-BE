module.exports = (sequelize, DataTypes) => {
  const CouselingRecord = sequelize.define("couselingRecord", {
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

  CouselingRecord.associate = (db) => {
    db.CouselingRecord.belongsTo(db.User);
  };

  return CouselingRecord;
};