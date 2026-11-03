import React from 'react';

// Standard 60% Keyboard Layout Rows
const KEYBOARD_ROWS = [
  [
    { key: '`', shift: '~', width: 1 },
    { key: '1', shift: '!', width: 1 },
    { key: '2', shift: '@', width: 1 },
    { key: '3', shift: '#', width: 1 },
    { key: '4', shift: '$', width: 1 },
    { key: '5', shift: '%', width: 1 },
    { key: '6', shift: '^', width: 1 },
    { key: '7', shift: '&', width: 1 },
    { key: '8', shift: '*', width: 1 },
    { key: '9', shift: '(', width: 1 },
    { key: '0', shift: ')', width: 1 },
    { key: '-', shift: '_', width: 1 },
    { key: '=', shift: '+', width: 1 },
    { key: 'Backspace', display: '⌫', width: 2 }
  ],
  [
    { key: 'Tab', display: 'Tab', width: 1.5 },
    { key: 'q', shift: 'Q', width: 1 },
    { key: 'w', shift: 'W', width: 1 },
    { key: 'e', shift: 'E', width: 1 },
    { key: 'r', shift: 'R', width: 1 },
    { key: 't', shift: 'T', width: 1 },
    { key: 'y', shift: 'Y', width: 1 },
    { key: 'u', shift: 'U', width: 1 },
    { key: 'i', shift: 'I', width: 1 },
    { key: 'o', shift: 'O', width: 1 },
    { key: 'p', shift: 'P', width: 1 },
    { key: '[', shift: '{', width: 1 },
    { key: ']', shift: '}', width: 1 },
    { key: '\\', shift: '|', width: 1.5 }
  ],
  [
    { key: 'CapsLock', display: 'Caps', width: 1.75 },
    { key: 'a', shift: 'A', width: 1, home: true },
    { key: 's', shift: 'S', width: 1, home: true },
    { key: 'd', shift: 'D', width: 1, home: true },
    { key: 'f', shift: 'F', width: 1, home: true, bump: true },
    { key: 'g', shift: 'G', width: 1 },
    { key: 'h', shift: 'H', width: 1 },
    { key: 'j', shift: 'J', width: 1, home: true, bump: true },
    { key: 'k', shift: 'K', width: 1, home: true },
    { key: 'l', shift: 'L', width: 1, home: true },
    { key: ';', shift: ':', width: 1, home: true },
    { key: "'", shift: '"', width: 1 },
    { key: 'Enter', display: 'Enter ↵', width: 2.25 }
  ],
  [
    { key: 'Shift', display: 'Shift', width: 2.25 },
    { key: 'z', shift: 'Z', width: 1 },
    { key: 'x', shift: 'X', width: 1 },
    { key: 'c', shift: 'C', width: 1 },
    { key: 'v', shift: 'V', width: 1 },
    { key: 'b', shift: 'B', width: 1 },
    { key: 'n', shift: 'N', width: 1 },
    { key: 'm', shift: 'M', width: 1 },
    { key: ',', shift: '<', width: 1 },
    { key: '.', shift: '>', width: 1 },
    { key: '/', shift: '?', width: 1 },
    { key: 'Shift', display: 'Shift', width: 2.75 }
  ],
  [
    { key: 'Control', display: 'Ctrl', width: 1.5 },
    { key: 'Alt', display: 'Alt', width: 1.25 },
    { key: ' ', display: 'Space', width: 7.25 },
    { key: 'Alt', display: 'Alt', width: 1.25 },
    { key: 'Control', display: 'Ctrl', width: 1.5 }
  ]
];

export function VirtualKeyboard({
  activeKey = null,
  nextExpectedChar = null,
  lastMatchState = null // 'correct' | 'wrong' | null
}) {
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
    if (keyDef.key === nextExpectedChar || keyDef.shift === nextExpectedChar) return true;
    if (keyDef.key.toLowerCase() === nextExpectedChar.toLowerCase()) return true;
    return false;
  };

  return (
    <div
      className="virtual-keyboard-container"
      style={{
        margin: '1.25rem auto 0',
        padding: '0.85rem 1rem',
        backgroundColor: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        maxWidth: '820px',
        boxShadow: 'var(--shadow-sm)',
        userSelect: 'none',
        transition: 'all 200ms ease'
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {KEYBOARD_ROWS.map((row, rowIndex) => (
          <div
            key={rowIndex}
            style={{
              display: 'flex',
              gap: '6px',
              justifyContent: 'center',
              width: '100%'
            }}
          >
            {row.map((k, colIndex) => {
              const active = isKeyActive(k);
              const next = isNextExpected(k);

              let keyBg = 'var(--color-bg-soft)';
              let keyBorder = 'var(--color-border-subtle)';
              let keyColor = 'var(--color-text-main)';
              let transform = 'translateY(0)';
              let boxShadow = '0 2px 0 var(--color-border)';

              if (active) {
                transform = 'translateY(2px)';
                boxShadow = 'none';
                if (lastMatchState === 'correct') {
                  keyBg = 'var(--color-primary-forest)';
                  keyColor = '#FFFFFF';
                  keyBorder = 'var(--color-primary-forest)';
                } else if (lastMatchState === 'wrong') {
                  keyBg = 'var(--color-error)';
                  keyColor = '#FFFFFF';
                  keyBorder = 'var(--color-error)';
                } else {
                  keyBg = 'var(--color-primary-sage)';
                  keyColor = '#FFFFFF';
                }
              } else if (next) {
                keyBorder = '2px solid var(--color-primary-forest)';
                keyBg = 'var(--color-primary-light)';
              }

              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  style={{
                    flex: k.width,
                    minWidth: `${k.width * 28}px`,
                    height: '38px',
                    backgroundColor: keyBg,
                    border: active ? `1px solid ${keyBorder}` : (next ? keyBorder : `1px solid ${keyBorder}`),
                    borderRadius: '6px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: k.display ? '0.75rem' : '0.85rem',
                    fontWeight: active || next ? 700 : 500,
                    color: keyColor,
                    transform,
                    boxShadow,
                    transition: 'all 70ms cubic-bezier(0.2, 0.8, 0.2, 1)',
                    position: 'relative'
                  }}
                >
                  {k.shift && (
                    <span
                      style={{
                        fontSize: '0.65rem',
                        lineHeight: 1,
                        opacity: 0.65,
                        marginBottom: '1px'
                      }}
                    >
                      {k.shift}
                    </span>
                  )}
                  <span style={{ lineHeight: 1 }}>{k.display || k.key}</span>
                  {k.bump && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '3px',
                        width: '8px',
                        height: '2px',
                        backgroundColor: active ? '#FFFFFF' : 'var(--color-text-muted)',
                        borderRadius: '1px',
                        opacity: 0.7
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '0.65rem',
          paddingTop: '0.5rem',
          borderTop: '1px solid var(--color-border-subtle)',
          fontSize: '0.75rem',
          color: 'var(--color-text-muted)'
        }}
      >
        <span>Guide: Home-row bumps on <strong style={{ color: 'var(--color-primary-forest)' }}>F</strong> & <strong style={{ color: 'var(--color-primary-forest)' }}>J</strong></span>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-primary-forest)' }} />
            Active
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '2px', border: '1.5px solid var(--color-primary-forest)' }} />
            Next Target
          </span>
        </div>
      </div>
    </div>
  );
}
