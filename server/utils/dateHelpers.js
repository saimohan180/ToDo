// Get local date string in YYYY-MM-DD format
function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Get local timestamp
function getLocalTimestamp() {
  return new Date().toISOString();
}

module.exports = {
  getLocalDateString,
  getLocalTimestamp
};
