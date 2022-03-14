module.exports = (sequelize, DataTypes) => {
  const StudyRecord = sequelize.define("studyRecord", {
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

  StudyRecord.associate = (db) => {
    db.StudyRecord.belongsTo(db.User);
  };

  return StudyRecord;
};