import Sidebar from './components/Sidebar';
import Today from './pages/Today';
import Tomorrow from './pages/Tomorrow';
import Inbox from './pages/Inbox';
import Projects from './pages/Projects';
import Boards from './pages/Boards';
import Focus from './pages/Focus';
import Calendar from './pages/Calendar';
import Done from './pages/Done';
import Journal from './pages/Journal';
import Settings from './pages/Settings';
import { useStore } from './store/useStore';

function App() {
  const { currentView, error } = useStore();

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
      case 'focus':
        return <Focus />;
      case 'calendar':
        return <Calendar />;
      case 'done':
        return <Done />;
      case 'journal':
        return <Journal />;
      case 'settings':
        return <Settings />;
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
