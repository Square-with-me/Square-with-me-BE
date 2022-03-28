module.exports = (sequelize, Sequelize) => {
  const RefreshToken = sequelize.define("refreshToken", {
    token: {
      type: Sequelize.STRING,
    },
    expiryDate: {
      type: Sequelize.DATE,
    },
  });

  RefreshToken.associate = (db) => {
    db.RefreshToken.belongsTo(db.User)
  };

  return RefreshToken;
};