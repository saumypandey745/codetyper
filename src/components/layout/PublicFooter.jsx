import React, { useState } from 'react';
import {
  Code2,
  Zap,
  Terminal,
  ShieldCheck,
  Award,
  Sparkles,
  Mail,
  Send,
  ArrowUp,
  Keyboard,
  CheckCircle2,
  Lock,
  Globe,
  Check,
  Cpu,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useToast } from '../../context/ToastContext.jsx';
import { api } from '../../utils/api.js';

export function PublicFooter({ onNavigate }) {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@') || !email.includes('.')) {
      toast?.error?.('Please enter a valid developer email address.');
      return;
    }
    setSubscribing(true);
    try {
      const res = await api.newsletter.subscribe({ email: email.trim() });
      setSubscribed(true);
      toast?.success?.(res.message || 'Subscribed! Check your inbox for your welcome dispatch.');
      setEmail('');
    } catch (err) {
      toast?.error?.(err.message || 'Subscription failed. Please try again.');
    } finally {
      setSubscribing(false);
    }
  };

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="public-footer" role="contentinfo" aria-label="CodeTyper Platform Footer">
      <div className="footer-container">

        {/* 1. TOP SECTION: Brand Identity & Developer Digest */}
        <div className="footer-top-strip">
          <div className="footer-brand-pane">
            <div className="footer-brand-title">
              <div className="footer-brand-logo-icon">
                <Code2 size={20} />
              </div>
              <span className="footer-brand-name">CodeTyper</span>
              <span className="footer-version-tag">
                <span className="version-dot" />
                v2.4 LTS
              </span>
            </div>

            <p className="footer-brand-desc">
              A peaceful, distraction-free typing platform designed for everyday prose and real-world programming workflows. Built with calm focus, sub-millisecond precision, and architectural intention.
            </p>

            <div className="footer-meta-badges">
              <div className="footer-status-badge" title="Live System Telemetry">
                <span className="pulse-dot" />
                <span>All Systems Operational (99.98% Uptime)</span>
              </div>
              <div className="footer-palette-hint" title="Press Ctrl+K anywhere to open Command Palette">
                <span className="hint-label">Quick Palette</span>
                <kbd className="footer-kbd">Ctrl</kbd>
                <span className="kbd-plus">+</span>
                <kbd className="footer-kbd">K</kbd>
              </div>
            </div>

            {/* Architectural Spec Chips (Clean & Minimalist) */}
            <div className="footer-spec-chips">
              <div className="footer-spec-chip" title="Direct native keydown listeners without Virtual DOM delays">
                <Zap size={13} className="spec-icon" />
                <span>&lt; 3ms Input Latency</span>
              </div>
              <div className="footer-spec-chip" title="Authentic syntax for Python, Rust, Go, TS, C++, and more">
                <Terminal size={13} className="spec-icon" />
                <span>25+ Real Languages</span>
              </div>
              <div className="footer-spec-chip" title="Drills compute entirely in browser RAM. Zero code leaves your device">
                <ShieldCheck size={13} className="spec-icon" />
                <span>Zero Telemetry</span>
              </div>
              <div className="footer-spec-chip" title="Cryptographically signed certificates with verification hashes">
                <Award size={13} className="spec-icon" />
                <span>Cryptographic Proof</span>
              </div>
            </div>
          </div>

          {/* Newsletter / Developer Digest Card */}
          <div className="footer-newsletter-card">
            <div className="footer-newsletter-glow" />
            <div className="footer-newsletter-header">
              <div className="newsletter-icon-wrap">
                <Sparkles size={16} />
              </div>
              <div className="newsletter-title-wrap">
                <div className="newsletter-title">Developer Digest</div>
                <div className="newsletter-subtitle">Stay in the Flow</div>
              </div>
            </div>

            <p className="footer-newsletter-text">
              Receive curated coding snippets in 25+ languages, typing ergonomics guides, and major engine changelogs. Zero spam, ever.
            </p>

            {subscribed ? (
              <div className="footer-newsletter-success">
                <CheckCircle2 size={16} />
                <span>Thank you for subscribing! Check your inbox for updates.</span>
              </div>
            ) : (
              <form className="footer-newsletter-form" onSubmit={handleSubscribe}>
                <div className="newsletter-input-wrap">
                  <Mail size={15} className="newsletter-input-icon" />
                  <input
                    type="email"
                    className="footer-newsletter-input"
                    placeholder="developer@codetyper.dev"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-label="Developer Email for Updates"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="footer-newsletter-btn"
                  disabled={subscribing}
                  title="Subscribe to Developer Digest"
                >
                  <span>{subscribing ? 'Joining...' : 'Subscribe'}</span>
                  <Send size={13} />
                </button>
              </form>
            )}

            <div className="footer-newsletter-guarantee">
              <Lock size={12} className="guarantee-icon" />
              <span>100% Client-Side Privacy. Your keystrokes and data are never sold or tracked.</span>
            </div>
          </div>
        </div>

        {/* 2. REFINED NAVIGATION GRID (5 Clean Columns) */}
        <div className="footer-nav-grid">
          {/* Column 1: Practice Modes */}
          <div className="footer-column">
            <div className="footer-column-heading">
              <Keyboard size={13} />
              <span>Practice Modes</span>
            </div>
            <div className="footer-links-list">
              <button className="footer-nav-item" onClick={() => onNavigate('coding')}>
                <span className="nav-label">Coding Snippets</span>
                <span className="footer-chip">25+ Langs</span>
              </button>
              <button className="footer-nav-item" onClick={() => onNavigate('english')}>
                <span className="nav-label">Literary Passages</span>
              </button>
              <button className="footer-nav-item" onClick={() => onNavigate('test')}>
                <span className="nav-label">Timed Speed Tests</span>
                <span className="footer-chip">15s–60s</span>
              </button>
              <button className="footer-nav-item" onClick={() => onNavigate('practice')}>
                <span className="nav-label">Custom Flow</span>
              </button>
              <button className="footer-nav-item" onClick={() => onNavigate('multiplayer')}>
                <span className="nav-label">Multiplayer Arena</span>
                <span className="footer-chip live">
                  <span className="chip-dot" />
                  Live
                </span>
              </button>
              <button className="footer-nav-item" onClick={() => onNavigate('heatmap')}>
                <span className="nav-label">Key Heatmap Drill</span>
              </button>
            </div>
          </div>

          {/* Column 2: Platform & Certification */}
          <div className="footer-column">
            <div className="footer-column-heading">
              <Award size={13} />
              <span>Platform</span>
            </div>
            <div className="footer-links-list">
              <button className="footer-nav-item highlight" onClick={() => onNavigate('certificate')}>
                <span className="nav-label">Official Certificates</span>
                <span className="footer-chip cert">Verified</span>
              </button>
              <button className="footer-nav-item" onClick={() => onNavigate('verify')}>
                <span className="nav-label">Verify Certificate</span>
              </button>
              <button className="footer-nav-item" onClick={() => onNavigate('dashboard')}>
                <span className="nav-label">Personal Dashboard</span>
              </button>
              <button className="footer-nav-item" onClick={() => onNavigate('statistics')}>
                <span className="nav-label">Analytics &amp; Trends</span>
              </button>
              <button className="footer-nav-item" onClick={() => onNavigate('history')}>
                <span className="nav-label">Session Logs</span>
              </button>
              <button className="footer-nav-item" onClick={() => onNavigate('settings')}>
                <span className="nav-label">Engine Preferences</span>
              </button>
            </div>
          </div>

          {/* Column 3: Developer Tools */}
          <div className="footer-column">
            <div className="footer-column-heading">
              <Terminal size={13} />
              <span>Developer Tools</span>
            </div>
            <div className="footer-links-list">
              <button className="footer-nav-item" onClick={() => onNavigate('leaderboard')}>
                <span className="nav-label">Global Leaderboards</span>
              </button>
              <button className="footer-nav-item" onClick={() => onNavigate('heatmap')}>
                <span className="nav-label">Keystroke Diagnostics</span>
              </button>
              <button className="footer-nav-item" onClick={() => onNavigate('settings')}>
                <span className="nav-label">Audio Synthesis &amp; FX</span>
              </button>
              <button className="footer-nav-item" onClick={() => onNavigate('practice')}>
                <span className="nav-label">Command Palette</span>
                <span className="footer-chip">Ctrl+K</span>
              </button>
              <button className="footer-nav-item" onClick={() => onNavigate('about')}>
                <span className="nav-label">Offline PWA Engine</span>
              </button>
              <button className="footer-nav-item" onClick={() => onNavigate('coding')}>
                <span className="nav-label">Syntax Highlighter</span>
              </button>
            </div>
          </div>

          {/* Column 4: Resources */}
          <div className="footer-column">
            <div className="footer-column-heading">
              <Globe size={13} />
              <span>Resources</span>
            </div>
            <div className="footer-links-list">
              <button className="footer-nav-item" onClick={() => onNavigate('about')}>
                <span className="nav-label">About the Mission</span>
              </button>
              <button className="footer-nav-item" onClick={() => onNavigate('contact')}>
                <span className="nav-label">Feedback &amp; Contact</span>
              </button>
              <button className="footer-nav-item" onClick={() => onNavigate('about')}>
                <span className="nav-label">Typing Ergonomics</span>
              </button>
              <button className="footer-nav-item" onClick={() => onNavigate('about')}>
                <span className="nav-label">Green &amp; Cream Harmony</span>
              </button>
              <button className="footer-nav-item" onClick={() => onNavigate('contact')}>
                <span className="nav-label">Bug Reports &amp; Requests</span>
              </button>
              <button className="footer-nav-item" onClick={() => onNavigate('landing')}>
                <span className="nav-label">Documentation &amp; FAQ</span>
              </button>
            </div>
          </div>

          {/* Column 5: Trust & Legal */}
          <div className="footer-column">
            <div className="footer-column-heading">
              <Lock size={13} />
              <span>Trust &amp; Legal</span>
            </div>
            <div className="footer-links-list">
              <button className="footer-nav-item" onClick={() => onNavigate('privacy')}>
                <span className="nav-label">Privacy Policy</span>
              </button>
              <button className="footer-nav-item" onClick={() => onNavigate('terms')}>
                <span className="nav-label">Terms of Service</span>
              </button>
              <button className="footer-nav-item" onClick={() => onNavigate('privacy')}>
                <span className="nav-label">Data Protection (GDPR)</span>
              </button>
              <button className="footer-nav-item" onClick={() => onNavigate('terms')}>
                <span className="nav-label">Certificate Integrity</span>
              </button>
              <button className="footer-nav-item" onClick={() => onNavigate('privacy')}>
                <span className="nav-label">Local Storage Model</span>
              </button>
              <button className="footer-nav-item" onClick={() => onNavigate('contact')}>
                <span className="nav-label">Responsible Disclosure</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3. SIGNATURE & BOTTOM STRIP */}
        <div className="footer-bottom-strip">
          {/* Left: Legal & Architecture */}
          <div className="footer-bottom-legal">
            <div className="footer-copyright-text">
              &copy; {new Date().getFullYear()} CodeTyper. Designed for clarity, speed, and endurance.
            </div>
          </div>

          {/* Center: Creator Showcase (Saumy Pandey) */}
          <div className="footer-creator-card" title="Architect & Lead Systems Engineer">
            <div className="footer-creator-avatar">
              <span>SP</span>
              <div className="footer-verified-badge" title="Verified Creator">
                <Check size={8} strokeWidth={3} />
              </div>
            </div>

            <div className="footer-creator-info">
              <div className="footer-creator-top">
                <span>Crafted for developers by</span>
                <strong className="footer-creator-name">Saumy Pandey</strong>
              </div>
              <div className="footer-creator-role">
                Founder &amp; Lead Platform Architect
              </div>
            </div>

            {/* Social Buttons */}
            <div className="footer-creator-actions">
              <a
                href="https://github.com/saumypandey745"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-btn"
                title="GitHub: saumypandey745"
                aria-label="GitHub Profile"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
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
                <Mail size={13} />
              </button>
            </div>
          </div>

          {/* Right: Back to Top */}
          <div className="footer-bottom-actions">
            <button
              id="footer-back-to-top"
              type="button"
              className="footer-back-to-top-btn"
              onClick={handleBackToTop}
              title="Smooth Scroll to Top of Page"
            >
              <span>Back to top</span>
              <ArrowUp size={13} className="back-to-top-icon" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
