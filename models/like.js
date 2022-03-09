module.exports = (sequelize, DataTypes) => {
  const Like = sequelize.define("like", {
    likedId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }
  }, {
    charset: "utf8",
    collate: "utf8_general_ci",
  });

  Like.associate = (db) => {
    db.Like.belongsTo(db.Room);
  };

  return Like;
};