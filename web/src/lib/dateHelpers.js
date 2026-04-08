import { getLocalDateString } from './utils';

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
  
  // Add all days of the month - use local time to avoid timezone issues
  for (let day = 1; day <= daysInMonth; day++) {
    const yearStr = year.toString();
    const monthStr = String(month + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const dateStr = `${yearStr}-${monthStr}-${dayStr}`;
    const todayStr = getLocalDateString();
    
    days.push({
      day,
      date: dateStr,
      isToday: dateStr === todayStr,
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
      date: getLocalDateString(date),
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
    start: getLocalDateString(start),
    end: getLocalDateString(end),
  };
}

export function getMonthStartEnd() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  return {
    start: getLocalDateString(start),
    end: getLocalDateString(end),
  };
}

export function debounce(fn, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}
