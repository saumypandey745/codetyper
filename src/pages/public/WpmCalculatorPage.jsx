import React, { useState } from 'react';
import { Calculator, ArrowRight, CheckCircle2, AlertCircle, HelpCircle, Code2, BookOpen, Timer } from 'lucide-react';
import { calculateMetrics } from '../../utils/wpmCalculator.js';

export function WpmCalculatorPage({ onNavigate }) {
  const [chars, setChars] = useState(300);
  const [seconds, setSeconds] = useState(60);
  const [errors, setErrors] = useState(2);

  // Compute live metrics using the exact production calculator engine
  const metrics = calculateMetrics({
    totalCharacters: Number(chars) || 0,
    correctCharacters: Math.max(0, (Number(chars) || 0) - (Number(errors) || 0)),
    errorCount: Number(errors) || 0,
    durationSeconds: Number(seconds) || 1
  });

  return (
    <div style={{ maxWidth: '960px', margin: '2rem auto', padding: '0 1.5rem', display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      {/* Page Header */}
      <div>
        <span className="badge badge-sage" style={{ marginBottom: '0.75rem' }}>
          <Calculator size={13} style={{ marginRight: '0.35rem' }} />
          Standardized Metrics Methodology
        </span>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--color-text-primary)' }}>
          WPM &amp; Typing Accuracy Calculator
        </h1>
        <p style={{ fontSize: '1.15rem', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
          CodeTyper computes Gross Words Per Minute (WPM), Net WPM, and Accuracy using standardized international typing benchmarks (Typing Master standard). Learn the exact mathematical formulas behind our zero-inflation typing telemetry.
        </p>
      </div>

      {/* Interactive Live Formula Sandbox */}
      <div className="card" style={{ padding: '2rem', border: '1px solid var(--color-border)' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--color-primary-forest)' }}>
          Live Interactive WPM Calculation Sandbox
        </h2>
        <p style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
          Adjust the inputs below to see how keystrokes, elapsed time, and uncorrected errors influence Gross vs. Net WPM in real-time.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              Total Typed Characters (Keystrokes):
            </label>
            <input
              type="number"
              min="0"
              max="5000"
              value={chars}
              onChange={(e) => setChars(Math.max(0, parseInt(e.target.value, 10) || 0))}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface)',
                color: 'var(--color-text)'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              Test Duration (Seconds):
            </label>
            <input
              type="number"
              min="1"
              max="600"
              value={seconds}
              onChange={(e) => setSeconds(Math.max(1, parseInt(e.target.value, 10) || 1))}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface)',
                color: 'var(--color-text)'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              Uncorrected Errors:
            </label>
            <input
              type="number"
              min="0"
              max={chars}
              value={errors}
              onChange={(e) => setErrors(Math.max(0, parseInt(e.target.value, 10) || 0))}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface)',
                color: 'var(--color-text)'
              }}
            />
          </div>
        </div>

        {/* Calculated Results Display */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '1rem',
          padding: '1.5rem',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--color-bg-subtle)',
          border: '1px solid var(--color-border)'
        }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Gross WPM</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>{metrics.grossWpm}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Raw speed without penalties</div>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Net WPM</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-primary-forest)' }}>{metrics.netWpm}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Official accredited speed</div>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Accuracy</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: metrics.accuracy >= 95 ? '#10b981' : '#f59e0b' }}>{metrics.accuracy}%</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Correct vs total keystrokes</div>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Time in Minutes</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>{(seconds / 60).toFixed(2)}m</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Elapsed normalized time</div>
          </div>
        </div>
      </div>

      {/* Production Mathematical Formulas */}
      <div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--color-text-primary)' }}>
          Exact Production Calculation Formulas
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--color-primary-forest)' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>1. The Standard 5-Character Word Rule</h3>
            <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--color-text-secondary)', marginBottom: '0.75rem' }}>
              In international typing standards, a &quot;word&quot; is standardized as <strong>5 keystrokes</strong> (including letters, spaces, punctuation, numbers, and coding symbols). This prevents bias between typing short words (&quot;in&quot;, &quot;on&quot;) and long technical words (&quot;asynchronous&quot;, &quot;addEventListener&quot;).
            </p>
            <div style={{ background: 'var(--color-surface)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>
              Total Standard Words = Total Typed Keystrokes / 5
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--color-primary-sage)' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>2. Gross WPM (Raw Velocity)</h3>
            <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--color-text-secondary)', marginBottom: '0.75rem' }}>
              Gross WPM measures raw finger speed across the keyboard, regardless of how many errors were committed during the session.
            </p>
            <div style={{ background: 'var(--color-surface)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>
              Gross WPM = (Total Typed Keystrokes / 5) / (Elapsed Seconds / 60)
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid #10b981' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>3. Net WPM (Official Typing Master Speed)</h3>
            <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--color-text-secondary)', marginBottom: '0.75rem' }}>
              Net WPM is the true industry standard metric used by employers and certification authorities. Every uncorrected mistake incurs a 1-word penalty per minute of typing. Net WPM is strictly clamped at zero and cannot become negative.
            </p>
            <div style={{ background: 'var(--color-surface)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>
              Net WPM = Math.max(0, Gross WPM - (Uncorrected Errors / Time in Minutes))
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid #f59e0b' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>4. Typing Accuracy Percentage</h3>
            <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--color-text-secondary)', marginBottom: '0.75rem' }}>
              Accuracy represents the ratio of correctly typed characters to total attempted keystrokes. Backspace corrections made during typing are handled cleanly: corrected errors do not penalize final Net WPM.
            </p>
            <div style={{ background: 'var(--color-surface)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>
              Accuracy % = (Correct Keystrokes / Total Keystrokes) * 100
            </div>
          </div>

        </div>
      </div>

      {/* Speed Benchmarks Table */}
      <div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--color-text-primary)' }}>
          Developer Typing Speed Benchmarks
        </h2>
        <div style={{ overflowX: 'auto' }}>
          <table className="comparison-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '1rem', borderBottom: '2px solid var(--color-border)' }}>Speed Tier</th>
                <th style={{ textAlign: 'left', padding: '1rem', borderBottom: '2px solid var(--color-border)' }}>Net WPM Range</th>
                <th style={{ textAlign: 'left', padding: '1rem', borderBottom: '2px solid var(--color-border)' }}>Target Accuracy</th>
                <th style={{ textAlign: 'left', padding: '1rem', borderBottom: '2px solid var(--color-border)' }}>Developer Competency</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)' }}><strong>Beginner</strong></td>
                <td style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)' }}>20 – 39 WPM</td>
                <td style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)' }}>90% +</td>
                <td style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)' }}>Searching for symbols and special characters</td>
              </tr>
              <tr>
                <td style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)' }}><strong>Fluent</strong></td>
                <td style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)' }}>40 – 59 WPM</td>
                <td style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)' }}>95% +</td>
                <td style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)' }}>Average professional typing velocity; minor stutter on brackets</td>
              </tr>
              <tr>
                <td style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)' }}><strong>Pro Developer</strong></td>
                <td style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)' }}>60 – 84 WPM</td>
                <td style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)' }}>97% +</td>
                <td style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)' }}>Strong muscle memory for coding symbols, indentation, and syntax</td>
              </tr>
              <tr>
                <td style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)' }}><strong>Elite / Grandmaster</strong></td>
                <td style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)' }}>85 – 120+ WPM</td>
                <td style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)' }}>99% +</td>
                <td style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)' }}>Top 2% velocity worldwide; effortless cadence across all 25+ stacks</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* CTA Navigation Row */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', paddingTop: '1rem' }}>
        <a
          href="/typing-test"
          className="btn-premium-hero"
          onClick={(e) => {
            if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
              e.preventDefault();
              onNavigate('/typing-test');
            }
          }}
          style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.85rem 1.75rem' }}
        >
          <span>Take 60-Second Typing Test</span>
          <ArrowRight size={18} />
        </a>

        <a
          href="/coding-typing-test"
          className="btn-glass-hero"
          onClick={(e) => {
            if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
              e.preventDefault();
              onNavigate('/coding-typing-test');
            }
          }}
          style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.85rem 1.75rem' }}
        >
          <Code2 size={18} />
          <span>Practice Code Typing</span>
        </a>
      </div>
    </div>
  );
}
