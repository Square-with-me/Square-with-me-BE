const { server } = require("./socket");

const dotenv = require("dotenv");
dotenv.config();

server.listen(process.env.PORT, () => {
  console.log("Nemo-with-me server is running on PORT =", process.env.PORT, ", ENVIRONMENT =", process.env.NODE_ENV);
});