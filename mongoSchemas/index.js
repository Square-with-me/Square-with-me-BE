const dotenv = require("dotenv");
dotenv.config();
const mongoose = require("mongoose");
const { MONGO_DB_URL } = process.env;
const krToday = require("../utils/date").koreanDate()

// Mongo DB 연결 부분
const connect = () => {
  mongoose
      .connect(MONGO_DB_URL, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          ignoreUndefined: true,
      }).then(() => console.log("MongoDB Connected", krToday))
      .catch(err => console.log(err));
};

mongoose.connection.on("error", err => {
  console.error("MongoDB Connection Error", err);
});

module.exports = connect;
