// Get local date string in YYYY-MM-DD format
export function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTodayDate() {
  return getLocalDateString(new Date());
}

export function getTomorrowDate() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return getLocalDateString(tomorrow);
}

export function formatDate(dateStr) {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const options = { month: 'short', day: 'numeric', year: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

export function getLocalTimestamp() {
  return new Date().toISOString();
}
