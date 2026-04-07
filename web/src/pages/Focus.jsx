import { useState, useEffect, useRef } from 'react';
import { api } from '../lib/api';
import { Timer, Bell, Plus, Trash2, Play, Pause, RotateCcw, BarChart3, Clock, Target } from 'lucide-react';

export default function Focus() {
  const [duration, setDuration] = useState(25);
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState({ today: { sessions: 0, minutes: 0 }, allTime: { sessions: 0, minutes: 0 } });
  const [alarmTime, setAlarmTime] = useState('');
  const [alarms, setAlarms] = useState([]);
  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    loadSessions();
    loadStats();
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIF2S56+yQSg0PUqzk+LRkHAU2j9frxngoAy5+zPLaizsKGGS56+qXTQ0NTqvh8bllHAU2kNXyvnUlBSl+zPDajDwKGGS56+mYTQ0NTavf8b1kHAU2j9brvnUlBSl+zPDaizsKGGS56+qWTA0NTqzh8blkHAU2kNfrvnUlBSh+zPDaizsKGGS56+qWTA0NT6zh8bllHAU2j9brvnUlBSh+zPDaizsKGGS56+qWTA0NT6zh8bllHAU2j9brvnUlBSh+zPDaizsKGGS56+qWTA0NT6zh8bllHAU2j9brvnUlBSh+zPDaizsKGGS56+qWTA0NT6zh8bllHAU2j9brvnUlBSh+zPDaizsKGGS56+qWTA0');
  }, []);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      handleComplete();
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, timeLeft]);

  useEffect(() => {
    const checkAlarms = setInterval(() => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      alarms.forEach(alarm => {
        if (alarm.time === currentTime && !alarm.triggered) {
          playSound();
          alert(`⏰ Alarm: ${alarm.label || 'Time\'s up!'}`);
          alarm.triggered = true;
        }
      });
    }, 30000);

    return () => clearInterval(checkAlarms);
  }, [alarms]);

  const loadSessions = async () => {
    try {
      const data = await api.focus.list();
      setSessions(data);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  };

  const loadStats = async () => {
    try {
      const data = await api.focus.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleStart = async () => {
    setIsRunning(true);
    setTimeLeft(duration * 60);
    
    try {
      const session = await api.focus.start({ duration });
      setCurrentSession(session);
    } catch (error) {
      console.error('Failed to start session:', error);
    }
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(duration * 60);
    setCurrentSession(null);
  };

  const handleComplete = async () => {
    setIsRunning(false);
    playSound();
    
    if (currentSession) {
      try {
        await api.focus.complete(currentSession.id);
        await loadSessions();
        await loadStats();
      } catch (error) {
        console.error('Failed to complete session:', error);
      }
    }
    
    setTimeLeft(duration * 60);
    setCurrentSession(null);
  };

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.log('Audio play failed:', e));
    }
  };

  const handleAddAlarm = () => {
    if (!alarmTime) return;
    setAlarms([...alarms, { id: Date.now(), time: alarmTime, label: '', triggered: false }]);
    setAlarmTime('');
  };

  const handleRemoveAlarm = (id) => {
    setAlarms(alarms.filter(a => a.id !== id));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const presets = [15, 25, 45, 60];
  const progress = ((duration * 60 - timeLeft) / (duration * 60)) * 100;

  return (
    <div className="h-full overflow-auto bg-gradient-to-br from-[#0b0f14] via-[#0d1117] to-[#161b22] p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/20">
            <Timer className="w-8 h-8 text-orange-400" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white">Focus & Timer</h2>
            <p className="text-gray-500">Stay productive with Pomodoro</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Timer Section */}
          <div className="bg-[#161b22] rounded-2xl border border-[#30363d] p-8">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-3 text-white">
              <div className="p-2 rounded-xl bg-accent/20">
                <Target className="w-5 h-5 text-accent" />
              </div>
              Pomodoro Timer
            </h3>

            <div className="relative w-64 h-64 mx-auto mb-8">
              <svg className="transform -rotate-90 w-64 h-64">
                <circle
                  cx="128"
                  cy="128"
                  r="120"
                  stroke="#21262d"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="128"
                  cy="128"
                  r="120"
                  stroke="url(#gradient)"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 120}`}
                  strokeDashoffset={`${2 * Math.PI * 120 * (1 - progress / 100)}`}
                  className="transition-all duration-1000"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#00ff9c" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-5xl font-bold text-accent mb-2 font-mono tracking-wider">
                    {formatTime(timeLeft)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {duration} minute session
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Duration</label>
                <div className="flex gap-2">
                  {presets.map(preset => (
                    <button
                      key={preset}
                      onClick={() => {
                        setDuration(preset);
                        if (!isRunning) setTimeLeft(preset * 60);
                      }}
                      disabled={isRunning}
                      className={`flex-1 py-2.5 rounded-xl font-semibold transition-all ${
                        duration === preset
                          ? 'bg-accent text-[#0b0f14] shadow-lg shadow-accent/25'
                          : 'bg-[#21262d] text-gray-300 hover:bg-[#30363d]'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {preset}m
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                {!isRunning ? (
                  <button
                    onClick={handleStart}
                    className="flex-1 bg-gradient-to-r from-accent to-emerald-400 text-[#0b0f14] py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-accent/25 transition-all flex items-center justify-center gap-2"
                  >
                    <Play className="w-5 h-5" />
                    Start
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handlePause}
                      className="flex-1 bg-yellow-500 text-[#0b0f14] py-3 rounded-xl font-semibold hover:bg-yellow-400 transition-all flex items-center justify-center gap-2"
                    >
                      <Pause className="w-5 h-5" />
                      Pause
                    </button>
                    <button
                      onClick={handleReset}
                      className="flex-1 bg-red-500 text-white py-3 rounded-xl font-semibold hover:bg-red-400 transition-all flex items-center justify-center gap-2"
                    >
                      <RotateCcw className="w-5 h-5" />
                      Reset
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Alarms Section */}
          <div className="space-y-6">
            <div className="bg-[#161b22] rounded-2xl border border-[#30363d] p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-3 text-white">
                <div className="p-2 rounded-xl bg-yellow-500/20">
                  <Bell className="w-5 h-5 text-yellow-400" />
                </div>
                Alarms
              </h3>

              <div className="flex gap-2 mb-4">
                <input
                  type="time"
                  value={alarmTime}
                  onChange={(e) => setAlarmTime(e.target.value)}
                  className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-3 text-gray-200 focus:outline-none focus:border-accent"
                />
                <button
                  onClick={handleAddAlarm}
                  className="px-4 py-3 bg-accent text-[#0b0f14] rounded-xl font-semibold hover:bg-accent/90 transition-all flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add
                </button>
              </div>

              <div className="space-y-2">
                {alarms.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-[#21262d] flex items-center justify-center">
                      <Bell className="w-6 h-6 text-gray-600" />
                    </div>
                    <p className="text-gray-500 text-sm">No alarms set</p>
                  </div>
                ) : (
                  alarms.map(alarm => (
                    <div
                      key={alarm.id}
                      className="flex items-center justify-between bg-[#0d1117] rounded-xl px-4 py-3 border border-[#21262d]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-yellow-500/10">
                          <Clock className="w-5 h-5 text-yellow-400" />
                        </div>
                        <span className="text-xl font-bold text-white font-mono">{alarm.time}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveAlarm(alarm.id)}
                        className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="bg-[#161b22] rounded-2xl border border-[#30363d] p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-3 text-white">
                <div className="p-2 rounded-xl bg-blue-500/20">
                  <BarChart3 className="w-5 h-5 text-blue-400" />
                </div>
                Focus Stats
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#0d1117] rounded-xl p-4 border border-[#21262d]">
                  <div className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Today</div>
                  <div className="text-3xl font-bold text-accent">
                    {stats.today.sessions}
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDuration(stats.today.minutes)}
                  </div>
                </div>
                <div className="bg-[#0d1117] rounded-xl p-4 border border-[#21262d]">
                  <div className="text-xs text-gray-500 mb-1 uppercase tracking-wide">All Time</div>
                  <div className="text-3xl font-bold text-blue-400">
                    {stats.allTime.sessions}
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDuration(stats.allTime.minutes)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="mt-8 bg-[#161b22] rounded-2xl border border-[#30363d] p-6">
          <h3 className="text-xl font-semibold mb-4 text-white">Recent Sessions</h3>
          
          {sessions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#21262d] flex items-center justify-center">
                <Timer className="w-8 h-8 text-gray-600" />
              </div>
              <p className="text-gray-500">No focus sessions yet. Start your first one!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sessions.slice(0, 5).map(session => (
                <div
                  key={session.id}
                  className="flex items-center justify-between bg-[#0d1117] rounded-xl px-4 py-3 border border-[#21262d]"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${session.completed_at ? 'bg-accent/10' : 'bg-yellow-500/10'}`}>
                      {session.completed_at ? (
                        <Target className="w-5 h-5 text-accent" />
                      ) : (
                        <Clock className="w-5 h-5 text-yellow-400" />
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-white">
                        {session.duration} minutes
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(session.started_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  {session.completed_at && (
                    <span className="text-xs text-accent bg-accent/10 px-3 py-1 rounded-full">Completed</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
