const multer = require('multer');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');

/* eslint-disable no-unused-vars */
/**
 * Central error handler — converts any thrown error into a consistent JSON shape.
 */
function errorHandler(err, _req, res, _next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let details = err.details;

  // Mongoose: bad ObjectId
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // Mongoose: validation
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    details = Object.values(err.errors).map((e) => e.message);
  }

  // Mongoose: duplicate key (e.g. email already exists)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `${field} already in use`;
  }

  // Multer upload errors
  if (err instanceof multer.MulterError) {
    statusCode = 400;
    message =
      err.code === 'LIMIT_FILE_SIZE' ? 'File is too large' : err.message;
  }

  if (statusCode >= 500) {
    console.error('💥', err);
  }

  const body = { success: false, message };
  if (details) body.details = details;
  if (env.nodeEnv === 'development' && statusCode >= 500) body.stack = err.stack;

  res.status(statusCode).json(body);
}

function notFound(req, _res, next) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

module.exports = { errorHandler, notFound };
