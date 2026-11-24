import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Zap,
  CheckCircle2,
  RotateCcw,
  Volume2,
  VolumeX,
  Terminal,
  Activity,
  Flame,
  ArrowRight,
  Sparkles,
  GitBranch,
  Layers,
  Code2,
  Trophy,
  X,
  Eye,
  Target,
  Clock,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEngine } from '../../utils/soundEngine.js';
import { useSettings } from '../../context/SettingsContext.jsx';

// 4 iconic dev snippets with syntax tokens
const SNIPPETS = [
  {
    id: 'js',
    filename: 'focusFlow.js',
    language: 'JavaScript',
    iconColor: '#F7DF1E',
    tag: 'ES2024',
    code: `function calculateFocus(speed, precision) {
  const flowState = speed * (precision / 100);
  return flowState >= 70 ? "Mastery" : "Flow State";
}`,
    tokens: [
      { text: 'function', type: 'keyword' },
      { text: ' ', type: 'plain' },
      { text: 'calculateFocus', type: 'function' },
      { text: '(', type: 'punct' },
      { text: 'speed', type: 'param' },
      { text: ', ', type: 'punct' },
      { text: 'precision', type: 'param' },
      { text: ') {\n  ', type: 'punct' },
      { text: 'const', type: 'keyword' },
      { text: ' ', type: 'plain' },
      { text: 'flowState', type: 'variable' },
      { text: ' = ', type: 'operator' },
      { text: 'speed', type: 'variable' },
      { text: ' * (', type: 'operator' },
      { text: 'precision', type: 'variable' },
      { text: ' / ', type: 'operator' },
      { text: '100', type: 'number' },
      { text: ');\n  ', type: 'punct' },
      { text: 'return', type: 'keyword' },
      { text: ' ', type: 'plain' },
      { text: 'flowState', type: 'variable' },
      { text: ' >= ', type: 'operator' },
      { text: '70', type: 'number' },
      { text: ' ? ', type: 'operator' },
      { text: '"Mastery"', type: 'string' },
      { text: ' : ', type: 'operator' },
      { text: '"Flow State"', type: 'string' },
      { text: ';\n}', type: 'punct' }
    ]
  },
  {
    id: 'python',
    filename: 'async_stream.py',
    language: 'Python',
    iconColor: '#38BDF8',
    tag: 'Python 3.12',
    code: `async def stream_tokens(prompt: str) -> None:
    async for token in generate_stream(prompt):
        await terminal.render(token, speed="120wpm")`,
    tokens: [
      { text: 'async', type: 'keyword' },
      { text: ' ', type: 'plain' },
      { text: 'def', type: 'keyword' },
      { text: ' ', type: 'plain' },
      { text: 'stream_tokens', type: 'function' },
      { text: '(', type: 'punct' },
      { text: 'prompt', type: 'param' },
      { text: ': ', type: 'punct' },
      { text: 'str', type: 'type' },
      { text: ') -> ', type: 'punct' },
      { text: 'None', type: 'keyword' },
      { text: ':\n    ', type: 'punct' },
      { text: 'async', type: 'keyword' },
      { text: ' ', type: 'plain' },
      { text: 'for', type: 'keyword' },
      { text: ' ', type: 'plain' },
      { text: 'token', type: 'variable' },
      { text: ' ', type: 'plain' },
      { text: 'in', type: 'keyword' },
      { text: ' ', type: 'plain' },
      { text: 'generate_stream', type: 'function' },
      { text: '(', type: 'punct' },
      { text: 'prompt', type: 'param' },
      { text: '):\n        ', type: 'punct' },
      { text: 'await', type: 'keyword' },
      { text: ' ', type: 'plain' },
      { text: 'terminal', type: 'variable' },
      { text: '.', type: 'punct' },
      { text: 'render', type: 'function' },
      { text: '(', type: 'punct' },
      { text: 'token', type: 'param' },
      { text: ', ', type: 'punct' },
      { text: 'speed', type: 'variable' },
      { text: '=', type: 'operator' },
      { text: '"120wpm"', type: 'string' },
      { text: ')', type: 'punct' }
    ]
  },
  {
    id: 'rust',
    filename: 'zero_cost.rs',
    language: 'Rust',
    iconColor: '#F97316',
    tag: 'Rust 2024',
    code: `pub fn accelerate<T: Sync>(pipeline: &mut Pipeline<T>) -> Result<(), Error> {
    pipeline.optimize_throughput(144);
    Ok(())
}`,
    tokens: [
      { text: 'pub', type: 'keyword' },
      { text: ' ', type: 'plain' },
      { text: 'fn', type: 'keyword' },
      { text: ' ', type: 'plain' },
      { text: 'accelerate', type: 'function' },
      { text: '<', type: 'punct' },
      { text: 'T', type: 'type' },
      { text: ': ', type: 'punct' },
      { text: 'Sync', type: 'type' },
      { text: '>(', type: 'punct' },
      { text: 'pipeline', type: 'param' },
      { text: ': &', type: 'operator' },
      { text: 'mut', type: 'keyword' },
      { text: ' ', type: 'plain' },
      { text: 'Pipeline', type: 'type' },
      { text: '<', type: 'punct' },
      { text: 'T', type: 'type' },
      { text: '>) -> ', type: 'punct' },
      { text: 'Result', type: 'type' },
      { text: '<(), ', type: 'punct' },
      { text: 'Error', type: 'type' },
      { text: '> {\n    ', type: 'punct' },
      { text: 'pipeline', type: 'variable' },
      { text: '.', type: 'punct' },
      { text: 'optimize_throughput', type: 'function' },
      { text: '(', type: 'punct' },
      { text: '144', type: 'number' },
      { text: ');\n    ', type: 'punct' },
      { text: 'Ok', type: 'type' },
      { text: '(())', type: 'punct' },
      { text: '\n}', type: 'punct' }
    ]
  },
  {
    id: 'ts',
    filename: 'developer_flow.ts',
    language: 'TypeScript',
    iconColor: '#3178C6',
    tag: 'TS 5.5',
    code: `interface DeveloperFlow {
  typingSpeed: number;
  accuracyRate: 0.99;
  distractionFree: true;
}`,
    tokens: [
      { text: 'interface', type: 'keyword' },
      { text: ' ', type: 'plain' },
      { text: 'DeveloperFlow', type: 'type' },
      { text: ' {\n  ', type: 'punct' },
      { text: 'typingSpeed', type: 'variable' },
      { text: ': ', type: 'punct' },
      { text: 'number', type: 'type' },
      { text: ';\n  ', type: 'punct' },
      { text: 'accuracyRate', type: 'variable' },
      { text: ': ', type: 'punct' },
      { text: '0.99', type: 'number' },
      { text: ';\n  ', type: 'punct' },
      { text: 'distractionFree', type: 'variable' },
      { text: ': ', type: 'punct' },
      { text: 'true', type: 'keyword' },
      { text: ';\n}', type: 'punct' }
    ]
  }
];

