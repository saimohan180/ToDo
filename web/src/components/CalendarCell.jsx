export default function CalendarCell({ day, tasks, analytics, onClick, isToday }) {
  if (!day) {
    return <div className="aspect-square border border-dark-border bg-dark-bg" />;
  }

  const hasData = tasks > 0;

  return (
    <button
      onClick={onClick}
      className={`aspect-square border transition-colors p-2 flex flex-col justify-between ${
        isToday
          ? 'border-accent bg-dark-card'
          : hasData
          ? 'border-dark-border bg-dark-card hover:border-accent'
          : 'border-dark-border bg-dark-bg hover:bg-dark-card'
      }`}
    >
      <div className="text-left">
        <span
          className={`text-sm font-semibold ${
            isToday ? 'text-accent' : hasData ? 'text-gray-200' : 'text-gray-500'
          }`}
        >
          {day}
        </span>
      </div>

      {hasData && (
        <div className="text-left space-y-1">
          <div className="text-xs text-gray-400">
            {analytics.completed}/{analytics.total}
          </div>
          <div
            className={`text-xs font-bold ${
              analytics.efficiency >= 70
                ? 'text-accent'
                : analytics.efficiency >= 40
                ? 'text-yellow-400'
                : 'text-red-400'
            }`}
          >
            {analytics.efficiency}%
          </div>
        </div>
      )}
    </button>
  );
}
