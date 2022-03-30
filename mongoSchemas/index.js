const mongoose = require("mongoose");
const { koreanDate } = require("../utils/date");

console.log("Mongo production:", process.env.NODE_ENV);


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
    .then(() => console.log("MongoDB Connected", koreanDate()))
    .catch(err => console.log("MongoDB Connect error:", err));
};

mongoose.connection.on("error", err => {
  console.error("MongoDB Connection Error", err);
});

module.exports = connect;
