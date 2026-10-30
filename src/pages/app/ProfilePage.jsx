import React, { useState } from 'react';
import {
  User,
  Award,
  Zap,
  Target,
  Clock,
  Flame,
  Calendar,
  CheckCircle2,
  Lock,
  Edit2,
  Save,
  Sparkles,
  ShieldCheck,
  Code2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { api } from '../../utils/api.js';
import { formatDuration, formatDate } from '../../utils/wpmCalculator.js';

const AVATAR_PRESETS = [
  'https://api.dicebear.com/7.x/identicon/svg?seed=sage',
  'https://api.dicebear.com/7.x/identicon/svg?seed=forest',
  'https://api.dicebear.com/7.x/identicon/svg?seed=cedar',
  'https://api.dicebear.com/7.x/identicon/svg?seed=willow',
  'https://api.dicebear.com/7.x/identicon/svg?seed=moss',
  'https://api.dicebear.com/7.x/identicon/svg?seed=calm'
];

export function ProfilePage({ onNavigate }) {
  const { user, userStats, updateUserProfile } = useAuth();
  const toast = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    username: user?.username || '',
    bio: user?.bio || '',
    avatar_url: user?.avatar_url || AVATAR_PRESETS[0]
  });
  const [saving, setSaving] = useState(false);

  const bestWpm = userStats?.best_wpm || 0;
  const totalTests = userStats?.total_tests || 0;
  const totalSeconds = userStats?.total_practice_seconds || 0;
  const currentStreak = userStats?.current_streak || 1;
  const avgAccuracy = userStats?.avg_accuracy || 0;

  // Badges & Milestones definitions
  const badges = [
    {
      id: 'first_step',
      name: 'First Keystroke',
      description: 'Completed your first typing session',
      icon: Sparkles,
      unlocked: totalTests >= 1
    },
    {
      id: 'speed_50',
      name: 'Velocity 50',
      description: 'Surpassed 50 WPM on any practice session',
      icon: Zap,
      unlocked: bestWpm >= 50
    },
    {
      id: 'speed_80',
      name: 'Cadence 80',
      description: 'Reached 80 WPM with high precision',
      icon: Award,
      unlocked: bestWpm >= 80
    },
    {
      id: 'speed_100',
      name: 'Century Mark',
      description: 'Achieved elite 100+ WPM typing speed',
      icon: Flame,
      unlocked: bestWpm >= 100
    },
    {
      id: 'perfection',
      name: 'Pinpoint Accuracy',
      description: 'Maintained 98%+ overall precision average',
      icon: Target,
      unlocked: avgAccuracy >= 98 && totalTests >= 5
    },
    {
      id: 'dedicated',
      name: 'Dedicated Mind',
      description: 'Completed 25 or more practice sessions',
      icon: CheckCircle2,
      unlocked: totalTests >= 25
    },
    {
      id: 'streak_7',
      name: 'Week in Flow',
      description: 'Maintained a 7-day daily typing practice streak',
      icon: Flame,
      unlocked: currentStreak >= 7
    },
    {
      id: 'marathon',
      name: 'Typing Marathoner',
      description: 'Accumulated over 1 hour of total deliberate practice',
      icon: Clock,
      unlocked: totalSeconds >= 3600
    }
  ];

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!formData.full_name.trim() || !formData.username.trim()) {
      toast.error('Name and username are required.');
      return;
    }

    setSaving(true);
    try {
      const res = await api.user.updateProfile(formData);
      updateUserProfile(res.user);
      setIsEditing(false);
      toast.success('Profile details saved successfully.');
    } catch (err) {
      toast.error(err.message || 'Could not update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '960px', margin: '0 auto' }}>
      {/* Profile Card Header */}
      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <img
              src={formData.avatar_url || user?.avatar_url || AVATAR_PRESETS[0]}
              alt={user?.full_name}
              style={{
                width: '88px',
                height: '88px',
                borderRadius: 'var(--radius-full)',
                border: '3px solid var(--color-primary-sage)',
                boxShadow: 'var(--shadow-sm)'
              }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                <h1 style={{ fontSize: '1.75rem', margin: 0 }}>{user?.full_name || 'Member'}</h1>
                <span className="badge badge-sage" style={{ textTransform: 'capitalize' }}>
                  {user?.role || 'Member'}
                </span>
              </div>
              <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                @{user?.username} &bull; {user?.email}
              </div>
              <p style={{ margin: 0, fontSize: '0.9rem', maxWidth: '480px', color: 'var(--color-text-primary)' }}>
                {user?.bio || 'Typing deliberately to think clearly and code fluidly.'}
              </p>
            </div>
          </div>

          <button
            className={`btn ${isEditing ? 'btn-outline' : 'btn-primary'}`}
            onClick={() => setIsEditing(!isEditing)}
          >
            <Edit2 size={16} />
            <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
          </button>
        </div>

        {/* Inline Edit Form */}
        {isEditing && (
          <form onSubmit={handleSaveProfile} style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Edit Personal Details</h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <label className="input-label">Full Name</label>
                <input
                  type="text"
                  className="input"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="input-label">Username</label>
                <input
                  type="text"
                  className="input"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label className="input-label">Bio / Philosophy</label>
              <textarea
                className="input"
                rows={2}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Share your typing focus, goals, or philosophy..."
              />
            </div>

            {/* Avatar Preset Selector */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="input-label">Choose Botanical Avatar Preset</label>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                {AVATAR_PRESETS.map((preset, idx) => (
                  <img
                    key={idx}
                    src={preset}
                    alt={`Preset ${idx + 1}`}
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: 'var(--radius-full)',
                      cursor: 'pointer',
                      border: formData.avatar_url === preset ? '3px solid var(--color-primary-forest)' : '2px solid transparent',
                      transform: formData.avatar_url === preset ? 'scale(1.1)' : 'none',
                      transition: 'all var(--transition-fast)'
                    }}
                    onClick={() => setFormData({ ...formData, avatar_url: preset })}
                  />
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button type="button" className="btn btn-ghost" onClick={() => setIsEditing(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                <Save size={16} />
                <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Lifetime Stats Matrix */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Best Record</span>
            <div className="stat-icon"><Award size={18} /></div>
          </div>
          <div className="stat-value" style={{ color: 'var(--color-primary-forest)' }}>
            {bestWpm} <span style={{ fontSize: '1rem', fontWeight: 500 }}>WPM</span>
          </div>
          <span className="stat-subtext">Peak performance score</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Lifetime Accuracy</span>
            <div className="stat-icon"><Target size={18} /></div>
          </div>
          <div className="stat-value">{avgAccuracy}%</div>
          <span className="stat-subtext">Average clean precision</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Tests Completed</span>
            <div className="stat-icon"><CheckCircle2 size={18} /></div>
          </div>
          <div className="stat-value">{totalTests}</div>
          <span className="stat-subtext">Total recorded sessions</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Practice Time</span>
            <div className="stat-icon"><Clock size={18} /></div>
          </div>
          <div className="stat-value">{formatDuration(totalSeconds)}</div>
          <span className="stat-subtext">Time spent on the keys</span>
        </div>
      </div>

      {/* Achievements & Milestones Badges Showcase */}
      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Award size={22} color="var(--color-primary-forest)" />
            <h2 style={{ fontSize: '1.35rem', margin: 0 }}>Achievements & Mastery Badges</h2>
          </div>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
            Milestones unlocked as you improve your typing velocity, accuracy, and daily discipline.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          {badges.map((badge) => {
            const Icon = badge.icon;
            return (
              <div
                key={badge.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  padding: '1rem',
                  borderRadius: 'var(--radius-lg)',
                  border: badge.unlocked ? '1px solid var(--color-primary-sage)' : '1px dashed var(--color-border)',
                  backgroundColor: badge.unlocked ? 'var(--color-bg-soft)' : 'var(--color-bg-subtle)',
                  opacity: badge.unlocked ? 1 : 0.65,
                  transition: 'all var(--transition-normal)'
                }}
              >
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: badge.unlocked ? 'var(--color-primary-light)' : 'var(--color-bg-surface)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: badge.unlocked ? 'var(--color-primary-forest)' : 'var(--color-text-muted)',
                    flexShrink: 0
                  }}
                >
                  {badge.unlocked ? <Icon size={22} /> : <Lock size={20} />}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', color: badge.unlocked ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>
                      {badge.name}
                    </h4>
                    {badge.unlocked && (
                      <span className="badge badge-sage" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                        Unlocked
                      </span>
                    )}
                  </div>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                    {badge.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
