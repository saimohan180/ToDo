import { useState } from 'react';
import { api } from '../lib/api';
import { 
  Settings as SettingsIcon,
  KeyRound,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  Shield,
  Database,
  Palette,
  Lock,
  Info
} from 'lucide-react';

export default function Settings() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage({ type: 'error', text: 'All fields are required' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (newPassword.length < 4) {
      setMessage({ type: 'error', text: 'Password must be at least 4 characters' });
      return;
    }

    setLoading(true);
    try {
      await api.settings.changePassword(currentPassword, newPassword);
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to change password' });
    }
    setLoading(false);
  };

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-[#0b0f14] via-[#0d1117] to-[#161b22]">
      <div className="max-w-3xl mx-auto p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-gray-700 to-gray-800 shadow-lg">
            <SettingsIcon className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Settings</h1>
            <p className="text-gray-400 mt-1">Manage your TaskFlow preferences</p>
          </div>
        </div>

        {/* Security Section */}
        <div className="bg-[#161b22] rounded-2xl border border-[#30363d] overflow-hidden mb-6">
          <div className="p-6 border-b border-[#30363d]">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-500/20">
                <Shield className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Security</h2>
                <p className="text-sm text-gray-500">Manage your journal encryption password</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="p-6 space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Current Password
              </label>
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full pl-12 pr-12 py-3 bg-[#0d1117] border border-[#30363d] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full pl-12 pr-12 py-3 bg-[#0d1117] border border-[#30363d] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full pl-12 pr-12 py-3 bg-[#0d1117] border border-[#30363d] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Message */}
            {message.text && (
              <div className={`flex items-center gap-2 px-4 py-3 rounded-xl ${
                message.type === 'success' 
                  ? 'bg-green-500/10 text-green-400' 
                  : 'bg-red-500/10 text-red-400'
              }`}>
                {message.type === 'success' 
                  ? <Check className="w-5 h-5" /> 
                  : <AlertCircle className="w-5 h-5" />
                }
                <span className="text-sm">{message.text}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <KeyRound className="w-5 h-5" />
              {loading ? 'Changing Password...' : 'Change Password'}
            </button>
          </form>
        </div>

        {/* Info Section */}
        <div className="bg-[#161b22] rounded-2xl border border-[#30363d] overflow-hidden mb-6">
          <div className="p-6 border-b border-[#30363d]">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-500/20">
                <Database className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Storage</h2>
                <p className="text-sm text-gray-500">Your data storage information</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-start gap-4 p-4 bg-[#0d1117] rounded-xl">
              <div className="p-2 rounded-lg bg-[#21262d]">
                <Info className="w-5 h-5 text-gray-400" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-white mb-1">Local-First Storage</h3>
                <p className="text-sm text-gray-500">
                  All your data is stored locally in SQLite database. Your journal entries are encrypted
                  with AES-256 encryption before being saved.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-[#0d1117] rounded-xl">
              <div className="p-2 rounded-lg bg-[#21262d]">
                <Shield className="w-5 h-5 text-gray-400" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-white mb-1">Encryption Details</h3>
                <p className="text-sm text-gray-500">
                  Journal entries use AES-256-CBC encryption with PBKDF2 key derivation. 
                  Even if someone accesses your database file, they cannot read your journal 
                  without the correct password.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="bg-[#161b22] rounded-2xl border border-[#30363d] overflow-hidden">
          <div className="p-6 border-b border-[#30363d]">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-accent/20">
                <Palette className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">About TaskFlow</h2>
                <p className="text-sm text-gray-500">Application information</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-[#0d1117] rounded-xl">
                <p className="text-xs text-gray-500 mb-1">Version</p>
                <p className="text-sm font-medium text-white">0.3.0</p>
              </div>
              <div className="p-4 bg-[#0d1117] rounded-xl">
                <p className="text-xs text-gray-500 mb-1">Type</p>
                <p className="text-sm font-medium text-white">Local-First</p>
              </div>
              <div className="p-4 bg-[#0d1117] rounded-xl">
                <p className="text-xs text-gray-500 mb-1">Database</p>
                <p className="text-sm font-medium text-white">SQLite</p>
              </div>
              <div className="p-4 bg-[#0d1117] rounded-xl">
                <p className="text-xs text-gray-500 mb-1">Encryption</p>
                <p className="text-sm font-medium text-white">AES-256</p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-[#30363d] text-center">
              <p className="text-sm text-gray-500">
                TaskFlow - A modern, local-first task manager with encrypted journaling.
              </p>
              <p className="text-xs text-gray-600 mt-2">
                Built with React, Express, SQLite, and 💚
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}