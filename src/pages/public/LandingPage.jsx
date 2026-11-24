import React, { useState, useEffect } from 'react';
import {
  Code2,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Timer,
  BookOpen,
  Keyboard,
  Sliders,
  ShieldCheck,
  TrendingUp,
  Brain,
  Zap,
  Terminal,
  Award,
  ExternalLink
} from 'lucide-react';
import { programmingLanguages } from '../../../server/seedData.js';
import { HeroInteractiveEditor } from '../../components/landing/HeroInteractiveEditor.jsx';

const ROTATING_PHRASES = [
  "Earn Accredited Certificates.",
  "Improve Every Day.",
  "Code Without Friction.",
  "Master 25+ Tech Stacks.",
  "Reach 100+ WPM Flow."
];

export function LandingPage({ onNavigate, onStartPractice }) {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [currentText, setCurrentText] = useState(ROTATING_PHRASES[0]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(true);

  // Smooth typewriter cycle for the hero accent title
  useEffect(() => {
    // Only pause animation if user explicitly enabled reduced motion in app settings
    if (document.body.getAttribute('data-reduced-motion') === 'true') {
      setCurrentText(ROTATING_PHRASES[0]);
      return;
    }

    const currentPhrase = ROTATING_PHRASES[phraseIndex];

    if (isPaused) {
      const pauseTimeout = setTimeout(() => {
        setIsPaused(false);
        setIsDeleting(true);
      }, 2200);
      return () => clearTimeout(pauseTimeout);
    }

    const typingSpeed = isDeleting ? 28 : 55;

    const timer = setTimeout(() => {
      if (!isDeleting) {
        const nextLength = currentText.length + 1;
        setCurrentText(currentPhrase.slice(0, nextLength));
        if (nextLength === currentPhrase.length) {
          setIsPaused(true);
        }
      } else {
        const nextLength = currentText.length - 1;
        setCurrentText(currentPhrase.slice(0, nextLength));
        if (nextLength === 0) {
          setIsDeleting(false);
          setPhraseIndex((prev) => (prev + 1) % ROTATING_PHRASES.length);
        }
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [currentText, isDeleting, isPaused, phraseIndex]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5.5rem', paddingBottom: '4rem', position: 'relative' }}>
      {/* =========================================================================
          HERO SECTION WITH AMBIENT GLOW & FLOATING PARALLAX CHIPS
          ========================================================================= */}
      <section className="landing-hero-container">
        {/* Ambient Gradient Canvas (Compositor GPU accelerated) */}
        <div className="hero-ambient-canvas" aria-hidden="true">
          <div className="hero-orb hero-orb-primary" />
          <div className="hero-orb hero-orb-secondary" />
          <div className="hero-orb hero-orb-accent" />
          <div className="hero-dot-grid" />
        </div>

        {/* Center Hero Content */}
        <div className="hero-content">
          {/* Shimmer Badge with Live Pulse Indicator */}
          <div
            className="hero-badge-shimmer"
            onClick={() => onNavigate('certificate')}
            style={{ cursor: 'pointer' }}
            title="Explore Official Accredited Typing Certificates"
          >
            <span className="hero-badge-pulse-dot" />
            <Award size={16} color="#eab308" />
            <span>Earn Official Accredited Typing Certificates • 4 Collectible Luxury Tiers</span>
            <ArrowRight size={13} color="#eab308" />
          </div>

          {/* Master Heading: "Type Better. Code Faster. Improve Every Day." */}
          <h1 className="hero-title">
            <span className="hero-title-shimmer">Type Better. Code Faster.</span>
            <br />
            <span className="hero-title-accent">
              <span className="hero-typewriter-text">{currentText}</span>
              <span className="hero-cursor">|</span>
              <span className="hero-underline-glow" aria-hidden="true" />
            </span>
          </h1>

          <p className="hero-description">
            Build calm typing speed, pinpoint accuracy, and effortless muscle memory with a peaceful distraction-free flow designed for everyday prose and 25+ real-world programming languages. Complete milestones to unlock official diplomas signed personally by founder Saumy Pandey.
          </p>

          {/* Premium CTA Buttons */}
          <div className="hero-cta-group">
            <button className="btn-premium-hero" onClick={() => onNavigate('signup')}>
              <span>Start Typing Free</span>
              <ArrowRight size={18} className="btn-icon-slide" />
            </button>
            <button
              className="btn-glass-hero"
              onClick={() => onNavigate('certificate')}
              style={{
                borderColor: 'rgba(234, 179, 8, 0.4)',
                backgroundColor: 'rgba(234, 179, 8, 0.08)'
              }}
            >
              <Award size={18} color="#eab308" />
              <span style={{ color: '#facc15' }}>Official Certificates 🎓</span>
            </button>
            <button className="btn-glass-hero" onClick={() => onNavigate('coding')}>
              <Code2 size={18} color="var(--color-primary-forest)" />
              <span>Practice Coding</span>
            </button>
          </div>

          {/* Quick Tactile Badges Ribbon */}
          <div className="hero-pills-ribbon" aria-hidden="true">
            <div
              className="ribbon-pill"
              onClick={() => onNavigate('certificate')}
              style={{
                cursor: 'pointer',
                border: '1px solid rgba(234, 179, 8, 0.4)',
                background: 'rgba(234, 179, 8, 0.12)'
              }}
            >
              <Award size={14} color="#eab308" />
              <span style={{ color: '#facc15', fontWeight: 650 }}>Accredited Certificates 🎓</span>
            </div>
            <div className="ribbon-pill">
              <span className="chip-key">⌘ K</span>
              <span>Quick Jump</span>
            </div>
            <div className="ribbon-pill">
              <Zap size={14} color="var(--color-primary-forest)" />
              <span>100+ WPM Flow</span>
            </div>
            <div className="ribbon-pill">
              <Code2 size={14} color="var(--color-primary-forest)" />
              <span>25+ Real Stacks</span>
            </div>
          </div>

          {/* Master Interactive Coding Showcase */}
          <HeroInteractiveEditor
            onNavigate={onNavigate}
            onStartPractice={onStartPractice}
          />
        </div>
      </section>

      {/* =========================================================================
          WHY PRACTICE SECTION
          ========================================================================= */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.5rem', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span className="badge badge-sage" style={{ marginBottom: '0.75rem' }}>Core Benefits</span>
          <h2>Why Cultivate Mindful Typing?</h2>
          <p style={{ maxWidth: '580px', margin: '0.5rem auto 0' }}>
            Fast typing removes the cognitive friction between thinking of a solution and delivering clean code or prose.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {[
            {
              icon: Zap,
              title: 'Improve Typing Speed',
              desc: 'Move effortlessly past 70–90 WPM through rhythmic, relaxed muscle memory training.'
            },
            {
              icon: Brain,
              title: 'Increase Accuracy',
              desc: 'Drastically lower your error rate with soft feedback that gently reinforces correct finger placement.'
            },
            {
              icon: CheckCircle2,
              title: 'Reduce Typing Mistakes',
              desc: 'Eliminate frustrating backspacing loops on awkward brackets, quotes, braces, and symbols.'
            },
            {
              icon: Terminal,
              title: 'Improve Coding Productivity',
              desc: 'Practice realistic syntax, lambdas, indentation, and methods from 25+ real-world tech stacks.'
            },
            {
              icon: TrendingUp,
              title: 'Build Consistent Habits',
              desc: 'Spend 10 to 15 peaceful minutes daily to compound steady speed gains that last a lifetime.'
            },
            {
              icon: ShieldCheck,
              title: 'Zero Distraction Guarantee',
              desc: 'Clean green and cream aesthetics with zero ads, aggressive colors, or visual clutter.'
            }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="feature-card-classy">
                <div className="feature-icon-wrapper">
                  <Icon size={22} />
                </div>
                <h3 style={{ fontSize: '1.18rem', fontWeight: 650 }}>{item.title}</h3>
                <p style={{ fontSize: '0.93rem', lineHeight: 1.55 }}>{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          PRACTICE MODES SECTION
          ========================================================================= */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.5rem', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span className="badge badge-sage" style={{ marginBottom: '0.75rem' }}>Designed For All Needs</span>
          <h2>Four Comprehensive Practice Modes</h2>
          <p style={{ maxWidth: '540px', margin: '0.5rem auto 0' }}>
            Tailor your session according to your goals, available time, and skill level.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
          {[
            {
              title: 'English Typing',
              desc: '13 rich literary and technical themes: Science, Nature, Technology, Education, Productivity.',
              icon: BookOpen,
              action: () => onNavigate('english')
            },
            {
              title: 'Coding Practice',
              desc: '25+ languages preserving exact syntax, indentation, quotes, brackets, and real functions.',
              icon: Code2,
              action: () => onNavigate('coding')
            },
            {
              title: 'Timed Tests',
              desc: 'Rigorous 30s, 1m, 2m, 5m tests with countdowns, accurate Net WPM, and progress tracking.',
              icon: Timer,
              action: () => onNavigate('test')
            },
            {
              title: 'Custom Practice',
              desc: 'Configure words count (25, 50, 100, 250), custom durations, and custom difficulty.',
              icon: Sliders,
              action: () => onNavigate('practice')
            }
          ].map((mode, idx) => {
            const Icon = mode.icon;
            return (
              <div key={idx} className="mode-card-classy">
                <div>
                  <div className="feature-icon-wrapper" style={{ marginBottom: '1.15rem' }}>
                    <Icon size={20} />
                  </div>
                  <h3 style={{ fontSize: '1.18rem', marginBottom: '0.5rem', fontWeight: 650 }}>{mode.title}</h3>
                  <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.55 }}>{mode.desc}</p>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={mode.action} style={{ width: '100%', justifyContent: 'center' }}>
                  <span>Explore Mode</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          OFFICIAL ACCREDITED CERTIFICATES SHOWCASE (4 THEMES & TASKS)
          ========================================================================= */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.5rem', width: '100%' }}>
        <div
          className="card"
          style={{
            padding: '3.25rem 2.25rem',
            background: 'linear-gradient(135deg, rgba(10, 15, 29, 0.96) 0%, rgba(4, 7, 16, 0.98) 100%)',
            border: '1px solid rgba(234, 179, 8, 0.4)',
            borderRadius: 'var(--radius-xl)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.55)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Ambient Glow */}
          <div
            style={{
              position: 'absolute',
              top: '-15%',
              right: '-10%',
              width: '400px',
              height: '400px',
              background: 'radial-gradient(circle, rgba(234, 179, 8, 0.14) 0%, transparent 70%)',
              pointerEvents: 'none'
            }}
          />

          <div style={{ textAlign: 'center', marginBottom: '2.5rem', position: 'relative', zIndex: 1 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.35rem 0.95rem',
                borderRadius: '9999px',
                background: 'rgba(234, 179, 8, 0.15)',
                border: '1px solid rgba(234, 179, 8, 0.45)',
                color: '#facc15',
                fontSize: '0.85rem',
                fontWeight: 700,
                marginBottom: '1rem'
              }}
            >
              <Award size={16} />
              <span>Official Accredited Typing Credentials</span>
            </span>
            <h2 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
              Earn Official Certificates As You Type & Practice
            </h2>
            <p style={{ maxWidth: '640px', margin: '0 auto', color: '#94a3b8', fontSize: '1.05rem', lineHeight: 1.6 }}>
              Create a free account or log in, complete milestone challenges across typing drills, coding syntax, and multiplayer duels, and unlock 4 collectible luxury certificate tiers personally signed by Founder <strong>Saumy Pandey</strong>.
            </p>
          </div>

          {/* 4 Collectible Themes Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem', position: 'relative', zIndex: 1 }}>
            {[
              {
                tier: 'Tier 1 Milestone',
                name: 'Imperial Ivory Parchment',
                badge: '📜 Vintage Ivory',
                subtitle: 'Touch-Typing Apprentice',
                tasks: ['≥ 35 Net WPM', '≥ 90% Accuracy', '5 Completed Tests'],
                swatch: 'linear-gradient(135deg, #fef9c3 0%, #b45309 100%)',
                accent: '#b45309'
              },
              {
                tier: 'Tier 2 Milestone',
                name: 'Royal Obsidian & 24K Gold',
                badge: '👑 Royal Gold',
                subtitle: 'Professional Velocity',
                tasks: ['≥ 60 Net WPM', '≥ 95% Accuracy', '3-Day Practice Streak'],
                swatch: 'linear-gradient(135deg, #090e1c 0%, #ca8a04 100%)',
                accent: '#eab308'
              },
              {
                tier: 'Tier 3 Milestone',
                name: 'Emerald Sovereign & Gold',
                badge: '🌿 Grandmaster Emerald',
                subtitle: 'Syntax Polyglot & Code Master',
                tasks: ['≥ 75 Net WPM', '≥ 97% Accuracy', '3+ Coding Languages'],
                swatch: 'linear-gradient(135deg, #064e3b 0%, #10b981 100%)',
                accent: '#10b981'
              },
              {
                tier: 'Tier 4 Milestone',
                name: 'Midnight Titanium & Platinum',
                badge: '💎 Celestial Platinum',
                subtitle: 'Apex Legend & Arena Champion',
                tasks: ['≥ 90 Net WPM', '≥ 98% Accuracy', 'Arena Wins & 7-Day Streak'],
                swatch: 'linear-gradient(135deg, #1e293b 0%, #60a5fa 100%)',
                accent: '#60a5fa'
              }
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(15, 23, 42, 0.75)',
                  border: `1px solid ${item.accent}55`,
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.35rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: item.accent, textTransform: 'uppercase' }}>
                    {item.tier}
                  </span>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: item.swatch, border: '1px solid rgba(255, 255, 255, 0.4)' }} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>{item.badge}</h4>
                  <div style={{ fontSize: '0.8rem', color: item.accent, fontWeight: 600 }}>{item.subtitle}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.25rem' }}>
                  {item.tasks.map((task, tIdx) => (
                    <div key={tIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#cbd5e1' }}>
                      <CheckCircle2 size={13} color="#4ade80" />
                      <span>{task}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Certificate Credential Features Bar */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              padding: '1.25rem',
              background: 'rgba(5, 9, 20, 0.8)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              marginBottom: '2rem',
              position: 'relative',
              zIndex: 1
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <ShieldCheck size={20} color="#38bdf8" />
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>SHA-256 Ledger Verified</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Immutable tamper-proof record</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Award size={20} color="#eab308" />
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>Signed by Saumy Pandey</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>App Owner & Founder signature</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <ExternalLink size={20} color="#60a5fa" />
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>1-Click LinkedIn Add</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Add credential to profile</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Sparkles size={20} color="#facc15" />
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>Ultra HD 4K Canvas</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>2400x1600 rasterized PNG</div>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
            <button
              className="btn btn-primary btn-lg"
              onClick={() => onNavigate('signup')}
              style={{
                background: 'linear-gradient(135deg, #ca8a04 0%, #eab308 50%, #facc15 100%)',
                color: '#070b14',
                fontWeight: 750,
                border: 'none',
                boxShadow: '0 6px 20px rgba(234, 179, 8, 0.45)',
                padding: '0.85rem 1.85rem'
              }}
            >
              <span>Sign Up & Claim Your Certificate 🎓</span>
              <ArrowRight size={18} />
            </button>
            <button
              className="btn btn-outline btn-lg"
              onClick={() => onNavigate('certificate')}
              style={{
                borderColor: 'rgba(234, 179, 8, 0.45)',
                color: '#facc15',
                backgroundColor: 'rgba(234, 179, 8, 0.08)',
                padding: '0.85rem 1.85rem'
              }}
            >
              <Award size={18} />
              <span>Preview Official Certificates 📜</span>
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SUPPORTED LANGUAGES GRID
          ========================================================================= */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.5rem', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span className="badge badge-sage" style={{ marginBottom: '0.75rem' }}>Developer Stacks</span>
          <h2>25+ Supported Programming Languages</h2>
          <p style={{ maxWidth: '580px', margin: '0.5rem auto 0' }}>
            Sharpen typing speed for real-world syntax, operators, brackets, and structural conventions.
          </p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
          {programmingLanguages.map((lang) => (
            <button
              key={lang}
              className="lang-chip-btn"
              onClick={() => onStartPractice({ type: 'coding', language: lang })}
            >
              <Code2 size={15} color="var(--color-primary-forest)" />
              <span>{lang}</span>
            </button>
          ))}
        </div>
      </section>

      {/* =========================================================================
          STATISTICS PREVIEW SECTION
          ========================================================================= */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.5rem', width: '100%' }}>
        <div className="card" style={{ padding: '3rem', backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-md)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem', alignItems: 'center' }}>
            <div>
              <span className="badge badge-forest" style={{ marginBottom: '0.75rem' }}>Analytics Engine</span>
              <h2 style={{ marginBottom: '1rem' }}>Deep Metrics, Zero Guesswork</h2>
              <p style={{ marginBottom: '1.5rem', fontSize: '0.95rem', lineHeight: 1.6 }}>
                Track your Gross WPM, Net WPM, accuracy, character distributions, error hotspots, and language comparisons over time.
              </p>
              <button className="btn-premium-hero" onClick={() => onNavigate('signup')}>
                <span>Create Free Profile & Track Stats</span>
                <ArrowRight size={16} className="btn-icon-slide" />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="stat-card" style={{ padding: '1.5rem', background: 'var(--color-bg-soft)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                <span className="stat-label">Average Speed</span>
                <div className="stat-value" style={{ color: 'var(--color-primary-forest)', fontSize: '2rem', fontWeight: 800 }}>74.8</div>
                <span className="stat-subtext">Net WPM</span>
              </div>
              <div className="stat-card" style={{ padding: '1.5rem', background: 'var(--color-bg-soft)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                <span className="stat-label">Accuracy Rate</span>
                <div className="stat-value" style={{ fontSize: '2rem', fontWeight: 800 }}>98.2%</div>
                <span className="stat-subtext">Last 30 sessions</span>
              </div>
              <div className="stat-card" style={{ padding: '1.5rem', background: 'var(--color-bg-soft)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                <span className="stat-label">Practice Time</span>
                <div className="stat-value" style={{ fontSize: '2rem', fontWeight: 800 }}>6.4h</div>
                <span className="stat-subtext">Deliberate focus</span>
              </div>
              <div className="stat-card" style={{ padding: '1.5rem', background: 'var(--color-bg-soft)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                <span className="stat-label">Current Streak</span>
                <div className="stat-value" style={{ color: 'var(--color-primary-forest)', fontSize: '2rem', fontWeight: 800 }}>7 Days</div>
                <span className="stat-subtext">Daily habit</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FINAL CALL TO ACTION BANNER
          ========================================================================= */}
      <section className="final-cta-banner">
        <h2 style={{ fontSize: '2.4rem', marginBottom: '1rem', color: 'var(--color-primary-deep)', fontWeight: 800, letterSpacing: '-0.02em' }}>
          Start Your Typing Journey Today
        </h2>
        <p style={{ maxWidth: '540px', margin: '0 auto 2.2rem', color: 'var(--color-primary-forest)', fontSize: '1.1rem', lineHeight: 1.6 }}>
          Cultivate smooth, ergonomic speed and eliminate typing frustration across real code and prose.
        </p>
        <button className="btn-premium-hero" onClick={() => onNavigate('signup')}>
          <span>Create Free Account</span>
          <ArrowRight size={18} className="btn-icon-slide" />
        </button>
      </section>
    </div>
  );
}
