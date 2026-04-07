function badRequest(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

function isValidIsoDate(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return false;
  }

  const parsed = new Date(`${date}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().startsWith(date);
}

function normalizeDateInput(value, fieldName = "date") {
  if (value === undefined) {
    return undefined;
  }

  if (value === null || value === "null") {
    return null;
  }

  if (typeof value !== "string" || !isValidIsoDate(value)) {
    throw badRequest(`${fieldName} must be YYYY-MM-DD, null, or omitted.`);
  }

  return value;
}

function requireNonEmptyString(value, fieldName) {
  if (typeof value !== "string") {
    throw badRequest(`${fieldName} must be a string.`);
  }

  const trimmed = value.trim();
  if (!trimmed) {
    throw badRequest(`${fieldName} cannot be empty.`);
  }

  return trimmed;
}

function normalizeStatus(value) {
  if (value !== "pending" && value !== "done") {
    throw badRequest(`status must be either "pending" or "done".`);
  }

  return value;
}

module.exports = {
  badRequest,
  normalizeDateInput,
  requireNonEmptyString,
  normalizeStatus,
};

