import { createElement } from 'react';
import { Home, Layers, Trophy, MessageSquare, Zap, X } from '../icons/Icons';

const TABS = [
  { id: 'home', label: 'Home', Icon: Home },
  { id: 'materials', label: 'Materials', Icon: Layers },
  { id: 'discussion', label: 'Discussion', Icon: MessageSquare },
  { id: 'quiz', label: 'Quiz', Icon: Zap },
  { id: 'leaderboard', label: 'Leaderboard', Icon: Trophy },
];

function SidebarContent({ activeTab, onTabChange, onCloseMobile }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 md:hidden">
        <p className="text-sm font-semibold text-slate-900">Navigation</p>
        <button type="button" onClick={onCloseMobile} className="btn-ghost px-2 py-2" aria-label="Close menu">
          <X size={16} />
        </button>
      </div>

      <nav className="flex-1 space-y-1.5 p-3 md:p-4">
        {TABS.map(({ id, label, Icon }) => {
          const isActive = id === activeTab;

          return (
            <button
              key={id}
              type="button"
              onClick={() => onTabChange(id)}
              className={`no-select flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium ${
                isActive ? 'tab-active' : 'tab-inactive'
              }`}
            >
              {createElement(Icon, { size: 16, className: isActive ? 'text-slate-700' : 'text-slate-500' })}
              <span>{label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 pt-2">
        <div className="glass-card rounded-xl p-3 text-xs text-slate-600">
          <p className="font-semibold text-slate-900">Daily streak</p>
          <p className="mt-1 text-slate-500">Keep learning every day to climb faster on the leaderboard.</p>
        </div>
      </div>
    </div>
  );
}

export default function Sidebar({ activeTab, onTabChange, isDesktopOpen, isMobileOpen, onCloseMobile }) {
  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-30 hidden w-56 border-r border-slate-200 bg-white pt-16 transition-transform duration-300 md:block ${
          isDesktopOpen ? 'md:translate-x-0 md:pointer-events-auto' : 'md:-translate-x-full md:pointer-events-none'
        }`}
      >
        <SidebarContent activeTab={activeTab} onTabChange={onTabChange} onCloseMobile={onCloseMobile} />
      </aside>

      <div
        className={`fixed inset-0 z-50 bg-black/30 transition-opacity md:hidden ${
          isMobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onCloseMobile}
        aria-hidden="true"
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-slate-200 bg-white shadow-xl transition-transform duration-300 md:hidden ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent activeTab={activeTab} onTabChange={onTabChange} onCloseMobile={onCloseMobile} />
      </aside>
    </>
  );
}
