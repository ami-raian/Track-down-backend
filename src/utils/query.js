/**
 * Shared helpers for the standard list query format:
 *   ?page=1&length=10&filters={"and":{"f__eq":"v"},"or":{"f__like":"t"}}
 *
 * Supported operators: __eq, __like, __gte, __lte
 */

/** Parse page + length (page size) query params. */
function getPagination(query) {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  // accept `length` (preferred) or `limit` (fallback), cap at 50
  const raw = parseInt(query.length ?? query.limit, 10) || 10;
  const pageSize = Math.min(Math.max(raw, 1), 50);
  return { page, pageSize, skip: (page - 1) * pageSize };
}

/** Build a `{ totalItems, totalPages, currentPage, pageSize }` block. */
function buildPagination(totalItems, page, pageSize) {
  return {
    totalItems,
    totalPages: Math.ceil(totalItems / pageSize) || 0,
    currentPage: page,
    pageSize,
  };
}

function applyOperator(condition, field, op, value) {
  switch (op) {
    case 'eq':
      condition[field] = value;
      break;
    case 'like':
      condition[field] = { $regex: String(value), $options: 'i' };
      break;
    case 'gte':
      condition[field] = { ...(condition[field] || {}), $gte: parseValue(value) };
      break;
    case 'lte':
      condition[field] = { ...(condition[field] || {}), $lte: parseValue(value) };
      break;
    default:
      break;
  }
}

function parseValue(value) {
  // Try date, then number, else raw string
  const d = new Date(value);
  if (!Number.isNaN(d.getTime()) && /\d{4}-\d{2}-\d{2}/.test(String(value))) return d;
  const n = Number(value);
  return Number.isNaN(n) ? value : n;
}

function buildGroup(group, allowedFields) {
  const conditions = [];
  for (const [key, value] of Object.entries(group || {})) {
    const [field, op] = key.split('__');
    if (!allowedFields.includes(field) || !op) continue;
    const condition = {};
    applyOperator(condition, field, op, value);
    if (Object.keys(condition).length) conditions.push(condition);
  }
  return conditions;
}

/**
 * Turn the `filters` JSON query string into a Mongoose filter object.
 * Only fields in `allowedFields` are honoured (prevents arbitrary querying).
 */
function buildFilter(query, allowedFields = []) {
  if (!query.filters) return {};

  let parsed;
  try {
    parsed = typeof query.filters === 'string' ? JSON.parse(query.filters) : query.filters;
  } catch {
    return {};
  }

  const clauses = [];
  const andConds = buildGroup(parsed.and, allowedFields);
  if (andConds.length) clauses.push(...andConds);

  const orConds = buildGroup(parsed.or, allowedFields);
  if (orConds.length) clauses.push({ $or: orConds });

  return clauses.length ? { $and: clauses } : {};
}

module.exports = { getPagination, buildPagination, buildFilter };
