/**
 * Standard success response shape so every endpoint returns the same envelope.
 */
function sendSuccess(res, statusCode, message, data = null, meta = undefined) {
  const body = { success: true, message, data };
  if (meta) body.meta = meta;
  return res.status(statusCode).json(body);
}

module.exports = { sendSuccess };
