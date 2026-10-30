import React from 'react';
import {
  LayoutDashboard,
  Code2,
  BookOpen,
  Timer,
  History,
  BarChart3,
  User,
  Settings,
  ShieldAlert,
  Keyboard,
  Flame
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export function Sidebar({ currentView, onNavigate, isOpen, onClose }) {
  const { user, userStats } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'practice', label: 'Quick Practice', icon: Keyboard },
    { id: 'coding', label: 'Coding Practice', icon: Code2 },
    { id: 'english', label: 'English Practice', icon: BookOpen },
    { id: 'test', label: 'Typing Test', icon: Timer },
    { id: 'history', label: 'History', icon: History },
    { id: 'statistics', label: 'Statistics', icon: BarChart3 },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  if (user && user.role === 'admin') {
    navItems.push({ id: 'admin', label: 'Admin Panel', icon: ShieldAlert });
  }

  const handleItemClick = (id) => {
    onNavigate(id);
    if (onClose) onClose();
  };

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />
      <aside className={`app-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <button
            className="brand-logo"
            onClick={() => handleItemClick('dashboard')}
            style={{ textAlign: 'left' }}
          >
            <div className="brand-icon">
              <Code2 size={20} />
            </div>
            <span>CodeTyper</span>
          </button>
        </div>

        <nav className="sidebar-nav">
          <span className="nav-section-title">Main Menu</span>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                className={`nav-link ${isActive ? 'active' : ''}`}
                onClick={() => handleItemClick(item.id)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {user && (
          <div className="sidebar-footer">
            <div className="sidebar-user-card" onClick={() => handleItemClick('profile')}>
              <img
                src={user.avatar_url || 'https://api.dicebear.com/7.x/identicon/svg?seed=user'}
                alt={user.full_name}
                className="user-avatar"
              />
              <div className="user-meta">
                <div className="user-meta-name">{user.full_name}</div>
                <div className="user-meta-wpm" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Flame size={12} color="var(--color-primary-forest)" />
                  <span>{userStats?.current_streak || 1} day streak</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
