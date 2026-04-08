import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Today from './pages/Today';
import Tomorrow from './pages/Tomorrow';
import Inbox from './pages/Inbox';
import Projects from './pages/Projects';
import Boards from './pages/Boards';
import Habits from './pages/Habits';
import Focus from './pages/Focus';
import Calendar from './pages/Calendar';
import Done from './pages/Done';
import Journal from './pages/Journal';
import Settings from './pages/Settings';
import { useStore } from './store/useStore';

function App() {
  const { currentView, error, user, setUser } = useStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const savedUser = localStorage.getItem('hexora_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        // Verify the session is still valid
        fetch('/api/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: userData.username }),
        })
          .then(res => res.json())
          .then(data => {
            if (data.valid) {
              setUser(userData);
            } else {
              localStorage.removeItem('hexora_user');
            }
            setIsLoading(false);
          })
          .catch(() => {
            localStorage.removeItem('hexora_user');
            setIsLoading(false);
          });
      } catch {
        localStorage.removeItem('hexora_user');
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, [setUser]);

  const handleLogin = (userData) => {
    localStorage.setItem('hexora_user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('hexora_user');
    setUser(null);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-dark-bg items-center justify-center">
        <div className="flex items-center gap-3 text-gray-400">
          <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          Loading HexOra...
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'today':
        return <Today />;
      case 'tomorrow':
        return <Tomorrow />;
      case 'inbox':
        return <Inbox />;
      case 'projects':
        return <Projects />;
      case 'boards':
        return <Boards />;
      case 'habits':
        return <Habits />;
      case 'focus':
        return <Focus />;
      case 'calendar':
        return <Calendar />;
      case 'done':
        return <Done />;
      case 'journal':
        return <Journal />;
      case 'settings':
        return <Settings onLogout={handleLogout} />;
      default:
        return <Today />;
    }
  };

  return (
    <div className="flex h-screen bg-dark-bg">
      <Sidebar />
      <main className="flex-1 relative overflow-hidden">
        {error && (
          <div className="absolute top-4 right-4 bg-red-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-xl shadow-lg z-50 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            {error}
          </div>
        )}
        {renderView()}
      </main>
    </div>
  );
}

export default App;
