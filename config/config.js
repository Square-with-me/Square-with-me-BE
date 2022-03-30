const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  "development": {
    "username": "root",
    "password": process.env.SQUARE_WITH_ME_DB_PASSWORD,
    "database": "Square_with_me_database",
    "host": "127.0.0.1",
    "dialect": "mysql",
    "timezone": "+09:00"
  },
  "test": {
    "username": "root",
    "password": process.env.SQUARE_WITH_ME_DB_PASSWORD,
    "database": "Square_with_me_database",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "production": {
<<<<<<< HEAD
    "username": process.env.MYSQL_PRODUCTION_DB_USERNAME,
    "password": process.env.MYSQL_PRODUCTION_DB_PASSWORD,
    "database": "nemo_with_me_database",
    "host": process.env.MYSQL_PRODUCTION_DB_HOST,
    "dialect": "mysql",
    "timezone": "+09:00"
=======
    "username": "root",
    "password": process.env.MYSQL_PRODUCTION_DB_PASSWORD,
    "database": "nemo_with_me_database",
    "host": process.env.MYSQL_PRODUCTION_DB_HOST,
    "dialect": "mysql"
>>>>>>> d1625e6 (FIX: master branch and ch_mongo branch merged)
  }
}
