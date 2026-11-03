import React, { useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { RotateCcw, ArrowRight, BarChart2, Home, CheckCircle2, Award, Zap, Sparkles } from 'lucide-react';
import { formatDuration } from '../../utils/wpmCalculator.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { computeSessionXp, calculateLevelFromXp } from '../../utils/gamificationEngine.js';

export function ResultsCard({
  result,
  onTryAgain,
  onNextPractice,
  onNavigate
}) {
  const { userStats } = useAuth();

  const earnedXp = useMemo(() => {
    return computeSessionXp({
      correctCharacters: result.correctCharacters || 0,
      netWpm: result.netWpm || 0,
      accuracy: result.accuracy || 0,
      durationSeconds: result.durationSeconds || 0,
      isZen: !!result.isZen
    });
  }, [result]);

  useEffect(() => {
    // Peaceful celebration burst
    try {
      confetti({
        particleCount: 65,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#2F6B52', '#8FAF9A', '#DDEBDD', '#FAF8F1']
      });

      // Update local gamification XP and unlock badges
      const storedXp = parseInt(localStorage.getItem('codetyper_total_xp') || '0', 10);
      const newTotalXp = storedXp + earnedXp;
      localStorage.setItem('codetyper_total_xp', newTotalXp.toString());

      const rawBadges = localStorage.getItem('codetyper_unlocked_badges');
      const unlocked = rawBadges ? JSON.parse(rawBadges) : [];
      const updatedBadges = [...unlocked];

      if (!updatedBadges.includes('first_keystroke')) updatedBadges.push('first_keystroke');
      if (result.netWpm >= 60 && !updatedBadges.includes('speed_demon_60')) updatedBadges.push('speed_demon_60');
      if (result.netWpm >= 80 && !updatedBadges.includes('speed_demon_80')) updatedBadges.push('speed_demon_80');
      if (result.netWpm >= 100 && !updatedBadges.includes('century_club')) updatedBadges.push('century_club');
      if (result.netWpm >= 120 && !updatedBadges.includes('hypersonic_120')) updatedBadges.push('hypersonic_120');
      if (result.accuracy === 100 && result.totalCharacters >= 150 && !updatedBadges.includes('flawless_accuracy')) updatedBadges.push('flawless_accuracy');
      if (result.isZen && !updatedBadges.includes('zen_master')) updatedBadges.push('zen_master');

      localStorage.setItem('codetyper_unlocked_badges', JSON.stringify(updatedBadges));
    } catch (e) {}
  }, [earnedXp, result]);

  const bestWpm = userStats?.best_wpm || result.netWpm;
  const avgWpm = userStats?.avg_wpm || result.netWpm;
  const isPersonalBest = result.netWpm >= bestWpm && bestWpm > 0;

  return (
    <div className="results-card">
      <div className="results-header">
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <CheckCircle2 size={24} color="var(--color-primary-forest)" />
          <span className="badge badge-sage">
            {result.lessonNumber && result.totalLessons
              ? `Lesson ${result.lessonNumber} of ${result.totalLessons} Complete`
              : 'Session Complete'}
          </span>
        </div>
        <h2 className="results-title">
          {result.isCourseComplete
            ? '🏆 Course Completed! Fantastic Job!'
            : isPersonalBest
            ? 'Outstanding! New Personal Best!'
            : 'Great Focus & Consistency!'}
        </h2>

        {/* XP Earned Tag */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', margin: '0.5rem 0 0.85rem' }}>
          <span
            className="badge badge-forest"
            style={{
              padding: '0.35rem 0.85rem',
              fontSize: '0.875rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <Sparkles size={14} />
            +{earnedXp} XP Earned
          </span>
          {result.isZen && (
            <span className="badge badge-sage" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
              🌿 Zen Focus Bonus (+20%)
            </span>
          )}
        </div>

        {/* Level Up Banner */}
        {result.levelUpInfo && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'var(--color-bg-soft)',
              padding: '0.45rem 1rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--color-primary-forest)',
              color: 'var(--color-primary-forest)',
              fontWeight: 600,
              fontSize: '0.875rem',
              margin: '0.5rem auto 0.75rem'
            }}
          >
            <Sparkles size={16} />
            <span>
              Level Up! Mastered {result.levelUpInfo.from} → Promoted to {result.levelUpInfo.to}!
            </span>
          </div>
        )}

        {/* Course Completion Banner */}
        {result.isCourseComplete && !result.levelUpInfo && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'var(--color-bg-soft)',
              padding: '0.45rem 1rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--color-primary-forest)',
              color: 'var(--color-primary-forest)',
              fontWeight: 600,
              fontSize: '0.875rem',
              margin: '0.5rem auto 0.75rem'
            }}
          >
            <Award size={18} />
            <span>All lessons completed in this curriculum!</span>
          </div>
        )}

        <p style={{ color: 'var(--color-text-secondary)', maxWidth: '520px', margin: '0 auto' }}>
          Every completed session trains neural pathways and muscle memory for faster, fatigue-free typing.
        </p>
      </div>

      {/* Main KPI Highlights */}
      <div className="results-highlight-grid">
        <div className="result-metric-card">
          <div className="result-metric-val">{result.netWpm}</div>
          <div className="result-metric-lbl">Net WPM</div>
        </div>

        <div className="result-metric-card">
          <div className="result-metric-val">{result.accuracy}%</div>
          <div className="result-metric-lbl">Accuracy</div>
        </div>

        <div className="result-metric-card">
          <div className="result-metric-val">{formatDuration(result.durationSeconds)}</div>
          <div className="result-metric-lbl">Practice Time</div>
        </div>
      </div>

      {/* Performance Comparison */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1rem',
          marginBottom: '2rem',
          padding: '1rem',
          backgroundColor: 'var(--color-bg-soft)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)'
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 600 }}>
            This Session
          </span>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-primary-forest)' }}>
            {result.netWpm} WPM
          </div>
        </div>

        <div style={{ textAlign: 'center', borderLeft: '1px solid var(--color-border)', borderRight: '1px solid var(--color-border)' }}>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 600 }}>
            Your Average
          </span>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            {avgWpm} WPM
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 600 }}>
            Your Best Record
          </span>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-primary-forest)' }}>
            {bestWpm} WPM
          </div>
        </div>
      </div>

      {/* Detailed Diagnostics Table */}
      <table className="results-breakdown-table">
        <tbody>
          <tr>
            <td>Raw (Gross) WPM</td>
            <td>{result.grossWpm} WPM</td>
          </tr>
          <tr>
            <td>Net WPM (Penalized for mistakes)</td>
            <td>{result.netWpm} WPM</td>
          </tr>
          <tr>
            <td>Accuracy Rate</td>
            <td>{result.accuracy}%</td>
          </tr>
          <tr>
            <td>Total Characters Typed</td>
            <td>{result.totalCharacters}</td>
          </tr>
          <tr>
            <td>Correct Characters</td>
            <td style={{ color: 'var(--color-primary-forest)' }}>{result.correctCharacters}</td>
          </tr>
          <tr>
            <td>Incorrect Characters</td>
            <td style={{ color: result.incorrectCharacters > 0 ? 'var(--color-error)' : 'inherit' }}>
              {result.incorrectCharacters}
            </td>
          </tr>
          <tr>
            <td>Uncorrected Mistakes / Errors</td>
            <td style={{ color: result.errorCount > 0 ? 'var(--color-error)' : 'inherit' }}>
              {result.errorCount}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Action Buttons */}
      <div className="results-actions">
        <button className="btn btn-secondary" onClick={onTryAgain}>
          <RotateCcw size={16} />
          <span>Try Again</span>
        </button>

        <button className="btn btn-primary" onClick={onNextPractice}>
          <span>
            {result.nextLesson
              ? `Next: Lesson ${result.lessonNumber + 1} (${result.nextLesson.title.length > 25 ? result.nextLesson.title.slice(0, 25) + '...' : result.nextLesson.title})`
              : 'Next Practice'}
          </span>
          <ArrowRight size={16} />
        </button>

        <button className="btn btn-outline" onClick={() => onNavigate('statistics')}>
          <BarChart2 size={16} />
          <span>View Statistics</span>
        </button>

        <button className="btn btn-ghost" onClick={() => onNavigate('dashboard')}>
          <Home size={16} />
          <span>Dashboard</span>
        </button>
      </div>
    </div>
  );
}
