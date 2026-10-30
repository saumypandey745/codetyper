import React from 'react';
import { Code2, Heart } from 'lucide-react';

export function PublicFooter({ onNavigate }) {
  return (
    <footer className="public-footer">
      <div className="footer-grid">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div className="brand-icon">
              <Code2 size={20} />
            </div>
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.25rem' }}>
              CodeTyper
            </span>
          </div>
          <p style={{ maxWidth: '340px', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            A peaceful, distraction-free typing platform designed for everyday prose and real-world programming workflows.
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.825rem', color: 'var(--color-primary-forest)', fontWeight: 500 }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-primary-forest)' }} />
            <span>Built with calm focus and intention.</span>
          </div>
        </div>

        <div>
          <h4 style={{ marginBottom: '1rem', fontSize: '0.95rem' }}>Practice Modes</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
            <button className="public-nav-link" style={{ textAlign: 'left' }} onClick={() => onNavigate('coding')}>
              Coding Snippets (25+ Languages)
            </button>
            <button className="public-nav-link" style={{ textAlign: 'left' }} onClick={() => onNavigate('english')}>
              English Literary Passages
            </button>
            <button className="public-nav-link" style={{ textAlign: 'left' }} onClick={() => onNavigate('test')}>
              Timed Speed Tests
            </button>
            <button className="public-nav-link" style={{ textAlign: 'left' }} onClick={() => onNavigate('practice')}>
              Custom Flow
            </button>
          </div>
        </div>

        <div>
          <h4 style={{ marginBottom: '1rem', fontSize: '0.95rem' }}>Platform</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
            <button className="public-nav-link" style={{ textAlign: 'left' }} onClick={() => onNavigate('dashboard')}>
              Personal Dashboard
            </button>
            <button className="public-nav-link" style={{ textAlign: 'left' }} onClick={() => onNavigate('statistics')}>
              Analytics & Trends
            </button>
            <button className="public-nav-link" style={{ textAlign: 'left' }} onClick={() => onNavigate('history')}>
              Session Logs
            </button>
            <button className="public-nav-link" style={{ textAlign: 'left' }} onClick={() => onNavigate('settings')}>
              Engine Preferences
            </button>
          </div>
        </div>

        <div>
          <h4 style={{ marginBottom: '1rem', fontSize: '0.95rem' }}>Resources & Legal</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
            <button className="public-nav-link" style={{ textAlign: 'left' }} onClick={() => onNavigate('about')}>
              About the Mission
            </button>
            <button className="public-nav-link" style={{ textAlign: 'left' }} onClick={() => onNavigate('contact')}>
              Feedback & Contact
            </button>
            <button className="public-nav-link" style={{ textAlign: 'left' }} onClick={() => onNavigate('privacy')}>
              Privacy Policy
            </button>
            <button className="public-nav-link" style={{ textAlign: 'left' }} onClick={() => onNavigate('terms')}>
              Terms of Service
            </button>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div>
          &copy; {new Date().getFullYear()} CodeTyper. Designed for clarity, speed, and endurance.
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span>Crafted for developers with</span>
          <Heart size={14} fill="var(--color-primary-sage)" color="var(--color-primary-sage)" />
        </div>
      </div>
    </footer>
  );
}
