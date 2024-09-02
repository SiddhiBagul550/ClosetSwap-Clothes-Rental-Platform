const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const User = require("./models/userModel");

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

app.post("/api/users/signup", async (req, res) => {
  const newUser = await User.create({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  res.status(201).json({
    status: "success",
    data: {
      user: newUser,
    },
  });
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log("Server started at port : localhost:3000");
});
