const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  "development": {
    "username": "root",
    "password": process.env.SQUARE_WITH_ME_DB_PASSWORD,
    "database": "Square_with_me_database",
    "host": "127.0.0.1",
    // "port": 3306,
    "dialect": "mysql"
  },
  "test": {
    "username": "root",
    "password": process.env.SQUARE_WITH_ME_DB_PASSWORD,
    "database": "Square_with_me_database",
    "host": "127.0.0.1",
    // "port": 3366,
    "dialect": "mysql"
  },
  "production": {
    "username": "root",
    "password": process.env.SQUARE_WITH_ME_DB_PASSWORD,
    "database": "Square_with_me_database",
    "host": "127.0.0.1",
    // "port": 3366,
    "dialect": "mysql"
  }
}
