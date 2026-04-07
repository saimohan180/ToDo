import { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function getWeekDates(baseDate) {
  const date = new Date(baseDate);
  const day = date.getDay();
  const diff = date.getDate() - day;
  
  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(date);
    d.setDate(diff + i);
    const dateStr = d.toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    
    weekDates.push({
      date: dateStr,
      day: d.getDate(),
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      month: d.getMonth(),
      year: d.getFullYear(),
      isToday: dateStr === today,
    });
  }
  return weekDates;
}

function getWeekLabel(dates) {
  if (!dates.length) return '';
  const first = dates[0];
  const last = dates[dates.length - 1];
  
  if (first.month === last.month) {
    return `${MONTHS[first.month]} ${first.day} - ${last.day}, ${first.year}`;
  } else if (first.year === last.year) {
    return `${MONTHS[first.month].slice(0, 3)} ${first.day} - ${MONTHS[last.month].slice(0, 3)} ${last.day}, ${first.year}`;
  } else {
    return `${MONTHS[first.month].slice(0, 3)} ${first.day}, ${first.year} - ${MONTHS[last.month].slice(0, 3)} ${last.day}, ${last.year}`;
  }
}

export default function DateScroller({ onDateSelect, currentDate }) {
  const [baseDate, setBaseDate] = useState(() => currentDate || new Date().toISOString().split('T')[0]);
  
  const dates = useMemo(() => getWeekDates(baseDate), [baseDate]);
  const weekLabel = useMemo(() => getWeekLabel(dates), [dates]);
  
  const today = new Date().toISOString().split('T')[0];
  const isCurrentWeek = dates.some(d => d.isToday);

  const navigateWeek = (direction) => {
    const current = new Date(baseDate);
    current.setDate(current.getDate() + (direction * 7));
    const newDate = current.toISOString().split('T')[0];
    setBaseDate(newDate);
    onDateSelect(newDate);
  };

  const goToToday = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    setBaseDate(todayStr);
    onDateSelect(todayStr);
  };

  useEffect(() => {
    if (currentDate && !dates.find(d => d.date === currentDate)) {
      setBaseDate(currentDate);
    }
  }, [currentDate]);

  return (
    <div className="bg-dark-card border-b border-dark-border">
      {/* Week Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-dark-border/50">
        <div className="flex items-center gap-3">
          <h3 className="text-white font-semibold text-sm">{weekLabel}</h3>
          {!isCurrentWeek && (
            <button
              onClick={goToToday}
              className="text-xs px-2 py-1 rounded-lg bg-accent/20 text-accent hover:bg-accent/30 transition-colors"
            >
              Today
            </button>
          )}
        </div>
      </div>
      
      {/* Date Buttons */}
      <div className="flex items-center justify-center gap-2 px-4 py-3 overflow-x-auto">
        <button
          className="text-gray-400 hover:text-accent transition-colors px-2 p-2 hover:bg-dark-border rounded-lg"
          onClick={() => navigateWeek(-1)}
          title="Previous week"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {dates.map((item) => (
          <button
            key={item.date}
            onClick={() => onDateSelect(item.date)}
            className={`flex flex-col items-center px-4 py-2 rounded-xl transition-all min-w-[60px] ${
              item.date === currentDate
                ? 'bg-accent text-dark-bg font-semibold shadow-lg shadow-accent/20'
                : item.isToday
                ? 'bg-dark-border text-accent ring-2 ring-accent/30'
                : 'text-gray-400 hover:bg-dark-border hover:text-white'
            }`}
          >
            <span className="text-xs uppercase">{item.dayName}</span>
            <span className="text-lg font-bold">{item.day}</span>
          </button>
        ))}

        <button
          className="text-gray-400 hover:text-accent transition-colors px-2 p-2 hover:bg-dark-border rounded-lg"
          onClick={() => navigateWeek(1)}
          title="Next week"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
