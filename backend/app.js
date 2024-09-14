const express = require("express");
const userRoute = require("./routes/userRoute");
const gobalErrorHandler = require("./controllers/errorController");
const AppError = require("./utils/appError");
const authController = require("./controllers/authController");
const cors = require("cors");
const productRoutes = require('./routes/productRoutes');

const app = express();
app.use(express.json());
app.use(cors());
// app.use((req, res, next) => {
//   console.log(req.headers);
// });

app.use("/api/v1/users", userRoute);
app.use('/api/v1/products', productRoutes);

app.all("*", (req, res, next) => {
  // res.status(404).json({
  //   status: "fail",
  //   message: `Can't find ${req.originalUrl} on this server!`,
  // });

  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(gobalErrorHandler);

module.exports = app;
