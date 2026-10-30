import React, { useRef, useEffect, useState, useMemo } from 'react';
import { RotateCcw, Volume2, VolumeX, Clock, Award, AlertCircle, Play } from 'lucide-react';
import { useTypingEngine } from '../../hooks/useTypingEngine.js';
import { useSettings } from '../../context/SettingsContext.jsx';
import { formatTimer } from '../../utils/wpmCalculator.js';

export function TypingEngine({
  targetText = '',
  title = '',
  language = 'English',
  difficulty = 'intermediate',
  isCode = false,
  mode = 'time',
  duration = 60,
  onComplete
}) {
  const { settings, updateSetting } = useSettings();
  const viewportRef = useRef(null);
  const activeCharRef = useRef(null);
  const [isFocused, setIsFocused] = useState(true);

  const {
    status,
    countdown,
    typedText,
    cursorIndex,
    remainingSeconds,
    liveMetrics,
    handleKeyDown,
    startTyping,
    resetEngine
  } = useTypingEngine({
    targetText,
    mode,
    duration,
    countdownEnabled: settings.countdown_enabled,
    onComplete
  });

  // Focus viewport on load
  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.focus();
    }
  }, [targetText]);

  // Keep cursor in view with smooth scrolling
  useEffect(() => {
    if (activeCharRef.current && viewportRef.current && settings.smooth_scrolling) {
      activeCharRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
      });
    }
  }, [cursorIndex, settings.smooth_scrolling]);

  // Split target text by lines for line numbers if code
  const lines = useMemo(() => {
    return targetText.split('\n');
  }, [targetText]);

  // Render character tokens
  const renderCharacters = () => {
    const tokens = [];
    for (let i = 0; i < targetText.length; i++) {
      const char = targetText[i];
      let state = 'pending';
      let isCurrent = i === cursorIndex;

      if (i < typedText.length) {
        state = typedText[i] === char ? 'correct' : 'wrong';
      }

      // Display newline or space visibility
      let displayChar = char;
      if (char === '\n') {
        displayChar = '↵\n';
      }

      tokens.push(
        <span
          key={i}
          ref={isCurrent ? activeCharRef : null}
          className={`char-token ${state} ${isCurrent ? 'current' : ''}`}
          style={{ position: 'relative' }}
        >
          {isCurrent && (status === 'typing' || status === 'idle') && (
            <span
              className={`typing-caret caret-${settings.cursor_style || 'line'}`}
              aria-hidden="true"
            />
          )}
          {displayChar}
        </span>
      );
    }
    return tokens;
  };

  const progressPercent = targetText.length > 0
    ? Math.min(100, Math.round((typedText.length / targetText.length) * 100))
    : 0;

  return (
    <div className="typing-container">
      {/* HUD & Stats Bar */}
      <div className="typing-hud">
        <div className="hud-stat-group">
          {settings.show_wpm && (
            <div className="hud-stat-item">
              <span className="hud-stat-label">WPM</span>
              <span className="hud-stat-value highlight">{liveMetrics.netWpm}</span>
            </div>
          )}

          {settings.show_accuracy && (
            <div className="hud-stat-item">
              <span className="hud-stat-label">Accuracy</span>
              <span className="hud-stat-value">{liveMetrics.accuracy}%</span>
            </div>
          )}

          {settings.show_errors && (
            <div className="hud-stat-item">
              <span className="hud-stat-label">Errors</span>
              <span className="hud-stat-value" style={{ color: liveMetrics.errorCount > 0 ? 'var(--color-error)' : 'inherit' }}>
                {liveMetrics.errorCount}
              </span>
            </div>
          )}

          <div className="hud-stat-item">
            <span className="hud-stat-label">Progress</span>
            <span className="hud-stat-value">{progressPercent}%</span>
          </div>
        </div>

        <div className="hud-controls">
          {mode === 'time' && (
            <div className="timer-pill">
              <Clock size={16} />
              <span>{formatTimer(remainingSeconds)}</span>
            </div>
          )}

          <button
            className="btn btn-outline btn-sm"
            onClick={() => updateSetting('sound_enabled', !settings.sound_enabled)}
            title={settings.sound_enabled ? 'Mute sound effects' : 'Enable sound effects'}
            aria-label="Toggle sound"
          >
            {settings.sound_enabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          <button
            className="btn btn-secondary btn-sm"
            onClick={resetEngine}
            title="Restart session (Ctrl + Enter)"
            aria-label="Restart typing session"
          >
            <RotateCcw size={16} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Target Info Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 0.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span className="badge badge-sage">{language}</span>
          <span className="badge badge-forest">{difficulty}</span>
          <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>{title}</span>
        </div>
        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
          {typedText.length} / {targetText.length} characters
        </span>
      </div>

      {/* Main Interactive Typing Viewport */}
      <div
        ref={viewportRef}
        className={`typing-viewport ${isFocused ? 'focused' : ''}`}
        tabIndex={0}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onKeyDown={handleKeyDown}
        role="textbox"
        aria-label="Typing practice input field"
        style={{
          fontFamily: isCode ? 'var(--font-mono)' : (settings.font_family === 'inter' ? 'var(--font-ui)' : 'var(--font-mono)'),
          fontSize: settings.font_size === 'large' ? '1.3rem' : settings.font_size === 'small' ? '1.05rem' : '1.18rem'
        }}
      >
        {/* Countdown Overlay */}
        {status === 'countdown' && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'var(--color-bg-overlay)',
              backdropFilter: 'blur(3px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 20,
              borderRadius: 'var(--radius-xl)'
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '5rem',
                fontWeight: 800,
                color: '#FFFFFF'
              }}
            >
              {countdown}
            </span>
            <p style={{ color: '#E8EFE9', fontSize: '1.1rem' }}>Get ready to type...</p>
          </div>
        )}

        {/* Start Overlay if Idle */}
        {status === 'idle' && (
          <div
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.35rem 0.75rem',
              backgroundColor: 'var(--color-primary-light)',
              borderRadius: 'var(--radius-full)',
              color: 'var(--color-primary-forest)',
              fontSize: '0.8rem',
              fontWeight: 600,
              pointerEvents: 'none'
            }}
          >
            <Play size={12} fill="currentColor" />
            <span>Type any key to begin</span>
          </div>
        )}

        {/* Typing Content */}
        <div className={isCode ? 'code-mode-container' : ''}>
          {isCode && (
            <div className="code-line-numbers" aria-hidden="true">
              {lines.map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
          )}

          <div className={`typing-text-content ${!isCode && settings.font_family === 'inter' ? 'english-font' : ''}`}>
            {renderCharacters()}
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Hint Bar */}
      <div className="typing-shortcuts-bar">
        <span className="shortcut-pill">
          <kbd>Ctrl</kbd> + <kbd>Enter</kbd> Restart
        </span>
        <span className="shortcut-pill">
          <kbd>Esc</kbd> Pause
        </span>
        <span className="shortcut-pill">
          <kbd>Tab</kbd> Indent
        </span>
        {!isFocused && (
          <span style={{ color: 'var(--color-warning)', fontWeight: 500 }}>
            Click inside box or press any key to focus
          </span>
        )}
      </div>
    </div>
  );
}
