import React, { useEffect } from 'react';
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
  Flame,
  Swords,
  Activity,
  Trophy,
  Award,
  X
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
    { id: 'multiplayer', label: '1v1 Duel Arena', icon: Swords },
    { id: 'certificate', label: 'Official Certificate 🎓', icon: Award },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'heatmap', label: 'Key Heatmap', icon: Activity },
    { id: 'history', label: 'History', icon: History },
    { id: 'statistics', label: 'Statistics', icon: BarChart3 },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  if (user && user.role === 'admin') {
    navItems.push({ id: 'admin', label: 'Admin Panel', icon: ShieldAlert });
  }

  // Close drawer on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (onClose) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleItemClick = (id) => {
    onNavigate(id);
    if (onClose) onClose();
  };

  return (
    <>
      <div
        className={`sidebar-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
        aria-hidden={!isOpen}
      />
      <aside
        className={`app-sidebar ${isOpen ? 'open' : ''}`}
        aria-label="Navigation Menu"
        aria-hidden={!isOpen}
      >
        <div className="sidebar-header">
          <button
            className="brand-logo"
            onClick={() => handleItemClick(user ? 'dashboard' : 'landing')}
            style={{ textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            title={user ? 'Go to Dashboard' : 'Go to Home'}
          >
            <div className="brand-icon">
              <Code2 size={20} />
            </div>
            <span>CodeTyper</span>
          </button>

          <button
            className="sidebar-close-btn"
            onClick={onClose}
            aria-label="Close navigation menu"
            title="Close menu (Esc)"
          >
            <X size={19} />
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

        {!user ? (
          <div className="sidebar-footer" style={{ padding: '0.85rem' }}>
            <div
              style={{
                padding: '0.75rem 0.85rem',
                backgroundColor: 'var(--color-bg-soft)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.45rem'
              }}
            >
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                Guest Practice Mode
              </div>
              <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--color-text-muted)', lineHeight: 1.3 }}>
                Sign up free to preserve your streak, stats & certificates.
              </p>
              <button
                className="btn btn-primary btn-sm"
                style={{ width: '100%', fontSize: '0.78rem', marginTop: '0.2rem' }}
                onClick={() => handleItemClick('signup')}
              >
                Sign Up Free
              </button>
            </div>
          </div>
        ) : (
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
