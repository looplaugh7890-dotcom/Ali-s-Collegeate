import mongoose from 'mongoose';

/**
 * Escape special regex characters in a string to prevent injection.
 */
export function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Parse pagination params from query string.
 * Returns { page, limit, skip } with defaults.
 */
export function parsePagination(query) {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

/**
 * Build a paginated response envelope.
 */
export function paginatedResponse(data, total, page, limit) {
  return {
    success: true,
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  };
}

/**
 * Standard success response.
 */
export function successResponse(data, message = 'Success', statusCode = 200) {
  return { success: true, data, message };
}

/**
 * Standard error response.
 */
export function errorResponse(message = 'Error', statusCode = 500) {
  return { success: false, message, statusCode };
}

/**
 * Validate a MongoDB ObjectId.
 */
export function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

/**
 * Safely escape and create a regex from user input for search.
 */
export function safeSearchRegex(search) {
  if (!search) return null;
  return new RegExp(escapeRegex(search), 'i');
}

/**
 * Validate required fields exist in req.body.
 * Returns array of missing field names (empty if all present).
 */
export function validateRequired(body, fields) {
  return fields.filter((f) => !body[f] || (typeof body[f] === 'string' && !body[f].trim()));
}

/**
 * Validate email format (basic check).
 */
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Generate a unique application/reference number.
 * Uses timestamp + random to avoid collisions.
 */
export function generateUniqueNumber(prefix = 'TAC') {
  const now = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${now}-${random}`;
}
