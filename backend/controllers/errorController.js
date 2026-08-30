module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  let message = err.message;
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    err.statusCode = 400;
    message = `That ${field} is already registered.`;
  }

  res.status(err.statusCode).json({
    status: err.status,
    message,
  });
};
