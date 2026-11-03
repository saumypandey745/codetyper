import React, { useRef, useEffect, useState, useMemo } from 'react';
import {
  RotateCcw,
  Volume2,
  VolumeX,
  Clock,
  Award,
  AlertCircle,
  Play,
  Keyboard,
  Leaf,
  CloudDrizzle,
  Trees,
  Coffee,
  Disc3,
  Sliders,
  ChevronDown
} from 'lucide-react';
import { useTypingEngine } from '../../hooks/useTypingEngine.js';
import { useSettings } from '../../context/SettingsContext.jsx';
import { formatTimer } from '../../utils/wpmCalculator.js';
import { VirtualKeyboard } from './VirtualKeyboard.jsx';
import { ambientEngine } from '../../utils/ambientSoundEngine.js';

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

  // New Advanced State: Zen Mode, Virtual Keyboard, Ambient Sound
  const [isZenMode, setIsZenMode] = useState(false);
  const [showVirtualKeyboard, setShowVirtualKeyboard] = useState(false);
  const [activeAmbientTrack, setActiveAmbientTrack] = useState(null);
  const [ambientVolume, setAmbientVolume] = useState(0.4);
  const [showAmbientMenu, setShowAmbientMenu] = useState(false);

  const {
    status,
    countdown,
    typedText,
    cursorIndex,
    remainingSeconds,
    liveMetrics,
    lastPressedKey,
    lastMatchState,
    handleKeyDown: engineKeyDown,
    startTyping,
    resetEngine
  } = useTypingEngine({
    targetText,
    mode,
    duration,
    countdownEnabled: settings.countdown_enabled,
    onComplete: (results) => {
      if (ambientEngine.isPlaying) {
        ambientEngine.stop();
        setActiveAmbientTrack(null);
      }
      if (onComplete) {
        onComplete({ ...results, isZen: isZenMode });
      }
    }
  });

  // Focus viewport on load
  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.focus();
    }
  }, [targetText]);

  // Clean up ambient audio when unmounting
  useEffect(() => {
    return () => {
      ambientEngine.stop();
    };
  }, []);

  // Keyboard shortcut listener for Zen Mode (Shift + Esc)
  const handleKeyDown = (e) => {
    if (e.shiftKey && e.key === 'Escape') {
      e.preventDefault();
      setIsZenMode((z) => !z);
      return;
    }
    if (e.key === 'Escape' && isZenMode) {
      e.preventDefault();
      setIsZenMode(false);
      return;
    }
    engineKeyDown(e);
  };

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

  // Handle ambient track toggle
  const toggleAmbientTrack = (trackId) => {
    if (activeAmbientTrack === trackId) {
      ambientEngine.stop();
      setActiveAmbientTrack(null);
    } else {
      ambientEngine.playTrack(trackId);
      setActiveAmbientTrack(trackId);
    }
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setAmbientVolume(val);
    ambientEngine.setVolume(val);
  };

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
    <div className={`typing-container ${isZenMode ? 'zen-mode' : ''}`}>
      {/* Floating pill when in Pure Zen Focus Mode */}
      {isZenMode && (
        <div className="zen-floating-pill">
          <Leaf size={15} style={{ color: 'var(--color-primary-forest)' }} />
          <span>Pure Zen Focus Active</span>
          <span style={{ opacity: 0.6 }}>•</span>
          <button
            onClick={() => setIsZenMode(false)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-primary-forest)',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.8rem',
              padding: 0
            }}
          >
            Exit (Esc)
          </button>
        </div>
      )}

      {/* HUD & Stats Bar (Hidden in Zen Mode) */}
      {!isZenMode && (
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

          <div className="hud-controls" style={{ position: 'relative' }}>
            {mode === 'time' && (
              <div className="timer-pill">
                <Clock size={16} />
                <span>{formatTimer(remainingSeconds)}</span>
              </div>
            )}

            {/* Ambient Soundscapes Popover Toggle */}
            <div style={{ position: 'relative' }}>
              <button
                className={`btn btn-sm ${activeAmbientTrack ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setShowAmbientMenu((prev) => !prev)}
                title="Ambient Soundscapes (Rain, Forest, Cafe, Vinyl)"
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <CloudDrizzle size={15} />
                <span>{activeAmbientTrack ? 'Soundscape On' : 'Ambient'}</span>
              </button>

              {/* Ambient Track Selection Dropdown Menu */}
              {showAmbientMenu && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: '240px',
                    backgroundColor: 'var(--color-bg-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.75rem',
                    boxShadow: 'var(--shadow-lg)',
                    zIndex: 100
                  }}
                >
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                    Soothing Soundscapes
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '0.75rem' }}>
                    {[
                      { id: 'rain', label: '🌧️ Gentle Rain' },
                      { id: 'forest', label: '🌲 Forest Wind' },
                      { id: 'cafe', label: '☕ Cozy Studio' },
                      { id: 'vinyl', label: '📻 Lo-Fi Vinyl' }
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => toggleAmbientTrack(t.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.45rem 0.65rem',
                          borderRadius: '6px',
                          border: 'none',
                          backgroundColor: activeAmbientTrack === t.id ? 'var(--color-primary-light)' : 'transparent',
                          color: activeAmbientTrack === t.id ? 'var(--color-primary-forest)' : 'var(--color-text-main)',
                          fontWeight: activeAmbientTrack === t.id ? 700 : 500,
                          fontSize: '0.825rem',
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                      >
                        <span>{t.label}</span>
                        {activeAmbientTrack === t.id && (
                          <span style={{ fontSize: '0.7rem', color: 'var(--color-primary-forest)' }}>Playing</span>
                        )}
                      </button>
                    ))}
                  </div>

                  {activeAmbientTrack && (
                    <div style={{ borderTop: '1px solid var(--color-border-subtle)', paddingTop: '0.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--color-text-muted)', marginBottom: '0.2rem' }}>
                        <span>Volume</span>
                        <span>{Math.round(ambientVolume * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={ambientVolume}
                        onChange={handleVolumeChange}
                        style={{ width: '100%', accentColor: 'var(--color-primary-forest)' }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Virtual Keyboard Toggle */}
            <button
              className={`btn btn-sm ${showVirtualKeyboard ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setShowVirtualKeyboard((prev) => !prev)}
              title={showVirtualKeyboard ? 'Hide virtual keyboard' : 'Show live virtual keyboard'}
            >
              <Keyboard size={15} />
            </button>

            {/* Pure Zen Mode Toggle */}
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setIsZenMode(true)}
              title="Enter Pure Zen Mode (Shift + Esc)"
            >
              <Leaf size={15} />
              <span>Zen</span>
            </button>

            {/* Keypress Sound Effects Toggle */}
            <button
              className="btn btn-outline btn-sm"
              onClick={() => updateSetting('sound_enabled', !settings.sound_enabled)}
              title={settings.sound_enabled ? 'Mute mechanical key sounds' : 'Enable mechanical key sounds'}
              aria-label="Toggle sound"
            >
              {settings.sound_enabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>

            {/* Restart Session */}
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
      )}

      {/* Target Info Bar (Hidden in Zen Mode) */}
      {!isZenMode && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 0.5rem', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span className="badge badge-sage">{language}</span>
            <span className="badge badge-forest">{difficulty}</span>
            <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>{title}</span>
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
            {typedText.length} / {targetText.length} characters
          </span>
        </div>
      )}

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
        {status === 'idle' && !isZenMode && (
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
          {isCode && !isZenMode && (
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

      {/* Interactive Virtual Keyboard (Toggleable) */}
      {showVirtualKeyboard && !isZenMode && (
        <VirtualKeyboard
          activeKey={lastPressedKey}
          nextExpectedChar={targetText[cursorIndex]}
          lastMatchState={lastMatchState}
        />
      )}

      {/* Keyboard Shortcuts Hint Bar (Hidden in Zen Mode) */}
      {!isZenMode && (
        <div className="typing-shortcuts-bar">
          <span className="shortcut-pill">
            <kbd>Ctrl</kbd> + <kbd>Enter</kbd> Restart
          </span>
          <span className="shortcut-pill">
            <kbd>Shift</kbd> + <kbd>Esc</kbd> Zen Mode
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
      )}
    </div>
  );
}
