const Sequelize = require('sequelize');
const env = process.env.NODE_ENV ? process.env.NODE_ENV : "development";
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
db.AnonUser = require("./anonUser")(sequelize, Sequelize);
db.Room = require("./room")(sequelize, Sequelize);
db.Category = require("./category")(sequelize, Sequelize);
db.Tag = require("./tag")(sequelize, Sequelize);
db.Viewer = require("./viewer")(sequelize, Sequelize);
db.Badge = require("./badge")(sequelize, Sequelize);
db.Like = require("./like")(sequelize, Sequelize);
db.RefreshToken = require("./refreshToken")(sequelize, Sequelize);

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;


/////// MySQL만 있을 때 코드 ///////

// const Sequelize = require('sequelize');
// const env = process.env.NODE_ENV || 'development';
// const config = require('../config/config')[env];
// const db = {};

// const sequelize = new Sequelize(
//   config.database,
//   config.username,
//   config.password,
//   config
// );

// db.User = require("./user")(sequelize, Sequelize);
// db.AnonUser = require("./anonUser")(sequelize, Sequelize);
// db.Room = require("./room")(sequelize, Sequelize);
// db.Category = require("./category")(sequelize, Sequelize);
// db.Tag = require("./tag")(sequelize, Sequelize);
// db.Viewer = require("./viewer")(sequelize, Sequelize);
// db.Badge = require("./badge")(sequelize, Sequelize);
// db.Like = require("./like")(sequelize, Sequelize);
// db.RefreshToken = require("./refreshToken")(sequelize, Sequelize);
// db.BeautyRecord = require("./beautyRecord")(sequelize, Sequelize);
// db.SportsRecord = require("./sportsRecord")(sequelize, Sequelize);
// db.StudyRecord = require("./studyRecord")(sequelize, Sequelize);
// db.CounselingRecord = require("./counselingRecord")(sequelize, Sequelize);
// db.CultureRecord = require("./cultureRecord")(sequelize, Sequelize);
// db.ETCRecord = require("./etcRecord")(sequelize, Sequelize);
// db.MonthRecord = require("./monthRecord")(sequelize, Sequelize);

// Object.keys(db).forEach(modelName => {
//   if (db[modelName].associate) {
//     db[modelName].associate(db);
//   }
// });

// db.sequelize = sequelize;
// db.Sequelize = Sequelize;

// module.exports = db;