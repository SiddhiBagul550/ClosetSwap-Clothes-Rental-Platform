const express = require("express");

const app = express();
// // app.use(express.json());

app.get("/api", (req, res) => {
  res.send("server running!!");
});

app.listen(3000, () => {
  console.log("Server started at port : localhost:3000");
});
