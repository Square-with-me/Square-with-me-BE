module.exports = (sequelize, DataTypes) => {
  const AnonUser = sequelize.define(
    'anonUser',
    {
      nickname: {
        type: DataTypes.STRING(12),
        unique: true,
        allowNull: false,
      },
    },
    {
      charset: 'utf8',
      collate: 'utf8_general_ci',
    },
  );

  AnonUser.associate = (db) => {
    
  };

  return AnonUser;
};
