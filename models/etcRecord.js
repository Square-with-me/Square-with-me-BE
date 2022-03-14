module.exports = (sequelize, DataTypes) => {
  const ETCRecord = sequelize.define("etcRecord", {
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

  ETCRecord.associate = (db) => {
    db.ETCRecord.belongsTo(db.User);
  };

  return ETCRecord;
};