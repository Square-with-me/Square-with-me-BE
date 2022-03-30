const Sequelize = require('sequelize');
// const dotenv = require("dotenv")
// dotenv.config();
// const env = process.env.NODE_ENV ? process.env.NODE_ENV : "development";
const env = "production";
const config = require('../config/config')[env];
const db = {};

// MySQL 연결 부분
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

db.User = require("./user")(sequelize, Sequelize);
db.Room = require("./room")(sequelize, Sequelize);
db.Category = require("./category")(sequelize, Sequelize);
db.Tag = require("./tag")(sequelize, Sequelize);
// db.Viewer = require("./viewer")(sequelize, Sequelize);
db.Badge = require("./badge")(sequelize, Sequelize);
db.Like = require("./like")(sequelize, Sequelize);
// db.RefreshToken = require("./refreshToken")(sequelize, Sequelize);

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;