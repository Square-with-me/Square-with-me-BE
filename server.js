const { server } = require("./socket");

const dotenv = require("dotenv");
dotenv.config();

server.listen(process.env.PORT, () => {
  console.log("Square with me server is running on PORT =", process.env.PORT);
})