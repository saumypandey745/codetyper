import React, { useState, useMemo } from 'react';

// Standard 60% Keyboard Layout Rows with Finger Positions:
// lp: Left Pinky, lr: Left Ring, lm: Left Middle, li: Left Index, th: Thumb
// ri: Right Index, rm: Right Middle, rr: Right Ring, rp: Right Pinky
const KEYBOARD_ROWS = [
  [
    { key: '`', shift: '~', width: 1, finger: 'lp' },
    { key: '1', shift: '!', width: 1, finger: 'lp' },
    { key: '2', shift: '@', width: 1, finger: 'lr' },
    { key: '3', shift: '#', width: 1, finger: 'lm' },
    { key: '4', shift: '$', width: 1, finger: 'li' },
    { key: '5', shift: '%', width: 1, finger: 'li' },
    { key: '6', shift: '^', width: 1, finger: 'ri' },
    { key: '7', shift: '&', width: 1, finger: 'ri' },
    { key: '8', shift: '*', width: 1, finger: 'rm' },
    { key: '9', shift: '(', width: 1, finger: 'rr' },
    { key: '0', shift: ')', width: 1, finger: 'rp' },
    { key: '-', shift: '_', width: 1, finger: 'rp' },
    { key: '=', shift: '+', width: 1, finger: 'rp' },
    { key: 'Backspace', display: '⌫', width: 1.85, isMod: true, finger: 'rp' }
  ],
  [
    { key: 'Tab', display: 'Tab', width: 1.4, isMod: true, finger: 'lp' },
    { key: 'q', shift: 'Q', width: 1, finger: 'lp' },
    { key: 'w', shift: 'W', width: 1, finger: 'lr' },
    { key: 'e', shift: 'E', width: 1, finger: 'lm' },
    { key: 'r', shift: 'R', width: 1, finger: 'li' },
    { key: 't', shift: 'T', width: 1, finger: 'li' },
    { key: 'y', shift: 'Y', width: 1, finger: 'ri' },
    { key: 'u', shift: 'U', width: 1, finger: 'ri' },
    { key: 'i', shift: 'I', width: 1, finger: 'rm' },
    { key: 'o', shift: 'O', width: 1, finger: 'rr' },
    { key: 'p', shift: 'P', width: 1, finger: 'rp' },
    { key: '[', shift: '{', width: 1, finger: 'rp' },
    { key: ']', shift: '}', width: 1, finger: 'rp' },
    { key: '\\', shift: '|', width: 1.4, isMod: true, finger: 'rp' }
  ],
  [
    { key: 'CapsLock', display: 'Caps', width: 1.65, isMod: true, finger: 'lp' },
    { key: 'a', shift: 'A', width: 1, home: true, finger: 'lp' },
    { key: 's', shift: 'S', width: 1, home: true, finger: 'lr' },
    { key: 'd', shift: 'D', width: 1, home: true, finger: 'lm' },
    { key: 'f', shift: 'F', width: 1, home: true, bump: true, finger: 'li' },
    { key: 'g', shift: 'G', width: 1, finger: 'li' },
    { key: 'h', shift: 'H', width: 1, finger: 'ri' },
    { key: 'j', shift: 'J', width: 1, home: true, bump: true, finger: 'ri' },
    { key: 'k', shift: 'K', width: 1, home: true, finger: 'rm' },
    { key: 'l', shift: 'L', width: 1, home: true, finger: 'rr' },
    { key: ';', shift: ':', width: 1, home: true, finger: 'rp' },
    { key: "'", shift: '"', width: 1, finger: 'rp' },
    { key: 'Enter', display: 'Enter ↵', width: 2.15, isMod: true, finger: 'rp' }
  ],
  [
    { key: 'Shift', display: 'Shift', width: 2.1, isMod: true, side: 'left', finger: 'lp' },
    { key: 'z', shift: 'Z', width: 1, finger: 'lp' },
    { key: 'x', shift: 'X', width: 1, finger: 'lr' },
    { key: 'c', shift: 'C', width: 1, finger: 'lm' },
    { key: 'v', shift: 'V', width: 1, finger: 'li' },
    { key: 'b', shift: 'B', width: 1, finger: 'li' },
    { key: 'n', shift: 'N', width: 1, finger: 'ri' },
    { key: 'm', shift: 'M', width: 1, finger: 'ri' },
    { key: ',', shift: '<', width: 1, finger: 'rm' },
    { key: '.', shift: '>', width: 1, finger: 'rr' },
    { key: '/', shift: '?', width: 1, finger: 'rp' },
    { key: 'Shift', display: 'Shift', width: 2.7, isMod: true, side: 'right', finger: 'rp' }
  ],
  [
    { key: 'Control', display: 'Ctrl', width: 1.5, isMod: true, finger: 'lp' },
    { key: 'Alt', display: 'Alt', width: 1.35, isMod: true, finger: 'th' },
    { key: ' ', display: 'Space', width: 9.1, isMod: true, finger: 'th' },
    { key: 'Alt', display: 'Alt', width: 1.35, isMod: true, finger: 'th' },
    { key: 'Control', display: 'Ctrl', width: 1.5, isMod: true, finger: 'rp' }
  ]
];

// Touch-typing finger color accents
const FINGER_COLORS = {
  lp: '#A78BFA', // Left Pinky (Purple)
  lr: '#60A5FA', // Left Ring (Blue)
  lm: '#34D399', // Left Middle (Emerald)
  li: '#FBBF24', // Left Index (Amber)
  th: '#94A3B8', // Thumb (Slate)
  ri: '#FBBF24', // Right Index (Amber)
  rm: '#34D399', // Right Middle (Emerald)
  rr: '#60A5FA', // Right Ring (Blue)
  rp: '#A78BFA'  // Right Pinky (Purple)
};

