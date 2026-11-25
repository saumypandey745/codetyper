import React, { useState, useEffect } from 'react';
import {
  Code2,
  ArrowRight,
  Zap,
  Award,
  BookOpen,
  Flame,
  Trophy,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Terminal,
  Users,
  Sparkles,
  Activity,
  Star,
  Search,
  Check,
  X,
  ExternalLink,
  Laptop,
  Cpu,
  Layers,
  HelpCircle,
  TrendingUp,
  Compass,
  Copy,
  RotateCcw,
  Volume2
} from 'lucide-react';
import { HeroInteractiveEditor } from '../../components/landing/HeroInteractiveEditor.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSettings } from '../../context/SettingsContext.jsx';
import { soundEngine } from '../../utils/soundEngine.js';

const ROTATING_PHRASES = [
  "Earn Accredited Certificates.",
  "Improve Every Day.",
  "Code Without Friction.",
  "Master 25+ Tech Stacks.",
  "Reach 100+ WPM Flow."
];

// Interactive Tech Stacks list with code snippets
const TECH_STACKS = [
  {
    id: 'js',
    name: 'JavaScript',
    category: 'web',
    tag: 'ES2024',
    iconColor: '#F7DF1E',
    iconText: 'JS',
    code: `const debounce = (fn, delay = 250) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
};`
  },
  {
    id: 'ts',
    name: 'TypeScript',
    category: 'web',
    tag: 'v5.5 Strict',
    iconColor: '#3178C6',
    iconText: 'TS',
    code: `interface StreamPayload<T> {
  id: string;
  data: T;
  timestamp: number;
}
type ReadonlyRecord<K extends string, V> = Readonly<Record<K, V>>;`
  },
  {
    id: 'python',
    name: 'Python',
    category: 'data',
    tag: 'v3.12 Async',
    iconColor: '#38BDF8',
    iconText: 'PY',
    code: `async def fetch_metrics(service_id: str) -> dict[str, float]:
    async with aiohttp.ClientSession() as session:
        async with session.get(f"/api/v1/{service_id}/stats") as res:
            return await res.json()`
  },
  {
    id: 'rust',
    name: 'Rust',
    category: 'systems',
    tag: 'Rust 2024',
    iconColor: '#F97316',
    iconText: 'RS',
    code: `pub fn optimize_buffer<T: Send + Sync>(data: &mut Vec<T>) -> Result<usize, Error> {
    data.shrink_to_fit();
    Ok(data.capacity())
}`
  },
  {
    id: 'go',
    name: 'Go',
    category: 'backend',
    tag: 'Go 1.22',
    iconColor: '#00ADD8',
    iconText: 'GO',
    code: `func ProcessQueue(ctx context.Context, jobs <-chan Job) error {
    for job := range jobs {
        if err := job.Execute(ctx); err != nil {
            return fmt.Errorf("job %s failed: %w", job.ID, err)
        }
    }
    return nil
}`
  },
  {
    id: 'cpp',
    name: 'C++',
    category: 'systems',
    tag: 'C++20 STL',
    iconColor: '#00599C',
    iconText: 'C++',
    code: `template <typename T>
concept Numeric = std::is_arithmetic_v<T>;

template <Numeric T>
auto compute_mean(const std::span<const T>& values) -> double {
    return std::accumulate(values.begin(), values.end(), 0.0) / values.size();
}`
  },
  {
    id: 'java',
    name: 'Java',
    category: 'backend',
    tag: 'JDK 21 LTS',
    iconColor: '#ED8B00',
    iconText: 'JV',
    code: `public record OrderEvent(UUID orderId, BigDecimal amount, Instant timestamp) {
    public boolean isHighValue() {
        return amount.compareTo(BigDecimal.valueOf(1000)) > 0;
    }
}`
  },
  {
    id: 'sql',
    name: 'PostgreSQL',
    category: 'data',
    tag: 'SQL CTEs',
    iconColor: '#336791',
    iconText: 'SQL',
    code: `WITH ranked_typists AS (
    SELECT user_id, wpm, accuracy,
           DENSE_RANK() OVER (ORDER BY wpm DESC) AS global_rank
    FROM user_typing_sessions
    WHERE created_at >= NOW() - INTERVAL '30 days'
)
SELECT * FROM ranked_typists WHERE global_rank <= 10;`
  },
  {
    id: 'html',
    name: 'HTML & CSS',
    category: 'web',
    tag: 'Modern CSS',
    iconColor: '#E34F26',
    iconText: 'UI',
    code: `@container (min-width: 600px) {
  .responsive-card {
    display: grid;
    grid-template-columns: subgrid;
    backdrop-filter: blur(16px);
  }
}`
  },
  {
    id: 'bash',
    name: 'Bash Shell',
    category: 'scripting',
    tag: 'CLI Automation',
    iconColor: '#4EAA25',
    iconText: 'SH',
    code: `#!/usr/bin/env bash
set -euo pipefail
IFS=$'\\n\\t'

find ./src -type f -name "*.jsx" -print0 | xargs -0 -P 4 npx prettier --check`
  },
  {
    id: 'docker',
    name: 'Docker',
    category: 'backend',
    tag: 'Containers',
    iconColor: '#2496ED',
    iconText: 'DK',
    code: `FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
CMD ["node", "server/index.js"]`
  },
  {
    id: 'kotlin',
    name: 'Kotlin',
    category: 'backend',
    tag: 'Coroutines',
    iconColor: '#7F52FF',
    iconText: 'KT',
    code: `suspend fun CoroutineScope.streamTelemetry(channel: ReceiveChannel<Event>) {
    for (event in channel) {
        withContext(Dispatchers.IO) { logger.info("Handled event: \${event.id}") }
    }
}`
  }
];

const FAQS = [
  {
    q: "Is CodeTyper completely free to use?",
    a: "Yes! CodeTyper is 100% free with no paywalls or subscription fees. You can practice all 25+ language stacks, take speed tests, race in multiplayer arenas, and earn official founder-signed accredited certificates at zero cost."
  },
  {
    q: "How do the Accredited Certificates work and how can employers verify them?",
    a: "Every certificate issued on CodeTyper is cryptographically registered in our global verification ledger with a unique Ledger ID (e.g., CT-2026-CERT). Employers, recruiters, and colleagues can verify your credentials anytime at codetyper.com/#verify by entering your certificate ID or scanning the certificate's QR code."
  },
  {
    q: "How does coding typing practice differ from standard English typing?",
    a: "Normal typing tests focus primarily on regular English dictionary words. Coding typing tests your muscle memory for syntactic constructs you actually type at work: curly braces {}, brackets [], arrows =>, operators ===, camelCase variables, indentation, and punctuation. Mastering these eliminates stutter during coding and technical interviews."
  },
  {
    q: "Can I use CodeTyper without creating an account?",
    a: "Absolutely! You can immediately use the interactive editor on the home page, test your speed in English and code snippets, and experience the mechanical sound engine without logging in. Creating a free account lets you save history, unlock high-tier certificates, and track finger heatmaps."
  },
  {
    q: "What mechanical keyboard sound profiles are included?",
    a: "Our zero-latency audio engine synthesizes realistic acoustic profiles for Cherry MX Blue (tactile click), Cherry MX Brown (subtle bump), Cherry MX Red (smooth linear), Topre Electro-Capacitive, and playful bubble wrap. You can toggle audio or switch profiles on the fly with zero lag."
  },
  {
    q: "What are the 4 Accredited Certificate tiers?",
    a: "We offer 4 collectible luxury tiers: Bronze Certified (40+ WPM, 95% Acc), Silver Specialist (65+ WPM, 97% Acc), Gold Master (85+ WPM, 98% Acc), and Diamond Grandmaster (100+ WPM, 99% Acc). Each milestone diploma is individually rendered with an official wax seal and founder signature."
  }
];

