import { useStore } from '../store/useStore';
import { 
  CalendarDays, 
  Sunrise, 
  Inbox, 
  FolderKanban, 
  Timer, 
  Calendar,
  CheckCircle2,
  BookLock,
  Settings,
  Sparkles,
  Layout,
  PanelLeftClose,
  PanelLeft
} from 'lucide-react';

export default function Sidebar() {
  const { currentView, setView, sidebarCollapsed, toggleSidebar } = useStore();

  const navItems = [
    { id: 'today', label: 'Today', icon: CalendarDays },
    { id: 'tomorrow', label: 'Tomorrow', icon: Sunrise },
    { id: 'inbox', label: 'Just Todo', icon: Inbox },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'boards', label: 'Boards', icon: Layout },
    { id: 'focus', label: 'Focus', icon: Timer },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'done', label: 'Done', icon: CheckCircle2 },
  ];

  const secretItems = [
    { id: 'journal', label: 'Secret Journal', icon: BookLock },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div 
      className={`${sidebarCollapsed ? 'w-20' : 'w-72'} bg-gradient-to-b from-[#0d1117] to-[#0b0f14] border-r border-[#21262d] h-full flex flex-col shadow-2xl transition-all duration-300 relative group/sidebar`}
    >
      {/* Toggle button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-6 z-50 p-1.5 bg-[#21262d] border border-[#30363d] rounded-full text-gray-400 hover:text-white hover:bg-[#30363d] transition-all shadow-lg opacity-0 group-hover/sidebar:opacity-100"
        title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {sidebarCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
      </button>

      <div className={`p-6 border-b border-[#21262d] ${sidebarCollapsed ? 'px-4' : ''}`}>
        <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-emerald-400 flex items-center justify-center shadow-lg shadow-accent/20 flex-shrink-0">
            <Sparkles className="w-5 h-5 text-[#0b0f14]" />
          </div>
          {!sidebarCollapsed && (
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">TaskFlow</h1>
              <p className="text-xs text-gray-500">Local Task Manager</p>
            </div>
          )}
        </div>
      </div>

      <nav className={`flex-1 p-3 overflow-y-auto ${sidebarCollapsed ? 'px-2' : ''}`}>
        <div className="mb-6">
          {!sidebarCollapsed && (
            <p className="text-[10px] uppercase tracking-wider text-gray-600 font-semibold px-3 mb-2">Tasks</p>
          )}
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                title={sidebarCollapsed ? item.label : undefined}
                className={`w-full text-left ${sidebarCollapsed ? 'px-0 justify-center' : 'px-3'} py-2.5 rounded-xl mb-1 flex items-center gap-3 transition-all duration-200 group ${
                  currentView === item.id
                    ? 'bg-accent/10 text-accent shadow-sm'
                    : 'text-gray-400 hover:bg-[#161b22] hover:text-gray-200'
                }`}
              >
                <div className={`p-1.5 rounded-lg transition-colors ${sidebarCollapsed ? 'mx-auto' : ''} ${
                  currentView === item.id 
                    ? 'bg-accent/20' 
                    : 'bg-[#21262d] group-hover:bg-[#30363d]'
                }`}>
                  <Icon className={`w-4 h-4 ${currentView === item.id ? 'text-accent' : ''}`} />
                </div>
                {!sidebarCollapsed && <span className="text-sm font-medium">{item.label}</span>}
              </button>
            );
          })}
        </div>

        <div className={`pt-4 border-t border-[#21262d] ${sidebarCollapsed ? 'border-t-0 pt-0' : ''}`}>
          {!sidebarCollapsed && (
            <p className="text-[10px] uppercase tracking-wider text-gray-600 font-semibold px-3 mb-2">Private</p>
          )}
          {secretItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                title={sidebarCollapsed ? item.label : undefined}
                className={`w-full text-left ${sidebarCollapsed ? 'px-0 justify-center' : 'px-3'} py-2.5 rounded-xl mb-1 flex items-center gap-3 transition-all duration-200 group ${
                  currentView === item.id
                    ? 'bg-purple-500/10 text-purple-400 shadow-sm'
                    : 'text-gray-400 hover:bg-[#161b22] hover:text-gray-200'
                }`}
              >
                <div className={`p-1.5 rounded-lg transition-colors ${sidebarCollapsed ? 'mx-auto' : ''} ${
                  currentView === item.id 
                    ? 'bg-purple-500/20' 
                    : 'bg-[#21262d] group-hover:bg-[#30363d]'
                }`}>
                  <Icon className={`w-4 h-4 ${currentView === item.id ? 'text-purple-400' : ''}`} />
                </div>
                {!sidebarCollapsed && <span className="text-sm font-medium">{item.label}</span>}
              </button>
            );
          })}
        </div>
      </nav>

      {!sidebarCollapsed && (
        <div className="p-4 border-t border-[#21262d]">
          <div className="flex items-center gap-2 text-[10px] text-gray-600">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span>Local-first • Encrypted • Offline</span>
          </div>
        </div>
      )}
    </div>
  );
}
