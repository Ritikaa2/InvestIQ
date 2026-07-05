// Centralized error handler
module.exports = (err, req, res, next) => {
  console.error('\n[Server Error]:', err.stack || err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'An unexpected internal server error occurred.';

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};
