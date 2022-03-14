module.exports = (sequelize, DataTypes) => {
  const CounselingRecord = sequelize.define("counselingRecord", {
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

  CounselingRecord.associate = (db) => {
    db.CounselingRecord.belongsTo(db.User);
  };

  return CounselingRecord;
};