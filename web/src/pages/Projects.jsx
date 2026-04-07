import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import TaskInput from '../components/TaskInput';
import TaskItem from '../components/TaskItem';
import { FolderKanban, Plus, Trash2, ListTodo, TrendingUp, CheckCircle2 } from 'lucide-react';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectTasks, setProjectTasks] = useState([]);
  const [projectStats, setProjectStats] = useState({ total: 0, completed: 0, efficiency: 0 });
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectColor, setNewProjectColor] = useState('#00ff9c');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      loadProjectData(selectedProject.id);
    }
  }, [selectedProject]);

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      const data = await api.projects.list();
      setProjects(data);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadProjectData = async (projectId) => {
    try {
      const [tasks, stats] = await Promise.all([
        api.projects.getTasks(projectId),
        api.projects.getStats(projectId),
      ]);
      setProjectTasks(tasks);
      setProjectStats(stats);
    } catch (error) {
      console.error('Failed to load project data:', error);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    try {
      const project = await api.projects.create({
        name: newProjectName,
        color: newProjectColor,
      });
      setProjects([project, ...projects]);
      setNewProjectName('');
      setNewProjectColor('#00ff9c');
      setShowNewProject(false);
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const handleAddTask = async (title) => {
    if (!selectedProject) return;

    try {
      const task = await api.tasks.create({
        title,
        project_id: selectedProject.id,
        date: null,
      });
      setProjectTasks([task, ...projectTasks]);
      await loadProjectData(selectedProject.id);
    } catch (error) {
      console.error('Failed to add task:', error);
    }
  };

  const handleToggleTask = async (id) => {
    const task = projectTasks.find(t => t.id === id);
    if (!task) return;

    const newStatus = task.status === 'done' ? 'pending' : 'done';
    
    setProjectTasks(projectTasks.map(t => 
      t.id === id ? { ...t, status: newStatus } : t
    ));

    try {
      await api.tasks.update(id, { status: newStatus });
      await loadProjectData(selectedProject.id);
    } catch (error) {
      setProjectTasks(projectTasks.map(t => 
        t.id === id ? task : t
      ));
    }
  };

  const handleDeleteTask = async (id) => {
    const task = projectTasks.find(t => t.id === id);
    setProjectTasks(projectTasks.filter(t => t.id !== id));

    try {
      await api.tasks.delete(id);
      await loadProjectData(selectedProject.id);
    } catch (error) {
      if (task) {
        setProjectTasks([...projectTasks, task]);
      }
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!confirm('Delete this project? Tasks will be unassigned.')) return;

    try {
      await api.projects.delete(projectId);
      setProjects(projects.filter(p => p.id !== projectId));
      if (selectedProject?.id === projectId) {
        setSelectedProject(null);
        setProjectTasks([]);
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  const colors = ['#00ff9c', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-[#0b0f14] via-[#0d1117] to-[#161b22]">
        <div className="flex items-center gap-3 text-gray-400">
          <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          Loading projects...
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex bg-gradient-to-br from-[#0b0f14] via-[#0d1117] to-[#161b22]">
      {/* Projects Sidebar */}
      <div className="w-80 bg-[#0d1117] border-r border-[#21262d] flex flex-col">
        <div className="p-4 border-b border-[#21262d]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FolderKanban className="w-5 h-5 text-accent" />
              <h2 className="text-xl font-bold text-white">Projects</h2>
            </div>
            <button
              onClick={() => setShowNewProject(!showNewProject)}
              className="px-3 py-1.5 bg-accent text-[#0b0f14] rounded-lg font-semibold hover:bg-accent/90 transition-all flex items-center gap-1.5 text-sm"
            >
              <Plus className="w-4 h-4" />
              New
            </button>
          </div>

          {showNewProject && (
            <form onSubmit={handleCreateProject} className="space-y-3 bg-[#161b22] rounded-xl p-4 border border-[#30363d]">
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Project name"
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-accent"
                autoFocus
              />
              <div className="flex gap-2">
                {colors.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewProjectColor(color)}
                    className={`w-8 h-8 rounded-full transition-all ${
                      newProjectColor === color ? 'ring-2 ring-white scale-110 shadow-lg' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color, boxShadow: newProjectColor === color ? `0 0 20px ${color}40` : 'none' }}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-accent text-[#0b0f14] rounded-lg py-2 font-semibold hover:bg-accent/90 transition-all"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewProject(false)}
                  className="flex-1 bg-[#21262d] text-gray-300 rounded-lg py-2 hover:bg-[#30363d] transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {projects.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#21262d] flex items-center justify-center">
                <FolderKanban className="w-8 h-8 text-gray-600" />
              </div>
              <p className="text-gray-500 text-sm">No projects yet</p>
              <p className="text-gray-600 text-xs mt-1">Click "+ New" to create one!</p>
            </div>
          ) : (
            projects.map((project) => (
              <div
                key={project.id}
                onClick={() => setSelectedProject(project)}
                className={`group p-3 mb-2 rounded-xl cursor-pointer transition-all ${
                  selectedProject?.id === project.id
                    ? 'bg-[#161b22] shadow-lg'
                    : 'hover:bg-[#161b22]/50'
                }`}
                style={{
                  borderLeft: selectedProject?.id === project.id ? `3px solid ${project.color}` : '3px solid transparent',
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0 shadow-lg"
                      style={{ backgroundColor: project.color, boxShadow: `0 0 10px ${project.color}40` }}
                    />
                    <span className="font-medium text-gray-200 truncate">{project.name}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteProject(project.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all ml-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Project Tasks */}
      <div className="flex-1 overflow-auto p-8">
        {!selectedProject ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-[#21262d] flex items-center justify-center">
                <FolderKanban className="w-12 h-12 text-gray-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-400 mb-2">Select a Project</h3>
              <p className="text-gray-500 text-sm">Choose a project from the sidebar to view tasks</p>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
                  style={{ backgroundColor: `${selectedProject.color}20`, boxShadow: `0 0 30px ${selectedProject.color}20` }}
                >
                  <div
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: selectedProject.color }}
                  />
                </div>
                <h2 className="text-3xl font-bold text-white">{selectedProject.name}</h2>
              </div>

              <div className="flex gap-6 text-sm">
                <div className="flex items-center gap-2 text-gray-400">
                  <ListTodo className="w-4 h-4" />
                  <span>{projectStats.total} tasks</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{projectStats.completed} completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className={`w-4 h-4 ${
                    projectStats.efficiency >= 70
                      ? 'text-accent'
                      : projectStats.efficiency >= 40
                      ? 'text-yellow-400'
                      : 'text-red-400'
                  }`} />
                  <span
                    className={`font-bold ${
                      projectStats.efficiency >= 70
                        ? 'text-accent'
                        : projectStats.efficiency >= 40
                        ? 'text-yellow-400'
                        : 'text-red-400'
                    }`}
                  >
                    {projectStats.efficiency}% efficiency
                  </span>
                </div>
              </div>
            </div>

            <TaskInput
              onAdd={handleAddTask}
              placeholder="Add a task to this project..."
            />

            <div className="space-y-3">
              {projectTasks.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-[#21262d] flex items-center justify-center">
                    <ListTodo className="w-10 h-10 text-gray-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-400 mb-2">No tasks yet</h3>
                  <p className="text-gray-500 text-sm">Add a task above to get started!</p>
                </div>
              ) : (
                projectTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={handleToggleTask}
                    onDelete={handleDeleteTask}
                  />
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
