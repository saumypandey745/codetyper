import React, { useState, useRef, useEffect } from 'react';
import { Menu, Sun, Moon, Search, Volume2, VolumeX, LogOut, User, Settings, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSettings } from '../../context/SettingsContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export function Header({ onToggleSidebar, onNavigate, onOpenSearch }) {
  const { user, logout, userStats } = useAuth();
  const { settings, toggleTheme, updateSetting } = useSettings();
  const toast = useToast();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    toast.info('You have been logged out.');
    onNavigate('landing');
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <button
          className="btn btn-ghost btn-sm"
          onClick={onToggleSidebar}
          aria-label="Toggle Navigation Menu"
        >
          <Menu size={20} />
        </button>

        <button
          className="search-trigger"
          onClick={onOpenSearch}
          aria-label="Search practice content"
        >
          <Search size={15} />
          <span>Quick Find...</span>
          <span className="search-kbd">Ctrl K</span>
        </button>
      </div>

      <div className="header-right">
        {/* Live Best WPM Badge */}
        {userStats && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.3rem 0.65rem',
              backgroundColor: 'var(--color-primary-light)',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.825rem',
              fontWeight: 600,
              color: 'var(--color-primary-forest)'
            }}
          >
            <span>Best: {userStats.best_wpm} WPM</span>
          </div>
        )}

        {/* Audio Toggle */}
        <button
          className="theme-toggle-btn"
          onClick={() => updateSetting('sound_enabled', !settings.sound_enabled)}
          title={settings.sound_enabled ? 'Mute typing audio' : 'Enable typing audio'}
          aria-label="Toggle sound"
        >
          {settings.sound_enabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>

        {/* Theme Toggle */}
        <button
          className="theme-toggle-btn"
          onClick={toggleTheme}
          title={settings.theme === 'dark' ? 'Switch to Peaceful Cream Theme' : 'Switch to Slate Green Dark Theme'}
          aria-label="Toggle appearance theme"
        >
          {settings.theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Profile Avatar / Menu */}
        {user ? (
          <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: 'var(--radius-full)' }}
              aria-label="User account menu"
            >
              <img
                src={user.avatar_url || 'https://api.dicebear.com/7.x/identicon/svg?seed=user'}
                alt={user.full_name}
                className="user-avatar"
                style={{ width: '36px', height: '36px', cursor: 'pointer' }}
              />
            </button>

            {dropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '115%',
                  right: 0,
                  width: '210px',
                  backgroundColor: 'var(--color-bg-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-lg)',
                  padding: '0.5rem',
                  zIndex: 110,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.2rem'
                }}
              >
                <div style={{ padding: '0.5rem', borderBottom: '1px solid var(--color-border-subtle)' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>
                    {user.full_name}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>@{user.username}</div>
                </div>

                <button
                  className="btn btn-ghost btn-sm"
                  style={{ justifyContent: 'flex-start', width: '100%' }}
                  onClick={() => {
                    setDropdownOpen(false);
                    onNavigate('profile');
                  }}
                >
                  <User size={15} />
                  <span>Profile</span>
                </button>

                <button
                  className="btn btn-ghost btn-sm"
                  style={{ justifyContent: 'flex-start', width: '100%' }}
                  onClick={() => {
                    setDropdownOpen(false);
                    onNavigate('settings');
                  }}
                >
                  <Settings size={15} />
                  <span>Settings</span>
                </button>

                <div style={{ height: '1px', backgroundColor: 'var(--color-border-subtle)', margin: '0.2rem 0' }} />

                <button
                  className="btn btn-ghost btn-sm"
                  style={{ justifyContent: 'flex-start', width: '100%', color: 'var(--color-error)' }}
                  onClick={handleLogout}
                >
                  <LogOut size={15} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('login')}>
              Log In
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => onNavigate('signup')}>
              Sign Up
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
