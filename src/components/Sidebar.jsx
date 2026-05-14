import { ChevronDown } from 'lucide-react';

export default function Sidebar({ items, icons, activePage, onNavigate }) {
  return (
    <aside className="sidebar">
      <div className="brand-row">
        <div className="brand-mark">✓</div>
        <span>FocusDeck</span>
      </div>

      <nav className="nav-list">
        {items.map((item) => {
          const Icon = icons[item];
          const active = activePage === item;
          return (
            <button
              key={item}
              className={`nav-item ${active ? 'active' : ''}`}
              onClick={() => onNavigate(item)}
            >
              <Icon size={18} />
              <span>{item}</span>
            </button>
          );
        })}
      </nav>

      <div className="profile-card">
        <div className="avatar">D</div>
        <div>
          <strong>Dewa</strong>
          <small>Stay locked in.</small>
        </div>
        <ChevronDown size={16} />
      </div>
    </aside>
  );
}
