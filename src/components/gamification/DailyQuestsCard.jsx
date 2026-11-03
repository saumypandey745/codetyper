import React from 'react';
import { getDailyQuests } from '../../utils/gamificationEngine.js';
import { CheckCircle2, Circle, Sparkles, Award } from 'lucide-react';

export function DailyQuestsCard({ completedQuestIds = [], onClaim = null }) {
  const quests = getDailyQuests();

  return (
    <div className="card" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={18} style={{ color: 'var(--color-primary-forest)' }} />
          <h3 style={{ fontSize: '1.05rem', margin: 0, fontWeight: 700 }}>Today's Daily Quests</h3>
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
          Resets daily at midnight
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {quests.map((quest) => {
          const isDone = completedQuestIds.includes(quest.id);

          return (
            <div
              key={quest.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                backgroundColor: isDone ? 'var(--color-primary-light)' : 'var(--color-bg-soft)',
                borderRadius: 'var(--radius-md)',
                border: `1px solid ${isDone ? 'var(--color-primary-sage)' : 'var(--color-border-subtle)'}`,
                transition: 'all 200ms ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {isDone ? (
                  <CheckCircle2 size={18} style={{ color: 'var(--color-primary-forest)' }} />
                ) : (
                  <Circle size={18} style={{ color: 'var(--color-text-muted)' }} />
                )}
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, textDecoration: isDone ? 'line-through' : 'none' }}>
                    {quest.title}
                  </h4>
                  <p style={{ margin: '0.15rem 0 0', fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                    {quest.description}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="badge badge-sage" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                  +{quest.xpReward} XP
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
