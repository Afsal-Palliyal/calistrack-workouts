import { Outlet, NavLink } from 'react-router-dom';
import { Home, ClipboardList, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function MainLayout() {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <main className="flex-1 overflow-y-auto pb-20 pt-4">
        <div className="max-w-xl mx-auto px-4 h-full">
          <Outlet />
        </div>
      </main>

      <nav className="fixed bottom-0 w-full bg-surface/80 backdrop-blur-lg border-t border-border z-50">
        <div className="max-w-xl mx-auto flex justify-around items-center h-16">
          <NavLink to="/" className={({isActive}) => `flex flex-col items-center p-2 rounded-xl transition-colors ${isActive ? 'text-primary' : 'text-textMuted hover:text-text'}`}>
            <Home size={24} />
            <span className="text-[10px] mt-1 font-medium">Dashboard</span>
          </NavLink>
          <NavLink to="/log" className={({isActive}) => `flex flex-col items-center p-2 rounded-xl transition-colors ${isActive ? 'text-primary' : 'text-textMuted hover:text-text'}`}>
            <ClipboardList size={24} />
            <span className="text-[10px] mt-1 font-medium">Log</span>
          </NavLink>
          <NavLink to="/history" className={({isActive}) => `flex flex-col items-center p-2 rounded-xl transition-colors ${isActive ? 'text-primary' : 'text-textMuted hover:text-text'}`}>
            <Clock size={24} />
            <span className="text-[10px] mt-1 font-medium">History</span>
          </NavLink>
        </div>
      </nav>
    </div>
  );
}
