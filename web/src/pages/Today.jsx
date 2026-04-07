import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import TaskInput from '../components/TaskInput';
import TaskItem from '../components/TaskItem';
import EfficiencyBar from '../components/EfficiencyBar';
import DateScroller from '../components/DateScroller';
import { formatDate } from '../lib/utils';
import { api } from '../lib/api';
import { CalendarDays, Sparkles, ListTodo } from 'lucide-react';

export default function Today() {
  const { tasks, analytics, addTask, toggleTask, deleteTask, isLoading } = useStore();
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  });
  const [dateTasks, setDateTasks] = useState([]);
  const [dateAnalytics, setDateAnalytics] = useState({ total: 0, completed: 0, efficiency: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDateData(selectedDate);
  }, [selectedDate]);

  const loadDateData = async (date) => {
    setLoading(true);
    try {
      const [tasks, analytics] = await Promise.all([
        api.tasks.list(date),
        api.analytics.get(date),
      ]);
      setDateTasks(tasks);
      setDateAnalytics(analytics);
    } catch (error) {
      console.error('Failed to load date data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (title) => {
    try {
      const newTask = await api.tasks.create({ title, date: selectedDate });
      setDateTasks([newTask, ...dateTasks]);
      await loadDateData(selectedDate);
    } catch (error) {
      console.error('Failed to add task:', error);
    }
  };

  const handleToggle = async (id) => {
    const task = dateTasks.find(t => t.id === id);
    if (!task) return;

    const newStatus = task.status === 'done' ? 'pending' : 'done';
    
    setDateTasks(dateTasks.map(t => 
      t.id === id ? { ...t, status: newStatus } : t
    ));

    try {
      await api.tasks.update(id, { status: newStatus });
      await loadDateData(selectedDate);
    } catch (error) {
      setDateTasks(dateTasks.map(t => 
        t.id === id ? task : t
      ));
    }
  };

  const handleDelete = async (id) => {
    const task = dateTasks.find(t => t.id === id);
    setDateTasks(dateTasks.filter(t => t.id !== id));

    try {
      await api.tasks.delete(id);
      await loadDateData(selectedDate);
    } catch (error) {
      if (task) {
        setDateTasks([...dateTasks, task]);
      }
    }
  };

  if (loading && dateTasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-[#0b0f14] via-[#0d1117] to-[#161b22]">
        <div className="flex items-center gap-3 text-gray-400">
          <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          Loading...
        </div>
      </div>
    );
  }

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-[#0b0f14] via-[#0d1117] to-[#161b22]">
      <DateScroller 
        onDateSelect={setSelectedDate}
        currentDate={selectedDate}
      />

      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-accent/20 to-emerald-500/20">
                <CalendarDays className="w-8 h-8 text-accent" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">
                  {isToday ? 'Today' : formatDate(selectedDate)}
                </h2>
                <p className="text-gray-500">{formatDate(selectedDate)}</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <EfficiencyBar
              total={dateAnalytics.total}
              completed={dateAnalytics.completed}
              efficiency={dateAnalytics.efficiency}
            />
          </div>

          <TaskInput onAdd={handleAddTask} placeholder="Add a task for this day..." />

          <div className="space-y-3">
            {dateTasks.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-[#21262d] flex items-center justify-center">
                  <ListTodo className="w-10 h-10 text-gray-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-400 mb-2">No tasks yet</h3>
                <p className="text-gray-500 text-sm">Add a task above to get started!</p>
              </div>
            ) : (
              dateTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
