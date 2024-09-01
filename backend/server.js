const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

dotenv.config({ path: "./config.env" });

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

console.log(DB);

mongoose
  .connect(DB)
  .then((con) => {
    console.log("Database connection successful");
  })
  .catch((err) => {
    console.log("Database Error : " + err);
  });

app.get("/api", (req, res) => {
  res.send("server running!!");
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log("Server started at port : localhost:3000");
});
