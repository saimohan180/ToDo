import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import TaskItem from '../components/TaskItem';
import EfficiencyBar from '../components/EfficiencyBar';
import { api } from '../lib/api';
import { Inbox as InboxIcon, Calendar, FolderKanban, X, Plus, Send, ListTodo } from 'lucide-react';

export default function Inbox() {
  const { tasks, analytics, toggleTask, deleteTask, loadTasksForView, isLoading } = useStore();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [projects, setProjects] = useState([]);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    loadTasksForView('inbox');
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await api.projects.list();
      setProjects(data);
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    const trimmed = newTaskTitle.trim();
    if (!trimmed) return;

    try {
      const task = await api.tasks.create({
        title: trimmed,
        date: selectedDate || null,
        project_id: selectedProject || null,
      });

      await loadTasksForView('inbox');
      
      setNewTaskTitle('');
      setSelectedDate('');
      setSelectedProject('');
      setShowDatePicker(false);
    } catch (error) {
      console.error('Failed to add task:', error);
    }
  };

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
            <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
              <InboxIcon className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">Just Todo</h2>
              <p className="text-gray-500">Flexible task creation</p>
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

        {/* Enhanced Task Input */}
        <form onSubmit={handleAddTask} className="mb-8 bg-[#161b22] rounded-2xl border border-[#30363d] p-5">
          <div className={`relative flex items-center bg-[#0d1117] border rounded-xl transition-all mb-4 ${
            focused ? 'border-accent shadow-lg shadow-accent/10' : 'border-[#30363d]'
          }`}>
            <div className="pl-4">
              <Plus className={`w-5 h-5 transition-colors ${focused ? 'text-accent' : 'text-gray-500'}`} />
            </div>
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="What needs to be done?"
              className="flex-1 bg-transparent px-3 py-4 text-gray-200 placeholder-gray-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <button
              type="button"
              onClick={() => setShowDatePicker(!showDatePicker)}
              className={`px-4 py-2 rounded-xl text-sm transition-all flex items-center gap-2 ${
                showDatePicker || selectedDate
                  ? 'bg-accent/20 text-accent border border-accent/30'
                  : 'bg-[#21262d] text-gray-400 hover:bg-[#30363d] hover:text-gray-200'
              }`}
            >
              <Calendar className="w-4 h-4" />
              {selectedDate ? selectedDate : 'Add Date'}
            </button>

            {projects.length > 0 && (
              <div className="relative">
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className={`appearance-none px-4 py-2 pr-8 rounded-xl text-sm transition-all cursor-pointer ${
                    selectedProject
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                      : 'bg-[#21262d] text-gray-400 hover:bg-[#30363d] hover:text-gray-200'
                  }`}
                >
                  <option value="">No Project</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
                <FolderKanban className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" />
              </div>
            )}

            {(selectedDate || selectedProject) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedDate('');
                  setSelectedProject('');
                  setShowDatePicker(false);
                }}
                className="px-4 py-2 bg-red-500/10 text-red-400 rounded-xl text-sm hover:bg-red-500/20 transition-all flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Clear
              </button>
            )}
          </div>

          {showDatePicker && (
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-3 text-gray-200 focus:outline-none focus:border-accent mb-4"
            />
          )}

          <button
            type="submit"
            disabled={!newTaskTitle.trim()}
            className="w-full bg-gradient-to-r from-accent to-emerald-400 text-[#0b0f14] py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-accent/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
            Add Task
          </button>
        </form>

        <div className="space-y-3">
          {tasks.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-[#21262d] flex items-center justify-center">
                <ListTodo className="w-10 h-10 text-gray-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-400 mb-2">Inbox is empty</h3>
              <p className="text-gray-500 text-sm">Create a task above to get started!</p>
            </div>
          ) : (
            tasks.map((task) => (
              <div key={task.id} className="relative group">
                <TaskItem
                  task={task}
                  onToggle={toggleTask}
                  onDelete={deleteTask}
                />
                <div className="absolute top-4 right-16 flex items-center gap-2">
                  {task.date && (
                    <span className="flex items-center gap-1 px-2 py-1 bg-accent/10 text-accent text-xs rounded-lg">
                      <Calendar className="w-3 h-3" />
                      {task.date}
                    </span>
                  )}
                  {task.project_id && (
                    <span className="flex items-center gap-1 px-2 py-1 bg-purple-500/10 text-purple-400 text-xs rounded-lg">
                      <FolderKanban className="w-3 h-3" />
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
