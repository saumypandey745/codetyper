import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { RotateCcw, ArrowRight, BarChart2, Home, CheckCircle2, Award, Zap, Sparkles, Lock } from 'lucide-react';
import { formatDuration, formatTwoDecimals } from '../../utils/wpmCalculator.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { computeSessionXp, calculateLevelFromXp } from '../../utils/gamificationEngine.js';
import { TypingCertificateModal } from './TypingCertificateModal.jsx';
import { checkCertificateEligibility } from '../../utils/certificateEligibility.js';

export function ResultsCard({
  result,
  onTryAgain,
  onNextPractice,
  onNavigate
}) {
  const { user, userStats } = useAuth();
  const [showCertModal, setShowCertModal] = useState(false);

  const eligibility = useMemo(() => checkCertificateEligibility(result), [result]);

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
          {eligibility.isEligible && (
            <span
              className="badge"
              style={{
                padding: '0.35rem 0.85rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                backgroundColor: 'rgba(234, 179, 8, 0.15)',
                color: '#eab308',
                border: '1px solid rgba(234, 179, 8, 0.4)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <Award size={14} />
              Accredited Certificate Unlocked ({eligibility.tierBadge})
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
          <div className="result-metric-val">{formatTwoDecimals(result.netWpm)}</div>
          <div className="result-metric-lbl">Net WPM</div>
        </div>

        <div className="result-metric-card">
          <div className="result-metric-val">{formatTwoDecimals(result.accuracy)}%</div>
          <div className="result-metric-lbl">Accuracy</div>
        </div>

        <div className="result-metric-card">
          <div className="result-metric-val">{formatDuration(result.durationSeconds)}</div>
          <div className="result-metric-lbl">Test Duration</div>
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
            {formatTwoDecimals(result.netWpm)} WPM
          </div>
        </div>

        <div style={{ textAlign: 'center', borderLeft: '1px solid var(--color-border)', borderRight: '1px solid var(--color-border)' }}>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 600 }}>
            Your Average
          </span>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            {formatTwoDecimals(avgWpm)} WPM
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 600 }}>
            Your Best Record
          </span>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-primary-forest)' }}>
            {formatTwoDecimals(bestWpm)} WPM
          </div>
        </div>
      </div>

      {/* Pro Biometrics & Ergonomics */}
      <div className="pro-metrics-grid">
        <div className="pro-metric-card">
          <div className="header">
            <span>Burst Speed</span>
            <span style={{ color: '#ef4444' }}>🔥 Peak</span>
          </div>
          <div className="value">
            {formatTwoDecimals(result.burstWpm || result.netWpm)} <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>WPM</span>
          </div>
          <div className="subtext">Highest 2-second speed spike during run</div>
        </div>

        <div className="pro-metric-card">
          <div className="header">
            <span>Consistency</span>
            <span style={{ color: 'var(--color-primary-forest)' }}>🎯 Flow</span>
          </div>
          <div className="value">
            {result.consistency !== undefined ? result.consistency : 95}%
          </div>
          <div className="subtext">Cadence stability & low pace variance</div>
        </div>

        <div className="pro-metric-card">
          <div className="header">
            <span>Hand Balance</span>
            <span>⌨️ Ergonomics</span>
          </div>
          <div className="value" style={{ fontSize: '1.2rem', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#3b82f6' }}>L: {result.handBalance ? result.handBalance.leftPercent : 50}%</span>
            <span style={{ color: '#10b981' }}>R: {result.handBalance ? result.handBalance.rightPercent : 50}%</span>
          </div>
          <div className="hand-balance-bar">
            <div
              className="hand-balance-left"
              style={{ width: `${result.handBalance ? result.handBalance.leftPercent : 50}%` }}
              title="Left Hand Key Distribution"
            />
            <div
              className="hand-balance-right"
              style={{ width: `${result.handBalance ? result.handBalance.rightPercent : 50}%` }}
              title="Right Hand Key Distribution"
            />
          </div>
        </div>
      </div>

      {/* Detailed Diagnostics Table: Typing Master Standards */}
      <table className="results-breakdown-table">
        <tbody>
          <tr>
            <td>Gross WPM</td>
            <td><strong>{formatTwoDecimals(result.grossWpm)} WPM</strong></td>
          </tr>
          <tr>
            <td>Net WPM</td>
            <td><strong>{formatTwoDecimals(result.netWpm)} WPM</strong></td>
          </tr>
          <tr>
            <td>Accuracy (%)</td>
            <td><strong>{formatTwoDecimals(result.accuracy)}%</strong></td>
          </tr>
          <tr>
            <td>Total Errors</td>
            <td style={{ color: (result.errorCount ?? result.totalErrors ?? result.incorrectCharacters) > 0 ? 'var(--color-error)' : 'inherit', fontWeight: 600 }}>
              {result.errorCount ?? result.totalErrors ?? result.incorrectCharacters ?? 0}
            </td>
          </tr>
          <tr>
            <td>Correct Characters</td>
            <td style={{ color: 'var(--color-primary-forest)', fontWeight: 600 }}>
              {result.correctCharacters ?? 0}
            </td>
          </tr>
          <tr>
            <td>Total Typed Characters</td>
            <td style={{ fontWeight: 600 }}>
              {result.totalCharacters ?? 0}
            </td>
          </tr>
          <tr>
            <td>Test Duration</td>
            <td>
              {formatDuration(result.durationSeconds)} ({formatTwoDecimals(result.durationSeconds)}s)
            </td>
          </tr>
        </tbody>
      </table>

      {/* Official Certificate Spotlight Banner */}
      <div
        style={{
          margin: '1.25rem 0',
          padding: '1.1rem 1.35rem',
          borderRadius: 'var(--radius-lg)',
          background: eligibility.isEligible
            ? 'linear-gradient(135deg, rgba(234, 179, 8, 0.16) 0%, rgba(15, 23, 42, 0.9) 100%)'
            : 'linear-gradient(135deg, rgba(56, 189, 248, 0.12) 0%, rgba(15, 23, 42, 0.85) 100%)',
          border: eligibility.isEligible
            ? '1px solid rgba(234, 179, 8, 0.5)'
            : '1px solid rgba(56, 189, 248, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap',
          boxShadow: eligibility.isEligible
            ? '0 8px 24px rgba(234, 179, 8, 0.2)'
            : '0 4px 16px rgba(0, 0, 0, 0.3)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              background: eligibility.isEligible
                ? 'linear-gradient(135deg, #facc15 0%, #ca8a04 100%)'
                : 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#070b14',
              boxShadow: eligibility.isEligible
                ? '0 0 16px rgba(234, 179, 8, 0.5)'
                : '0 0 12px rgba(56, 189, 248, 0.4)',
              flexShrink: 0
            }}
          >
            <Award size={24} strokeWidth={2.5} />
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 800, fontSize: '1rem', color: '#f8fafc' }}>
                {eligibility.isEligible ? '🏆 Accredited Touch-Typing Certificate' : '📜 Official CodeTyper Certificate'}
              </span>
              <span
                style={{
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  padding: '0.15rem 0.6rem',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(56, 189, 248, 0.15)',
                  color: '#38bdf8',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  fontFamily: '"Pinyon Script", "Alex Brush", cursive'
                }}
              >
                Signed by Saumy Pandey
              </span>
            </div>
            <div style={{ fontSize: '0.825rem', color: '#94a3b8', marginTop: '0.2rem' }}>
              {!user
                ? `🔥 You hit ${Math.round(result.netWpm || 0)} WPM! Sign up free to permanently record your score on the leaderboard, level up, and claim your accredited 4K diploma.`
                : eligibility.isEligible
                ? `High distinction ${eligibility.tierTitle} diploma unlocked with verified owner signature & 4K download!`
                : `Verified competency certificate with authentic cursive signature of founder Saumy Pandey (${eligibility.passedCount}/4 criteria met).`}
            </div>
          </div>
        </div>

        <button
          className="btn btn-sm"
          style={{
            background: (!user || eligibility.isEligible)
              ? 'linear-gradient(135deg, #ca8a04 0%, #eab308 50%, #facc15 100%)'
              : 'rgba(56, 189, 248, 0.15)',
            color: (!user || eligibility.isEligible) ? '#070b14' : '#38bdf8',
            border: (!user || eligibility.isEligible) ? 'none' : '1px solid rgba(56, 189, 248, 0.4)',
            fontWeight: 700,
            boxShadow: (!user || eligibility.isEligible) ? '0 4px 14px rgba(234, 179, 8, 0.4)' : 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.5rem 1rem'
          }}
          onClick={() => {
            if (!user) {
              onNavigate('signup');
            } else {
              setShowCertModal(true);
            }
          }}
        >
          <Award size={15} />
          <span>
            {!user
              ? 'Sign Up to Claim Diploma 🎓'
              : eligibility.isEligible
              ? 'Claim Official Certificate 🎓'
              : 'Preview Certificate & Signature 📜'}
          </span>
        </button>
      </div>

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

        {!user ? (
          <button
            className="btn btn-primary"
            style={{
              background: 'linear-gradient(135deg, #ca8a04 0%, #eab308 50%, #facc15 100%)',
              color: '#0f172a',
              border: '1px solid #eab308',
              fontWeight: 700,
              boxShadow: '0 4px 14px rgba(234, 179, 8, 0.35)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem'
            }}
            onClick={() => onNavigate('signup')}
          >
            <Award size={16} />
            <span>Sign Up to Claim Diploma 🎓</span>
          </button>
        ) : eligibility.isEligible ? (
          <button
            className="btn btn-primary"
            style={{
              background: 'linear-gradient(135deg, #ca8a04 0%, #eab308 50%, #facc15 100%)',
              color: '#0f172a',
              border: '1px solid #eab308',
              fontWeight: 700,
              boxShadow: '0 4px 14px rgba(234, 179, 8, 0.35)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem'
            }}
            onClick={() => setShowCertModal(true)}
          >
            <Award size={16} />
            <span>Claim Official Certificate 🎓</span>
          </button>
        ) : (
          <button
            className="btn btn-outline"
            style={{
              borderColor: 'rgba(234, 179, 8, 0.4)',
              color: '#EAB308',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem'
            }}
            onClick={() => setShowCertModal(true)}
            title="Official Certification Requirements: Click to view criteria"
          >
            <Lock size={15} />
            <span>Certificate Locked ({eligibility.passedCount}/4 Met)</span>
          </button>
        )}

        <button className="btn btn-ghost" onClick={() => onNavigate('dashboard')}>
          <Home size={16} />
          <span>Dashboard</span>
        </button>
      </div>

      <TypingCertificateModal
        isOpen={showCertModal}
        onClose={() => setShowCertModal(false)}
        result={result}
        onStartCertTest={onTryAgain}
      />
    </div>
  );
}
