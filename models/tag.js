module.exports = (sequelize, DataTypes) => {
  const Tag = sequelize.define(
    'tag',
    {
      name: {
        type: DataTypes.STRING(8),
        unique: true,
        allowNull: false,
      },
    },
    {
      charset: 'utf8',
      collate: 'utf8_general_ci',
    },
  );

  Tag.associate = (db) => {
    db.Tag.belongsToMany(db.Room, { through: "RoomTag", as: "Rooms" });
  };

  return Tag;
};
