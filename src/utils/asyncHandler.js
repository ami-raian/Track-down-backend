/**
 * Wraps async route handlers so thrown/rejected errors are forwarded to
 * Express's error middleware without repetitive try/catch blocks.
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
