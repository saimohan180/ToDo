import { useState } from 'react';
import { Hexagon, Eye, EyeOff, LogIn, Sparkles } from 'lucide-react';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      onLogin(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0f14] via-[#0d1117] to-[#161b22] flex items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-accent/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/3 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo and branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-accent/30 blur-xl rounded-full" />
              <div className="relative p-4 bg-gradient-to-br from-accent/20 to-emerald-500/20 rounded-2xl border border-accent/30">
                <Hexagon className="w-16 h-16 text-accent" strokeWidth={1.5} />
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
            Hex<span className="text-accent">Ora</span>
          </h1>
          <p className="text-gray-500 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-accent/60" />
            Your personal productivity hub
          </p>
        </div>

        {/* Login form */}
        <div className="bg-[#161b22]/80 backdrop-blur-xl rounded-3xl border border-[#30363d] p-8 shadow-2xl shadow-black/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full px-4 py-3 bg-[#21262d] text-white rounded-xl border border-[#30363d] focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-all placeholder:text-gray-600"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 pr-12 bg-[#21262d] text-white rounded-xl border border-[#30363d] focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-all placeholder:text-gray-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !username || !password}
              className="w-full py-3.5 bg-gradient-to-r from-accent to-emerald-400 text-[#0b0f14] rounded-xl font-semibold hover:shadow-lg hover:shadow-accent/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-[#0b0f14] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In
                </>
              )}
            </button>
          </form>

        </div>

        {/* Footer */}
        <p className="text-center text-gray-600 text-sm mt-6">
          © 2026 HexOra. All rights reserved.
        </p>
      </div>
    </div>
  );
}
