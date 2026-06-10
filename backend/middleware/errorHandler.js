/**
 * Global Express error handler.
 * Catches all errors passed via next(err).
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message    = err.message    || 'Internal Server Error';

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const fields = Object.values(err.errors).map(e => e.message);
    message = `Validation failed: ${fields.join(', ')}`;
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate value for '${field}'.`;
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid value for field '${err.path}'.`;
  }

  // JWT errors (shouldn't reach here normally — handled in middleware)
  if (err.name === 'JsonWebTokenError')  { statusCode = 401; message = 'Invalid token.'; }
  if (err.name === 'TokenExpiredError')  { statusCode = 401; message = 'Token expired.'; }

  if (process.env.NODE_ENV === 'development') {
    console.error(`[ERROR] ${req.method} ${req.path}:`, err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
