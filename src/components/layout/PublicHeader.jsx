import React, { useState } from 'react';
import { Code2, BookOpen, Timer, Award, Info, Mail, Sun, Moon, ArrowRight, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSettings } from '../../context/SettingsContext.jsx';

export function PublicHeader({ onNavigate, currentView = 'landing' }) {
  const { user } = useAuth();
  const { settings, toggleTheme } = useSettings();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMobileNav = (view, action) => {
    setMobileMenuOpen(false);
    if (action) {
      action();
    } else {
      onNavigate(view);
    }
  };

  return (
    <>
      <header className="public-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <button
            id="brand-logo-btn"
            className="brand-logo"
            onClick={() => onNavigate('landing')}
            style={{ cursor: 'pointer', background: 'transparent', border: 'none', padding: 0 }}
            title="CodeTyper Home"
          >
            <div className="brand-icon">
              <Code2 size={20} />
            </div>
            <span>CodeTyper</span>
          </button>
        </div>

        <nav className="public-nav-links" aria-label="Main Navigation">
          <button
            id="header-nav-english"
            className={`public-nav-link ${currentView === 'english' || currentView === 'practice' ? 'active' : ''}`}
            onClick={() => onNavigate('english')}
            title="English Typing Practice"
          >
            <BookOpen size={15} />
            <span>English Typing</span>
          </button>
          <button
            id="header-nav-coding"
            className={`public-nav-link ${currentView === 'coding' ? 'active' : ''}`}
            onClick={() => onNavigate('coding')}
            title="Coding Practice (25+ Languages)"
          >
            <Code2 size={15} />
            <span>Coding Practice</span>
          </button>
          <button
            id="header-nav-test"
            className={`public-nav-link ${currentView === 'test' ? 'active' : ''}`}
            onClick={() => onNavigate('test')}
            title="Speed Typing Test"
          >
            <Timer size={15} />
            <span>Typing Test</span>
          </button>
          <button
            id="header-nav-certificate"
            className={`public-nav-link ${currentView === 'certificate' ? 'active' : ''}`}
            onClick={() => onNavigate('certificate')}
            title="Verified Typing Certificates"
          >
            <Award size={15} />
            <span>Certificates</span>
          </button>
          <button
            id="header-nav-about"
            className={`public-nav-link ${currentView === 'about' ? 'active' : ''}`}
            onClick={() => onNavigate('about')}
          >
            <span>About</span>
          </button>
          <button
            id="header-nav-contact"
            className={`public-nav-link ${currentView === 'contact' ? 'active' : ''}`}
            onClick={() => onNavigate('contact')}
          >
            <span>Contact</span>
          </button>
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
            <button className="btn btn-primary btn-sm" onClick={() => onNavigate('dashboard')}>
              <span>Dashboard</span>
              <ArrowRight size={14} />
            </button>
          ) : (
            <div className="header-auth-group">
              <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('login')}>
                Log In
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => onNavigate('signup')}>
                Start Free
              </button>
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            className="mobile-menu-toggle-btn"
            onClick={() => setMobileMenuOpen(prev => !prev)}
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="mobile-public-drawer">
          <button
            id="mobile-drawer-english"
            className={`mobile-drawer-link ${currentView === 'english' ? 'active' : ''}`}
            onClick={() => handleMobileNav('english')}
          >
            <BookOpen size={18} />
            <span>English Typing</span>
          </button>
          <button
            id="mobile-drawer-coding"
            className={`mobile-drawer-link ${currentView === 'coding' ? 'active' : ''}`}
            onClick={() => handleMobileNav('coding')}
          >
            <Code2 size={18} />
            <span>Coding Practice (25+ Languages)</span>
          </button>
          <button
            id="mobile-drawer-test"
            className={`mobile-drawer-link ${currentView === 'test' ? 'active' : ''}`}
            onClick={() => handleMobileNav('test')}
          >
            <Timer size={18} />
            <span>Speed Typing Test</span>
          </button>
          <button
            id="mobile-drawer-certificate"
            className={`mobile-drawer-link ${currentView === 'certificate' ? 'active' : ''}`}
            onClick={() => handleMobileNav('certificate')}
          >
            <Award size={18} />
            <span>Certificates</span>
          </button>
          <button
            id="mobile-drawer-about"
            className={`mobile-drawer-link ${currentView === 'about' ? 'active' : ''}`}
            onClick={() => handleMobileNav('about')}
          >
            <Info size={18} />
            <span>About CodeTyper</span>
          </button>
          <button
            id="mobile-drawer-contact"
            className={`mobile-drawer-link ${currentView === 'contact' ? 'active' : ''}`}
            onClick={() => handleMobileNav('contact')}
          >
            <Mail size={18} />
            <span>Contact & Support</span>
          </button>

          <div className="mobile-drawer-auth">
            {!user ? (
              <>
                <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => handleMobileNav('login')}>
                  Log In
                </button>
                <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => handleMobileNav('signup')}>
                  Start Typing Free
                </button>
              </>
            ) : (
              <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => handleMobileNav('dashboard')}>
                Go to Dashboard
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