export function HeroInteractiveEditor({ onNavigate, onStartPractice }) {
  const { settings, updateSetting } = useSettings();
  const [activeTabId, setActiveTabId] = useState('js');
  const activeSnippet = useMemo(() => {
    return SNIPPETS.find((s) => s.id === activeTabId) || SNIPPETS[0];
  }, [activeTabId]);

  const targetText = activeSnippet.code;
  const [typedText, setTypedText] = useState('');
  const [cursorIndex, setCursorIndex] = useState(0);
  const [status, setStatus] = useState('idle'); // 'idle' | 'typing' | 'completed'
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [errors, setErrors] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showCelebration, setShowCelebration] = useState(true);

  const editorViewportRef = useRef(null);
  const timerRef = useRef(null);
  const caretRef = useRef(null);

  // Compute live character mapping with token types
  const charTokens = useMemo(() => {
    const list = [];
    let charIdx = 0;
    activeSnippet.tokens.forEach((token) => {
      for (let i = 0; i < token.text.length; i++) {
        list.push({
          char: token.text[i],
          type: token.type,
          index: charIdx++
        });
      }
    });
    return list;
  }, [activeSnippet]);

  // Reset session
  const resetSession = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTypedText('');
    setCursorIndex(0);
    setStatus('idle');
    setStreak(0);
    setMaxStreak(0);
    setErrors(0);
    setStartTime(null);
    setElapsedSeconds(0);
    setShowCelebration(true);
  }, []);

  // Switch tabs
  const handleTabChange = (tabId) => {
    if (tabId === activeTabId) return;
    setActiveTabId(tabId);
    resetSession();
    if (editorViewportRef.current) {
      editorViewportRef.current.focus({ preventScroll: true });
    }
  };

  // Switch to next language
  const handleNextLanguage = useCallback(() => {
    const currentIndex = SNIPPETS.findIndex((s) => s.id === activeTabId);
    const nextSnippet = SNIPPETS[(currentIndex + 1) % SNIPPETS.length];
    setActiveTabId(nextSnippet.id);
    resetSession();
    if (editorViewportRef.current) {
      editorViewportRef.current.focus({ preventScroll: true });
    }
  }, [activeTabId, resetSession]);

  // Live timer interval
  useEffect(() => {
    if (status === 'typing' && startTime) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((Date.now() - startTime) / 1000);
      }, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status, startTime]);

  // Calculate live WPM & Accuracy
  const metrics = useMemo(() => {
    const minutes = Math.max(elapsedSeconds / 60, 0.01);
    let correctCount = 0;
    for (let i = 0; i < typedText.length; i++) {
      if (typedText[i] === targetText[i]) {
        correctCount++;
      }
    }
    const words = correctCount / 5;
    const grossWpm = elapsedSeconds > 0 ? words / minutes : 0;
    const netWpm = Math.max(0, grossWpm - (errors / minutes));
    const accuracy = typedText.length > 0 ? (correctCount / typedText.length) * 100 : 100;

    return {
      wpm: status === 'idle' ? 0 : Math.round(netWpm * 10) / 10,
      accuracy: Math.round(accuracy * 10) / 10,
      correctCount
    };
  }, [typedText, targetText, elapsedSeconds, errors, status]);

  // Gamified developer rank based on WPM and Accuracy
  const devRank = useMemo(() => {
    if (metrics.wpm >= 80) {
      return {
        tier: 'DIAMOND FLOW',
        title: 'Cybernetic Speedster',
        subtitle: 'Top 1% Typing Mastery',
        percentile: '⚡ Faster than 98% of developers',
        color: '#38BDF8',
        gradient: 'linear-gradient(135deg, #38BDF8, #818CF8)',
        badgeClass: 'tier-diamond'
      };
    } else if (metrics.wpm >= 55) {
      return {
        tier: 'PLATINUM FLOW',
        title: 'High-Octane Coder',
        subtitle: 'Effortless rhythm & speed',
        percentile: '⚡ Faster than 85% of developers',
        color: '#34D399',
        gradient: 'linear-gradient(135deg, #34D399, #10B981)',
        badgeClass: 'tier-platinum'
      };
    } else if (metrics.wpm >= 35) {
      return {
        tier: 'GOLD PACE',
        title: 'Focused Developer',
        subtitle: 'Solid muscle memory rhythm',
        percentile: '⚡ Solid developer flow pace',
        color: '#FBBF24',
        gradient: 'linear-gradient(135deg, #FBBF24, #F59E0B)',
        badgeClass: 'tier-gold'
      };
    }
    return {
      tier: 'SAGE SEED',
      title: 'Mindful Typist',
      subtitle: 'Building clean muscle memory',
      percentile: '🌱 Precision foundation phase',
      color: '#A7F3D0',
      gradient: 'linear-gradient(135deg, #A7F3D0, #34D399)',
      badgeClass: 'tier-sage'
    };
  }, [metrics.wpm]);

  // Rolling odometer animation for victory card numbers
  const [displayWpm, setDisplayWpm] = useState(0);
  const [displayAcc, setDisplayAcc] = useState(0);

  useEffect(() => {
    if (status === 'completed' && showCelebration) {
      const targetWpm = metrics.wpm;
      const targetAcc = metrics.accuracy;
      let startTimestamp = null;
      const duration = 650;

      const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        setDisplayWpm(Math.round(targetWpm * ease * 10) / 10);
        setDisplayAcc(Math.round(targetAcc * ease * 10) / 10);
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          setDisplayWpm(targetWpm);
          setDisplayAcc(targetAcc);
        }
      };
      requestAnimationFrame(step);
    } else if (status !== 'completed') {
      setDisplayWpm(0);
      setDisplayAcc(0);
    }
  }, [status, showCelebration, metrics.wpm, metrics.accuracy]);

  // Handle keystroke
  const handleKeyDown = (e) => {
    // Ignore function / system keys
    if (e.key === 'Tab') {
      e.preventDefault();
      resetSession();
      return;
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      if (status === 'completed' && showCelebration) {
        setShowCelebration(false);
        return;
      }
      resetSession();
      return;
    }
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      resetSession();
      return;
    }
    if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
      return;
    }

    // Backspace
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (cursorIndex > 0) {
        soundEngine.playKeypress();
        const nextTyped = typedText.slice(0, -1);
        setTypedText(nextTyped);
        setCursorIndex((idx) => Math.max(0, idx - 1));
        setStreak((s) => Math.max(0, s - 1));
      }
      return;
    }

    // Ignore if already completed
    if (status === 'completed') return;

    // Normalize enter
    let inputChar = e.key;
    if (e.key === 'Enter') {
      inputChar = '\n';
    }

    // Only accept single character
    if (inputChar.length !== 1) return;

    e.preventDefault();

    // Start typing state on first valid keypress
    if (status === 'idle') {
      setStatus('typing');
      setStartTime(Date.now());
    }

    const expectedChar = targetText[cursorIndex];
    const isCorrect = inputChar === expectedChar;

    if (isCorrect) {
      soundEngine.playKeypress();
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      if (nextStreak > maxStreak) setMaxStreak(nextStreak);
    } else {
      soundEngine.playError();
      setErrors((prev) => prev + 1);
      setStreak(0);
    }

    const nextTyped = typedText + inputChar;
    const nextCursor = cursorIndex + 1;
    setTypedText(nextTyped);
    setCursorIndex(nextCursor);

    // Completion condition
    if (nextCursor >= targetText.length) {
      setStatus('completed');
      setShowCelebration(true);
      soundEngine.playComplete();
      if (timerRef.current) clearInterval(timerRef.current);

      // Explosive celebration confetti burst
      try {
        confetti({
          particleCount: 85,
          spread: 75,
          origin: { y: 0.58 },
          colors: ['#10B981', '#34D399', '#38BDF8', '#FBBF24', '#A855F7']
        });
        setTimeout(() => {
          confetti({
            particleCount: 45,
            angle: 60,
            spread: 55,
            origin: { x: 0.15, y: 0.65 },
            colors: ['#34D399', '#FBBF24']
          });
          confetti({
            particleCount: 45,
            angle: 120,
            spread: 55,
            origin: { x: 0.85, y: 0.65 },
            colors: ['#38BDF8', '#10B981']
          });
        }, 220);
      } catch (err) {}
    }
  };

  // Sound toggle
  const toggleSound = () => {
    updateSetting('sound_enabled', !settings.sound_enabled);
  };

  // Split lines for line numbers
  const lines = useMemo(() => targetText.split('\n'), [targetText]);

  // Current line and column calculation for status bar
  const currentPosition = useMemo(() => {
    let line = 1;
    let col = 1;
    for (let i = 0; i < cursorIndex; i++) {
      if (targetText[i] === '\n') {
        line++;
        col = 1;
      } else {
        col++;
      }
    }
    return { line, col };
  }, [cursorIndex, targetText]);

  return (
    <div className="hero-editor-master-stage">
      {/* Dynamic Ambient Aurora Lighting Rig */}
      <div className="hero-editor-ambient-glow" aria-hidden="true" />

      {/* Sleek Stage Header Bar */}
      <div className="hero-stage-topbar" aria-label="Interactive Live Demo">
        <div className="stage-topbar-left">
          <span className="stage-live-dot" />
          <Terminal size={13} className="stage-terminal-icon" />
          <span className="stage-topbar-title">Interactive Mechanical Flow Studio</span>
          <span className="stage-topbar-tag">Live Engine • No Login Required to Try</span>
        </div>
        <div className="stage-topbar-right">
          <span className="stage-hint-chip"><kbd>Tab</kbd> Switch Language</span>
          <span className="stage-hint-chip"><kbd>Esc</kbd> Reset</span>
        </div>
      </div>

      {/* Main Studio IDE Chassis */}
      <div
        className={`hero-studio-window ${isFocused ? 'window-active-glow' : ''} ${status === 'completed' && showCelebration ? 'is-celebrating' : ''}`}
        onClick={() => {
          if (editorViewportRef.current) {
            editorViewportRef.current.focus({ preventScroll: true });
          }
        }}
      >
        {/* Studio Window Chrome (macOS Header + IDE Tabs + Live Telemetry) */}
        <div className="hero-studio-header">
          {/* macOS Traffic Dots */}
          <div className="studio-traffic-lights" aria-hidden="true">
            <span className="studio-dot dot-close" />
            <span className="studio-dot dot-minimize" />
            <span className="studio-dot dot-expand" />
          </div>

          {/* IDE File Switcher Tabs */}
          <div className="studio-tabs-bar" role="tablist" aria-label="Code language switch">
            {SNIPPETS.map((snippet) => {
              const isActive = snippet.id === activeTabId;
              return (
                <button
                  key={snippet.id}
                  role="tab"
                  aria-selected={isActive}
                  className={`studio-tab-item ${isActive ? 'tab-active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTabChange(snippet.id);
                  }}
                >
                  <span
                    className="tab-lang-dot"
                    style={{ backgroundColor: snippet.iconColor }}
                  />
                  <span className="tab-filename">{snippet.filename}</span>
                  {isActive && <span className="tab-active-indicator" />}
                </button>
              );
            })}
          </div>

          {/* Live Integrated Telemetry HUD */}
          <div className="studio-hud-telemetry" aria-label="Live Typing Metrics">
            {/* Live WPM Pill */}
            <div className={`studio-hud-chip chip-wpm ${metrics.wpm > 0 ? 'chip-active-wpm' : ''}`}>
              <Activity size={13} className="hud-metric-icon" />
              <span className="hud-metric-label">WPM</span>
              <span className="hud-metric-number">{metrics.wpm.toFixed(1)}</span>
            </div>

            {/* Live Accuracy Pill */}
            <div className="studio-hud-chip chip-accuracy">
              <span className="hud-metric-label">ACC</span>
              <span className="hud-metric-number">{metrics.accuracy.toFixed(1)}%</span>
            </div>

            {/* Live Hot Streak Flame */}
            <div
              className={`studio-hud-chip chip-streak ${streak >= 10 ? 'flame-ignited' : ''}`}
              title={`${streak} consecutive correct keystrokes`}
            >
              <Flame size={13} className={streak >= 10 ? 'flame-flicker' : ''} />
              <span className="hud-metric-number">{streak}</span>
            </div>

            {/* Tactile Sound FX Toggle */}
            <button
              type="button"
              className="studio-icon-btn"
              onClick={(e) => {
                e.stopPropagation();
                toggleSound();
              }}
              title={settings.sound_enabled ? 'Mute mechanical key sounds' : 'Enable mechanical key sounds'}
              aria-label="Toggle mechanical sound"
            >
              {settings.sound_enabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
            </button>

            {/* Instant Reset Button */}
            <button
              type="button"
              className="studio-icon-btn btn-reset-spin"
              onClick={(e) => {
                e.stopPropagation();
                resetSession();
              }}
              title="Reset snippet (Tab)"
              aria-label="Reset typing demo"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>

        {/* Studio Editor Viewport Canvas */}
        <div
          ref={editorViewportRef}
          className={`hero-studio-viewport ${isFocused ? 'viewport-focused' : ''}`}
          tabIndex={0}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          role="textbox"
          aria-label="Interactive typing demo editor"
        >
          {/* Subtle line background glow for active line */}
          <div
            className="editor-active-line-highlight"
            style={{
              top: `${(currentPosition.line - 1) * 1.85 + 0.3}em`
            }}
            aria-hidden="true"
          />

          {/* Line Numbers Gutter */}
          <div className="editor-gutter" aria-hidden="true">
            {lines.map((_, i) => (
              <div
                key={i}
                className={`gutter-number ${currentPosition.line === i + 1 ? 'gutter-active' : ''}`}
              >
                {i + 1}
              </div>
            ))}
          </div>

          {/* Tokenized Syntax Content */}
          <div className="editor-syntax-stream">
            {charTokens.map((item, idx) => {
              const isTyped = idx < typedText.length;
              const isCurrent = idx === cursorIndex;
              let statusClass = 'token-pending';

              if (isTyped) {
                statusClass = typedText[idx] === item.char ? 'token-correct' : 'token-error';
              }

              // Special representation for newline
              const displayChar = item.char === '\n' ? '↵\n' : item.char;

              return (
                <span
                  key={idx}
                  className={`syntax-char ${statusClass} token-type-${item.type} ${isCurrent ? 'char-current' : ''}`}
                >
                  {/* Glowing Neon Caret */}
                  {isCurrent && status !== 'completed' && (
                    <span
                      ref={caretRef}
                      className={`hero-neon-caret ${status === 'typing' ? 'caret-typing' : 'caret-idle'}`}
                      aria-hidden="true"
                    />
                  )}
                  {displayChar}
                </span>
              );
            })}
          </div>
        </div>

        {/* Studio Bottom Status Bar (VS Code / Zed Style) */}
        <div className="hero-studio-statusbar">
          <div className="statusbar-left">
            <span className="statusbar-item">
              <GitBranch size={12} />
              <span>main</span>
            </span>
            <span className="statusbar-item statusbar-hide-sm">UTF-8</span>
            <span className="statusbar-item">
              <span className="statusbar-lang-dot" style={{ backgroundColor: activeSnippet.iconColor }} />
              <span>{activeSnippet.tag}</span>
            </span>
            <span className="statusbar-item">
              Ln {currentPosition.line}, Col {currentPosition.col}
            </span>
          </div>

          <div className="statusbar-center">
            {status === 'idle' && (
              <span className="statusbar-prompt pulse-prompt">
                <span className="prompt-dot" />
                <span>Click inside or press any key to test drive mechanical flow</span>
              </span>
            )}
            {status === 'typing' && (
              <span className="statusbar-prompt text-emerald">
                <span className="prompt-dot dot-live-green" />
                <span>Engine capturing real-time keystrokes ({metrics.wpm} WPM)</span>
              </span>
            )}
            {status === 'completed' && (
              <div className="statusbar-completed-banner">
                <span className="text-gold">
                  🎉 {metrics.wpm} WPM ({metrics.accuracy}% Acc)
                </span>
                {!showCelebration && (
                  <button
                    type="button"
                    className="statusbar-view-stats-btn"
                    onClick={() => setShowCelebration(true)}
                  >
                    <Trophy size={11} />
                    <span>View Victory Card</span>
                  </button>
                )}
                <button
                  type="button"
                  className="statusbar-view-stats-btn"
                  onClick={handleNextLanguage}
                >
                  <Code2 size={11} />
                  <span>Next Lang</span>
                </button>
              </div>
            )}
          </div>

          <div className="statusbar-right">
            <span className="statusbar-shortcut">
              <kbd>Tab</kbd> Reset
            </span>
            <span className="statusbar-shortcut statusbar-hide-sm">
              <kbd>Esc</kbd> Clear
            </span>
          </div>
        </div>

        {/* Deluxe Holographic Flow Achievement Card */}
        {status === 'completed' && showCelebration && (
          <div className="hero-celebration-overlay" onClick={() => setShowCelebration(false)}>
            <div
              className={`celebration-hologram-card ${devRank.badgeClass}`}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-label="Typing drill results"
            >
              {/* Card Topbar: Crest, Rank, Percentile, Inspect Code Button */}
              <div className="celebration-card-topbar">
                <div className="celebration-tier-badge">
                  <div className="tier-crest-icon">
                    <Trophy size={18} className="trophy-crest" />
                    <span className="crest-ring-pulse" />
                  </div>
                  <div className="tier-text-wrap">
                    <div className="tier-badge-title-row">
                      <span className="tier-badge-label">{devRank.tier}</span>
                      <span className="tier-badge-dot">•</span>
                      <span className="tier-badge-name">{devRank.title}</span>
                    </div>
                    <span className="tier-badge-percentile">{devRank.percentile}</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="card-inspect-btn"
                  onClick={() => setShowCelebration(false)}
                  title="Inspect typed code snippet (Esc)"
                  aria-label="Inspect typed code"
                >
                  <Eye size={13} />
                  <span>Inspect Code</span>
                  <kbd>Esc</kbd>
                </button>
              </div>

              {/* Main Stats Showcase: Dual Cybernetic Visualizers */}
              <div className="celebration-stats-deck">
                {/* Speed Showcase */}
                <div className="stat-hero-block stat-block-wpm">
                  <div className="stat-hero-header">
                    <span className="stat-pill-label">
                      <Zap size={11} /> NET SPEED
                    </span>
                    <span className="stat-pill-sub">Raw Flow Pace</span>
                  </div>
                  <div className="stat-hero-reading">
                    <span className="stat-hero-num">{displayWpm.toFixed(1)}</span>
                    <span className="stat-hero-unit">WPM</span>
                  </div>
                  <div className="stat-speed-meter">
                    <div
                      className="stat-speed-fill"
                      style={{
                        width: `${Math.min(100, Math.max(10, (displayWpm / 120) * 100))}%`
                      }}
                    />
                  </div>
                </div>

                {/* Precision Showcase */}
                <div className="stat-hero-block stat-block-acc">
                  <div className="stat-hero-header">
                    <span className="stat-pill-label label-emerald">
                      <Target size={11} /> PRECISION
                    </span>
                    <span className="stat-pill-sub">
                      {errors === 0 ? '100% Flawless' : `${errors} correction${errors > 1 ? 's' : ''}`}
                    </span>
                  </div>
                  <div className="stat-hero-reading">
                    <span className="stat-hero-num text-emerald">{displayAcc.toFixed(1)}%</span>
                    <span className="stat-hero-unit">ACC</span>
                  </div>
                  <div className="stat-speed-meter meter-emerald">
                    <div
                      className="stat-speed-fill fill-emerald"
                      style={{
                        width: `${Math.min(100, Math.max(8, displayAcc))}%`
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Telemetry Micro Bento Row */}
              <div className="celebration-bento-row">
                <div className="bento-cell">
                  <Clock size={13} className="bento-icon text-cyan" />
                  <div className="bento-data">
                    <span className="bento-val">{elapsedSeconds.toFixed(1)}s</span>
                    <span className="bento-lbl">Duration</span>
                  </div>
                </div>

                <div className="bento-cell">
                  <Flame size={13} className="bento-icon text-amber" />
                  <div className="bento-data">
                    <span className="bento-val text-amber">{maxStreak}</span>
                    <span className="bento-lbl">Max Combo</span>
                  </div>
                </div>

                <div className="bento-cell">
                  <Activity size={13} className="bento-icon text-emerald" />
                  <div className="bento-data">
                    <span className="bento-val">
                      {Math.round((typedText.length / Math.max(elapsedSeconds, 0.5)) * 60)}
                    </span>
                    <span className="bento-lbl">Gross CPM</span>
                  </div>
                </div>

                <div className="bento-cell">
                  <Sparkles size={13} className="bento-icon text-purple" />
                  <div className="bento-data">
                    <span className="bento-val">{activeSnippet.language}</span>
                    <span className="bento-lbl">Snippet</span>
                  </div>
                </div>
              </div>

              {/* Action Deck: Primary & Secondary Actions */}
              <div className="celebration-cta-deck">
                <button
                  type="button"
                  className="btn-celebration-hero-primary"
                  onClick={() => {
                    if (onStartPractice) {
                      onStartPractice('coding');
                    } else if (onNavigate) {
                      onNavigate('coding');
                    }
                  }}
                >
                  <span className="btn-shine-bar" />
                  <Sparkles size={16} />
                  <span>Launch Full Practice Arena</span>
                  <ArrowRight size={16} className="btn-arrow-icon" />
                </button>

                <div className="celebration-cta-subrow">
                  <button
                    type="button"
                    className="btn-celebration-secondary"
                    onClick={handleNextLanguage}
                    title="Switch to next language snippet (Tab)"
                  >
                    <Code2 size={13} />
                    <span>Next Language</span>
                    <kbd className="cta-kbd">Tab</kbd>
                  </button>

                  <button
                    type="button"
                    className="btn-celebration-secondary"
                    onClick={resetSession}
                    title="Retry this snippet (Ctrl+Enter)"
                  >
                    <RotateCcw size={13} />
                    <span>Retry</span>
                    <kbd className="cta-kbd">Ctrl+↵</kbd>
                  </button>
                </div>

                {/* Irresistible Save Score / Login Banner */}
                <div className="celebration-login-nudge">
                  <span className="login-nudge-text">
                    Want to save your {metrics.wpm} WPM run & climb the leaderboard?
                  </span>
                  <button
                    type="button"
                    className="celebration-link-login"
                    onClick={() => onNavigate && onNavigate('login')}
                  >
                    <span>Login to Save</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* High-Impact Social Proof & Login Conversion Dock */}
      <div className="hero-conversion-dock">
        {/* Left: Community Proof & Speed Gains */}
        <div className="conversion-social-proof">
          <div className="social-avatar-cluster" aria-hidden="true">
            <span className="avatar-chip avatar-1">👩‍💻</span>
            <span className="avatar-chip avatar-2">👨‍💻</span>
            <span className="avatar-chip avatar-3">🧑‍💻</span>
            <span className="avatar-chip avatar-plus">+14k</span>
          </div>
          <div className="social-proof-text">
            <div className="social-stars-row">
              <span className="stars-glow">★★★★★</span>
              <span className="stars-rating-num">4.9/5</span>
              <span className="stars-sub">• 14,000+ developers</span>
            </div>
            <p className="social-proof-desc">
              Average speed gain: <strong className="text-emerald">+28 WPM</strong> in 30 days
            </p>
          </div>
        </div>

        {/* Center Divider */}
        <div className="conversion-dock-divider" aria-hidden="true" />

        {/* Right: Irresistible Login / Sign Up Call To Action */}
        <div className="conversion-action-block">
          <div className="conversion-benefit-tags">
            <span className="benefit-tag">
              <Trophy size={12} className="benefit-icon text-amber" />
              <span>Leaderboards</span>
            </span>
            <span className="benefit-tag">
              <TrendingUp size={12} className="benefit-icon text-cyan" />
              <span>Speed Analytics</span>
            </span>
            <span className="benefit-tag">
              <ShieldCheck size={12} className="benefit-icon text-emerald" />
              <span>Free Forever</span>
            </span>
          </div>
          <div className="conversion-buttons-row">
            <button
              type="button"
              className="btn-dock-login"
              onClick={() => onNavigate && onNavigate('login')}
              title="Sign in to save your typing sessions"
            >
              <span>Login to Save Stats</span>
              <ArrowRight size={14} className="btn-dock-arrow" />
            </button>
            <button
              type="button"
              className="btn-dock-signup"
              onClick={() => onNavigate && onNavigate('signup')}
              title="Create free developer account"
            >
              <Sparkles size={13} />
              <span>Create Free Account</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
