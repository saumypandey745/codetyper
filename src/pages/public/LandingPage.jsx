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
  Terminal
} from 'lucide-react';
import { programmingLanguages } from '../../../server/seedData.js';
import { TypingEngine } from '../../components/typing/TypingEngine.jsx';

const ROTATING_PHRASES = [
  "Improve Every Day.",
  "Code Without Friction.",
  "Master 25+ Tech Stacks.",
  "Reach 100+ WPM Flow."
];

export function LandingPage({ onNavigate, onStartPractice }) {
  const [demoFinished, setDemoFinished] = useState(false);
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

  const demoSnippet = `function calculateFocus(speed, precision) {
  const flowState = speed * (precision / 100);
  return flowState >= 70 ? "Mastery" : "Consistent Practice";
}`;

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
          <div className="hero-badge-shimmer">
            <span className="hero-badge-pulse-dot" />
            <Sparkles size={16} />
            <span>Peaceful, Distraction-Free Typing for Modern Developers & Writers</span>
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
            Build calm typing speed, pinpoint accuracy, and effortless muscle memory with a peaceful distraction-free flow designed for everyday prose and 25+ real-world programming languages.
          </p>

          {/* Premium CTA Buttons */}
          <div className="hero-cta-group">
            <button className="btn-premium-hero" onClick={() => onNavigate('signup')}>
              <span>Start Typing Free</span>
              <ArrowRight size={18} className="btn-icon-slide" />
            </button>
            <button className="btn-glass-hero" onClick={() => onNavigate('coding')}>
              <Code2 size={18} color="var(--color-primary-forest)" />
              <span>Explore Practice Modes</span>
            </button>
          </div>

          {/* Quick Tactile Badges Ribbon */}
          <div className="hero-pills-ribbon" aria-hidden="true">
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
            <div className="ribbon-pill">
              <CheckCircle2 size={14} color="var(--color-primary-forest)" />
              <span>Zero Distractions</span>
            </div>
          </div>

          {/* Live Interactive Typing Showcase Frame */}
          <div className="hero-showcase-wrapper">
            {/* Floating Live Metric Pills */}
            <div className="showcase-stat-pill showcase-stat-left" aria-hidden="true">
              <Zap size={14} color="var(--color-primary-forest)" />
              <span>114 WPM Flow State</span>
            </div>
            <div className="showcase-stat-pill showcase-stat-right" aria-hidden="true">
              <CheckCircle2 size={14} color="var(--color-primary-forest)" />
              <span>99.8% Precision Target</span>
            </div>

            {/* Studio Code Terminal Window */}
            <div className="hero-terminal-frame">
              <div className="hero-terminal-header">
                <div className="hero-terminal-dots" aria-hidden="true">
                  <span className="terminal-dot dot-red" />
                  <span className="terminal-dot dot-yellow" />
                  <span className="terminal-dot dot-green" />
                </div>
                <div className="hero-terminal-title">
                  <Terminal size={14} color="var(--color-primary-forest)" />
                  <span>interactive-flow-engine.js</span>
                </div>
                <div className="hero-terminal-badge">
                  <span className="hero-badge-pulse-dot" style={{ width: 6, height: 6 }} />
                  <span>Interactive Live Engine (Try typing below)</span>
                </div>
              </div>

              <div className="hero-terminal-body">
                <TypingEngine
                  targetText={demoSnippet}
                  title="Interactive Flow Engine"
                  language="JavaScript"
                  difficulty="beginner"
                  isCode={true}
                  mode="text"
                  duration={60}
                  onComplete={() => setDemoFinished(true)}
                />
              </div>
            </div>
          </div>
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
