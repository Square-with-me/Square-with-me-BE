module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "user",
    {
      email: {
        type: DataTypes.STRING(40),
        unique: true,
        allowNull: false,
      },
      nickname: {
        type: DataTypes.STRING(12),
        unique: true,
        allowNull: false,
      },
      pwd: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      statusMsg: {
        type: DataTypes.STRING(25),
        allowNull: false,
      }
    },
    {
      charset: "utf8",
      collate: "utf8_general_ci",
    },
  );

  User.associate = (db) => {
    db.User.belongsToMany(db.Badge, { through: "UserBadge", onDelete: "CASCADE" });
    db.User.hasOne(db.WeekRecord, { onDelete: "CASCADE" });
    db.User.hasOne(db.MonthRecord, { onDelete: "CASCADE" });
    db.User.belongsTo(db.Badge, { foreignKey: "masterBadgeId" });
    db.User.belongsToMany(db.Room, { through: "Participant", as: "Participating", onDelete: "CASCADE" });
  };

  return User;
};