export function VirtualKeyboard({
  activeKey = null,
  nextExpectedChar = null,
  lastMatchState = null // 'correct' | 'wrong' | null
}) {
  // Keyboard size mode: 'compact' (default space-saving) | 'comfort' (standard)
  const [sizeMode, setSizeMode] = useState(() => {
    try {
      return localStorage.getItem('codetyper_kb_size') || 'compact';
    } catch {
      return 'compact';
    }
  });

  // Toggle finger color indicators
  const [showFingers, setShowFingers] = useState(() => {
    try {
      return localStorage.getItem('codetyper_kb_fingers') === 'true';
    } catch {
      return false;
    }
  });

  const toggleSize = () => {
    const next = sizeMode === 'compact' ? 'comfort' : 'compact';
    setSizeMode(next);
    try {
      localStorage.setItem('codetyper_kb_size', next);
    } catch {}
  };

  const toggleFingers = () => {
    setShowFingers((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('codetyper_kb_fingers', String(next));
      } catch {}
      return next;
    });
  };

  const isShiftNeeded = useMemo(() => {
    if (!nextExpectedChar) return false;
    const isUpper = nextExpectedChar >= 'A' && nextExpectedChar <= 'Z';
    const shiftChars = '~!@#$%^&*()_+{}|:"<>?';
    return isUpper || shiftChars.includes(nextExpectedChar);
  }, [nextExpectedChar]);

  const isKeyActive = (keyDef) => {
    if (!activeKey) return false;
    const pressed = activeKey.toLowerCase();
    if (keyDef.key.toLowerCase() === pressed) return true;
    if (keyDef.shift && keyDef.shift.toLowerCase() === pressed) return true;
    if (keyDef.key === ' ' && (pressed === ' ' || pressed === 'space')) return true;
    return false;
  };

  const isNextExpected = (keyDef) => {
    if (!nextExpectedChar) return false;
    if (nextExpectedChar === '\n' && keyDef.key === 'Enter') return true;
    if (nextExpectedChar === ' ' && keyDef.key === ' ') return true;
    if (nextExpectedChar === '\t' && keyDef.key === 'Tab') return true;
    if (keyDef.key === nextExpectedChar || keyDef.shift === nextExpectedChar) return true;
    if (keyDef.key.toLowerCase() === nextExpectedChar.toLowerCase()) return true;
    return false;
  };

  return (
    <div
      className={`virtual-keyboard-container ${sizeMode}`}
      aria-label="Interactive Virtual Keyboard"
    >
      <div className="keyboard-rows-wrapper">
        {KEYBOARD_ROWS.map((row, rowIndex) => (
          <div key={rowIndex} className="keyboard-row">
            {row.map((k, colIndex) => {
              const active = isKeyActive(k);
              const next = isNextExpected(k);
              const shiftHint = isShiftNeeded && k.key === 'Shift';
              const hitState = active
                ? (lastMatchState === 'correct' ? 'hit-correct' : lastMatchState === 'wrong' ? 'hit-wrong' : 'hit-active')
                : '';

              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`keyboard-key ${k.isMod ? 'is-modifier' : ''} ${active ? `active-key ${hitState}` : ''} ${next ? 'next-key' : ''} ${shiftHint ? 'shift-hint' : ''}`}
                  style={{
                    flex: `${k.width} 1 0%`,
                    minWidth: 0
                  }}
                  title={k.shift ? `${k.key.toUpperCase()} (Shift: ${k.shift})` : k.display || k.key}
                >
                  {/* Subtle top indicator for finger zone (if enabled) */}
                  {showFingers && k.finger && (
                    <span
                      className="keyboard-finger-indicator"
                      style={{ backgroundColor: FINGER_COLORS[k.finger] || '#94A3B8' }}
                    />
                  )}

                  {/* Shift secondary symbol */}
                  {k.shift && (
                    <span className="keyboard-key-shift">
                      {k.shift}
                    </span>
                  )}

                  {/* Main Key Display */}
                  <span className="keyboard-key-main">
                    {k.display || k.key.toUpperCase()}
                  </span>

                  {/* Tactile home-row bumps on F & J */}
                  {k.bump && <div className="keyboard-home-bump" />}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Slim Space-Saving Legend & Size Switcher */}
      <div className="keyboard-compact-footer">
        <div className="footer-left">
          <span>Home-row: <strong>F</strong> & <strong>J</strong></span>
          {showFingers && (
            <span style={{ opacity: 0.85 }}>• Color-coded fingers active</span>
          )}
        </div>

        <div className="footer-right">
          <span className="keyboard-legend-item">
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: 'var(--color-primary-forest)', display: 'inline-block' }} />
            <span>Active</span>
          </span>
          <span className="keyboard-legend-item">
            <span style={{ width: '7px', height: '7px', borderRadius: '2px', border: '1.5px solid var(--color-primary-forest)', display: 'inline-block' }} />
            <span>Target</span>
          </span>

          {/* Toggle Finger Guides */}
          <button
            type="button"
            className="keyboard-size-toggle"
            onClick={toggleFingers}
            title={showFingers ? 'Hide finger zone colors' : 'Show finger zone colors on keys'}
          >
            {showFingers ? '🖐️ Colors On' : '🖐️ Fingers'}
          </button>

          {/* Size Mode Toggle */}
          <button
            type="button"
            className="keyboard-size-toggle"
            onClick={toggleSize}
            title={sizeMode === 'compact' ? 'Switch to comfortable size' : 'Switch to ultra-compact size'}
          >
            {sizeMode === 'compact' ? '🗖 Comfort' : '🗗 Compact'}
          </button>
        </div>
      </div>
    </div>
  );
}