export function LandingPage({ onNavigate, onStartPractice }) {
  const { user } = useAuth();
  const { settings } = useSettings();
  const isDark = settings?.theme === 'dark';

  // Typewriter state
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [currentText, setCurrentText] = useState(ROTATING_PHRASES[0]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(true);

  // Tech Stacks state
  const [stackFilter, setStackFilter] = useState('all');
  const [selectedStack, setSelectedStack] = useState(TECH_STACKS[0]);

  // Certificate Live Verifier state
  const [certInputId, setCertInputId] = useState('CT-2026-CERT');
  const [verifierStatus, setVerifierStatus] = useState(null);

  // FAQ open accordion state
  const [openFaq, setOpenFaq] = useState(0);

  // Practice Modes 3D Flip Card state
  const [flippedCardId, setFlippedCardId] = useState(null);

  // Stacks code snippet copy state
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  // Bento acoustic switch testing state
  const [activeSwitchTest, setActiveSwitchTest] = useState(null);

  const handleCopySnippet = () => {
    if (selectedStack?.code) {
      navigator.clipboard.writeText(selectedStack.code);
      setCopiedSnippet(true);
      setTimeout(() => setCopiedSnippet(false), 2000);
    }
  };

  const handleTestSwitch = (switchType, themeKey) => {
    setActiveSwitchTest(switchType);
    try {
      soundEngine.setPreferences(true, themeKey, 0.65);
      soundEngine.playKeypress();
    } catch (e) {
      // AudioContext fallback
    }
    setTimeout(() => {
      setActiveSwitchTest(null);
    }, 600);
  };

  // Smooth typewriter cycle for the hero accent title
  useEffect(() => {
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

  // Filter stacks
  const filteredStacks = TECH_STACKS.filter(s => {
    if (stackFilter === 'all') return true;
    if (stackFilter === 'web') return s.category === 'web';
    if (stackFilter === 'systems') return s.category === 'systems';
    if (stackFilter === 'backend') return s.category === 'backend';
    if (stackFilter === 'data') return s.category === 'data' || s.category === 'scripting';
    return true;
  });

  const handleVerifyDemo = (e) => {
    e.preventDefault();
    const clean = certInputId.trim();
    if (!clean) return;
    setVerifierStatus({
      loading: true
    });
    setTimeout(() => {
      try {
        soundEngine.playComplete();
      } catch (err) {}
      setVerifierStatus({
        loading: false,
        verified: true,
        id: clean.toUpperCase(),
        tier: 'Gold Master Distinction',
        recipient: 'Certified Developer',
        signatory: 'Saumy Pandey'
      });
    }, 450);
  };

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
          {/* Live Platform Telemetry Radar Pill */}
          <div className="landing-hero-radar-badge" aria-label="System Status">
            <span className="landing-radar-ping-dot" />
            <span className="landing-radar-text">ENGINE RUNNER v2.6 • LIVE</span>
            <span className="landing-radar-divider">•</span>
            <span className="landing-radar-stats">50,000+ Active Typists • Real-Time WebSockets 0.8ms</span>
          </div>

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
            <button
              className="btn-glass-hero"
              onClick={() => {
                if (!user) {
                  const el = document.getElementById('home-editor');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                } else {
                  onNavigate('coding');
                }
              }}
            >
              <Code2 size={18} color="var(--color-primary-forest)" />
              <span>{!user ? 'Try Home Editor ⚡' : 'Practice Coding'}</span>
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
          SECTION 1: LIVE DEVELOPER METRICS & SOCIAL PROOF STRIP
          ========================================================================= */}
      <section className="landing-section-wrap" style={{ paddingTop: '0', paddingBottom: '0' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <span className="sequence-badge">
            <Activity size={13} />
            <span>01 // LIVE TELEMETRY & NETWORK SPEED</span>
          </span>
        </div>
        <div className="landing-metrics-strip">
          <div className="metric-card">
            <div className="metric-icon-wrap">
              <Users size={20} />
            </div>
            <div className="metric-val">50,000+</div>
            <div className="metric-lbl">Active Developers</div>
          </div>

          <div className="metric-card">
            <div className="metric-icon-wrap">
              <Zap size={20} />
            </div>
            <div className="metric-val">48.2M+</div>
            <div className="metric-lbl">Keystrokes Typed</div>
          </div>

          <div className="metric-card">
            <div className="metric-icon-wrap">
              <Code2 size={20} />
            </div>
            <div className="metric-val">25+</div>
            <div className="metric-lbl">Language Stacks</div>
          </div>

          <div className="metric-card">
            <div className="metric-icon-wrap">
              <Activity size={20} />
            </div>
            <div className="metric-val">99.4%</div>
            <div className="metric-lbl">Average Precision</div>
          </div>

          <div className="metric-card">
            <div className="metric-icon-wrap" style={{ color: '#eab308' }}>
              <Award size={20} />
            </div>
            <div className="metric-val">8,500+</div>
            <div className="metric-lbl">Diplomas Issued</div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: FLAGSHIP PRACTICE MODES GRID ("Choose Your Flow")
          ========================================================================= */}
      <section className="landing-section-wrap">
        <div className="landing-section-header" style={{ marginBottom: '1.75rem' }}>
          <span className="sequence-badge">
            <Sparkles size={12} />
            <span>02 // FLAGSHIP PRACTICE MODES</span>
          </span>
          <h2 className="landing-section-title">Engineered For Every Typing Workflow</h2>
          <p className="landing-section-desc">
            Interviews, endurance, or live multiplayer battles. Click <strong>Specs ↻</strong> on any card to inspect full parameters.
          </p>
        </div>

        <div className="landing-modes-grid">
          {/* Card 1: Real-World Code */}
          <div className={`landing-3d-card-wrap ${flippedCardId === 'mode-1' ? 'flipped' : ''}`}>
            <div className="landing-3d-card-inner">
              {/* FRONT */}
              <div
                className="landing-3d-card-face"
                onClick={() => onNavigate('coding')}
                style={{ cursor: 'pointer' }}
              >
                <div>
                  <div className="mode-card-header">
                    <div className="mode-icon-box" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#16a34a' }}>
                      <Code2 size={18} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span className="mode-badge-pill" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#16a34a' }}>
                        Most Popular
                      </span>
                      <button
                        type="button"
                        className="flip-trigger-btn"
                        onClick={(e) => { e.stopPropagation(); setFlippedCardId('mode-1'); }}
                        title="View Syllabus & Specs"
                      >
                        <RotateCcw size={11} />
                        <span>Specs ↻</span>
                      </button>
                    </div>
                  </div>
                  <h3 className="mode-card-title">Real-World Code Engine</h3>
                  <p className="mode-card-desc">
                    Production code typing with syntax, indentation, and tricky symbols across 25+ language stacks.
                  </p>
                  <div className="mode-card-tags">
                    <span className="mode-tag">JavaScript</span>
                    <span className="mode-tag">Python</span>
                    <span className="mode-tag">Rust</span>
                    <span className="mode-tag">Go</span>
                  </div>
                </div>
                <div
                  className="mode-action-link"
                  onClick={(e) => { e.stopPropagation(); onNavigate('coding'); }}
                >
                  <span>Practice Code Now</span>
                  <ArrowRight size={14} />
                </div>
              </div>

              {/* BACK */}
              <div className="landing-3d-card-face landing-3d-card-back">
                <div>
                  <div className="flip-header-bar">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 750, fontSize: '0.86rem', color: '#16a34a' }}>
                      <Code2 size={15} />
                      <span>Code Syllabus & Specs</span>
                    </div>
                    <button
                      type="button"
                      className="flip-trigger-btn"
                      onClick={(e) => { e.stopPropagation(); setFlippedCardId(null); }}
                    >
                      <RotateCcw size={11} />
                      <span>Back ↺</span>
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', margin: '0.35rem 0 0.75rem' }}>
                    <div className="flip-spec-row">
                      <span className="flip-spec-label">Target Audience</span>
                      <span className="flip-spec-val">Developers & Engineers</span>
                    </div>
                    <div className="flip-spec-row">
                      <span className="flip-spec-label">Stack Coverage</span>
                      <span className="flip-spec-val">25+ Real Production Stacks</span>
                    </div>
                    <div className="flip-spec-row">
                      <span className="flip-spec-label">Symbol Drills</span>
                      <span className="flip-spec-val">Brackets, Arrow ops, Semicolons</span>
                    </div>
                    <div className="flip-spec-row">
                      <span className="flip-spec-label">Sprint Options</span>
                      <span className="flip-spec-val">15s, 30s, 60s, Custom</span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%', justifyContent: 'center', padding: '0.48rem 0.85rem', fontSize: '0.80rem', marginTop: 'auto' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate('coding');
                  }}
                >
                  <span>Launch Code Drill ⚡</span>
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: English Literature & Prose */}
          <div className={`landing-3d-card-wrap ${flippedCardId === 'mode-2' ? 'flipped' : ''}`}>
            <div className="landing-3d-card-inner">
              {/* FRONT */}
              <div
                className="landing-3d-card-face"
                onClick={() => onNavigate('english')}
                style={{ cursor: 'pointer' }}
              >
                <div>
                  <div className="mode-card-header">
                    <div className="mode-icon-box" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#0284c7' }}>
                      <BookOpen size={18} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span className="mode-badge-pill" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#0284c7' }}>
                        Zen Flow
                      </span>
                      <button
                        type="button"
                        className="flip-trigger-btn"
                        onClick={(e) => { e.stopPropagation(); setFlippedCardId('mode-2'); }}
                        title="View Syllabus & Specs"
                      >
                        <RotateCcw size={11} />
                        <span>Specs ↻</span>
                      </button>
                    </div>
                  </div>
                  <h3 className="mode-card-title">English Literature & Prose</h3>
                  <p className="mode-card-desc">
                    Distraction-free classic literature and essays to calibrate typing rhythm and deep endurance.
                  </p>
                  <div className="mode-card-tags">
                    <span className="mode-tag">Essays</span>
                    <span className="mode-tag">Philosophy</span>
                    <span className="mode-tag">Rhythm</span>
                  </div>
                </div>
                <div
                  className="mode-action-link"
                  style={{ color: '#0284c7' }}
                  onClick={(e) => { e.stopPropagation(); onNavigate('english'); }}
                >
                  <span>Read & Type Passages</span>
                  <ArrowRight size={14} />
                </div>
              </div>

              {/* BACK */}
              <div className="landing-3d-card-face landing-3d-card-back">
                <div>
                  <div className="flip-header-bar">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 750, fontSize: '0.86rem', color: '#0284c7' }}>
                      <BookOpen size={15} />
                      <span>Prose Syllabus & Specs</span>
                    </div>
                    <button
                      type="button"
                      className="flip-trigger-btn"
                      onClick={(e) => { e.stopPropagation(); setFlippedCardId(null); }}
                    >
                      <RotateCcw size={11} />
                      <span>Back ↺</span>
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', margin: '0.35rem 0 0.75rem' }}>
                    <div className="flip-spec-row">
                      <span className="flip-spec-label">Target Audience</span>
                      <span className="flip-spec-val">Writers & Speed Typists</span>
                    </div>
                    <div className="flip-spec-row">
                      <span className="flip-spec-label">Passage Archive</span>
                      <span className="flip-spec-val">1,200+ Curated Chapters</span>
                    </div>
                    <div className="flip-spec-row">
                      <span className="flip-spec-label">Cadence Mode</span>
                      <span className="flip-spec-val">Zero Punctuation Friction</span>
                    </div>
                    <div className="flip-spec-row">
                      <span className="flip-spec-label">Endurance Target</span>
                      <span className="flip-spec-val">100+ WPM Unbroken Stream</span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%', justifyContent: 'center', padding: '0.48rem 0.85rem', fontSize: '0.80rem', background: '#0284c7', borderColor: '#0284c7', marginTop: 'auto' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate('english');
                  }}
                >
                  <span>Enter Zen Prose Chamber ⚡</span>
                </button>
              </div>
            </div>
          </div>

          {/* Card 3: Multiplayer Live Arenas */}
          <div className={`landing-3d-card-wrap ${flippedCardId === 'mode-3' ? 'flipped' : ''}`}>
            <div className="landing-3d-card-inner">
              {/* FRONT */}
              <div
                className="landing-3d-card-face"
                onClick={() => onNavigate('multiplayer')}
                style={{ cursor: 'pointer' }}
              >
                <div>
                  <div className="mode-card-header">
                    <div className="mode-icon-box" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#9333ea' }}>
                      <Flame size={18} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span className="mode-badge-pill" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#9333ea' }}>
                        Competitive
                      </span>
                      <button
                        type="button"
                        className="flip-trigger-btn"
                        onClick={(e) => { e.stopPropagation(); setFlippedCardId('mode-3'); }}
                        title="View Arena Specs"
                      >
                        <RotateCcw size={11} />
                        <span>Specs ↻</span>
                      </button>
                    </div>
                  </div>
                  <h3 className="mode-card-title">Live Multiplayer Arenas</h3>
                  <p className="mode-card-desc">
                    Head-to-head real-time battles worldwide with live speedometers and MMR rank progression.
                  </p>
                  <div className="mode-card-tags">
                    <span className="mode-tag">Real-Time</span>
                    <span className="mode-tag">Leaderboards</span>
                    <span className="mode-tag">Speedometer</span>
                  </div>
                </div>
                <div
                  className="mode-action-link"
                  style={{ color: '#9333ea' }}
                  onClick={(e) => { e.stopPropagation(); onNavigate('multiplayer'); }}
                >
                  <span>Enter Race Arena</span>
                  <ArrowRight size={14} />
                </div>
              </div>

              {/* BACK */}
              <div className="landing-3d-card-face landing-3d-card-back">
                <div>
                  <div className="flip-header-bar">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 750, fontSize: '0.86rem', color: '#9333ea' }}>
                      <Flame size={15} />
                      <span>Arena Architecture & Specs</span>
                    </div>
                    <button
                      type="button"
                      className="flip-trigger-btn"
                      onClick={(e) => { e.stopPropagation(); setFlippedCardId(null); }}
                    >
                      <RotateCcw size={11} />
                      <span>Back ↺</span>
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', margin: '0.35rem 0 0.75rem' }}>
                    <div className="flip-spec-row">
                      <span className="flip-spec-label">Protocol</span>
                      <span className="flip-spec-val">Ultra Low-Latency WebSockets</span>
                    </div>
                    <div className="flip-spec-row">
                      <span className="flip-spec-label">Matchmaking</span>
                      <span className="flip-spec-val">Global Elo Skill Rating</span>
                    </div>
                    <div className="flip-spec-row">
                      <span className="flip-spec-label">Spectators</span>
                      <span className="flip-spec-val">Live Opponent Ghost Cars</span>
                    </div>
                    <div className="flip-spec-row">
                      <span className="flip-spec-label">Lobby Modes</span>
                      <span className="flip-spec-val">Public QuickMatch & Private Rooms</span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%', justifyContent: 'center', padding: '0.48rem 0.85rem', fontSize: '0.80rem', background: '#9333ea', borderColor: '#9333ea', marginTop: 'auto' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate('multiplayer');
                  }}
                >
                  <span>Launch 1v1 Race Arena ⚡</span>
                </button>
              </div>
            </div>
          </div>

          {/* Card 4: Official Accredited Certificates */}
          <div className={`landing-3d-card-wrap ${flippedCardId === 'mode-4' ? 'flipped' : ''}`}>
            <div className="landing-3d-card-inner">
              {/* FRONT */}
              <div
                className="landing-3d-card-face"
                style={{
                  borderColor: 'rgba(234, 179, 8, 0.45)',
                  background: isDark
                    ? 'linear-gradient(135deg, rgba(234, 179, 8, 0.08) 0%, rgba(17, 26, 21, 0.95) 100%)'
                    : 'linear-gradient(135deg, #fffdf2 0%, #ffffff 100%)',
                  cursor: 'pointer'
                }}
                onClick={() => onNavigate('certificate')}
              >
                <div>
                  <div className="mode-card-header">
                    <div className="mode-icon-box" style={{ background: 'rgba(234, 179, 8, 0.2)', color: '#ca8a04' }}>
                      <Award size={18} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span className="mode-badge-pill" style={{ background: 'rgba(234, 179, 8, 0.2)', color: '#ca8a04' }}>
                        Official
                      </span>
                      <button
                        type="button"
                        className="flip-trigger-btn"
                        onClick={(e) => { e.stopPropagation(); setFlippedCardId('mode-4'); }}
                        title="View Certificate Specs"
                      >
                        <RotateCcw size={11} />
                        <span>Specs ↻</span>
                      </button>
                    </div>
                  </div>
                  <h3 className="mode-card-title">Accredited Diplomas 🎓</h3>
                  <p className="mode-card-desc">
                    4 collectible luxury tiers signed by founder Saumy Pandey. Cryptographically verifiable.
                  </p>
                  <div className="mode-card-tags">
                    <span className="mode-tag" style={{ color: isDark ? '#facc15' : '#854d0e', background: 'rgba(234, 179, 8, 0.15)', borderColor: 'rgba(234, 179, 8, 0.3)' }}>Bronze</span>
                    <span className="mode-tag" style={{ color: isDark ? '#facc15' : '#854d0e', background: 'rgba(234, 179, 8, 0.15)', borderColor: 'rgba(234, 179, 8, 0.3)' }}>Silver</span>
                    <span className="mode-tag" style={{ color: isDark ? '#facc15' : '#854d0e', background: 'rgba(234, 179, 8, 0.15)', borderColor: 'rgba(234, 179, 8, 0.3)' }}>Gold</span>
                    <span className="mode-tag" style={{ color: isDark ? '#facc15' : '#854d0e', background: 'rgba(234, 179, 8, 0.15)', borderColor: 'rgba(234, 179, 8, 0.3)' }}>Diamond</span>
                  </div>
                </div>
                <div
                  className="mode-action-link"
                  style={{ color: '#ca8a04' }}
                  onClick={(e) => { e.stopPropagation(); onNavigate('certificate'); }}
                >
                  <span>Explore Certificate Registry</span>
                  <ArrowRight size={14} />
                </div>
              </div>

              {/* BACK */}
              <div className="landing-3d-card-face landing-3d-card-back" style={{ borderColor: 'rgba(234, 179, 8, 0.45)' }}>
                <div>
                  <div className="flip-header-bar">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 750, fontSize: '0.86rem', color: isDark ? '#facc15' : '#ca8a04' }}>
                      <Award size={15} />
                      <span>Accreditation Framework</span>
                    </div>
                    <button
                      type="button"
                      className="flip-trigger-btn"
                      onClick={(e) => { e.stopPropagation(); setFlippedCardId(null); }}
                    >
                      <RotateCcw size={11} />
                      <span>Back ↺</span>
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', margin: '0.35rem 0 0.75rem' }}>
                    <div className="flip-spec-row">
                      <span className="flip-spec-label">Issuing Authority</span>
                      <span className="flip-spec-val">CodeTyper Global Registry</span>
                    </div>
                    <div className="flip-spec-row">
                      <span className="flip-spec-label">Authorized Signatory</span>
                      <span className="flip-spec-val">Founder Saumy Pandey</span>
                    </div>
                    <div className="flip-spec-row">
                      <span className="flip-spec-label">Verification Hash</span>
                      <span className="flip-spec-val">SHA-256 Ledger Record</span>
                    </div>
                    <div className="flip-spec-row">
                      <span className="flip-spec-label">Accredited Tiers</span>
                      <span className="flip-spec-val">Bronze, Silver, Gold, Diamond</span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%', justifyContent: 'center', padding: '0.48rem 0.85rem', fontSize: '0.80rem', background: '#ca8a04', borderColor: '#ca8a04', marginTop: 'auto' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate('certificate');
                  }}
                >
                  <span>Claim Official Certificate 🎓</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: INTERACTIVE 25+ TECH STACKS EXPLORER
          ========================================================================= */}
      <section className="landing-section-wrap">
        <div className="landing-section-header">
          <span className="sequence-badge">
            <Terminal size={13} />
            <span>03 // 25+ PRODUCTION TECH STACKS</span>
          </span>
          <br />
          <span className="landing-pill-tag">
            <Terminal size={14} />
            <span>Interactive Code Explorer</span>
          </span>
          <h2 className="landing-section-title">Practice What You Actually Build With</h2>
          <p className="landing-section-desc">
            Select your preferred programming language or framework below to preview authentic syntax snippets and start practicing immediately.
          </p>
        </div>

        {/* Category Filters */}
        <div className="stacks-filter-bar">
          <button
            className={`stacks-filter-btn ${stackFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStackFilter('all')}
          >
            All Tech Stacks
          </button>
          <button
            className={`stacks-filter-btn ${stackFilter === 'web' ? 'active' : ''}`}
            onClick={() => setStackFilter('web')}
          >
            Web & Frontend
          </button>
          <button
            className={`stacks-filter-btn ${stackFilter === 'systems' ? 'active' : ''}`}
            onClick={() => setStackFilter('systems')}
          >
            Systems (Rust / C++)
          </button>
          <button
            className={`stacks-filter-btn ${stackFilter === 'backend' ? 'active' : ''}`}
            onClick={() => setStackFilter('backend')}
          >
            Backend & Cloud (Go / Java / Docker)
          </button>
          <button
            className={`stacks-filter-btn ${stackFilter === 'data' ? 'active' : ''}`}
            onClick={() => setStackFilter('data')}
          >
            Data & Automation (Python / SQL / Bash)
          </button>
        </div>

        {/* Dual Layout: Left Chips, Right Code Window */}
        <div className="stacks-grid-layout">
          {/* Language Selectors */}
          <div className="stacks-chips-container">
            {filteredStacks.map((stack) => (
              <button
                key={stack.id}
                className={`stack-card-btn ${selectedStack.id === stack.id ? 'selected' : ''}`}
                onClick={() => setSelectedStack(stack)}
              >
                <div
                  className="stack-icon-pill"
                  style={{
                    backgroundColor: `${stack.iconColor}22`,
                    color: stack.iconColor,
                    border: `1px solid ${stack.iconColor}44`
                  }}
                >
                  {stack.iconText}
                </div>
                <div>
                  <div className="stack-name-bold">{stack.name}</div>
                  <div className="stack-tag-small">{stack.tag}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Code Preview & Live Test Window */}
          <div className="stacks-preview-window">
            <div className="stacks-window-topbar">
              <div className="window-dots">
                <span className="window-dot dot-red" />
                <span className="window-dot dot-yellow" />
                <span className="window-dot dot-green" />
              </div>
              <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
                snippet_{selectedStack.id}.{selectedStack.id === 'python' ? 'py' : selectedStack.id === 'rust' ? 'rs' : selectedStack.id === 'go' ? 'go' : 'js'}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.5rem',
                    borderRadius: '4px',
                    backgroundColor: `${selectedStack.iconColor}22`,
                    color: selectedStack.iconColor
                  }}
                >
                  {selectedStack.name}
                </span>
                <button
                  type="button"
                  className={`copy-code-btn ${copiedSnippet ? 'copied' : ''}`}
                  onClick={handleCopySnippet}
                  title="Copy Code Snippet"
                >
                  {copiedSnippet ? <Check size={13} color="#22c55e" /> : <Copy size={13} />}
                  <span>{copiedSnippet ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Code Lines with Line Numbers */}
            <div className="stacks-code-row">
              <div className="stacks-line-nums" style={{ paddingLeft: '1.25rem', paddingTop: '1.25rem' }}>
                {selectedStack.code.split('\n').map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>
              <pre className="stacks-preview-code" style={{ paddingLeft: '0.75rem', flex: 1 }}>
                <code>{selectedStack.code}</code>
              </pre>
            </div>

            <div className="stacks-preview-footer">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                <CheckCircle2 size={15} color="var(--color-primary-forest)" />
                <span>Standardized syntax tokens & bracket pairs</span>
              </div>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  if (!user) {
                    // Switch hero snippet tab if matching
                    window.dispatchEvent(new CustomEvent('codetyper-switch-hero-snippet', { detail: { tabId: selectedStack.id } }));
                    const el = document.getElementById('home-editor');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    onStartPractice({ type: 'coding', language: selectedStack.id });
                  }
                }}
              >
                <span>Practice {selectedStack.name}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: ENGINEERING HIGHLIGHTS ("Engineered For Serious Developers")
          ========================================================================= */}
      <section className="landing-section-wrap">
        <div className="landing-section-header">
          <span className="sequence-badge">
            <Cpu size={13} />
            <span>04 // HARDWARE ACOUSTICS & ARCHITECTURE</span>
          </span>
          <br />
          <span className="landing-pill-tag">
            <Cpu size={14} />
            <span>Architecture & Precision</span>
          </span>
          <h2 className="landing-section-title">Engineered For Serious Developers</h2>
          <p className="landing-section-desc">
            We obsessed over every microsecond of input latency, sound synthesis accuracy, and visual distraction to give you the most responsive typing feel ever built. Click any switch below to test live acoustic waveforms!
          </p>
        </div>

        <div className="bento-features-grid">
          {/* Bento 1: Low Latency Audio Synthesizer */}
          <div className="bento-card span-2">
            <div>
              <div className="bento-icon-box">
                <Zap size={24} />
              </div>
              <h3 className="bento-title">Sub-Millisecond Keystroke Loop & Mechanical Synthesizer</h3>
              <p className="bento-desc">
                Zero audio lag modeled via the Web Audio API with multi-oscillator frequency acoustics. Click any switch model to audition acoustic response in real-time:
              </p>
            </div>
            <div className="bento-visual-preview">
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
                <button
                  type="button"
                  className="switch-test-btn"
                  onClick={() => handleTestSwitch('blue', 'typewriter')}
                  title="Test Clicky Switch Acoustics"
                  style={{
                    borderColor: activeSwitchTest === 'blue' ? '#3b82f6' : undefined,
                    background: activeSwitchTest === 'blue' ? 'rgba(59, 130, 246, 0.15)' : undefined
                  }}
                >
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#3b82f6' }} />
                  <span>Cherry MX Blue (Clicky)</span>
                  <div className="sound-bars-anim" aria-hidden="true">
                    <span className={`sound-bar ${activeSwitchTest === 'blue' ? 'active' : ''}`} style={{ background: '#3b82f6' }} />
                    <span className={`sound-bar ${activeSwitchTest === 'blue' ? 'active' : ''}`} style={{ background: '#3b82f6', animationDelay: '0.1s' }} />
                    <span className={`sound-bar ${activeSwitchTest === 'blue' ? 'active' : ''}`} style={{ background: '#3b82f6', animationDelay: '0.2s' }} />
                  </div>
                </button>

                <button
                  type="button"
                  className="switch-test-btn"
                  onClick={() => handleTestSwitch('brown', 'mechanical')}
                  title="Test Tactile Switch Acoustics"
                  style={{
                    borderColor: activeSwitchTest === 'brown' ? '#d97706' : undefined,
                    background: activeSwitchTest === 'brown' ? 'rgba(217, 119, 6, 0.15)' : undefined
                  }}
                >
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#d97706' }} />
                  <span>Cherry MX Brown (Tactile)</span>
                  <div className="sound-bars-anim" aria-hidden="true">
                    <span className={`sound-bar ${activeSwitchTest === 'brown' ? 'active' : ''}`} style={{ background: '#d97706' }} />
                    <span className={`sound-bar ${activeSwitchTest === 'brown' ? 'active' : ''}`} style={{ background: '#d97706', animationDelay: '0.1s' }} />
                    <span className={`sound-bar ${activeSwitchTest === 'brown' ? 'active' : ''}`} style={{ background: '#d97706', animationDelay: '0.2s' }} />
                  </div>
                </button>

                <button
                  type="button"
                  className="switch-test-btn"
                  onClick={() => handleTestSwitch('thock', 'thock')}
                  title="Test Deep Thock Switch Acoustics"
                  style={{
                    borderColor: activeSwitchTest === 'thock' ? '#10b981' : undefined,
                    background: activeSwitchTest === 'thock' ? 'rgba(16, 185, 129, 0.15)' : undefined
                  }}
                >
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
                  <span>Gateron Oil King (Thock)</span>
                  <div className="sound-bars-anim" aria-hidden="true">
                    <span className={`sound-bar ${activeSwitchTest === 'thock' ? 'active' : ''}`} style={{ background: '#10b981' }} />
                    <span className={`sound-bar ${activeSwitchTest === 'thock' ? 'active' : ''}`} style={{ background: '#10b981', animationDelay: '0.1s' }} />
                    <span className={`sound-bar ${activeSwitchTest === 'thock' ? 'active' : ''}`} style={{ background: '#10b981', animationDelay: '0.2s' }} />
                  </div>
                </button>

                <button
                  type="button"
                  className="switch-test-btn"
                  onClick={() => handleTestSwitch('topre', 'bubble')}
                  title="Test Soft Bubble Switch Acoustics"
                  style={{
                    borderColor: activeSwitchTest === 'topre' ? '#a855f7' : undefined,
                    background: activeSwitchTest === 'topre' ? 'rgba(168, 85, 247, 0.15)' : undefined
                  }}
                >
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#a855f7' }} />
                  <span>Topre Capacitive (Soft)</span>
                  <div className="sound-bars-anim" aria-hidden="true">
                    <span className={`sound-bar ${activeSwitchTest === 'topre' ? 'active' : ''}`} style={{ background: '#a855f7' }} />
                    <span className={`sound-bar ${activeSwitchTest === 'topre' ? 'active' : ''}`} style={{ background: '#a855f7', animationDelay: '0.1s' }} />
                    <span className={`sound-bar ${activeSwitchTest === 'topre' ? 'active' : ''}`} style={{ background: '#a855f7', animationDelay: '0.2s' }} />
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Bento 2: Syntax Muscle Memory */}
          <div className="bento-card">
            <div>
              <div className="bento-icon-box" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#0284c7' }}>
                <Terminal size={24} />
              </div>
              <h3 className="bento-title">True Syntax Muscle Memory</h3>
              <p className="bento-desc">
                Master the symbols that actually trip you up: curly braces <code>{`{}`}</code>, arrow operators <code>=&gt;</code>, brackets <code>[]</code>, indentation, and semicolons.
              </p>
            </div>
            <div className="bento-visual-preview" style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', letterSpacing: '0.15em', color: 'var(--color-primary-forest)', fontWeight: 700 }}>
              {`{ [ ] ( ) => === !== ; :`}
            </div>
          </div>

          {/* Bento 3: Key & Finger Heatmap */}
          <div className="bento-card">
            <div>
              <div className="bento-icon-box" style={{ background: 'rgba(234, 179, 8, 0.15)', color: '#ca8a04' }}>
                <Activity size={24} />
              </div>
              <h3 className="bento-title">Key & Finger Heatmap</h3>
              <p className="bento-desc">
                Identify slow fingers and mistake-prone keys with live color-coded heatmap telemetry after every drill.
              </p>
            </div>
            <div className="bento-visual-preview" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ padding: '0.35rem 0.65rem', borderRadius: '6px', background: 'rgba(34, 197, 94, 0.2)', color: '#16a34a', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>J (Fast)</span>
              <span style={{ padding: '0.35rem 0.65rem', borderRadius: '6px', background: 'rgba(234, 179, 8, 0.2)', color: '#ca8a04', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>P (Warn)</span>
              <span style={{ padding: '0.35rem 0.65rem', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.2)', color: '#dc2626', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{`{ (Slow)`}</span>
            </div>
          </div>

          {/* Bento 4: Zen & Distraction Free */}
          <div className="bento-card span-2">
            <div>
              <div className="bento-icon-box" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#9333ea' }}>
                <Compass size={24} />
              </div>
              <h3 className="bento-title">Zen Distraction-Free Workspace</h3>
              <p className="bento-desc">
                Zero popup ads, zero visual clutter. Calibrated soothing color schemes (Obsidian Emerald dark mode and Cream Forest light mode) designed for hours of effortless focus without eye strain.
              </p>
            </div>
            <div className="bento-visual-preview">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: '0.85rem' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  <CheckCircle2 size={16} color="var(--color-primary-forest)" />
                  <span>100% Ad-Free Forever</span>
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  <CheckCircle2 size={16} color="var(--color-primary-forest)" />
                  <span>Carets: Line, Block, Underline</span>
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  <CheckCircle2 size={16} color="var(--color-primary-forest)" />
                  <span>WCAG AAA Compliant Contrast</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: OFFICIAL ACCREDITED CERTIFICATION SYSTEM & LIVE VERIFIER
          ========================================================================= */}
      <section id="certificates" className="landing-section-wrap">
        <div className="landing-section-header">
          <span className="sequence-badge gold">
            <Award size={13} />
            <span>05 // GLOBAL ACCREDITATION REGISTRY</span>
          </span>
          <br />
          <span className="landing-pill-tag gold">
            <Award size={14} />
            <span>Global Accreditation Registry</span>
          </span>
          <h2 className="landing-section-title">Earn Accredited Diplomas As You Master Speed</h2>
          <p className="landing-section-desc">
            Pass official milestone examinations across prose and 25+ programming languages to unlock collectible luxury diplomas personally signed by Founder <strong>Saumy Pandey</strong>.
          </p>
        </div>

        {/* 4 Collectible Tiers Grid */}
        <div className="cert-tiers-container">
          {/* Bronze Tier */}
          <div className="cert-tier-box tier-bronze">
            <div className="cert-tier-top">
              <span className="cert-tier-badge" style={{ background: 'rgba(205, 127, 50, 0.15)', color: '#cd7f32' }}>
                Tier I
              </span>
              <span style={{ fontSize: '1.25rem' }}>🥉</span>
            </div>
            <div className="cert-tier-wpm">40+</div>
            <div className="cert-tier-name" style={{ color: '#cd7f32' }}>Bronze Certified</div>
            <p className="cert-tier-desc">
              Foundational touch-typing speed with baseline accuracy across standard alphanumeric text.
            </p>
            <div className="cert-tier-reqs">
              <span>Req: 40 WPM • 95% Accuracy • 3 Milestones</span>
            </div>
          </div>

          {/* Silver Tier */}
          <div className="cert-tier-box tier-silver">
            <div className="cert-tier-top">
              <span className="cert-tier-badge" style={{ background: 'rgba(148, 163, 184, 0.2)', color: '#64748b' }}>
                Tier II
              </span>
              <span style={{ fontSize: '1.25rem' }}>🥈</span>
            </div>
            <div className="cert-tier-wpm">65+</div>
            <div className="cert-tier-name" style={{ color: '#64748b' }}>Silver Specialist</div>
            <p className="cert-tier-desc">
              Professional software developer typing velocity with fluent bracket and operator mastery.
            </p>
            <div className="cert-tier-reqs">
              <span>Req: 65 WPM • 97% Accuracy • 5 Stacks</span>
            </div>
          </div>

          {/* Gold Tier */}
          <div className="cert-tier-box tier-gold">
            <div className="cert-tier-top">
              <span className="cert-tier-badge" style={{ background: 'rgba(234, 179, 8, 0.2)', color: '#ca8a04' }}>
                Tier III
              </span>
              <span style={{ fontSize: '1.25rem' }}>🥇</span>
            </div>
            <div className="cert-tier-wpm">85+</div>
            <div className="cert-tier-name" style={{ color: '#ca8a04' }}>Gold Master</div>
            <p className="cert-tier-desc">
              Elite typing mastery. Uninterrupted thought-to-screen flow across complex syntax and prose.
            </p>
            <div className="cert-tier-reqs">
              <span>Req: 85 WPM • 98% Accuracy • 10 Stacks</span>
            </div>
          </div>

          {/* Diamond Grandmaster Tier */}
          <div className="cert-tier-box tier-diamond">
            <div className="cert-tier-top">
              <span className="cert-tier-badge" style={{ background: 'rgba(56, 189, 248, 0.2)', color: '#0284c7' }}>
                Apex Tier
              </span>
              <span style={{ fontSize: '1.25rem' }}>💎</span>
            </div>
            <div className="cert-tier-wpm">100+</div>
            <div className="cert-tier-name" style={{ color: '#0284c7' }}>Diamond Grandmaster</div>
            <p className="cert-tier-desc">
              Top 0.5% global typing echelon. Flawless muscle memory, zero hesitation, maximum velocity.
            </p>
            <div className="cert-tier-reqs">
              <span>Req: 100+ WPM • 99% Accuracy • Grade A+</span>
            </div>
          </div>
        </div>

        {/* Visual Certificate Diploma Mockup */}
        <div
          style={{
            maxWidth: '840px',
            margin: '0 auto 2.5rem',
            position: 'relative',
            zIndex: 1,
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            boxShadow: isDark
              ? '0 24px 60px rgba(0, 0, 0, 0.75), 0 0 30px rgba(234, 179, 8, 0.2)'
              : '0 24px 60px rgba(180, 83, 9, 0.15), 0 0 25px rgba(234, 179, 8, 0.15)',
            border: '2px solid rgba(234, 179, 8, 0.65)',
            background: isDark
              ? 'linear-gradient(135deg, #060913 0%, #0c1322 50%, #050811 100%)'
              : 'linear-gradient(135deg, #fffdfa 0%, #fefcf3 50%, #fbf7ec 100%)',
            padding: '2.5rem 2.75rem',
            cursor: 'pointer'
          }}
          onClick={() => onNavigate(user ? 'certificate' : 'signup')}
          title="Click to claim your official certificate"
        >
          {/* Holographic Gold Foil Sweep */}
          <div className="cert-holo-sheen" aria-hidden="true" />

          {/* Inner Guilloche Border */}
          <div
            style={{
              border: '1px solid rgba(234, 179, 8, 0.45)',
              padding: '2rem 2.25rem',
              borderRadius: '8px',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center'
            }}
          >
            {/* Corner Ornaments */}
            <div style={{ position: 'absolute', top: '8px', left: '10px', color: '#eab308', fontSize: '1.1rem' }}>✦</div>
            <div style={{ position: 'absolute', top: '8px', right: '10px', color: '#eab308', fontSize: '1.1rem' }}>✦</div>
            <div style={{ position: 'absolute', bottom: '8px', left: '10px', color: '#eab308', fontSize: '1.1rem' }}>✦</div>
            <div style={{ position: 'absolute', bottom: '8px', right: '10px', color: '#eab308', fontSize: '1.1rem' }}>✦</div>

            {/* Institution Header */}
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#eab308', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
              CodeTyper Global Accreditation Registry
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: isDark ? '#f8fafc' : '#1c1917', fontFamily: '"Cinzel", "Outfit", serif', letterSpacing: '0.04em', marginBottom: '0.85rem' }}>
              Certificate of Touch-Typing Mastery
            </div>

            <div style={{ fontSize: '0.85rem', color: isDark ? '#94a3b8' : '#78716c', fontStyle: 'italic', marginBottom: '0.35rem' }}>
              This is proudly presented to
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: isDark ? '#facc15' : '#b45309', fontFamily: '"Playfair Display", "Outfit", serif', letterSpacing: '0.02em', marginBottom: '0.5rem' }}>
              Certified Developer & Touch Typist
            </div>

            <div style={{ maxWidth: '520px', fontSize: '0.85rem', color: isDark ? '#cbd5e1' : '#57534e', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              For demonstrating exceptional speed, accuracy, and muscle memory across standardized English prose and real-world software programming languages.
            </div>

            {/* Badges Ribbon */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '1.75rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.25rem 0.65rem', borderRadius: '9999px', background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', border: '1px solid rgba(34, 197, 94, 0.35)' }}>
                ✓ 100+ WPM Velocity
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.25rem 0.65rem', borderRadius: '9999px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.35)' }}>
                ✓ 99.2% Accuracy Rate
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.25rem 0.65rem', borderRadius: '9999px', background: 'rgba(234, 179, 8, 0.15)', color: '#eab308', border: '1px solid rgba(234, 179, 8, 0.35)' }}>
                ★ Grade A+ Distinction
              </span>
            </div>

            {/* Bottom Signatory & Seal Row */}
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '0.75rem', borderTop: '1px dashed rgba(234, 179, 8, 0.3)' }}>
              {/* Official Wax Seal */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textAlign: 'left' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, #fde047 0%, #ca8a04 70%, #78350f 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#070b14',
                    boxShadow: '0 0 12px rgba(234, 179, 8, 0.5)',
                    flexShrink: 0
                  }}
                >
                  <Award size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#eab308' }}>VERIFIED ACCREDITED</div>
                  <div style={{ fontSize: '0.7rem', color: isDark ? '#94a3b8' : '#78716c' }}>Ledger ID: CT-2026-CERT</div>
                </div>
              </div>

              {/* Founder Cursive Signature */}
              <div style={{ textAlign: 'right' }}>
                <div
                  style={{
                    fontFamily: '"Pinyon Script", "Alex Brush", cursive',
                    fontSize: '2.1rem',
                    color: isDark ? '#facc15' : '#b45309',
                    lineHeight: 1,
                    marginBottom: '0.1rem'
                  }}
                >
                  Saumy Pandey
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: isDark ? '#e2e8f0' : '#44403c', borderTop: '1px solid rgba(234, 179, 8, 0.4)', paddingTop: '0.2rem' }}>
                  Founder & Authorized Signatory
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Live Verifier Lookup Bar */}
        <div className="cert-live-verifier-card">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', color: '#eab308', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            <ShieldCheck size={18} />
            <span>INSTANT REGISTRY VERIFICATION</span>
          </div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.4rem', color: 'var(--color-text-primary)' }}>
            Verify Any CodeTyper Certificate In Seconds
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', maxWidth: '520px', margin: '0 auto' }}>
            Enter any certificate ledger ID to query the public cryptographic registry.
          </p>

          <form onSubmit={handleVerifyDemo} className="cert-lookup-form">
            <input
              type="text"
              className="cert-lookup-input"
              value={certInputId}
              onChange={(e) => setCertInputId(e.target.value)}
              placeholder="e.g. CT-2026-CERT"
            />
            <button
              type="submit"
              className="btn btn-primary"
              style={{ padding: '0.75rem 1.4rem', background: '#ca8a04', borderColor: '#ca8a04' }}
            >
              <Search size={16} />
              <span>Verify ID</span>
            </button>
          </form>

          {/* Quick Preset Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Quick Samples:</span>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => { setCertInputId('CT-2026-CERT'); }}
              style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
            >
              CT-2026-CERT
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => { setCertInputId('CT-2026-GOLD'); }}
              style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
            >
              CT-2026-GOLD
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => { setCertInputId('CT-2026-DIAMOND'); }}
              style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
            >
              CT-2026-DIAMOND
            </button>
          </div>

          {/* Verification Result Toast/Card */}
          {verifierStatus && (
            <div
              style={{
                marginTop: '1.25rem',
                padding: '1rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <CheckCircle2 size={24} color="#16a34a" />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#16a34a' }}>
                    Authentic Certificate Verified
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                    Ledger ID: <strong>{verifierStatus.id}</strong> • Signed by Founder <strong>{verifierStatus.signatory}</strong>
                  </div>
                </div>
              </div>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => onNavigate('verify')}
                style={{ borderColor: '#16a34a', color: '#16a34a' }}
              >
                <span>Full Ledger Record</span>
                <ExternalLink size={13} />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: FEATURE COMPARISON MATRIX ("CodeTyper vs Other Sites")
          ========================================================================= */}
      <section className="landing-section-wrap">
        <div className="landing-section-header">
          <span className="sequence-badge">
            <Trophy size={13} />
            <span>06 // UNMATCHED COMPETITIVE VALUE</span>
          </span>
          <br />
          <span className="landing-pill-tag">
            <Trophy size={14} />
            <span>Unmatched Value</span>
          </span>
          <h2 className="landing-section-title">Why Developers Prefer CodeTyper</h2>
          <p className="landing-section-desc">
            A head-to-head comparison against conventional dictionary typing websites.
          </p>
        </div>

        <div className="comparison-table-wrap">
          <table className="comparison-table">
            <thead>
              <tr>
                <th className="comparison-th" style={{ width: '40%' }}>Core Capabilities</th>
                <th className="comparison-th brand-col" style={{ width: '28%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Code2 size={18} />
                    <span>CodeTyper</span>
                  </div>
                </th>
                <th className="comparison-th" style={{ width: '16%' }}>Monkeytype</th>
                <th className="comparison-th" style={{ width: '16%' }}>10FastFingers</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="comparison-td">
                  <strong>25+ Real-World Programming Stacks</strong>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Python, Rust, Go, JS, C++, SQL, Bash & more</div>
                </td>
                <td className="comparison-td brand-col">
                  <span className="check-green"><Check size={16} /> Native Support</span>
                </td>
                <td className="comparison-td">
                  <span className="part-warn">⚠️ Simple Words Mode</span>
                </td>
                <td className="comparison-td">
                  <span className="cross-red"><X size={16} /> English Only</span>
                </td>
              </tr>
              <tr>
                <td className="comparison-td">
                  <strong>Cryptographic Accredited Certificates</strong>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Founder-signed verifiable diplomas with Ledger QR</div>
                </td>
                <td className="comparison-td brand-col">
                  <span className="check-green"><Check size={16} /> 4 Luxury Tiers</span>
                </td>
                <td className="comparison-td">
                  <span className="cross-red"><X size={16} /> None</span>
                </td>
                <td className="comparison-td">
                  <span className="cross-red"><X size={16} /> Basic Screenshot</span>
                </td>
              </tr>
              <tr>
                <td className="comparison-td">
                  <strong>Zero-Latency Mechanical Audio Synthesizer</strong>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Cherry MX Blue, Brown, Red, Topre acoustic synthesis</div>
                </td>
                <td className="comparison-td brand-col">
                  <span className="check-green"><Check size={16} /> Built-in</span>
                </td>
                <td className="comparison-td">
                  <span className="part-warn">⚠️ Basic Clicks</span>
                </td>
                <td className="comparison-td">
                  <span className="cross-red"><X size={16} /> None</span>
                </td>
              </tr>
              <tr>
                <td className="comparison-td">
                  <strong>Key & Finger Error Heatmap Telemetry</strong>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Pinpoints individual weak fingers and mistake-prone keys</div>
                </td>
                <td className="comparison-td brand-col">
                  <span className="check-green"><Check size={16} /> Live Diagnostics</span>
                </td>
                <td className="comparison-td">
                  <span className="part-warn">⚠️ Key Heatmap</span>
                </td>
                <td className="comparison-td">
                  <span className="cross-red"><X size={16} /> None</span>
                </td>
              </tr>
              <tr>
                <td className="comparison-td">
                  <strong>Live Multiplayer Race Arenas</strong>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Real-time WebSockets head-to-head racing with live WPM</div>
                </td>
                <td className="comparison-td brand-col">
                  <span className="check-green"><Check size={16} /> Global Arenas</span>
                </td>
                <td className="comparison-td">
                  <span className="part-warn">⚠️ Private Only</span>
                </td>
                <td className="comparison-td">
                  <span className="part-warn">⚠️ Basic Races</span>
                </td>
              </tr>
              <tr>
                <td className="comparison-td">
                  <strong>Distraction-Free Experience & Pricing</strong>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>No intrusive ads, no subscription barriers</div>
                </td>
                <td className="comparison-td brand-col">
                  <span className="check-green"><Check size={16} /> 100% Free & No Ads</span>
                </td>
                <td className="comparison-td">
                  <span className="check-green"><Check size={16} /> Free</span>
                </td>
                <td className="comparison-td">
                  <span className="cross-red"><X size={16} /> Heavy Banner Ads</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* =========================================================================
          SECTION 7: DEVELOPER TESTIMONIALS ("Wall of Love")
          ========================================================================= */}
      <section className="landing-section-wrap">
        <div className="landing-section-header">
          <span className="sequence-badge">
            <Star size={13} />
            <span>07 // COMMUNITY FEEDBACK & WALL OF LOVE</span>
          </span>
          <br />
          <span className="landing-pill-tag">
            <Star size={14} />
            <span>Community Feedback</span>
          </span>
          <h2 className="landing-section-title">Loved By Engineers Worldwide</h2>
          <p className="landing-section-desc">
            See how developers, students, and competitive coders use CodeTyper to elevate their daily flow.
          </p>
        </div>

        <div className="testimonials-grid">
          {/* Testimonial 1 */}
          <div className="testimonial-card">
            <div>
              <div className="test-stars-row">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="#eab308" color="#eab308" />
                ))}
              </div>
              <p className="test-quote-text">
                "Practicing curly braces and arrow function muscle memory on CodeTyper completely eliminated my hesitation during live technical interviews. I jumped from 60 to 95 WPM on real JavaScript and TypeScript code."
              </p>
            </div>
            <div className="test-author-box">
              <div className="test-avatar">AR</div>
              <div>
                <div className="test-author-name">Ananya Rao</div>
                <div className="test-author-role">Senior Frontend Engineer @ FinTech</div>
              </div>
            </div>
          </div>

          {/* Testimonial 2 */}
          <div className="testimonial-card">
            <div>
              <div className="test-stars-row">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="#eab308" color="#eab308" />
                ))}
              </div>
              <p className="test-quote-text">
                "The Cherry MX Blue acoustic synthesizer and the peaceful obsidian dark mode make my morning typing drills a joy. Unlocking my official Gold Master diploma signed by Saumy Pandey was a huge milestone!"
              </p>
            </div>
            <div className="test-author-box">
              <div className="test-avatar" style={{ background: 'linear-gradient(135deg, #0284c7, #38bdf8)' }}>MS</div>
              <div>
                <div className="test-author-name">Marcus Schmidt</div>
                <div className="test-author-role">Staff Systems Engineer (Rust / Go)</div>
              </div>
            </div>
          </div>

          {/* Testimonial 3 */}
          <div className="testimonial-card">
            <div>
              <div className="test-stars-row">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="#eab308" color="#eab308" />
                ))}
              </div>
              <p className="test-quote-text">
                "Having verifiable cryptographic certificates for typing speed is brilliant. I added my 100+ WPM Diamond Grandmaster certificate to my LinkedIn profile and recruiters commented on it during my screening calls."
              </p>
            </div>
            <div className="test-author-box">
              <div className="test-avatar" style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>DP</div>
              <div>
                <div className="test-author-name">Devon Park</div>
                <div className="test-author-role">Computer Science Graduate & Competitive Typist</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 8: INTERACTIVE FAQ ACCORDION
          ========================================================================= */}
      <section className="landing-section-wrap">
        <div className="landing-section-header">
          <span className="sequence-badge">
            <HelpCircle size={13} />
            <span>08 // FREQUENTLY ASKED QUESTIONS</span>
          </span>
          <br />
          <span className="landing-pill-tag">
            <HelpCircle size={14} />
            <span>Got Questions?</span>
          </span>
          <h2 className="landing-section-title">Frequently Asked Questions</h2>
          <p className="landing-section-desc">
            Everything you need to know about practicing, accreditation, and features.
          </p>
        </div>

        <div className="faq-accordion-wrap">
          {FAQS.map((faq, idx) => (
            <div key={idx} className="faq-item-card">
              <button
                className="faq-question-btn"
                onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                aria-expanded={openFaq === idx}
              >
                <span>{faq.q}</span>
                {openFaq === idx ? (
                  <ChevronUp size={20} color="var(--color-primary-forest)" />
                ) : (
                  <ChevronDown size={20} color="var(--color-text-muted)" />
                )}
              </button>
              {openFaq === idx && (
                <div className="faq-answer-panel">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          SECTION 9: GRAND PRE-FOOTER CLOSING CTA BANNER
          ========================================================================= */}
      <section className="landing-section-wrap" style={{ paddingBottom: '1rem' }}>
        <div className="grand-cta-banner-wrap">
          <div className="grand-cta-glow-orb" aria-hidden="true" />
          <span className="sequence-badge">
            <Zap size={13} />
            <span>09 // ACCREDITED VELOCITY CTA</span>
          </span>
          <br />
          <span className="landing-pill-tag">
            <Zap size={14} />
            <span>Join 50,000+ Developers</span>
          </span>
          <h2 className="grand-cta-h2">Master The Keyboard. Elevate Your Code.</h2>
          <p className="grand-cta-p">
            Build calm, stutter-free typing velocity across real programming stacks and claim your official accredited diploma today.
          </p>

          <div className="grand-cta-actions-row">
            <button
              className="btn-premium-hero"
              style={{ padding: '0.85rem 2rem', fontSize: '1.05rem' }}
              onClick={() => onNavigate('signup')}
            >
              <span>Start Typing Free</span>
              <ArrowRight size={20} className="btn-icon-slide" />
            </button>
            <button
              className="btn-glass-hero"
              onClick={() => onNavigate('certificate')}
              style={{
                borderColor: 'rgba(234, 179, 8, 0.45)',
                backgroundColor: 'rgba(234, 179, 8, 0.1)',
                color: '#eab308'
              }}
            >
              <Award size={18} color="#eab308" />
              <span>Explore Official Certificates</span>
            </button>
          </div>

          <div className="grand-cta-badges">
            <span className="grand-badge-item">
              <CheckCircle2 size={16} color="var(--color-primary-forest)" />
              <span>100% Free Forever</span>
            </span>
            <span className="grand-badge-item">
              <CheckCircle2 size={16} color="var(--color-primary-forest)" />
              <span>No Credit Card Needed</span>
            </span>
            <span className="grand-badge-item">
              <CheckCircle2 size={16} color="var(--color-primary-forest)" />
              <span>Instant Public Access</span>
            </span>
            <span className="grand-badge-item">
              <CheckCircle2 size={16} color="var(--color-primary-forest)" />
              <span>Verifiable Diplomas</span>
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
