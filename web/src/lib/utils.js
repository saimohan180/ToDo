export function getTodayDate() {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

export function getTomorrowDate() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
}

export function formatDate(dateStr) {
  if (!dateStr) return null;
  const date = new Date(`${dateStr}T00:00:00.000Z`);
  const options = { month: 'short', day: 'numeric', year: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}
