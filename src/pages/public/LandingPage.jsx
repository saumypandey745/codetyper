import React, { useState } from 'react';
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

export function LandingPage({ onNavigate, onStartPractice }) {
  const [demoFinished, setDemoFinished] = useState(false);

  const demoSnippet = `function calculateFocus(speed, precision) {
  const flowState = speed * (precision / 100);
  return flowState >= 70 ? "Mastery" : "Consistent Practice";
}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5rem', paddingBottom: '4rem' }}>
      {/* Hero Section */}
      <section style={{ maxWidth: '1100px', margin: '2rem auto 0', textAlign: 'center', padding: '0 1.5rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.95rem', backgroundColor: 'var(--color-primary-light)', borderRadius: 'var(--radius-full)', color: 'var(--color-primary-forest)', fontSize: '0.875rem', fontWeight: 600, marginBottom: '1.5rem' }}>
          <Sparkles size={16} />
          <span>Calm, Distraction-Free Typing for Modern Developers & Writers</span>
        </div>

        <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 800, marginBottom: '1.25rem', letterSpacing: '-0.025em', color: 'var(--color-text-primary)' }}>
          Type Better. Code Faster.<br />
          <span style={{ color: 'var(--color-primary-forest)' }}>Improve Every Day.</span>
        </h1>

        <p style={{ fontSize: '1.2rem', color: 'var(--color-text-secondary)', maxWidth: '680px', margin: '0 auto 2.5rem', lineHeight: 1.6 }}>
          Build your typing speed, accuracy, and confidence through focused practice designed for everyday writing and programming across 25+ languages.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '3.5rem' }}>
          <button className="btn btn-primary btn-lg" onClick={() => onNavigate('signup')}>
            <span>Start Typing Free</span>
            <ArrowRight size={18} />
          </button>
          <button className="btn btn-outline btn-lg" onClick={() => onNavigate('coding')}>
            <Code2 size={18} />
            <span>Explore Practice Modes</span>
          </button>
        </div>

        {/* Live Interactive Typing Preview in Hero */}
        <div style={{ textAlign: 'left', margin: '0 auto', maxWidth: '880px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', padding: '0 0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-primary-forest)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Terminal size={15} />
              Interactive Live Engine Demo (Try typing below)
            </span>
            <span className="badge badge-sage">JavaScript Demo</span>
          </div>

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
      </section>

      {/* Why Practice Section */}
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
              <div key={idx} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary-forest)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={20} />
                </div>
                <h3 style={{ fontSize: '1.15rem' }}>{item.title}</h3>
                <p style={{ fontSize: '0.925rem' }}>{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Practice Modes Section */}
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
              <div key={idx} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-soft)', color: 'var(--color-primary-forest)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                    <Icon size={20} />
                  </div>
                  <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>{mode.title}</h3>
                  <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>{mode.desc}</p>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={mode.action}>
                  <span>Explore Mode</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Supported Languages Grid */}
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
              className="btn btn-outline"
              style={{ padding: '0.55rem 1rem', fontSize: '0.9rem', borderRadius: 'var(--radius-md)' }}
              onClick={() => onStartPractice('code', lang)}
            >
              <Code2 size={15} color="var(--color-primary-forest)" />
              <span>{lang}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Statistics Preview Section */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.5rem', width: '100%' }}>
        <div className="card" style={{ padding: '3rem', backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem', alignItems: 'center' }}>
            <div>
              <span className="badge badge-forest" style={{ marginBottom: '0.75rem' }}>Analytics Engine</span>
              <h2 style={{ marginBottom: '1rem' }}>Deep Metrics, Zero Guesswork</h2>
              <p style={{ marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                Track your Gross WPM, Net WPM, accuracy, character distributions, error hotspots, and language comparisons over time.
              </p>
              <button className="btn btn-primary" onClick={() => onNavigate('signup')}>
                <span>Create Free Profile & Track Stats</span>
                <ArrowRight size={16} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="stat-card">
                <span className="stat-label">Average Speed</span>
                <div className="stat-value" style={{ color: 'var(--color-primary-forest)' }}>74.8</div>
                <span className="stat-subtext">Net WPM</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Accuracy Rate</span>
                <div className="stat-value">98.2%</div>
                <span className="stat-subtext">Last 30 sessions</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Practice Time</span>
                <div className="stat-value">6.4h</div>
                <span className="stat-subtext">Deliberate focus</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Current Streak</span>
                <div className="stat-value" style={{ color: 'var(--color-primary-forest)' }}>7 Days</div>
                <span className="stat-subtext">Daily habit</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center', padding: '3.5rem 1.5rem', backgroundColor: 'var(--color-primary-light)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-primary-soft)' }}>
        <h2 style={{ fontSize: '2.2rem', marginBottom: '1rem', color: 'var(--color-primary-deep)' }}>
          Start Your Typing Journey Today
        </h2>
        <p style={{ maxWidth: '520px', margin: '0 auto 2rem', color: 'var(--color-primary-forest)', fontSize: '1.05rem' }}>
          Cultivate smooth, ergonomic speed and eliminate typing frustration in code and prose.
        </p>
        <button className="btn btn-primary btn-lg" onClick={() => onNavigate('signup')}>
          <span>Create Free Account</span>
          <ArrowRight size={18} />
        </button>
      </section>
    </div>
  );
}
