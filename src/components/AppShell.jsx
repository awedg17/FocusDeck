import Sidebar from './Sidebar.jsx';
import { navItems } from '../data/seedData.js';
import { Home, CheckSquare, Target, BarChart3, Settings } from 'lucide-react';

const icons = {
  Home,
  Tasks: CheckSquare,
  Habits: Target,
  Review: BarChart3,
  Settings
};

const accentMap = {
  indigo: { primary: '#6366f1', secondary: '#4f8cff', glow: 'rgba(99, 102, 241, 0.35)' },
  teal: { primary: '#2dd4bf', secondary: '#4f8cff', glow: 'rgba(45, 212, 191, 0.32)' },
  purple: { primary: '#a855f7', secondary: '#6366f1', glow: 'rgba(168, 85, 247, 0.34)' },
  green: { primary: '#4ade80', secondary: '#2dd4bf', glow: 'rgba(74, 222, 128, 0.28)' }
};

export default function AppShell({ activePage, onNavigate, settings, children }) {
  const accent = accentMap[settings.accentColor] || accentMap.indigo;
  const shellStyle = {
    '--accent-primary': accent.primary,
    '--accent-secondary': accent.secondary,
    '--accent-glow': accent.glow,
    '--content-density': settings.compactMode ? '12px' : '18px'
  };

  return (
    <div className={`app-bg ${settings.theme === 'dark' ? 'theme-dark' : ''}`} style={shellStyle}>
      <div className="glow glow-one" />
      <div className="glow glow-two" />
      <div className="app-frame">
        <Sidebar
          items={navItems}
          icons={icons}
          activePage={activePage}
          onNavigate={onNavigate}
        />
        <main className={`main-shell ${settings.compactMode ? 'compact-shell' : ''}`}>{children}</main>
      </div>
    </div>
  );
}
