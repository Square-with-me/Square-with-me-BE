const dotenv = require("dotenv");
dotenv.config();
const mongoose = require("mongoose");
const { mongodbUrl } = process.env;


// Mongo DB 연결 부분
const connect = () => {
  mongoose
      .connect(mongodbUrl, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          ignoreUndefined: true,
      }).then(() => console.log("MongoDB Connected", new Date()))
      .catch(err => console.log(err));
};

mongoose.connection.on("error", err => {
  console.error("MongoDB Connection Error", err);
});

module.exports = connect;