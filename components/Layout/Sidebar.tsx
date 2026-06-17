
import React from 'react';
import { Icons } from '../../constants';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  userRole: string;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange, userRole }) => {
  const menuItems = [
    { id: 'overview', name: 'Overview', icon: Icons.Dashboard },
    { id: 'predictions', name: 'Sports Predictions', icon: Icons.Sports },
    { id: 'crash', name: 'Spin & Crash', icon: Icons.Crash },
    { id: 'lotto', name: 'Lotto Tools', icon: Icons.Lotto },
  ];

  return (
    <aside className="w-64 bg-slate-900 h-screen fixed left-0 top-0 text-white flex flex-col z-20 transition-all duration-300">
      <div className="p-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <span className="text-blue-500">Pro</span>Stat
        </h1>
        <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-semibold">Intelligence Hub</p>
      </div>

      <nav className="flex-1 mt-6">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full flex items-center gap-4 px-6 py-4 text-sm font-medium transition-colors ${
              activeView === item.id 
              ? 'bg-blue-600 text-white border-r-4 border-blue-400' 
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <item.icon className="w-5 h-5" />
            {item.name}
          </button>
        ))}
      </nav>

      <div className="p-6 border-t border-slate-800">
        <div className="bg-slate-800/50 rounded-lg p-3">
          <p className="text-xs text-slate-400">Account Status</p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400">
              PRO ACCESS
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
