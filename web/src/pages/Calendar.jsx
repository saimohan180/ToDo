import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { getMonthDays, getMonthName } from '../lib/dateHelpers';
import CalendarCell from '../components/CalendarCell';

export default function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [monthData, setMonthData] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMonthData();
  }, [currentMonth, currentYear]);

  const loadMonthData = async () => {
    setIsLoading(true);
    try {
      const days = getMonthDays(currentYear, currentMonth);
      const dataPromises = days
        .filter(d => d !== null)
        .map(async (day) => {
          const [tasks, analytics] = await Promise.all([
            api.tasks.list(day.date),
            api.analytics.get(day.date),
          ]);
          return { date: day.date, tasks: tasks.length, analytics };
        });

      const results = await Promise.all(dataPromises);
      const data = {};
      results.forEach(({ date, tasks, analytics }) => {
        data[date] = { tasks, analytics };
      });

      setMonthData(data);
    } catch (error) {
      console.error('Failed to load calendar data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const days = getMonthDays(currentYear, currentMonth);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleDayClick = (date) => {
    // Navigate to Today view with selected date
    window.location.hash = `#day/${date}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-400">Loading calendar...</div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">
            {getMonthName(currentMonth)} {currentYear}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={goToPrevMonth}
              className="px-4 py-2 bg-dark-card border border-dark-border rounded-lg hover:border-accent transition-colors"
            >
              ← Prev
            </button>
            <button
              onClick={() => {
                setCurrentMonth(new Date().getMonth());
                setCurrentYear(new Date().getFullYear());
              }}
              className="px-4 py-2 bg-dark-card border border-dark-border rounded-lg hover:border-accent transition-colors"
            >
              Today
            </button>
            <button
              onClick={goToNextMonth}
              className="px-4 py-2 bg-dark-card border border-dark-border rounded-lg hover:border-accent transition-colors"
            >
              Next →
            </button>
          </div>
        </div>

        <div className="bg-dark-card rounded-lg border border-dark-border overflow-hidden">
          {/* Week day headers */}
          <div className="grid grid-cols-7 border-b border-dark-border">
            {weekDays.map((day) => (
              <div
                key={day}
                className="p-3 text-center text-sm font-semibold text-gray-400 border-r border-dark-border last:border-r-0"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7">
            {days.map((day, index) => {
              const data = day ? monthData[day.date] : null;
              return (
                <CalendarCell
                  key={index}
                  day={day?.day}
                  tasks={data?.tasks || 0}
                  analytics={data?.analytics || { total: 0, completed: 0, efficiency: 0 }}
                  onClick={() => day && handleDayClick(day.date)}
                  isToday={day?.isToday}
                />
              );
            })}
          </div>
        </div>

        <div className="mt-6 p-4 bg-dark-card rounded-lg border border-dark-border">
          <h3 className="text-sm font-semibold text-gray-400 mb-2">Legend</h3>
          <div className="flex flex-wrap gap-4 text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-accent rounded" />
              <span>70%+ efficiency</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-400 rounded" />
              <span>40-69% efficiency</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-400 rounded" />
              <span>&lt;40% efficiency</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-accent rounded" />
              <span>Today</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
