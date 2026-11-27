import React, { useState, useRef, useEffect } from 'react';
import { Menu, Sun, Moon, Search, Volume2, VolumeX, LogOut, User, Settings, Check, BookOpen, Code2, Timer } from 'lucide-react';
import { LogoutConfirmModal } from '../common/LogoutConfirmModal.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSettings } from '../../context/SettingsContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export function Header({ onToggleSidebar, onNavigate, onOpenSearch, currentView }) {
  const { user, logout, userStats } = useAuth();
  const { settings, toggleTheme, updateSetting } = useSettings();
  const toast = useToast();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const dropdownRef = useRef(null);
  const themeMenuRef = useRef(null);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target)) {
        setShowThemeMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Step 1: dropdown band karo, confirmation modal dikhao
  const handleLogoutRequest = () => {
    setDropdownOpen(false);
    setShowLogoutConfirm(true);
  };

  // Step 2: user ne confirm kiya — ab actual logout
  const handleLogoutConfirmed = async () => {
    setShowLogoutConfirm(false);
    await logout();
    toast.info('You have been signed out.');
    onNavigate('landing');
  };

  const handleLogoutCancelled = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <button
          className="btn btn-ghost btn-sm sidebar-toggle-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle Navigation Menu"
          title="Toggle Navigation Menu"
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

      {/* Quick Mode Switcher in App Header */}
      <div className="header-mode-nav" role="tablist" aria-label="Typing Practice Modes">
        <button
          id="app-header-nav-english"
          className={`header-mode-btn ${currentView === 'english' || currentView === 'practice' ? 'active' : ''}`}
          onClick={() => onNavigate('english')}
          title="English Typing Practice"
        >
          <BookOpen size={14} />
          <span>English Typing</span>
        </button>
        <button
          id="app-header-nav-coding"
          className={`header-mode-btn ${currentView === 'coding' ? 'active' : ''}`}
          onClick={() => onNavigate('coding')}
          title="Coding Practice (25+ Languages)"
        >
          <Code2 size={14} />
          <span>Coding Practice</span>
        </button>
        <button
          id="app-header-nav-test"
          className={`header-mode-btn ${currentView === 'test' ? 'active' : ''}`}
          onClick={() => onNavigate('test')}
          title="Speed Typing Test"
        >
          <Timer size={14} />
          <span>Typing Test</span>
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

        {/* Theme Picker Dropdown */}
        <div style={{ position: 'relative' }} ref={themeMenuRef}>
          <button
            className="theme-toggle-btn"
            onClick={() => setShowThemeMenu((p) => !p)}
            title={`Current theme: ${settings.theme}. Click to switch theme.`}
            aria-label="Change Theme"
          >
            {settings.theme === 'peaceful' || settings.theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          {showThemeMenu && (
            <div
              style={{
                position: 'absolute',
                top: '125%',
                right: 0,
                width: '190px',
                backgroundColor: 'var(--color-bg-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-lg)',
                padding: '0.4rem',
                zIndex: 100,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.2rem'
              }}
            >
              {[
                { id: 'peaceful', label: '☀️ Peaceful Cream' },
                { id: 'dark', label: '🌿 Slate Emerald' },
                { id: 'catppuccin', label: '🌸 Catppuccin' },
                { id: 'dracula', label: '🧛 Dracula' },
                { id: 'tokyo-night', label: '🌆 Tokyo Night' },
                { id: 'nord', label: '❄️ Nord Arctic' },
                { id: 'matrix-neon', label: '💚 Matrix Neon' }
              ].map((th) => (
                <button
                  key={th.id}
                  onClick={() => {
                    updateSetting('theme', th.id);
                    setShowThemeMenu(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.4rem 0.65rem',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: settings.theme === th.id ? 'var(--color-primary-light)' : 'transparent',
                    color: settings.theme === th.id ? 'var(--color-primary-forest)' : 'var(--color-text-main)',
                    fontWeight: settings.theme === th.id ? 700 : 500,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <span>{th.label}</span>
                  {settings.theme === th.id && <Check size={14} />}
                </button>
              ))}
            </div>
          )}
        </div>

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
                  onClick={handleLogoutRequest}
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
      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={showLogoutConfirm}
        onConfirm={handleLogoutConfirmed}
        onCancel={handleLogoutCancelled}
        userName={user?.full_name}
      />
    </header>
  );
}
