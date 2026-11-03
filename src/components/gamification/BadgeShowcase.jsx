import React from 'react';
import { BADGES } from '../../utils/gamificationEngine.js';
import {
  Sparkles,
  Zap,
  Flame,
  Gauge,
  Rocket,
  Target,
  Layers,
  Leaf,
  Moon,
  CalendarCheck,
  Code2,
  Timer,
  Lock
} from 'lucide-react';

const ICON_MAP = {
  Sparkles,
  Zap,
  Flame,
  Gauge,
  Rocket,
  Target,
  Layers,
  Leaf,
  Moon,
  CalendarCheck,
  Code2,
  Timer
};

export function BadgeShowcase({ unlockedBadgeIds = [] }) {
  const isUnlocked = (badgeId) => unlockedBadgeIds.includes(badgeId);

  const unlockedCount = BADGES.filter((b) => isUnlocked(b.id)).length;

  return (
    <div className="card" style={{ padding: '1.5rem', marginTop: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '0.25rem' }}>Achievements & Badges</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
            Accomplishments earned through disciplined typing and speed mastery.
          </p>
        </div>
        <span className="badge badge-forest" style={{ fontSize: '0.825rem' }}>
          {unlockedCount} / {BADGES.length} Unlocked
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '1rem'
        }}
      >
        {BADGES.map((badge) => {
          const unlocked = isUnlocked(badge.id);
          const IconComp = ICON_MAP[badge.icon] || Sparkles;

          return (
            <div
              key={badge.id}
              style={{
                padding: '1rem',
                backgroundColor: unlocked ? 'var(--color-bg-card)' : 'var(--color-bg-soft)',
                border: `1px solid ${unlocked ? 'var(--color-border)' : 'var(--color-border-subtle)'}`,
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                opacity: unlocked ? 1 : 0.65,
                transition: 'all 200ms ease',
                position: 'relative'
              }}
            >
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: unlocked ? 'var(--color-primary-light)' : 'var(--color-bg-subtle)',
                  color: unlocked ? 'var(--color-primary-forest)' : 'var(--color-text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                {unlocked ? <IconComp size={20} /> : <Lock size={16} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.25rem' }}>
                  <h4 style={{ fontSize: '0.875rem', margin: 0, fontWeight: 600 }}>{badge.title}</h4>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', margin: '0.25rem 0 0', lineHeight: 1.35 }}>
                  {badge.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

