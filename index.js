require("dotenv").config();
const connectDB = require("./config/DB");
const app = require("./app");
const morgan = require("morgan");
connectDB();
if (process.env.NODE_ENV == "development") {
  // logging
  app.use(morgan("dev"));
}

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server listening on port ${port}...`);
});
