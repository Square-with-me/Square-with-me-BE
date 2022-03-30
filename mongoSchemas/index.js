const mongoose = require("mongoose");
const { koreanDate: krToday } = require("../utils/date");


// Mongo DB 연결 부분
const connect = () => {
  mongoose
    .connect(
      process.env.NODE_ENV === "production"
        ? process.env.NEMO_WITH_ME_DB_PRODUCTION_URL
        : process.env.NEMO_WITH_ME_DB_URL
      , {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        ignoreUndefined: true,
      })
    .then(() => console.log("MongoDB Connected", krToday()))
    .catch(err => console.log(err));
};

mongoose.connection.on("error", err => {
  console.error("MongoDB Connection Error", err);
});

module.exports = connect;