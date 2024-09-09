const app = require("./app");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config({ path: "./config.env" });

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB)
  .then((con) => {
    console.log("Database connection successful");
  })
  .catch((err) => {
    console.log("Database Error : " + err);
  });

const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log("Server started at port : localhost:3001");
});
