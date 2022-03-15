module.exports = (sequelize, DataTypes) => {
  const Room = sequelize.define(
    "room",
    {
      title: {
        type: DataTypes.STRING(30),
        unique: true,
        allowNull: false,
      },
      isSecret: {
        type: DataTypes.BOOLEAN,
        default: false,
      },
      pwd: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      masterUserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      likeCnt: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      participantCnt: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      }
    },
    {
      charset: "utf8",
      collate: "utf8_general_ci",
    },
  );

  Room.associate = (db) => {
    db.Room.belongsToMany(db.User, { through: "Participant", as: "Participants", onDelete: "CASCADE" });
    db.Room.hasOne(db.Viewer, { onDelete: "CASCADE" });
    db.Room.belongsTo(db.Category);
    db.Room.belongsToMany(db.Tag, { through: "RoomTag", as: "Tags" });
    db.Room.hasMany(db.Like, { onDelete: "CASCADE" });
  };

  return Room;
};
