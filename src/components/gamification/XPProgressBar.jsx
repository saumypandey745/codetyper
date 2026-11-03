import React from 'react';
import { calculateLevelFromXp } from '../../utils/gamificationEngine.js';
import { Award, Zap } from 'lucide-react';

export function XPProgressBar({ totalXp = 0, compact = false }) {
  const levelData = calculateLevelFromXp(totalXp);

  if (compact) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          padding: '0.25rem 0.65rem',
          backgroundColor: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.8rem',
          fontWeight: 600
        }}
        title={`${levelData.totalXp} XP • Next level in ${levelData.xpNeededForNext - levelData.xpInCurrentLevel} XP`}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '22px',
            height: '22px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-primary-forest)',
            color: '#FFFFFF',
            fontSize: '0.72rem',
            fontWeight: 700
          }}
        >
          {levelData.level}
        </span>
        <span style={{ color: 'var(--color-text-main)' }}>{levelData.title}</span>
        <div
          style={{
            width: '45px',
            height: '6px',
            backgroundColor: 'var(--color-bg-soft)',
            borderRadius: '3px',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              width: `${levelData.progressPercent}%`,
              height: '100%',
              backgroundColor: 'var(--color-primary-sage)',
              transition: 'width 300ms ease'
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className="card"
      style={{
        padding: '1.25rem 1.5rem',
        backgroundColor: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-primary-light)',
              color: 'var(--color-primary-forest)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.1rem'
            }}
          >
            {levelData.level}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>{levelData.title}</h4>
              <span className="badge badge-sage">Level {levelData.level}</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              {levelData.totalXp.toLocaleString()} Total Keystroke XP
            </p>
          </div>
        </div>
        <div style={{ textAlign: 'right', fontSize: '0.825rem' }}>
          <span style={{ fontWeight: 600, color: 'var(--color-primary-forest)' }}>
            {levelData.xpInCurrentLevel} / {levelData.xpNeededForNext} XP
          </span>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            {levelData.progressPercent}% to Level {levelData.level + 1}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div
        style={{
          width: '100%',
          height: '8px',
          backgroundColor: 'var(--color-bg-soft)',
          borderRadius: '4px',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            width: `${levelData.progressPercent}%`,
            height: '100%',
            background: 'linear-gradient(90deg, var(--color-primary-sage) 0%, var(--color-primary-forest) 100%)',
            borderRadius: '4px',
            transition: 'width 400ms ease'
          }}
        />
      </div>
    </div>
  );
}
