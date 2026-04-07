export function getMonthDays(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay();
  
  const days = [];
  
  // Add empty slots for days before the month starts
  for (let i = 0; i < startDayOfWeek; i++) {
    days.push(null);
  }
  
  // Add all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    days.push({
      day,
      date: date.toISOString().split('T')[0],
      isToday: date.toDateString() === new Date().toDateString(),
    });
  }
  
  return days;
}

export function getMonthName(month) {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month];
}

export function getDateRange(numDays = 7) {
  const dates = [];
  const today = new Date();
  
  for (let i = -3; i <= numDays - 4; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push({
      date: date.toISOString().split('T')[0],
      dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
      day: date.getDate(),
      month: date.getMonth(),
      isToday: i === 0,
    });
  }
  
  return dates;
}

export function getWeekStartEnd() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  
  const start = new Date(now);
  start.setDate(now.getDate() - dayOfWeek);
  
  const end = new Date(now);
  end.setDate(now.getDate() + (6 - dayOfWeek));
  
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
}

export function getMonthStartEnd() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
}

export function debounce(fn, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}
