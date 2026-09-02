module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  let message = err.message;

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    err.statusCode = 400;
    err.status = "fail";
    message = `That ${field} is already registered.`;
  } else if (err.name === "ValidationError") {
    err.statusCode = 400;
    err.status = "fail";
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(". ");
  } else if (err.name === "JsonWebTokenError") {
    err.statusCode = 401;
    err.status = "fail";
    message = "Invalid session, please log in again.";
  } else if (err.name === "TokenExpiredError") {
    err.statusCode = 401;
    err.status = "fail";
    message = "Your session has expired, please log in again.";
  }

  res.status(err.statusCode).json({
    status: err.status,
    message,
  });
};
