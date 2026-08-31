const express = require("express");
const userRoute = require("./routes/userRoute");
const gobalErrorHandler = require("./controllers/errorController");
const AppError = require("./utils/appError");
const cors = require("cors");
const productRoutes = require("./routes/productRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const cookieParser = require("cookie-parser");

const app = express();
app.use(express.json({ limit: "10mb" }));
const allowedOrigins = [
  /^http:\/\/localhost:\d+$/, // any localhost port, for local dev
  ...(process.env.CLIENT_URL ? [process.env.CLIENT_URL] : []),
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.some((allowed) => (allowed instanceof RegExp ? allowed.test(origin) : allowed === origin))) {
        return callback(null, true);
      }
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true, // Allow credentials (cookies)
  })
);
app.use(cookieParser());

// app.use((req, res, next) => {
//   console.log(req.headers);
// });

app.use("/api/v1/users", userRoute);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/bookings", bookingRoutes);

app.all("*", (req, res, next) => {
  // res.status(404).json({
  //   status: "fail",
  //   message: `Can't find ${req.originalUrl} on this server!`,
  // });

  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(gobalErrorHandler);

module.exports = app;
