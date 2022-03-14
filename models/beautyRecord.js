module.exports = (sequelize, DataTypes) => {
  const BeautyRecord = sequelize.define("beautyRecord", {
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

  BeautyRecord.associate = (db) => {
    db.BeautyRecord.belongsTo(db.User);
  };

  return BeautyRecord;
};