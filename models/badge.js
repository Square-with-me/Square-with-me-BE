module.exports = (sequelize, DataTypes) => {
  const Badge = sequelize.define(
    'badge',
    {
      name: {
        type: DataTypes.STRING(20),
        unique: true,
        allowNull: false,
      },
      desc: {
        type: DataTypes.STRING(40),
        allowNull: false,
      },
      imageUrl: {
        type: DataTypes.STRING(300), // 길이 필요에 따라 조정 가능
        allowNull: false,
      },
      leftBadges: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      
    },
    {
      charset: 'utf8',
      collate: 'utf8_general_ci',
    },
  );

  Badge.associate = (db) => {
    db.Badge.belongsToMany(db.User, { through: "UserBadge", as: "Challengers" });
    db.Badge.hasMany(db.User, { as: "MasterBadge", foreignKey: "masterBadgeId" })
  };

  return Badge;
};
