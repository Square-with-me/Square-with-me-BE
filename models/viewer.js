module.exports = (sequelize, DataTypes) => {
    const Viewer = sequelize.define(
      "viewer",
      {
        userId: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        anonUserId: {
          type: DataTypes.INTEGER,
          allowNull: true,
        }
      },
      {
        charset: 'utf8',
        collate: 'utf8_general_ci',
      },
    );
  
    Viewer.associate = (db) => {
      db.Viewer.belongsTo(db.Room);
    };

    return Viewer;
  };
  