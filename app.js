const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const path = require("path");
const hpp = require("hpp");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
// const fs = require("fs");


const app = express();
const dotenv = require("dotenv");
dotenv.config();


const connect = require('./mongoSchemas/index');

// 몽고 db 커넥트
connect();

// MySQL
const db = require("./models");
db.sequelize
  .sync()
  .then(() => {
    console.log("MySQL DB 연결 성공");
  })
  .catch((error) => {
    console.error(error);
  });

// public 폴더 생성  <= image local upload 할 때만 사용
// try {
//   fs.accessSync("public");
// } catch (error) {
//   console.log("public 폴더가 없습니다. 새로 생성합니다.");
//   fs.mkdirSync("public");
// }

// static
// app.use("/", express.static(path.join(__dirname, "public")));

const passportconfig = require("./passport/kakao");
passportconfig();

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

if(process.env.NODE_ENV === "production") {
  app.use(morgan("dev"));
  app.use(hpp());  // req.query 오염 방지
  app.use(helmet.xssFilter());  // X-XSS-Protection 설정
  app.use(helmet.frameguard());  // X-Frame-Options 헤더 설정하여 clickjacking에 대한 보호
  app.use(helmet.contentSecurityPolicy());  // Content-Security-Policy 헤더 설정. XSS 공격 및 기타 교차 사이트 인젝션 예방.
  app.use(
    cors({
      origin: '*'
      // ["https://nemowithme.com", "http://localhost:3000"]
      // credentials: true,
    })
  );
} else {
  app.use(morgan("dev"));
  app.use(
    cors({
      origin: "*",
      // credentials: true,
    })
  );
};

app.get("/", (req, res) => {
  return res.status(200).send("Hello");
});

// routes
const router = require("./routes/router");
app.use("/api", router);

module.exports = app;