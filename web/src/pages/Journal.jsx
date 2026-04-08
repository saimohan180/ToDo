import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { getLocalDateString } from '../lib/utils';
import { 
  Lock, 
  Unlock, 
  ChevronLeft, 
  ChevronRight, 
  Calendar,
  Save,
  Trash2,
  Eye,
  EyeOff,
  BookOpen,
  Shield,
  Skull,
  X
} from 'lucide-react';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Journal() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [entryDates, setEntryDates] = useState([]);
  const [currentEntry, setCurrentEntry] = useState(null);
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [storedPassword, setStoredPassword] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handleUnlock = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const result = await api.journal.verify(password);
      if (result.valid) {
        setIsUnlocked(true);
        setStoredPassword(password);
        loadEntriesForMonth(password);
      } else {
        setError('Invalid password');
      }
    } catch (err) {
      setError('Failed to verify password');
    }
  };

  const loadEntriesForMonth = async (pwd) => {
    try {
      const entries = await api.journal.getEntriesByMonth(year, month + 1, pwd);
      setEntryDates(entries.map(e => e.date));
    } catch (err) {
      console.error('Failed to load entries:', err);
    }
  };

  useEffect(() => {
    if (isUnlocked && storedPassword) {
      loadEntriesForMonth(storedPassword);
    }
  }, [year, month, isUnlocked]);

  const loadEntry = async (date) => {
    setSelectedDate(date);
    try {
      const entry = await api.journal.getEntry(date, storedPassword);
      setCurrentEntry(entry);
      setContent(entry.content || '');
    } catch (err) {
      setContent('');
      setCurrentEntry(null);
    }
  };

  const handleSave = async () => {
    if (!selectedDate || !content.trim()) return;
    
    setSaving(true);
    try {
      if (currentEntry && currentEntry.id) {
        await api.journal.updateEntry(currentEntry.id, content, storedPassword);
      } else {
        const newEntry = await api.journal.createEntry(selectedDate, content, storedPassword);
        setCurrentEntry(newEntry);
      }
      loadEntriesForMonth(storedPassword);
    } catch (err) {
      setError('Failed to save entry');
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!currentEntry || !currentEntry.id) return;
    
    if (!confirm('Are you sure you want to delete this entry?')) return;
    
    try {
      await api.journal.deleteEntry(currentEntry.id, storedPassword);
      setContent('');
      setCurrentEntry(null);
      loadEntriesForMonth(storedPassword);
    } catch (err) {
      setError('Failed to delete entry');
    }
  };

  const navigateMonth = (delta) => {
    const newDate = new Date(year, month + delta, 1);
    setCurrentDate(newDate);
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
      days.push({
        day: i,
        date: dateStr,
        hasEntry: entryDates.includes(dateStr),
        isToday: dateStr === getLocalDateString(),
        isSelected: dateStr === selectedDate
      });
    }
    
    return days;
  };

  const handleLock = () => {
    setIsUnlocked(false);
    setPassword('');
    setStoredPassword('');
    setSelectedDate(null);
    setContent('');
    setCurrentEntry(null);
  };

  if (!isUnlocked) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-[#0b0f14] via-[#0d1117] to-[#161b22]">
        <div className="w-full max-w-md mx-auto p-8">
          <div className="bg-[#161b22] rounded-3xl p-8 border border-[#30363d] shadow-2xl">
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Secret Journal</h2>
              <p className="text-gray-400 text-sm">Your private encrypted thoughts</p>
            </div>

            <form onSubmit={handleUnlock} className="space-y-4">
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full pl-12 pr-12 py-4 bg-[#0d1117] border border-[#30363d] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {error && (
                <div className="text-red-400 text-sm text-center bg-red-500/10 py-2 px-4 rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2"
              >
                <Unlock className="w-5 h-5" />
                Unlock Journal
              </button>
            </form>

            <p className="text-center text-gray-500 text-xs mt-6">
              Use your journal password to unlock.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const days = getDaysInMonth();

  return (
    <div className="h-full flex bg-gradient-to-br from-[#0b0f14] via-[#0d1117] to-[#161b22] relative">
      {/* Floating Hacker Button to show calendar */}
      {!showCalendar && (
        <button
          onClick={() => setShowCalendar(true)}
          className="absolute left-4 top-4 z-40 p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-110 transition-all duration-300 group"
          title="Open calendar"
        >
          <Skull className="w-6 h-6 text-white group-hover:animate-pulse" />
        </button>
      )}

      {/* Calendar Panel - Sliding */}
      <div 
        className={`${showCalendar ? 'w-96 opacity-100' : 'w-0 opacity-0'} border-r border-[#21262d] flex flex-col overflow-hidden transition-all duration-300 ease-in-out`}
      >
        <div className="p-6 flex flex-col h-full min-w-[384px]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                <BookOpen className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Journal</h2>
                <p className="text-xs text-gray-500">Select a date</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCalendar(false)}
                className="p-2 rounded-lg bg-[#21262d] text-gray-400 hover:text-white hover:bg-[#30363d] transition-all"
                title="Hide calendar"
              >
                <X className="w-5 h-5" />
              </button>
              <button
                onClick={handleLock}
                className="p-2 rounded-lg bg-[#21262d] text-gray-400 hover:text-white hover:bg-[#30363d] transition-all"
                title="Lock journal"
              >
                <Lock className="w-5 h-5" />
              </button>
            </div>
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
                    onClick={() => {
                      loadEntry(day.date);
                      setShowCalendar(false);
                    }}
                    className={`w-full h-full rounded-xl flex flex-col items-center justify-center transition-all relative ${
                      day.isSelected
                        ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25'
                        : day.isToday
                        ? 'bg-[#21262d] text-white ring-2 ring-purple-500/50'
                        : 'hover:bg-[#21262d] text-gray-400 hover:text-white'
                    }`}
                  >
                    <span className="text-sm font-medium">{day.day}</span>
                    {day.hasEntry && !day.isSelected && (
                      <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-purple-400" />
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-[#21262d]">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="w-2 h-2 rounded-full bg-purple-400" />
              <span>Has entry</span>
            </div>
          </div>
        </div>
      </div>

      {/* Editor Panel */}
      <div className="flex-1 p-6 flex flex-col">
        {selectedDate ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                {!showCalendar && (
                  <button
                    onClick={() => setShowCalendar(true)}
                    className="p-2 rounded-lg bg-[#21262d] text-gray-400 hover:text-purple-400 hover:bg-[#30363d] transition-all"
                    title="Show calendar"
                  >
                    <Calendar className="w-5 h-5" />
                  </button>
                )}
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {currentEntry ? 'Last updated: ' + new Date(currentEntry.updated_at).toLocaleString() : 'New entry'}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {currentEntry?.id && (
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                )}
                <button
                  onClick={handleSave}
                  disabled={saving || !content.trim()}
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg shadow-purple-500/25 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>

            <div className="flex-1 relative">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your thoughts here... Your entry will be encrypted."
                className="w-full h-full p-6 bg-[#161b22] border border-[#30363d] rounded-2xl text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 resize-none text-lg leading-relaxed"
              />
              <div className="absolute bottom-4 right-4 flex items-center gap-2 text-xs text-gray-500">
                <Shield className="w-4 h-4" />
                <span>AES-256 Encrypted</span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-[#21262d] flex items-center justify-center">
                <Skull className="w-12 h-12 text-purple-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-400 mb-2">Select a Date</h3>
              <p className="text-gray-500 text-sm mb-4">Click the skull icon or press the button below</p>
              <button
                onClick={() => setShowCalendar(true)}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg shadow-purple-500/25 flex items-center gap-2 mx-auto"
              >
                <Calendar className="w-5 h-5" />
                Open Calendar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
