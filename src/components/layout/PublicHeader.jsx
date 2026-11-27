import React from 'react';
import { Code2, BookOpen, Timer, Award, Info, Mail, Sun, Moon, ArrowRight, Calculator } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSettings } from '../../context/SettingsContext.jsx';

export function PublicHeader({ onNavigate, currentView = 'landing', currentPath = '/' }) {
  const { user } = useAuth();
  const { settings, toggleTheme } = useSettings();


  const handleLinkClick = (e, path) => {
    if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
      e.preventDefault();
      onNavigate(path);
    }
  };

  return (
    <header className="public-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <a
            id="brand-logo-btn"
            href="/"
            className="brand-logo"
            onClick={(e) => handleLinkClick(e, '/')}
            style={{ cursor: 'pointer', background: 'transparent', border: 'none', padding: 0, textDecoration: 'none' }}
            title="CodeTyper Home"
          >
            <div className="brand-icon">
              <Code2 size={20} />
            </div>
            <span>CodeTyper</span>
          </a>
        </div>

        <nav className="public-nav-links" aria-label="Main Navigation">
          <a
            id="header-nav-english"
            href="/practice"
            className={`public-nav-link ${currentPath === '/practice' || currentView === 'english' || currentView === 'practice' ? 'active' : ''}`}
            onClick={(e) => handleLinkClick(e, '/practice')}
            title="Interactive Typing Practice"
          >
            <span>Practice</span>
          </a>
          <a
            id="header-nav-coding"
            href="/coding-typing-test"
            className={`public-nav-link ${currentPath === '/coding-typing-test' || currentView === 'coding' ? 'active' : ''}`}
            onClick={(e) => handleLinkClick(e, '/coding-typing-test')}
            title="Coding Practice (25+ Languages)"
          >
            <span>Code Test</span>
          </a>
          <a
            id="header-nav-test"
            href="/typing-test"
            className={`public-nav-link ${currentPath === '/typing-test' || currentView === 'test' ? 'active' : ''}`}
            onClick={(e) => handleLinkClick(e, '/typing-test')}
            title="Speed Typing Test"
          >
            <span>Typing Test</span>
          </a>
          <a
            id="header-nav-calculator"
            href="/wpm-calculator"
            className={`public-nav-link ${currentPath === '/wpm-calculator' || currentView === 'wpm-calculator' ? 'active' : ''}`}
            onClick={(e) => handleLinkClick(e, '/wpm-calculator')}
            title="WPM & Accuracy Calculator"
          >
            <span>WPM Calculator</span>
          </a>
          <a
            id="header-nav-certificate"
            href="/certificate"
            className={`public-nav-link ${currentPath === '/certificate' || currentView === 'certificate' ? 'active' : ''}`}
            onClick={(e) => handleLinkClick(e, '/certificate')}
            title="Verified Typing Certificates"
          >
            <span>Certificates</span>
          </a>
          <a
            id="header-nav-about"
            href="/about"
            className={`public-nav-link ${currentPath === '/about' || currentView === 'about' ? 'active' : ''}`}
            onClick={(e) => handleLinkClick(e, '/about')}
          >
            <span>About</span>
          </a>
          <a
            id="header-nav-contact"
            href="/contact"
            className={`public-nav-link ${currentPath === '/contact' || currentView === 'contact' ? 'active' : ''}`}
            onClick={(e) => handleLinkClick(e, '/contact')}
          >
            <span>Contact</span>
          </a>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {/* Theme Toggle */}
          <button
            className="theme-toggle-btn"
            onClick={toggleTheme}
            title={settings?.theme === 'peaceful' || settings?.theme === 'light' ? 'Switch to Dark Theme' : 'Switch to Light Theme'}
            aria-label="Toggle Theme"
          >
            {settings?.theme === 'peaceful' || settings?.theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
          </button>

          {/* User Auth Buttons */}
          {user ? (
            <a
              href="/dashboard"
              className="btn btn-primary btn-sm"
              onClick={(e) => handleLinkClick(e, '/dashboard')}
              style={{ textDecoration: 'none' }}
            >
              <span>Dashboard</span>
              <ArrowRight size={14} />
            </a>
          ) : (
            <div className="header-auth-group">
              <a
                id="header-signin-btn"
                href="/login"
                className="btn btn-ghost btn-sm"
                onClick={(e) => handleLinkClick(e, '/login')}
                style={{ textDecoration: 'none' }}
              >
                Sign In
              </a>
              <a
                id="header-signup-btn"
                href="/signup"
                className="btn btn-primary btn-sm"
                onClick={(e) => handleLinkClick(e, '/signup')}
                style={{ textDecoration: 'none' }}
              >
                Get Started
              </a>
            </div>
          )}

        </div>
    </header>
  );
}
