module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "user",
    {
      origin: { // 로컬 로그인은 이메일, sns 로그인은 id 저장
        type: DataTypes.STRING(40),
        unique: true,
        allowNull: false,
      },
      nickname: {
        type: DataTypes.STRING(12),
        unique: false,
        allowNull: false,
      },
      pwd: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      profileImg: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      statusMsg: {
        type: DataTypes.STRING(25),
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING(10),
        allowNull: false,
      }
    },
    {
      charset: "utf8",
      collate: "utf8_general_ci",
    },
  );

  User.associate = (db) => {
    db.User.belongsToMany(db.Badge, { through: "UserBadge", as: "MyBadges", onDelete: "CASCADE" });
    db.User.hasOne(db.WeekRecord, { onDelete: "CASCADE" });
    db.User.hasOne(db.MonthRecord, { onDelete: "CASCADE" });
    db.User.belongsTo(db.Badge, { as: "MasterBadge", foreignKey: "masterBadgeId" });
    db.User.belongsToMany(db.Room, { through: "Participant", as: "Participating", onDelete: "CASCADE" });
  };

  return User;
};
