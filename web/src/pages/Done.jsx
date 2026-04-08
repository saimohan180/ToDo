import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import TaskItem from '../components/TaskItem';
import { formatDate, getTodayDate, getLocalDateString } from '../lib/utils';
import { getWeekStartEnd, getMonthStartEnd } from '../lib/dateHelpers';
import { CheckCircle2, Trophy, Calendar, CalendarDays, CalendarRange, ChevronLeft, ChevronRight, LayoutList, LayoutGrid } from 'lucide-react';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Done() {
  const { tasks, toggleTask, deleteTask, loadTasksForView, isLoading } = useStore();
  const [filter, setFilter] = useState('all');
  const [viewMode, setViewMode] = useState('list');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    loadTasksForView('done');
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-[#0b0f14] via-[#0d1117] to-[#161b22]">
        <div className="flex items-center gap-3 text-gray-400">
          <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          Loading...
        </div>
      </div>
    );
  }

  const filterTasks = (tasks) => {
    if (filter === 'all') return tasks;

    const today = getTodayDate();
    
    if (filter === 'today') {
      return tasks.filter(t => t.date === today);
    }
    
    if (filter === 'week') {
      const { start, end } = getWeekStartEnd();
      return tasks.filter(t => t.date >= start && t.date <= end);
    }
    
    if (filter === 'month') {
      const { start, end } = getMonthStartEnd();
      return tasks.filter(t => t.date >= start && t.date <= end);
    }

    return tasks;
  };

  const filteredTasks = filterTasks(tasks);

  const groupedByDate = filteredTasks.reduce((acc, task) => {
    const date = task.date || 'No Date';
    if (!acc[date]) acc[date] = [];
    acc[date].push(task);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedByDate).sort((a, b) => {
    if (a === 'No Date') return 1;
    if (b === 'No Date') return -1;
    return b.localeCompare(a);
  });

  const filterButtons = [
    { id: 'all', label: 'All', icon: CheckCircle2 },
    { id: 'today', label: 'Today', icon: Calendar },
    { id: 'week', label: 'Week', icon: CalendarDays },
    { id: 'month', label: 'Month', icon: CalendarRange },
  ];

  const navigateMonth = (delta) => {
    const newDate = new Date(year, month + delta, 1);
    setCurrentDate(newDate);
    setSelectedDate(null);
  };

  const getDaysInMonth = () => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const dayTasks = tasks.filter(t => t.date === dateStr);
      days.push({
        day: i,
        date: dateStr,
        count: dayTasks.length,
        isToday: dateStr === getLocalDateString(),
        isSelected: dateStr === selectedDate
      });
    }
    
    return days;
  };

  const selectedDateTasks = selectedDate ? tasks.filter(t => t.date === selectedDate) : [];

  if (viewMode === 'calendar') {
    const days = getDaysInMonth();
    
    return (
      <div className="h-full flex bg-gradient-to-br from-[#0b0f14] via-[#0d1117] to-[#161b22]">
        {/* Calendar Panel */}
        <div className="w-[420px] border-r border-[#21262d] p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-accent/20 to-emerald-500/20">
                <Trophy className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Completed</h2>
                <p className="text-xs text-gray-500">Calendar view</p>
              </div>
            </div>
            <button
              onClick={() => setViewMode('list')}
              className="p-2 rounded-lg bg-[#21262d] text-gray-400 hover:text-white hover:bg-[#30363d] transition-all"
              title="Switch to list view"
            >
              <LayoutList className="w-5 h-5" />
            </button>
          </div>

          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4 px-2">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 rounded-lg hover:bg-[#21262d] text-gray-400 hover:text-white transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h3 className="text-white font-semibold">
              {MONTHS[month]} {year}
            </h3>
            <button
              onClick={() => navigateMonth(1)}
              className="p-2 rounded-lg hover:bg-[#21262d] text-gray-400 hover:text-white transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {WEEKDAYS.map(day => (
              <div key={day} className="text-center text-xs text-gray-500 font-medium py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 flex-1">
            {days.map((day, idx) => (
              <div key={idx} className="aspect-square">
                {day && (
                  <button
                    onClick={() => setSelectedDate(day.date)}
                    className={`w-full h-full rounded-xl flex flex-col items-center justify-center transition-all relative ${
                      day.isSelected
                        ? 'bg-gradient-to-br from-accent to-emerald-400 text-[#0b0f14] shadow-lg shadow-accent/25'
                        : day.isToday
                        ? 'bg-[#21262d] text-white ring-2 ring-accent/50'
                        : day.count > 0
                        ? 'bg-accent/10 text-accent hover:bg-accent/20'
                        : 'hover:bg-[#21262d] text-gray-400 hover:text-white'
                    }`}
                  >
                    <span className="text-sm font-medium">{day.day}</span>
                    {day.count > 0 && !day.isSelected && (
                      <span className="text-[10px] font-bold">{day.count}</span>
                    )}
                    {day.isSelected && day.count > 0 && (
                      <span className="text-[10px] font-bold">{day.count}</span>
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-[#21262d]">
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-accent/20" />
                <span>Has completions</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded ring-2 ring-accent/50" />
                <span>Today</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks Panel */}
        <div className="flex-1 p-6 overflow-auto">
          {selectedDate ? (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedDateTasks.length} completed task{selectedDateTasks.length !== 1 ? 's' : ''}
                </p>
              </div>

              {selectedDateTasks.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-[#21262d] flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-gray-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-400 mb-2">No completions</h3>
                  <p className="text-gray-500 text-sm">No tasks were completed on this day</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedDateTasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggle={toggleTask}
                      onDelete={deleteTask}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-[#21262d] flex items-center justify-center">
                  <Calendar className="w-12 h-12 text-gray-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-400 mb-2">Select a Date</h3>
                <p className="text-gray-500 text-sm">Choose a date to view completed tasks</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-gradient-to-br from-[#0b0f14] via-[#0d1117] to-[#161b22] p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-accent/20 to-emerald-500/20">
                <Trophy className="w-8 h-8 text-accent" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">Done</h2>
                <p className="text-gray-500">All completed tasks</p>
              </div>
            </div>
            <button
              onClick={() => setViewMode('calendar')}
              className="p-3 rounded-xl bg-[#161b22] border border-[#30363d] text-gray-400 hover:text-white hover:border-accent/50 transition-all flex items-center gap-2"
              title="Switch to calendar view"
            >
              <LayoutGrid className="w-5 h-5" />
              <span className="text-sm font-medium">Calendar</span>
            </button>
          </div>
        </div>

        <div className="mb-6 flex gap-2">
          {filterButtons.map((f) => {
            const Icon = f.icon;
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
                  filter === f.id
                    ? 'bg-accent text-[#0b0f14] font-semibold shadow-lg shadow-accent/25'
                    : 'bg-[#161b22] border border-[#30363d] text-gray-300 hover:border-accent/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {f.label}
              </button>
            );
          })}
        </div>

        {filteredTasks.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-[#21262d] flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-gray-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-400 mb-2">
              {filter === 'all' 
                ? 'No completed tasks yet'
                : `No completed tasks for ${filter}`}
            </h3>
            <p className="text-gray-500 text-sm">Complete some tasks to see them here!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedDates.map((date) => (
              <div key={date}>
                <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {date === 'No Date' ? date : formatDate(date)}
                </h3>
                <div className="space-y-3">
                  {groupedByDate[date].map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggle={toggleTask}
                      onDelete={deleteTask}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
