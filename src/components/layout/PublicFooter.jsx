import React, { useState } from 'react';
import {
  Code2,
  Heart,
  Zap,
  Terminal,
  ShieldCheck,
  Award,
  Sparkles,
  Mail,
  Send,
  ArrowUp,
  Activity,
  Keyboard,
  CheckCircle2,
  Lock,
  Globe,
  Flame,
  Check
} from 'lucide-react';
import { useToast } from '../../context/ToastContext.jsx';

export function PublicFooter({ onNavigate }) {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast?.error?.('Please enter a valid developer email address.');
      return;
    }
    setSubscribed(true);
    toast?.success?.('Subscribed! You will receive developer release notes and snippet packs.');
    setEmail('');
  };

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="public-footer" role="contentinfo" aria-label="CodeTyper Platform Footer">
      <div className="footer-container">

        {/* 1. TOP STRIP: Brand Identity & Developer Digest */}
        <div className="footer-top-strip">
          <div className="footer-brand-pane">
            <div className="footer-brand-title">
              <div className="brand-icon" style={{ boxShadow: 'var(--glow-primary)' }}>
                <Code2 size={22} />
              </div>
              <span className="footer-brand-name">CodeTyper</span>
              <span className="footer-version-tag">v2.4 LTS</span>
            </div>

            <p className="footer-brand-desc">
              A peaceful, distraction-free typing platform designed for everyday prose and real-world programming workflows. Built with calm focus, sub-millisecond precision, and architectural intention.
            </p>

            <div className="footer-telemetry-row">
              <div className="footer-status-pill" title="Live System Telemetry">
                <span className="pulse-dot" />
                <span>All Systems Operational (99.98% Uptime)</span>
              </div>
              <div className="footer-kbd-hint">
                <span>Quick Palette:</span>
                <kbd className="footer-kbd">Ctrl</kbd>
                <span>+</span>
                <kbd className="footer-kbd">K</kbd>
              </div>
            </div>
          </div>

          {/* Newsletter / Release Notes Card */}
          <div className="footer-newsletter-card">
            <div className="footer-newsletter-header">
              <Sparkles size={18} />
              <span>Stay in the Flow • Developer Digest</span>
            </div>
            <p className="footer-newsletter-text">
              Receive curated coding snippets in 25+ languages, typing ergonomics guides, and major engine changelogs. Zero spam, ever.
            </p>

            {subscribed ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary-forest)', fontWeight: 600, fontSize: '0.875rem', padding: '0.5rem 0' }}>
                <CheckCircle2 size={18} />
                <span>Thank you! You are subscribed to CodeTyper release updates.</span>
              </div>
            ) : (
              <form className="footer-newsletter-form" onSubmit={handleSubscribe}>
                <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
                  <Mail size={15} color="var(--color-text-muted)" style={{ position: 'absolute', left: '0.75rem', pointerEvents: 'none' }} />
                  <input
                    type="email"
                    className="footer-newsletter-input"
                    style={{ paddingLeft: '2.25rem' }}
                    placeholder="developer@codetyper.dev"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-label="Developer Email for Updates"
                    required
                  />
                </div>
                <button type="submit" className="footer-newsletter-btn" title="Subscribe to Updates">
                  <span>Subscribe</span>
                  <Send size={14} />
                </button>
              </form>
            )}

            <div className="footer-newsletter-guarantee">
              <ShieldCheck size={13} color="var(--color-primary-sage)" />
              <span>100% Client-Side Privacy. Your keystrokes and data are never sold or tracked.</span>
            </div>
          </div>
        </div>

        {/* 2. TRUST & ARCHITECTURE HIGHLIGHT CARDS */}
        <div className="footer-trust-grid">
          <div className="footer-trust-card">
            <div className="footer-trust-icon-box">
              <Zap size={18} />
            </div>
            <div>
              <div className="footer-trust-title">&lt; 3ms Input Latency</div>
              <p className="footer-trust-desc">Zero virtual DOM overhead with direct, native keydown event listeners.</p>
            </div>
          </div>

          <div className="footer-trust-card">
            <div className="footer-trust-icon-box">
              <Terminal size={18} />
            </div>
            <div>
              <div className="footer-trust-title">25+ Real Languages</div>
              <p className="footer-trust-desc">Authentic syntax: Python, Rust, Go, TypeScript, C++, Java, SQL, and more.</p>
            </div>
          </div>

          <div className="footer-trust-card">
            <div className="footer-trust-icon-box">
              <ShieldCheck size={18} />
            </div>
            <div>
              <div className="footer-trust-title">Zero Keystroke Telemetry</div>
              <p className="footer-trust-desc">Practice drills compute in browser RAM. Your source code never leaves your PC.</p>
            </div>
          </div>

          <div className="footer-trust-card">
            <div className="footer-trust-icon-box">
              <Award size={18} />
            </div>
            <div>
              <div className="footer-trust-title">Cryptographic Proof</div>
              <p className="footer-trust-desc">Tamper-evident certificates with public verification hashes for resumes.</p>
            </div>
          </div>
        </div>

        {/* 3. MULTI-COLUMN NAVIGATION (5 Columns with Rich Badges) */}
        <div className="footer-nav-grid">
          {/* Column 1: Practice Modes */}
          <div className="footer-column">
            <div className="footer-column-heading">
              <Keyboard size={14} />
              <span>Practice Modes</span>
            </div>
            <div className="footer-links-list">
              <button className="footer-nav-item" onClick={() => onNavigate('coding')}>
                <span>Coding Snippets</span>
                <span className="footer-badge-pill">25+ Langs</span>
              </button>
              <button className="footer-nav-item" onClick={() => onNavigate('english')}>
                <span>Literary Passages</span>
                <span className="footer-badge-pill">Prose</span>
              </button>
              <button className="footer-nav-item" onClick={() => onNavigate('test')}>
                <span>Timed Speed Tests</span>
                <span className="footer-badge-pill">15s-60s</span>
              </button>
              <button className="footer-nav-item" onClick={() => onNavigate('practice')}>
                <span>Custom Flow</span>
                <span className="footer-badge-pill">Zen Mode</span>
              </button>
              <button className="footer-nav-item" onClick={() => onNavigate('multiplayer')}>
                <span>Multiplayer Arena</span>
                <span className="footer-badge-pill live">Live 🟢</span>
              </button>
              <button className="footer-nav-item" onClick={() => onNavigate('heatmap')}>
                <span>Key Heatmap Drill</span>
                <span className="footer-badge-pill">Diagnostic</span>
              </button>
            </div>
          </div>

          {/* Column 2: Platform & Certification */}
          <div className="footer-column">
            <div className="footer-column-heading">
              <Award size={14} />
              <span>Platform</span>
            </div>
            <div className="footer-links-list">
              <button className="footer-nav-item" onClick={() => onNavigate('certificate')}>
                <span style={{ fontWeight: 600, color: 'var(--color-primary-forest)' }}>Official Certificates 🎓</span>
                <span className="footer-badge-pill gold">Verifiable</span>
              </button>
              <button className="footer-nav-item" onClick={() => onNavigate('verify')}>
                <span>Verify Certificate 🔍</span>
              </button>
              <button className="footer-nav-item" onClick={() => onNavigate('dashboard')}>
                <span>Personal Dashboard</span>
              </button>
              <button className="footer-nav-item" onClick={() => onNavigate('statistics')}>
                <span>Analytics &amp; Trends</span>
              </button>
              <button className="footer-nav-item" onClick={() => onNavigate('history')}>
                <span>Session Logs</span>
              </button>
              <button className="footer-nav-item" onClick={() => onNavigate('settings')}>
                <span>Engine Preferences</span>
              </button>
            </div>
          </div>

          {/* Column 3: Developer & Ergonomics */}
          <div className="footer-column">
            <div className="footer-column-heading">
              <Terminal size={14} />
              <span>Developer Tools</span>
            </div>
            <div className="footer-links-list">
              <button className="footer-nav-item" onClick={() => onNavigate('leaderboard')}>
                <span>Global Leaderboards 🏆</span>
              </button>
              <button className="footer-nav-item" onClick={() => onNavigate('heatmap')}>
                <span>Keystroke Diagnostics</span>
              </button>
              <button className="footer-nav-item" onClick={() => onNavigate('settings')}>
                <span>Audio Synthesis &amp; FX</span>
              </button>
              <button className="footer-nav-item" onClick={() => onNavigate('practice')}>
                <span>Command Palette</span>
                <span className="footer-badge-pill">Ctrl+K</span>
              </button>
              <button className="footer-nav-item" onClick={() => onNavigate('about')}>
                <span>Offline PWA Engine</span>
              </button>
              <button className="footer-nav-item" onClick={() => onNavigate('coding')}>
                <span>Syntax Highlighter</span>
              </button>
            </div>
          </div>

          {/* Column 4: Resources & Mission */}
          <div className="footer-column">
            <div className="footer-column-heading">
              <Globe size={14} />
              <span>Resources</span>
            </div>
            <div className="footer-links-list">
              <button className="footer-nav-item" onClick={() => onNavigate('about')}>
                <span>About the Mission</span>
              </button>
              <button className="footer-nav-item" onClick={() => onNavigate('contact')}>
                <span>Feedback &amp; Contact</span>
              </button>
              <button className="footer-nav-item" onClick={() => onNavigate('about')}>
                <span>Typing Ergonomics</span>
              </button>
              <button className="footer-nav-item" onClick={() => onNavigate('about')}>
                <span>Green &amp; Cream Harmony</span>
              </button>
              <button className="footer-nav-item" onClick={() => onNavigate('contact')}>
                <span>Bug Reports &amp; Requests</span>
              </button>
              <button className="footer-nav-item" onClick={() => onNavigate('landing')}>
                <span>Documentation &amp; FAQ</span>
              </button>
            </div>
          </div>

          {/* Column 5: Legal & Security */}
          <div className="footer-column">
            <div className="footer-column-heading">
              <Lock size={14} />
              <span>Trust &amp; Legal</span>
            </div>
            <div className="footer-links-list">
              <button className="footer-nav-item" onClick={() => onNavigate('privacy')}>
                <span>Privacy Policy</span>
              </button>
              <button className="footer-nav-item" onClick={() => onNavigate('terms')}>
                <span>Terms of Service</span>
              </button>
              <button className="footer-nav-item" onClick={() => onNavigate('privacy')}>
                <span>Data Protection (GDPR)</span>
              </button>
              <button className="footer-nav-item" onClick={() => onNavigate('terms')}>
                <span>Certificate Integrity</span>
              </button>
              <button className="footer-nav-item" onClick={() => onNavigate('privacy')}>
                <span>Local Storage Model</span>
              </button>
              <button className="footer-nav-item" onClick={() => onNavigate('contact')}>
                <span>Responsible Disclosure</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4. BOTTOM SIGNATURE & CREATOR SHOWCASE (Saumy Pandey) */}
        <div className="footer-bottom-strip">
          {/* Left: Copyright & Engineering Specs */}
          <div className="footer-bottom-legal">
            <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
              &copy; {new Date().getFullYear()} CodeTyper. Designed for clarity, speed, and endurance.
            </div>
            <div className="footer-tech-stack-row">
              <span>Architected with React 19</span>
              <span>•</span>
              <span>Vite Engine</span>
              <span>•</span>
              <span>Web Audio API</span>
              <span>•</span>
              <span>100% Local-First</span>
            </div>
          </div>

          {/* Center: Creator & Lead Architect Badge (Saumy Pandey) */}
          <div className="footer-creator-card" title="Architect & Lead Engineer">
            <div className="footer-creator-avatar">
              <span>SP</span>
              <div className="footer-verified-badge" title="Verified Creator">
                <Check size={9} strokeWidth={3} />
              </div>
            </div>

            <div className="footer-creator-info">
              <div className="footer-creator-top">
                <span>Crafted for developers with</span>
                <Heart size={13} fill="#e11d48" color="#e11d48" className="heart-pulse" />
                <span>by</span>
                <strong className="footer-creator-name">Saumy Pandey</strong>
              </div>
              <div className="footer-creator-role">
                Founder &amp; Lead Platform Architect
              </div>
            </div>

            {/* Interactive Social & Direct Connect Icons */}
            <div className="footer-creator-actions">
              <a
                href="https://github.com/saumypandey745"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-btn"
                title="GitHub: saumypandey745"
                aria-label="GitHub Profile"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                </svg>
              </a>

              <a
                href="https://www.linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-btn"
                title="LinkedIn Profile"
                aria-label="LinkedIn Profile"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>

              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-btn"
                title="X / Twitter"
                aria-label="X / Twitter Profile"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

              <button
                type="button"
                className="footer-social-btn"
                onClick={() => onNavigate('contact')}
                title="Direct Message / Contact Saumy Pandey"
                aria-label="Contact Saumy Pandey"
              >
                <Mail size={14} />
              </button>
            </div>
          </div>

          {/* Right: Back to Top & Build Status */}
          <div className="footer-bottom-actions">
            <button
              id="footer-back-to-top"
              type="button"
              className="footer-back-to-top-btn"
              onClick={handleBackToTop}
              title="Smooth Scroll to Top of Page"
            >
              <span>Back to top</span>
              <ArrowUp size={14} />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
