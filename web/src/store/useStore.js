import { create } from 'zustand';
import { api } from '../lib/api';
import { getTodayDate, getTomorrowDate } from '../lib/utils';
import { debounce } from '../lib/dateHelpers';

const analyticsCache = new Map();
const CACHE_TTL = 30000; // 30 seconds

const getCachedAnalytics = (date) => {
  const key = date === undefined ? 'all' : date === null ? 'null' : date;
  const cached = analyticsCache.get(key);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  
  return null;
};

const setCachedAnalytics = (date, data) => {
  const key = date === undefined ? 'all' : date === null ? 'null' : date;
  analyticsCache.set(key, { data, timestamp: Date.now() });
};

export const useStore = create((set, get) => ({
  tasks: [],
  analytics: { total: 0, completed: 0, efficiency: 0 },
  currentView: 'today',
  currentDate: null,
  isLoading: false,
  error: null,
  sidebarCollapsed: false,
  user: null,

  setUser: (user) => {
    set({ user });
  },

  toggleSidebar: () => {
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }));
  },

  setSidebarCollapsed: (collapsed) => {
    set({ sidebarCollapsed: collapsed });
  },

  setView: (view) => {
    set({ currentView: view, error: null });
    get().loadTasksForView(view);
  },

  loadTasksForView: async (view) => {
    set({ isLoading: true, error: null });
    
    try {
      let date;
      
      if (view === 'today') {
        date = getTodayDate();
      } else if (view === 'tomorrow') {
        date = getTomorrowDate();
      } else if (view === 'inbox') {
        date = null;
      } else if (view === 'done') {
        date = undefined;
      } else if (view === 'calendar') {
        set({ isLoading: false });
        return;
      }

      set({ currentDate: date });
      
      const tasks = await api.tasks.list(date);
      const filteredTasks = view === 'done' 
        ? tasks.filter(t => t.status === 'done')
        : tasks;
      
      set({ tasks: filteredTasks, isLoading: false });
      
      if (view !== 'done') {
        const cached = getCachedAnalytics(date);
        
        if (cached) {
          set({ analytics: cached });
        } else {
          const analytics = await api.analytics.get(date);
          setCachedAnalytics(date, analytics);
          set({ analytics });
        }
      }
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  addTask: async (title) => {
    const { currentDate, currentView } = get();
    
    try {
      const taskDate = currentView === 'inbox' ? null : currentDate;
      const newTask = await api.tasks.create({ title, date: taskDate });
      set((state) => ({
        tasks: [newTask, ...state.tasks],
      }));
      
      await get().refreshAnalytics();
    } catch (error) {
      set({ error: error.message });
    }
  },

  toggleTask: async (id) => {
    const task = get().tasks.find(t => t.id === id);
    if (!task) return;

    const newStatus = task.status === 'done' ? 'pending' : 'done';
    
    set((state) => ({
      tasks: state.tasks.map(t => 
        t.id === id ? { ...t, status: newStatus } : t
      ),
    }));
    
    try {
      const updated = await api.tasks.update(id, { status: newStatus });
      set((state) => ({
        tasks: state.tasks.map(t => t.id === id ? updated : t),
      }));
      
      await get().refreshAnalytics();
    } catch (error) {
      set((state) => ({
        tasks: state.tasks.map(t => 
          t.id === id ? { ...t, status: task.status } : t
        ),
        error: error.message,
      }));
    }
  },

  deleteTask: async (id) => {
    const deletedTask = get().tasks.find(t => t.id === id);
    
    set((state) => ({
      tasks: state.tasks.filter(t => t.id !== id),
    }));
    
    try {
      await api.tasks.delete(id);
      await get().refreshAnalytics();
    } catch (error) {
      if (deletedTask) {
        set((state) => ({
          tasks: [...state.tasks, deletedTask],
          error: error.message,
        }));
      }
    }
  },

  refreshAnalytics: debounce(async function() {
    const { currentDate, currentView } = get();
    
    if (currentView !== 'done' && currentView !== 'calendar') {
      try {
        const analytics = await api.analytics.get(currentDate);
        setCachedAnalytics(currentDate, analytics);
        set({ analytics });
      } catch (error) {
        console.error('Failed to refresh analytics:', error);
      }
    }
  }, 300),

  clearCache: () => {
    analyticsCache.clear();
  },
}));
