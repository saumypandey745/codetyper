import React from 'react';
import { Code2, Sun, Moon, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSettings } from '../../context/SettingsContext.jsx';

export function PublicHeader({ onNavigate }) {
  const { user } = useAuth();
  const { settings, toggleTheme } = useSettings();

  return (
    <header className="public-header">
      <button
        className="brand-logo"
        onClick={() => onNavigate('landing')}
        style={{ cursor: 'pointer' }}
      >
        <div className="brand-icon">
          <Code2 size={20} />
        </div>
        <span>CodeTyper</span>
      </button>

      <nav className="public-nav-links">
        <button className="public-nav-link" onClick={() => onNavigate('english')}>
          English Typing
        </button>
        <button className="public-nav-link" onClick={() => onNavigate('coding')}>
          Coding Practice
        </button>
        <button className="public-nav-link" onClick={() => onNavigate('test')}>
          Typing Test
        </button>
        <button className="public-nav-link" onClick={() => onNavigate('about')}>
          About
        </button>
        <button className="public-nav-link" onClick={() => onNavigate('contact')}>
          Contact
        </button>
      </nav>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button
          className="theme-toggle-btn"
          onClick={toggleTheme}
          title="Toggle Theme"
          aria-label="Toggle Theme"
        >
          {settings.theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {user ? (
          <button className="btn btn-primary btn-sm" onClick={() => onNavigate('dashboard')}>
            <span>Dashboard</span>
            <ArrowRight size={15} />
          </button>
        ) : (
          <>
            <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('login')}>
              Log In
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => onNavigate('signup')}>
              Start Typing
            </button>
          </>
        )}
      </div>
    </header>
  );
}
