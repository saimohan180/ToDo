import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { getLocalDateString } from '../lib/utils';
import {
  Zap,
  Plus,
  Trash2,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Check,
  X,
  TrendingUp,
  Calendar as CalendarIcon,
  Target,
  Award,
  Edit3,
  ChevronRight,
  Flame,
  CheckCircle2,
  Circle
} from 'lucide-react';

const COLORS = [
  '#00ff9c', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', 
  '#10b981', '#ef4444', '#06b6d4', '#f97316', '#a855f7'
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function parseFrequencyData(value) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function HabitCard({ habit, onToggle, onEdit, onDelete, isCompleted, isPrivate, onUnlock }) {
  const [showStats, setShowStats] = useState(false);
  const [stats, setStats] = useState(null);
  const [showCounters, setShowCounters] = useState(false);
  const [counters, setCounters] = useState([]);
  const [counterName, setCounterName] = useState('');
  const [activePulseId, setActivePulseId] = useState(null);

  const loadStats = async () => {
    if (!showStats) {
      try {
        const data = await api.habits.get(habit.id);
        setStats(data.stats);
      } catch (error) {
        console.error('Failed to load stats:', error);
      }
    }
    setShowStats(!showStats);
  };

  const loadCounters = async () => {
    try {
      const data = await api.habits.getCounters(habit.id);
      setCounters(Array.isArray(data?.counters) ? data.counters : []);
    } catch (error) {
      console.error('Failed to load counters:', error);
    }
  };

  const toggleCounters = async () => {
    if (!showCounters) {
      await loadCounters();
    }
    setShowCounters(!showCounters);
  };

  const handleCreateCounter = async () => {
    const name = counterName.trim();
    if (!name) return;
    try {
      const data = await api.habits.createCounter(habit.id, name);
      if (data?.counter) {
        setCounters(prev => [data.counter, ...prev]);
      }
      setCounterName('');
    } catch (error) {
      console.error('Failed to create counter:', error);
    }
  };

  const handleIncrementCounter = async (counterId) => {
    setActivePulseId(counterId);
    setTimeout(() => setActivePulseId(null), 220);
    try {
      const data = await api.habits.incrementCounter(habit.id, counterId);
      if (data?.counter) {
        setCounters(prev =>
          prev.map(counter => (counter.id === counterId ? data.counter : counter))
        );
      } else {
        setCounters(prev =>
          prev.map(counter =>
            counter.id === counterId ? { ...counter, count: Number(counter.count || 0) + 1 } : counter
          )
        );
      }
    } catch (error) {
      console.error('Failed to increment counter:', error);
    }
  };

  const handleDeleteCounter = async (counterId) => {
    try {
      await api.habits.deleteCounter(habit.id, counterId);
      setCounters(prev => prev.filter(counter => counter.id !== counterId));
    } catch (error) {
      console.error('Failed to delete counter:', error);
    }
  };

  const getFrequencyText = () => {
    if (habit.frequency === 'daily') return 'Daily';
    if (habit.frequency === 'weekly') {
      const days = parseFrequencyData(habit.frequency_data);
      return days.map(d => WEEKDAYS[d].slice(0, 3)).join(', ');
    }
    if (habit.frequency === 'monthly') {
      const days = parseFrequencyData(habit.frequency_data);
      return `Day ${days.join(', ')}`;
    }
    return '';
  };

  if (isPrivate && !onUnlock) {
    return (
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 hover:border-purple-500/50 transition-all">
        <div className="flex items-center justify-center gap-3 text-gray-500">
          <Lock className="w-5 h-5" />
          <span>Private habit - Unlock to view</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 hover:border-cyan-500/30 transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4 flex-1">
          <button
            onClick={() => onToggle(habit.id)}
            className={`p-3 rounded-xl transition-all ${
              isCompleted
                ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25'
                : 'bg-[#21262d] text-gray-400 hover:bg-[#30363d] hover:text-white'
            }`}
          >
            {isCompleted ? (
              <CheckCircle2 className="w-6 h-6" />
            ) : (
              <Circle className="w-6 h-6" />
            )}
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-white">{habit.name}</h3>
              {habit.is_private === 1 && (
                <Lock className="w-4 h-4 text-purple-400" />
              )}
            </div>
            {habit.description && (
              <p className="text-sm text-gray-400 mb-2">{habit.description}</p>
            )}
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <CalendarIcon className="w-3.5 h-3.5" />
                {getFrequencyText()}
              </span>
              {stats && (
                <>
                  <span className="flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-orange-400" />
                    {stats.currentStreak} day streak
                  </span>
                  <span className="flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-yellow-400" />
                    Best: {stats.bestStreak}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={toggleCounters}
            className="p-2 rounded-lg text-gray-400 hover:text-cyan-300 hover:bg-[#21262d] transition-all"
            title={showCounters ? 'Hide tap counters' : 'Show tap counters'}
          >
            <ChevronRight className={`w-4 h-4 transition-transform ${showCounters ? 'rotate-90' : ''}`} />
          </button>
          <button
            onClick={loadStats}
            className="p-2 rounded-lg text-gray-400 hover:text-cyan-400 hover:bg-[#21262d] transition-all"
            title={showStats ? 'Hide stats' : 'Show stats'}
          >
            <TrendingUp className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(habit)}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#21262d] transition-all"
            title="Edit"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(habit.id)}
            className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showStats && stats && (
        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#30363d]">
          <div className="text-center">
            <div className="text-2xl font-bold text-cyan-400">{stats.currentStreak}</div>
            <div className="text-xs text-gray-500 mt-1">Current Streak</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">{stats.bestStreak}</div>
            <div className="text-xs text-gray-500 mt-1">Best Streak</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{stats.totalCompletions}</div>
            <div className="text-xs text-gray-500 mt-1">Total</div>
          </div>
        </div>
      )}

      {showCounters && (
        <div className="mt-4 pt-4 border-t border-[#30363d] space-y-3">
          <div className="flex items-center gap-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-cyan-300/80">
              Tap Counter
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-cyan-500/40 to-transparent" />
          </div>

          <div className="flex items-center gap-2">
            <input
              value={counterName}
              onChange={(e) => setCounterName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleCreateCounter();
                }
              }}
              placeholder="Create counter (e.g. Water, Pushups)"
              className="flex-1 px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
            />
            <button
              onClick={handleCreateCounter}
              disabled={!counterName.trim()}
              className="px-3 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-cyan-500 to-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:from-cyan-600 hover:to-blue-700 transition-all"
            >
              Add
            </button>
          </div>

          {counters.length === 0 ? (
            <p className="text-xs text-gray-500">No counters yet. Add one and tap to increase.</p>
          ) : (
            <div className="space-y-2">
              {counters.map((counter) => (
                <div
                  key={counter.id}
                  className="flex items-center gap-2 p-2 rounded-xl bg-[#0d1117] border border-[#30363d]"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-200 truncate">{counter.name}</p>
                    <p className="text-xs text-gray-500">Count: {counter.count}</p>
                  </div>

                  <button
                    onClick={() => handleIncrementCounter(counter.id)}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 transition-all active:scale-95 ${
                      activePulseId === counter.id ? 'scale-105 shadow-lg shadow-cyan-500/25' : ''
                    }`}
                  >
                    +1 Tap
                  </button>

                  <button
                    onClick={() => handleDeleteCounter(counter.id)}
                    className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    title="Delete counter"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Habits() {
  const [habits, setHabits] = useState([]);
  const [allHabits, setAllHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [editingHabit, setEditingHabit] = useState(null);
  const [activeTab, setActiveTab] = useState('today'); // 'today' or 'all'

  // Form state
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formFrequency, setFormFrequency] = useState('daily');
  const [formWeekDays, setFormWeekDays] = useState([]);
  const [formMonthDays, setFormMonthDays] = useState([]);
  const [formIsPrivate, setFormIsPrivate] = useState(false);
  const [formColor, setFormColor] = useState('#00ff9c');

  const today = getLocalDateString();

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    try {
      const [todayData, allData] = await Promise.all([
        api.habits.getTodayStatus(),
        api.habits.list()
      ]);
      const todayHabits = Array.isArray(todayData?.habits) ? todayData.habits : [];
      const allHabitsList = Array.isArray(allData) ? allData : [];
      setHabits(todayHabits.filter(h => h.isDueToday));
      setAllHabits(allHabitsList);
    } catch (error) {
      console.error('Failed to load habits:', error);
      setHabits([]);
      setAllHabits([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const result = await api.journal.verify(password);
      if (result.valid) {
        setIsUnlocked(true);
      } else {
        setError('Invalid password');
      }
    } catch (err) {
      setError('Failed to verify password');
    }
  };

  const resetForm = () => {
    setFormName('');
    setFormDescription('');
    setFormFrequency('daily');
    setFormWeekDays([]);
    setFormMonthDays([]);
    setFormIsPrivate(false);
    setFormColor('#00ff9c');
    setEditingHabit(null);
  };

  const openCreate = () => {
    resetForm();
    setShowCreate(true);
  };

  const openEdit = (habit) => {
    setEditingHabit(habit);
    setFormName(habit.name);
    setFormDescription(habit.description || '');
    setFormFrequency(habit.frequency);
    setFormIsPrivate(habit.is_private === 1);
    setFormColor(habit.color || '#00ff9c');
    
    if (habit.frequency === 'weekly') {
      setFormWeekDays(parseFrequencyData(habit.frequency_data));
    } else if (habit.frequency === 'monthly') {
      setFormMonthDays(parseFrequencyData(habit.frequency_data));
    }
    
    setShowCreate(true);
  };

  const handleSubmit = async () => {
    if (!formName.trim()) return;

    let frequencyData = null;
    if (formFrequency === 'weekly' && formWeekDays.length > 0) {
      frequencyData = JSON.stringify(formWeekDays);
    } else if (formFrequency === 'monthly' && formMonthDays.length > 0) {
      frequencyData = JSON.stringify(formMonthDays);
    }

    const habitData = {
      name: formName,
      description: formDescription,
      frequency: formFrequency,
      frequency_data: frequencyData,
      is_private: formIsPrivate,
      color: formColor,
    };

    try {
      if (editingHabit) {
        await api.habits.update(editingHabit.id, habitData);
      } else {
        await api.habits.create(habitData);
      }
      setShowCreate(false);
      resetForm();
      loadHabits();
    } catch (error) {
      console.error('Failed to save habit:', error);
    }
  };

  const handleToggle = async (habitId) => {
    try {
      await api.habits.toggleComplete(habitId, today);
      loadHabits();
    } catch (error) {
      console.error('Failed to toggle habit:', error);
    }
  };

  const handleDelete = async (habitId) => {
    if (!confirm('Delete this habit? This will also delete all completion history.')) return;
    try {
      await api.habits.delete(habitId);
      loadHabits();
    } catch (error) {
      console.error('Failed to delete habit:', error);
    }
  };

  const toggleWeekDay = (day) => {
    setFormWeekDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const toggleMonthDay = (day) => {
    setFormMonthDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  // Get habits based on active tab
  const displayHabits = activeTab === 'today' ? habits : allHabits;
  const publicHabits = displayHabits.filter(h => h.is_private === 0);
  const privateHabits = displayHabits.filter(h => h.is_private === 1);
  const needsUnlock = privateHabits.length > 0 && !isUnlocked;

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-[#0b0f14] via-[#0d1117] to-[#161b22]">
        <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-[#0b0f14] via-[#0d1117] to-[#161b22]">
      {/* Header */}
      <div className="p-6 border-b border-[#21262d]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Habits</h1>
              <p className="text-sm text-gray-400">Build consistency, track streaks</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {needsUnlock && (
              <button
                onClick={() => setIsUnlocked(false)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 text-purple-400 rounded-xl hover:bg-purple-500/20 transition-all"
              >
                <Lock className="w-4 h-4" />
                Unlock Private
              </button>
            )}
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg shadow-cyan-500/25"
            >
              <Plus className="w-5 h-5" />
              New Habit
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mt-6">
          <button
            onClick={() => setActiveTab('today')}
            className={`px-5 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 ${
              activeTab === 'today'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25'
                : 'bg-[#21262d] text-gray-400 hover:text-white hover:bg-[#30363d]'
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
            Today
            {habits.length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === 'today' ? 'bg-white/20' : 'bg-[#30363d]'
              }`}>
                {habits.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-5 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 ${
              activeTab === 'all'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25'
                : 'bg-[#21262d] text-gray-400 hover:text-white hover:bg-[#30363d]'
            }`}
          >
            <Target className="w-4 h-4" />
            All Habits
            {allHabits.length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === 'all' ? 'bg-white/20' : 'bg-[#30363d]'
              }`}>
                {allHabits.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Empty State */}
          {displayHabits.length === 0 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-[#21262d] flex items-center justify-center">
                <Zap className="w-10 h-10 text-gray-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-400 mb-2">
                {activeTab === 'today' ? 'No habits for today' : 'No habits yet'}
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                {activeTab === 'today' 
                  ? 'Your scheduled habits will appear here'
                  : 'Create your first habit to start tracking'
                }
              </p>
              <button
                onClick={openCreate}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all"
              >
                <Plus className="w-5 h-5" />
                Create Habit
              </button>
            </div>
          )}

          {/* Public Habits */}
          {publicHabits.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-cyan-400" />
                {activeTab === 'today' ? "Today's Habits" : 'Public Habits'}
              </h2>
              <div className="space-y-3">
                {publicHabits.map(habit => (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    isCompleted={habit.isCompleted}
                    onToggle={handleToggle}
                    onEdit={openEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Private Habits */}
          {privateHabits.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5 text-purple-400" />
                Private Habits
              </h2>
              {!isUnlocked ? (
                <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-8">
                  <form onSubmit={handleUnlock} className="max-w-md mx-auto">
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Lock className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">Unlock Private Habits</h3>
                      <p className="text-sm text-gray-400">Enter your journal password</p>
                    </div>
                    <div className="relative mb-4">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        className="w-full px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {error && (
                      <div className="text-red-400 text-sm text-center mb-4 bg-red-500/10 py-2 px-4 rounded-lg">
                        {error}
                      </div>
                    )}
                    <button
                      type="submit"
                      className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg"
                    >
                      Unlock
                    </button>
                  </form>
                </div>
              ) : (
                <div className="space-y-3">
                  {privateHabits.map(habit => (
                    <HabitCard
                      key={habit.id}
                      habit={habit}
                      isCompleted={habit.isCompleted}
                      isPrivate={false}
                      onToggle={handleToggle}
                      onEdit={openEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Create/Edit Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-[#161b22] rounded-2xl w-full max-w-2xl border border-[#30363d] shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-[#30363d] sticky top-0 bg-[#161b22] z-10">
              <h2 className="text-2xl font-bold text-white">
                {editingHabit ? 'Edit Habit' : 'Create New Habit'}
              </h2>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Habit Name *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g., Morning Exercise"
                  className="w-full px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Optional description..."
                  className="w-full px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none h-20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Frequency</label>
                <div className="grid grid-cols-3 gap-3">
                  {['daily', 'weekly', 'monthly'].map(freq => (
                    <button
                      key={freq}
                      onClick={() => setFormFrequency(freq)}
                      className={`px-4 py-3 rounded-xl font-medium transition-all ${
                        formFrequency === freq
                          ? 'bg-cyan-500 text-white'
                          : 'bg-[#21262d] text-gray-400 hover:bg-[#30363d]'
                      }`}
                    >
                      {freq.charAt(0).toUpperCase() + freq.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {formFrequency === 'weekly' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Which days?</label>
                  <div className="grid grid-cols-7 gap-2">
                    {WEEKDAYS.map((day, idx) => (
                      <button
                        key={idx}
                        onClick={() => toggleWeekDay(idx)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          formWeekDays.includes(idx)
                            ? 'bg-cyan-500 text-white'
                            : 'bg-[#21262d] text-gray-400 hover:bg-[#30363d]'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {formFrequency === 'monthly' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Which days of month?</label>
                  <div className="grid grid-cols-7 gap-2 max-h-48 overflow-y-auto p-2 bg-[#0d1117] rounded-xl">
                    {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                      <button
                        key={day}
                        onClick={() => toggleMonthDay(day)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          formMonthDays.includes(day)
                            ? 'bg-cyan-500 text-white'
                            : 'bg-[#21262d] text-gray-400 hover:bg-[#30363d]'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => setFormColor(color)}
                      className={`w-10 h-10 rounded-lg transition-all ${
                        formColor === color ? 'ring-2 ring-white scale-110' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsPrivate}
                    onChange={(e) => setFormIsPrivate(e.target.checked)}
                    className="w-5 h-5 rounded bg-[#0d1117] border-[#30363d] text-purple-500 focus:ring-2 focus:ring-purple-500/50"
                  />
                  <span className="text-sm text-gray-300 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-purple-400" />
                    Make this habit private (requires password)
                  </span>
                </label>
              </div>
            </div>

            <div className="p-6 border-t border-[#30363d] flex justify-end gap-3 sticky bottom-0 bg-[#161b22]">
              <button
                onClick={() => {
                  setShowCreate(false);
                  resetForm();
                }}
                className="px-6 py-3 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!formName.trim()}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-semibold hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
              >
                {editingHabit ? 'Save Changes' : 'Create Habit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
