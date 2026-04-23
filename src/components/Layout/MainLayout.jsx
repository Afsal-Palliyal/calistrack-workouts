import { Outlet, NavLink } from 'react-router-dom';
import { Home, ClipboardList, Clock, LogOut, Activity } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function MainLayout() {
  const { logout } = useAuth();

  return (
    <div className="flex h-[100dvh] bg-background font-sans text-text overflow-hidden">
      
      {/* Desktop Sidebar (hidden on mobile) */}
      <aside className="hidden md:flex flex-col w-64 border-r border-white/5 bg-background/80 backdrop-blur-2xl flex-none z-50">
        <div className="h-24 flex items-center px-8 border-b border-white/5 gap-3">
          <div className="p-2 bg-primary/10 rounded-xl">
            <Activity className="text-primary" size={24} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
            Calistrack
          </h1>
        </div>
        
        <nav className="flex-1 px-4 py-8 space-y-4">
          <NavLink to="/" className={({isActive}) => `flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 ${isActive ? 'text-primary bg-primary/10' : 'text-textMuted hover:text-text hover:bg-white/5'}`}>
            {({ isActive }) => (
              <>
                <Home size={22} className={`transition-all duration-300`} />
                <span className="font-bold tracking-wide text-sm">Dashboard</span>
              </>
            )}
          </NavLink>
          <NavLink to="/log" className={({isActive}) => `flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 ${isActive ? 'text-accent bg-accent/10' : 'text-textMuted hover:text-text hover:bg-white/5'}`}>
            {({ isActive }) => (
              <>
                <ClipboardList size={22} className={`transition-all duration-300`} />
                <span className="font-bold tracking-wide text-sm">Log Workout</span>
              </>
            )}
          </NavLink>
          <NavLink to="/history" className={({isActive}) => `flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 ${isActive ? 'text-primary bg-primary/10' : 'text-textMuted hover:text-text hover:bg-white/5'}`}>
            {({ isActive }) => (
              <>
                <Clock size={22} className={`transition-all duration-300`} />
                <span className="font-bold tracking-wide text-sm">History</span>
              </>
            )}
          </NavLink>
        </nav>
        
        <div className="p-4 border-t border-white/5">
          <button 
            onClick={logout} 
            className="flex items-center gap-4 px-4 py-3 w-full text-textMuted hover:text-red-400 transition-colors rounded-2xl hover:bg-white/5 active:scale-95 text-left"
          >
            <LogOut size={22} />
            <span className="font-bold tracking-wide text-sm">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0 h-[100dvh]">
        
        {/* Mobile Top Header (hidden on desktop) */}
        <header className="md:hidden flex-none fixed top-0 w-full z-40 bg-background/80 backdrop-blur-2xl border-b border-white/5">
          <div className="px-6 h-16 flex items-center justify-between">
            <h1 className="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              Calistrack
            </h1>
            <button 
              onClick={logout} 
              className="p-2 text-textMuted hover:text-red-400 transition-colors rounded-full hover:bg-white/5 active:scale-95"
              aria-label="Sign Out"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* Scrollable Main Area */}
        <main className="flex-1 overflow-y-auto pt-20 pb-32 md:pt-10 md:pb-12 w-full">
          <div className="max-w-xl md:max-w-6xl mx-auto px-4 md:px-8">
            <Outlet />
          </div>
        </main>

        {/* Mobile Bottom Nav (hidden on desktop) */}
        <nav className="md:hidden fixed bottom-0 w-full bg-background/80 backdrop-blur-2xl border-t border-white/5 z-40">
          <div className="max-w-xl mx-auto flex justify-around items-center h-20 px-2 pb-safe">
            <NavLink to="/" className={({isActive}) => `flex flex-col items-center justify-center py-2 px-4 rounded-2xl transition-all duration-300 w-20 ${isActive ? 'text-primary bg-primary/10' : 'text-textMuted hover:text-text hover:bg-white/5'}`}>
              {({ isActive }) => (
                <>
                  <Home size={22} className={`mb-1 transition-all duration-300`} />
                  <span className="text-[10px] font-bold tracking-wide">Dash</span>
                </>
              )}
            </NavLink>
            <NavLink to="/log" className={({isActive}) => `flex flex-col items-center justify-center py-2 px-4 rounded-2xl transition-all duration-300 w-20 ${isActive ? 'text-accent bg-accent/10' : 'text-textMuted hover:text-text hover:bg-white/5'}`}>
              {({ isActive }) => (
                <>
                  <ClipboardList size={22} className={`mb-1 transition-all duration-300`} />
                  <span className="text-[10px] font-bold tracking-wide">Log</span>
                </>
              )}
            </NavLink>
            <NavLink to="/history" className={({isActive}) => `flex flex-col items-center justify-center py-2 px-4 rounded-2xl transition-all duration-300 w-20 ${isActive ? 'text-primary bg-primary/10' : 'text-textMuted hover:text-text hover:bg-white/5'}`}>
              {({ isActive }) => (
                <>
                  <Clock size={22} className={`mb-1 transition-all duration-300`} />
                  <span className="text-[10px] font-bold tracking-wide">History</span>
                </>
              )}
            </NavLink>
          </div>
        </nav>
        
      </div>
    </div>
  );
}
