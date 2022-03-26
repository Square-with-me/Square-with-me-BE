const dotenv = require("dotenv");
dotenv.config();
const mongoose = require("mongoose");
const { MONGO_DB_URL } = process.env;

// 1. 현재 PC 표준 시간
const curr = new Date();

// 2. UTC 시간 계산
const utc = 
      curr.getTime() + 
      (curr.getTimezoneOffset() * 60 * 1000);

// 3. UTC to KST (UTC + 9시간)
const KR_TIME_DIFF = 9 * 60 * 60 * 1000;
const kr_curr = 
      new Date(utc + (KR_TIME_DIFF));

// Mongo DB 연결 부분
const connect = () => {
  mongoose
      .connect(MONGO_DB_URL, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          ignoreUndefined: true,
      }).then(() => console.log("MongoDB Connected", kr_curr))
      .catch(err => console.log(err));
};

mongoose.connection.on("error", err => {
  console.error("MongoDB Connection Error", err);
});

module.exports = connect;