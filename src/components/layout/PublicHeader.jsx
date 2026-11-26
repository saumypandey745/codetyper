import React, { useState } from 'react';
import { Code2, BookOpen, Timer, Award, Info, Mail, Sun, Moon, ArrowRight, Menu, X, Calculator } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSettings } from '../../context/SettingsContext.jsx';

export function PublicHeader({ onNavigate, currentView = 'landing', currentPath = '/' }) {
  const { user } = useAuth();
  const { settings, toggleTheme } = useSettings();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLinkClick = (e, path) => {
    if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
      e.preventDefault();
      setMobileMenuOpen(false);
      onNavigate(path);
    }
  };

  return (
    <>
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
            <BookOpen size={15} />
            <span>Practice</span>
          </a>
          <a
            id="header-nav-coding"
            href="/coding-typing-test"
            className={`public-nav-link ${currentPath === '/coding-typing-test' || currentView === 'coding' ? 'active' : ''}`}
            onClick={(e) => handleLinkClick(e, '/coding-typing-test')}
            title="Coding Practice (25+ Languages)"
          >
            <Code2 size={15} />
            <span>Code Test</span>
          </a>
          <a
            id="header-nav-test"
            href="/typing-test"
            className={`public-nav-link ${currentPath === '/typing-test' || currentView === 'test' ? 'active' : ''}`}
            onClick={(e) => handleLinkClick(e, '/typing-test')}
            title="Speed Typing Test"
          >
            <Timer size={15} />
            <span>Typing Test</span>
          </a>
          <a
            id="header-nav-calculator"
            href="/wpm-calculator"
            className={`public-nav-link ${currentPath === '/wpm-calculator' || currentView === 'wpm-calculator' ? 'active' : ''}`}
            onClick={(e) => handleLinkClick(e, '/wpm-calculator')}
            title="WPM & Accuracy Calculator"
          >
            <Calculator size={15} />
            <span>WPM Calculator</span>
          </a>
          <a
            id="header-nav-certificate"
            href="/certificate"
            className={`public-nav-link ${currentPath === '/certificate' || currentView === 'certificate' ? 'active' : ''}`}
            onClick={(e) => handleLinkClick(e, '/certificate')}
            title="Verified Typing Certificates"
          >
            <Award size={15} />
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
                href="/login"
                className="btn btn-ghost btn-sm"
                onClick={(e) => handleLinkClick(e, '/login')}
                style={{ textDecoration: 'none' }}
              >
                Sign In
              </a>
              <a
                href="/signup"
                className="btn btn-primary btn-sm"
                onClick={(e) => handleLinkClick(e, '/signup')}
                style={{ textDecoration: 'none' }}
              >
                Get Started
              </a>
            </div>
          )}

          {/* Mobile Menu Hamburger Toggle */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="mobile-drawer-overlay" onClick={() => setMobileMenuOpen(false)}>
          <div className="mobile-drawer-content" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-drawer-header">
              <div className="brand-logo">
                <div className="brand-icon">
                  <Code2 size={20} />
                </div>
                <span>CodeTyper</span>
              </div>
              <button className="mobile-close-btn" onClick={() => setMobileMenuOpen(false)} aria-label="Close Menu">
                <X size={20} />
              </button>
            </div>

            <nav className="mobile-nav-list" aria-label="Mobile Navigation">
              <a
                href="/practice"
                className={`mobile-nav-item ${currentPath === '/practice' ? 'active' : ''}`}
                onClick={(e) => handleLinkClick(e, '/practice')}
              >
                <BookOpen size={18} />
                <span>Practice Drills</span>
              </a>
              <a
                href="/coding-typing-test"
                className={`mobile-nav-item ${currentPath === '/coding-typing-test' ? 'active' : ''}`}
                onClick={(e) => handleLinkClick(e, '/coding-typing-test')}
              >
                <Code2 size={18} />
                <span>Coding Test (25+ Stacks)</span>
              </a>
              <a
                href="/typing-test"
                className={`mobile-nav-item ${currentPath === '/typing-test' ? 'active' : ''}`}
                onClick={(e) => handleLinkClick(e, '/typing-test')}
              >
                <Timer size={18} />
                <span>Speed Typing Test</span>
              </a>
              <a
                href="/wpm-calculator"
                className={`mobile-nav-item ${currentPath === '/wpm-calculator' ? 'active' : ''}`}
                onClick={(e) => handleLinkClick(e, '/wpm-calculator')}
              >
                <Calculator size={18} />
                <span>WPM Calculator</span>
              </a>
              <a
                href="/certificate"
                className={`mobile-nav-item ${currentPath === '/certificate' ? 'active' : ''}`}
                onClick={(e) => handleLinkClick(e, '/certificate')}
              >
                <Award size={18} />
                <span>Accredited Certificates</span>
              </a>
              <a
                href="/about"
                className={`mobile-nav-item ${currentPath === '/about' ? 'active' : ''}`}
                onClick={(e) => handleLinkClick(e, '/about')}
              >
                <Info size={18} />
                <span>About CodeTyper</span>
              </a>
              <a
                href="/contact"
                className={`mobile-nav-item ${currentPath === '/contact' ? 'active' : ''}`}
                onClick={(e) => handleLinkClick(e, '/contact')}
              >
                <Mail size={18} />
                <span>Contact &amp; Support</span>
              </a>
            </nav>

            <div className="mobile-drawer-footer">
              {user ? (
                <a
                  href="/dashboard"
                  className="btn btn-primary"
                  onClick={(e) => handleLinkClick(e, '/dashboard')}
                  style={{ width: '100%', justifyContent: 'center', textDecoration: 'none' }}
                >
                  <span>Dashboard</span>
                  <ArrowRight size={16} />
                </a>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
                  <a
                    href="/login"
                    className="btn btn-secondary"
                    onClick={(e) => handleLinkClick(e, '/login')}
                    style={{ width: '100%', justifyContent: 'center', textDecoration: 'none' }}
                  >
                    Sign In
                  </a>
                  <a
                    href="/signup"
                    className="btn btn-primary"
                    onClick={(e) => handleLinkClick(e, '/signup')}
                    style={{ width: '100%', justifyContent: 'center', textDecoration: 'none' }}
                  >
                    Create Free Account
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
