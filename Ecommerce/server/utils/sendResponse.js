/**
 * ShopEase - Standardised API Response Helper
 *
 * Ensures every success response from the API has a consistent shape:
 * {
 *   success: true,
 *   message: "...",
 *   data: { ... } | [...],
 *   pagination: { ... }  // optional
 * }
 *
 * Usage:
 *   sendResponse(res, 200, 'Products fetched', { products }, { page, limit, total });
 */

/**
 * @param {import('express').Response} res
 * @param {number}  statusCode  - HTTP status code
 * @param {string}  message     - Human-readable success message
 * @param {Object}  [data={}]   - Payload to include in the `data` key
 * @param {Object}  [pagination] - Optional pagination metadata
 */
const sendResponse = (res, statusCode, message, data = {}, pagination = null) => {
  const responseBody = {
    success: true,
    message,
    ...data,
  };

  if (pagination) {
    responseBody.pagination = pagination;
  }

  return res.status(statusCode).json(responseBody);
};

module.exports = { sendResponse };
