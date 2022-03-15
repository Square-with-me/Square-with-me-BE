module.exports = (sequelize, DataTypes) => {
  const BeautyRecord = sequelize.define("beautyRecord", {
    mon: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    tue: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    wed: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    thur: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    fri: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    sat: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    sun: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
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