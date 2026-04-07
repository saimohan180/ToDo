import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import TaskInput from '../components/TaskInput';
import TaskItem from '../components/TaskItem';
import EfficiencyBar from '../components/EfficiencyBar';
import { formatDate } from '../lib/utils';
import { Sunrise, ListTodo } from 'lucide-react';

export default function Tomorrow() {
  const { tasks, analytics, addTask, toggleTask, deleteTask, loadTasksForView, isLoading, currentDate } = useStore();

  useEffect(() => {
    loadTasksForView('tomorrow');
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

  return (
    <div className="h-full overflow-auto bg-gradient-to-br from-[#0b0f14] via-[#0d1117] to-[#161b22] p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20">
              <Sunrise className="w-8 h-8 text-amber-400" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">Tomorrow</h2>
              <p className="text-gray-500">{formatDate(currentDate)}</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <EfficiencyBar
            total={analytics.total}
            completed={analytics.completed}
            efficiency={analytics.efficiency}
          />
        </div>

        <TaskInput onAdd={addTask} placeholder="Plan for tomorrow..." />

        <div className="space-y-3">
          {tasks.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-[#21262d] flex items-center justify-center">
                <ListTodo className="w-10 h-10 text-gray-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-400 mb-2">No plans yet</h3>
              <p className="text-gray-500 text-sm">Start planning for tomorrow!</p>
            </div>
          ) : (
            tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={toggleTask}
                onDelete={deleteTask}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
