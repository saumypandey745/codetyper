import React, { useState, useEffect } from 'react';
import {
  User,
  Award,
  Zap,
  Target,
  Clock,
  Flame,
  CheckCircle2,
  Lock,
  Edit2,
  Save,
  Sparkles,
  ShieldCheck,
  Check,
  X,
  Link as LinkIcon,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { api } from '../../utils/api.js';
import { formatDuration } from '../../utils/wpmCalculator.js';

const AVATAR_PRESETS = [
  {
    id: 'sage',
    name: 'Sage Leaf',
    url: 'https://api.dicebear.com/7.x/identicon/svg?seed=sage',
    desc: 'Calm & Grounded'
  },
  {
    id: 'forest',
    name: 'Evergreen Forest',
    url: 'https://api.dicebear.com/7.x/identicon/svg?seed=forest',
    desc: 'Deep & Resilient'
  },
  {
    id: 'cedar',
    name: 'Mountain Cedar',
    url: 'https://api.dicebear.com/7.x/identicon/svg?seed=cedar',
    desc: 'Strong & Elevated'
  },
  {
    id: 'willow',
    name: 'Weeping Willow',
    url: 'https://api.dicebear.com/7.x/identicon/svg?seed=willow',
    desc: 'Fluid & Adaptable'
  },
  {
    id: 'moss',
    name: 'Velvet Moss',
    url: 'https://api.dicebear.com/7.x/identicon/svg?seed=moss',
    desc: 'Quiet & Persistent'
  },
  {
    id: 'calm',
    name: 'Calm Lotus',
    url: 'https://api.dicebear.com/7.x/identicon/svg?seed=calm',
    desc: 'Balanced & Mindful'
  }
];

export function ProfilePage({ onNavigate }) {
  const { user, userStats, updateUserProfile } = useAuth();
  const toast = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    username: user?.username || '',
    bio: user?.bio || '',
    avatar_url: user?.avatar_url || AVATAR_PRESETS[0].url
  });
  const [saving, setSaving] = useState(false);
  const [showCustomUrl, setShowCustomUrl] = useState(false);

  // Synchronize form state whenever user changes or editor is opened
  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        username: user.username || '',
        bio: user.bio || '',
        avatar_url: user.avatar_url || AVATAR_PRESETS[0].url
      });
      // If user has a custom avatar not matching the 6 presets, show the custom input
      const matchesPreset = AVATAR_PRESETS.some((p) => p.url === user.avatar_url);
      if (user.avatar_url && !matchesPreset) {
        setShowCustomUrl(true);
      }
    }
  }, [user, isEditing]);

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

  const unlockedBadgesCount = badges.filter((b) => b.unlocked).length;

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!formData.full_name.trim() || !formData.username.trim()) {
      toast.error('Full Name and Username are required.');
      return;
    }

    if (formData.avatar_url && formData.avatar_url.trim()) {
      const trimmed = formData.avatar_url.trim();
      if (!trimmed.startsWith('https://') && !trimmed.startsWith('http://')) {
        toast.error('Avatar URL must start with https://');
        return;
      }
    }

    setSaving(true);
    try {
      const res = await api.user.updateProfile({
        full_name: formData.full_name.trim(),
        username: formData.username.trim(),
        bio: formData.bio.trim(),
        avatar_url: formData.avatar_url ? formData.avatar_url.trim() : AVATAR_PRESETS[0].url
      });
      if (updateUserProfile) {
        updateUserProfile(res.user);
      }
      setIsEditing(false);
      toast.success('Profile details saved successfully.');
    } catch (err) {
      toast.error(err.message || 'Could not update profile.');
    } finally {
      setSaving(false);
    }
  };

  const currentDisplayAvatar = formData.avatar_url || user?.avatar_url || AVATAR_PRESETS[0].url;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      {/* Profile Card Header */}
      <section className="profile-hero-card" aria-label="Profile Details">
        <div className="profile-hero-header">
          <div className="profile-identity-group">
            <div className="profile-avatar-frame">
              <img
                src={currentDisplayAvatar}
                alt=""
                aria-hidden="true"
              />
              <span className="profile-avatar-status" title="Active Account" />
            </div>

            <div style={{ minWidth: '240px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                <h1 style={{ fontSize: '1.75rem', margin: 0, fontWeight: 700, letterSpacing: '-0.02em' }}>
                  {user?.full_name || 'Member'}
                </h1>
                {user?.role === 'admin' ? (
                  <span className="badge badge-forest" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', textTransform: 'capitalize' }}>
                    <ShieldCheck size={13} />
                    <span>Admin</span>
                  </span>
                ) : (
                  <span className="badge badge-sage" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', textTransform: 'capitalize' }}>
                    <Sparkles size={13} />
                    <span>{user?.role || 'Member'}</span>
                  </span>
                )}
              </div>

              <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.925rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>@{user?.username || 'member'}</span>
                <span>&bull;</span>
                <span>{user?.email || 'saumypandey745@gmail.com'}</span>
              </div>

              <div className="profile-bio-callout">
                {user?.bio || 'Typing deliberately to think clearly and code fluidly.'}
              </div>
            </div>
          </div>

          <button
            type="button"
            className={`btn ${isEditing ? 'btn-outline' : 'btn-primary'}`}
            onClick={() => setIsEditing(!isEditing)}
            aria-expanded={isEditing}
            aria-controls="profile-edit-section"
            style={{ alignSelf: 'flex-start' }}
          >
            {isEditing ? <X size={16} /> : <Edit2 size={16} />}
            <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
          </button>
        </div>

        {/* Structured Edit Personal Details Form */}
        {isEditing && (
          <div id="profile-edit-section" className="profile-edit-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--color-border)' }}>
              <div>
                <h2 style={{ fontSize: '1.15rem', margin: '0 0 0.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Edit2 size={18} color="var(--color-primary-forest)" />
                  <span>Edit Personal Details</span>
                </h2>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                  Update your public display identity, bio philosophy, and botanical avatar preset.
                </p>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setIsEditing(false)}
                aria-label="Close edit form"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} noValidate={false}>
              {/* Row 1: Full Name and Username in 2-column grid */}
              <div className="form-grid-2col">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="profile-full-name" className="form-label">
                    <span>Full Name <span aria-hidden="true" style={{ color: 'var(--color-error)' }}>*</span></span>
                  </label>
                  <input
                    id="profile-full-name"
                    name="full_name"
                    type="text"
                    className="form-input"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
                    placeholder="Enter your full name"
                    autoComplete="name"
                  />
                  <span className="form-hint">Displayed on leaderboards and duel match cards</span>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="profile-username" className="form-label">
                    <span>Username <span aria-hidden="true" style={{ color: 'var(--color-error)' }}>*</span></span>
                  </label>
                  <input
                    id="profile-username"
                    name="username"
                    type="text"
                    className="form-input"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s+/g, '') })}
                    required
                    placeholder="username"
                    autoComplete="username"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck="false"
                  />
                  <span className="form-hint">Unique handle for your public profile</span>
                </div>
              </div>

              {/* Row 2: Bio / Philosophy (Full Width) */}
              <div className="form-group" style={{ marginTop: '1.25rem', marginBottom: '1.25rem' }}>
                <label htmlFor="profile-bio" className="form-label">
                  <span>Bio / Philosophy</span>
                  <span style={{ fontSize: '0.775rem', color: 'var(--color-text-muted)' }}>
                    {formData.bio.length} / 250
                  </span>
                </label>
                <textarea
                  id="profile-bio"
                  name="bio"
                  rows={3}
                  maxLength={250}
                  className="form-textarea"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Share your typing focus, goals, or philosophy..."
                  style={{ resize: 'vertical' }}
                />
                <span className="form-hint">A brief description shown on your profile card</span>
              </div>

              {/* Row 3: Botanical Avatar Preset Selector */}
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <label className="form-label" style={{ margin: 0, fontWeight: 600 }}>
                    Choose Botanical Avatar Preset
                  </label>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => setShowCustomUrl(!showCustomUrl)}
                    style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem', height: 'auto', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <LinkIcon size={13} />
                    <span>{showCustomUrl ? 'Hide Custom URL' : 'Custom Image URL'}</span>
                  </button>
                </div>
                <p style={{ margin: '0 0 0.75rem', fontSize: '0.825rem', color: 'var(--color-text-secondary)' }}>
                  Select an algorithmic botanical identicon or provide a custom image URL.
                </p>

                {/* Grid of Botanical Presets */}
                <div className="avatar-presets-grid" role="radiogroup" aria-label="Botanical avatar preset options">
                  {AVATAR_PRESETS.map((preset) => {
                    const isSelected = formData.avatar_url === preset.url;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        className={`avatar-preset-btn ${isSelected ? 'active' : ''}`}
                        onClick={() => setFormData({ ...formData, avatar_url: preset.url })}
                        title={`Select ${preset.name} preset`}
                      >
                        {isSelected && (
                          <div className="avatar-preset-check">
                            <Check size={12} strokeWidth={3} />
                          </div>
                        )}
                        <img
                          src={preset.url}
                          alt=""
                          aria-hidden="true"
                        />
                        <span className="avatar-preset-name">{preset.name}</span>
                        <span className="avatar-preset-desc">{preset.desc}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Optional Custom Avatar URL Input */}
                {showCustomUrl && (
                  <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                    <label htmlFor="custom-avatar-url" className="form-label" style={{ fontSize: '0.825rem', marginBottom: '0.35rem' }}>
                      Custom Avatar URL (HTTPS only)
                    </label>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <input
                        id="custom-avatar-url"
                        type="url"
                        className="form-input"
                        placeholder="https://example.com/avatar.png"
                        value={formData.avatar_url}
                        onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                      />
                      <img
                        src={formData.avatar_url || AVATAR_PRESETS[0].url}
                        alt="Preview"
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: 'var(--radius-full)',
                          border: '2px solid var(--color-primary-sage)',
                          flexShrink: 0
                        }}
                        onError={(e) => {
                          e.target.src = AVATAR_PRESETS[0].url;
                        }}
                      />
                    </div>
                    <span className="form-hint">Must be a secure HTTPS image link</span>
                  </div>
                )}
              </div>

              {/* Form Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setIsEditing(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  <Save size={16} />
                  <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </section>

      {/* Lifetime Stats Matrix */}
      <section aria-label="Lifetime Typing Matrix">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
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
            <span className="stat-subtext">Time spent on keys</span>
          </div>
        </div>
      </section>

      {/* Achievements & Milestones Badges Showcase */}
      <section className="card" style={{ padding: '2rem' }} aria-label="Achievements Showcase">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <Award size={22} color="var(--color-primary-forest)" />
              <h2 style={{ fontSize: '1.35rem', margin: 0, fontWeight: 700 }}>Achievements & Mastery Badges</h2>
            </div>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
              Milestones unlocked as you improve your velocity, precision, and daily discipline.
            </p>
          </div>
          <span className="badge badge-sage" style={{ fontSize: '0.85rem', padding: '0.3rem 0.75rem', fontWeight: 600 }}>
            {unlockedBadgesCount} of {badges.length} Unlocked
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {badges.map((badge) => {
            const Icon = badge.icon;
            return (
              <div
                key={badge.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  padding: '1.15rem',
                  borderRadius: 'var(--radius-lg)',
                  border: badge.unlocked ? '1.5px solid var(--color-primary-sage)' : '1px dashed var(--color-border)',
                  backgroundColor: badge.unlocked ? 'var(--color-bg-soft)' : 'var(--color-bg-subtle)',
                  opacity: badge.unlocked ? 1 : 0.65,
                  transition: 'all var(--transition-normal)'
                }}
              >
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: badge.unlocked ? 'var(--color-primary-light)' : 'var(--color-bg-surface)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: badge.unlocked ? 'var(--color-primary-forest)' : 'var(--color-text-muted)',
                    flexShrink: 0
                  }}
                >
                  {badge.unlocked ? <Icon size={24} /> : <Lock size={20} />}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: badge.unlocked ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>
                      {badge.name}
                    </h3>
                    {badge.unlocked && (
                      <span className="badge badge-forest" style={{ fontSize: '0.65rem', padding: '0.1rem 0.45rem' }}>
                        Unlocked
                      </span>
                    )}
                  </div>
                  <p style={{ margin: 0, fontSize: '0.825rem', color: 'var(--color-text-secondary)', lineHeight: 1.45 }}>
                    {badge.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
