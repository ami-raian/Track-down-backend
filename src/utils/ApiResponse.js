/**
 * Standard success envelope for single / object responses.
 *   { success, message, data }
 */
function sendSuccess(res, statusCode, message, data = null) {
  return res.status(statusCode).json({ success: true, message, data });
}

/**
 * Standard envelope for paginated list responses.
 *   { success, message, data: [...], pagination: { totalItems, totalPages, currentPage, pageSize } }
 */
function sendPaginated(res, statusCode, message, items, pagination) {
  return res.status(statusCode).json({
    success: true,
    message,
    data: items,
    pagination,
  });
}

module.exports = { sendSuccess, sendPaginated };
