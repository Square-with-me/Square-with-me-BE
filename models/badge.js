module.exports = (sequelize, DataTypes) => {
  const Badge = sequelize.define(
    'badge',
    {
      name: {
        type: DataTypes.STRING(20),
        unique: true,
        allowNull: false,
      },
      condition: {
        type: DataTypes.STRING(40),
        allowNull: false,
      },
      desc: {
        type: DataTypes.STRING(40),
        allowNull: false,
      }
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
