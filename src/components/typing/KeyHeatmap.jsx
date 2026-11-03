import React, { useState, useEffect } from 'react';
import { keyStatsManager } from '../../utils/gamificationEngine.js';
import { RotateCcw } from 'lucide-react';

const HEATMAP_ROWS = [
  ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'"],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'],
  [' ']
];

export function KeyHeatmap() {
  const [stats, setStats] = useState({});
  const [hoveredKey, setHoveredKey] = useState(null);

  const loadStats = () => {
    setStats(keyStatsManager.getStats());
  };

  useEffect(() => {
    loadStats();
  }, []);

  const clearHeatmap = () => {
    if (window.confirm('Reset all keystroke heatmap accuracy stats?')) {
      localStorage.removeItem('codetyper_key_heatmap');
      setStats({});
    }
  };

  const getKeyInfo = (k) => {
    const cleanKey = k.toLowerCase();
    const data = stats[cleanKey];
    if (!data || data.total === 0) return { total: 0, errors: 0, accuracy: null };
    const correct = data.total - data.errors;
    const accuracy = Math.round((correct / data.total) * 100);
    return { total: data.total, errors: data.errors, accuracy };
  };

  const getKeyColor = (accuracy) => {
    if (accuracy === null) return 'var(--color-bg-soft)';
    if (accuracy >= 98) return 'rgba(47, 107, 82, 0.85)'; // Forest Green
    if (accuracy >= 94) return 'rgba(92, 143, 114, 0.75)'; // Sage Green
    if (accuracy >= 88) return 'rgba(217, 158, 62, 0.75)'; // Amber/Gold
    return 'rgba(217, 83, 79, 0.8)'; // Red
  };

  return (
    <div className="card" style={{ padding: '1.5rem', marginTop: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '0.25rem' }}>Keystroke Accuracy Heatmap</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
            Hover over any key to inspect your real-world typing accuracy and error count.
          </p>
        </div>
        <button
          className="btn btn-outline btn-sm"
          onClick={clearHeatmap}
          title="Reset heatmap data"
        >
          <RotateCcw size={14} />
          <span>Reset Heatmap</span>
        </button>
      </div>

      {/* Heatmap Legend */}
      <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '1.25rem', fontSize: '0.78rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: 'rgba(47, 107, 82, 0.85)' }} />
          <span>98% - 100% (Mastery)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: 'rgba(92, 143, 114, 0.75)' }} />
          <span>94% - 97% (Fluent)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: 'rgba(217, 158, 62, 0.75)' }} />
          <span>88% - 93% (Practice Needed)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: 'rgba(217, 83, 79, 0.8)' }} />
          <span>&lt; 88% (High Error Rate)</span>
        </div>
      </div>

      {/* Keyboard Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '780px', margin: '0 auto' }}>
        {HEATMAP_ROWS.map((row, rIdx) => (
          <div key={rIdx} style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
            {row.map((k) => {
              const info = getKeyInfo(k);
              const color = getKeyColor(info.accuracy);
              const isSpace = k === ' ';
              const isDarkColor = info.accuracy !== null;

              return (
                <div
                  key={k}
                  onMouseEnter={() => setHoveredKey({ key: isSpace ? 'Space' : k, ...info })}
                  onMouseLeave={() => setHoveredKey(null)}
                  style={{
                    flex: isSpace ? 6 : 1,
                    minWidth: isSpace ? '160px' : '36px',
                    height: '42px',
                    backgroundColor: color,
                    color: isDarkColor ? '#FFFFFF' : 'var(--color-text-main)',
                    border: '1px solid var(--color-border-subtle)',
                    borderRadius: '6px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: isSpace ? '0.8rem' : '0.85rem',
                    fontWeight: 600,
                    transition: 'all 120ms ease',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <span>{isSpace ? 'Space' : k.toUpperCase()}</span>
                  {info.accuracy !== null && !isSpace && (
                    <span style={{ fontSize: '0.62rem', opacity: 0.9 }}>
                      {info.accuracy}%
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Hover Info Tooltip */}
      <div
        style={{
          marginTop: '1.25rem',
          padding: '0.75rem 1rem',
          backgroundColor: 'var(--color-bg-soft)',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.875rem',
          minHeight: '44px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-text-primary)'
        }}
      >
        {hoveredKey ? (
          <div>
            <strong>Key "{hoveredKey.key.toUpperCase()}":</strong>{' '}
            {hoveredKey.total > 0 ? (
              <span>
                Typed <strong>{hoveredKey.total}</strong> times • Accuracy:{' '}
                <strong style={{ color: hoveredKey.accuracy >= 95 ? 'var(--color-primary-forest)' : 'var(--color-warning)' }}>
                  {hoveredKey.accuracy}%
                </strong>{' '}
                ({hoveredKey.errors} errors)
              </span>
            ) : (
              <span style={{ color: 'var(--color-text-muted)' }}>No keystroke telemetry recorded yet for this key.</span>
            )}
          </div>
        ) : (
          <span style={{ color: 'var(--color-text-muted)' }}>Hover over a key above to view keystroke error breakdown.</span>
        )}
      </div>
    </div>
  );
}

