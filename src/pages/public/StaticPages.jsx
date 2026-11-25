import React, { useState, useEffect } from 'react';
import { Send, CheckCircle2, Shield, Heart, Terminal, Sparkles, Loader2, Star } from 'lucide-react';
import { useToast } from '../../context/ToastContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { api } from '../../utils/api.js';

export function AboutPage({ onNavigate }) {
  return (
    <div style={{ maxWidth: '820px', margin: '2rem auto', padding: '0 1.5rem', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      <div>
        <span className="badge badge-sage" style={{ marginBottom: '0.75rem' }}>Our Philosophy</span>
        <h1 style={{ marginBottom: '1rem' }}>Typing as a Meditative Discipline</h1>
        <p style={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
          In a world dominated by noisy notifications, harsh neon aesthetics, and frantic gaming gamification,
          CodeTyper was founded on a simple premise: <strong>Typing practice should cultivate calm focus and clarity.</strong>
        </p>
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        <h3 style={{ marginBottom: '0.75rem', color: 'var(--color-primary-forest)' }}>The Green + Cream Design Harmony</h3>
        <p style={{ marginBottom: '1rem' }}>
          Research in visual ergonomics and cognitive load demonstrates that soft botanical sage, deep forest green,
          and warm natural cream surfaces significantly reduce optical fatigue compared to stark white or harsh dark themes.
        </p>
        <p>
          Whether you practice for 10 minutes before your workday or engage in an hour of intensive code muscle-memory training,
          CodeTyper keeps your eyes relaxed and your mind in flow.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        <div className="card">
          <Terminal size={24} color="var(--color-primary-forest)" style={{ marginBottom: '0.75rem' }} />
          <h4 style={{ marginBottom: '0.5rem' }}>Code-First Ergonomics</h4>
          <p style={{ fontSize: '0.9rem' }}>
            Real programmers don't just type lowercase dictionary words. They type curly braces, arrow functions, SQL clauses, and regex symbols.
          </p>
        </div>

        <div className="card">
          <Shield size={24} color="var(--color-primary-sage)" style={{ marginBottom: '0.75rem' }} />
          <h4 style={{ marginBottom: '0.5rem' }}>Zero Fake Metrics</h4>
          <p style={{ fontSize: '0.9rem' }}>
            We calculate Gross WPM, Net WPM, and accuracy directly from raw millisecond keystrokes. No inflated stats or fake speed illusions.
          </p>
        </div>

        <div className="card">
          <Heart size={24} color="var(--color-primary-forest)" style={{ marginBottom: '0.75rem' }} />
          <h4 style={{ marginBottom: '0.5rem' }}>Accessible by Design</h4>
          <p style={{ fontSize: '0.9rem' }}>
            Full keyboard navigation, screen-reader semantics, high contrast mode, and prefers-reduced-motion compatibility.
          </p>
        </div>
      </div>

      <div className="card" style={{ padding: '1.75rem', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', border: '1px solid var(--color-border)' }}>
        <img
          src="https://api.dicebear.com/7.x/identicon/svg?seed=sage"
          alt="Saumy Pandey"
          style={{ width: '68px', height: '68px', borderRadius: 'var(--radius-full)', border: '2.5px solid var(--color-primary-forest)', backgroundColor: 'var(--color-bg-subtle)' }}
        />
        <div style={{ flex: 1, minWidth: '220px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>Saumy Pandey</h3>
            <span className="badge badge-forest">Lead Developer &amp; Architect</span>
          </div>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
            Creator and lead architect of CodeTyper. Dedicated to building peaceful, distraction-free tools that cultivate deep focus, clean muscle memory, and fluid typing cadence for programmers and writers.
          </p>
        </div>
      </div>
    </div>
  );
}

export function ContactPage() {
  const toast = useToast();
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('feedback');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [displayRole, setDisplayRole] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.full_name && !name) setName(user.full_name);
      if (user.email && !email) setEmail(user.email);
    }
  }, [user]);

  const ratingDescriptions = {
    1: '1 Star — Needs Critical Work',
    2: '2 Stars — Fair / Room for Improvement',
    3: '3 Stars — Good Typing Platform',
    4: '4 Stars — Very Good Experience & Audio',
    5: '5 Stars — Exceptional Flow & Practice!'
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error('Please complete all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.feedback.submit({
        name: name.trim(),
        email: email.trim(),
        category,
        rating,
        display_role: displayRole.trim(),
        subject: subject.trim() || `${category.toUpperCase()}: Note from ${name.trim()}`,
        message: message.trim()
      });

      setSubmitted(true);
      toast.success(res.message || 'Thank you! Your feedback has been received.');
    } catch (err) {
      toast.error(err.message || 'Failed to submit feedback. Please check your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '640px', margin: '2.5rem auto', padding: '0 1.5rem' }}>
      <div className="card" style={{ padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span className="badge badge-sage" style={{ marginBottom: '0.5rem' }}>We Value Your Thoughts</span>
          <h2>Get in Touch &amp; Review</h2>
          <p style={{ fontSize: '0.95rem' }}>Have feedback, a testimonial, typo report, or feature suggestion?</p>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <CheckCircle2 size={46} color="var(--color-primary-forest)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ marginBottom: '0.5rem' }}>Message Dispatched to Maintainers</h3>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              Thank you for reaching out, <strong>{name}</strong>! Your note and rating ({rating} ★) have been logged.
              Inspiring community reviews may be verified by our administrative team and featured on our global wall of love.
            </p>
            <button
              className="btn btn-outline"
              onClick={() => {
                setSubmitted(false);
                setMessage('');
                setSubject('');
                setDisplayRole('');
                setRating(5);
              }}
            >
              Send Another Note
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Your Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Maya Lin"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                className="form-input"
                placeholder="maya@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Inquiry Category</label>
              <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="feedback">💡 General Feedback &amp; Ideas</option>
                <option value="bug_report">🐛 Report a Bug / Technical Issue</option>
                <option value="typo">🔤 Typo in Practice Snippet</option>
                <option value="snippet_suggestion">📝 Suggest New Language or Passage</option>
                <option value="account">❓ Account &amp; Data Inquiry</option>
                <option value="other">💬 Other Communication</option>
              </select>
            </div>

            {/* Interactive Experience Rating */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Your Experience Rating *</span>
                <span style={{ fontSize: '0.8rem', color: '#eab308', fontWeight: 600 }}>
                  {ratingDescriptions[hoverRating || rating]}
                </span>
              </label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem 0.85rem',
                  backgroundColor: 'var(--color-bg-subtle)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)'
                }}
              >
                {[1, 2, 3, 4, 5].map((starVal) => {
                  const active = starVal <= (hoverRating || rating);
                  return (
                    <button
                      key={starVal}
                      type="button"
                      onClick={() => setRating(starVal)}
                      onMouseEnter={() => setHoverRating(starVal)}
                      onMouseLeave={() => setHoverRating(0)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0.2rem',
                        display: 'flex',
                        alignItems: 'center',
                        transition: 'transform 0.15s ease'
                      }}
                      onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.85)'}
                      onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1.15)'}
                      title={`Rate ${starVal} Star${starVal > 1 ? 's' : ''}`}
                    >
                      <Star
                        size={24}
                        fill={active ? '#eab308' : 'none'}
                        color={active ? '#eab308' : 'var(--color-border)'}
                      />
                    </button>
                  );
                })}
                <span style={{ marginLeft: '0.5rem', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  {rating}.0 / 5.0
                </span>
              </div>
            </div>

            {/* Optional Professional Title / Headline */}
            <div className="form-group">
              <label className="form-label">
                Your Role or Discipline (Optional)
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Senior Frontend Engineer @ FinTech, CS Student, or Systems Dev"
                value={displayRole}
                onChange={(e) => setDisplayRole(e.target.value)}
              />
              <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '0.25rem', display: 'block' }}>
                If your feedback is selected for our community wall of love, this title will appear alongside your name.
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Subject Line *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. How CodeTyper improved my typing speed or Feature idea"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Detailed Message or Review *</label>
              <textarea
                className="form-textarea"
                rows={5}
                placeholder="Share your experience, typing speed milestones, suggestions, or bug details..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 size={16} className="spin" />
                  <span>Submitting Review...</span>
                </>
              ) : (
                <>
                  <Send size={16} />
                  <span>Submit Note &amp; Rating</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export function PrivacyPage() {
  return (
    <div style={{ maxWidth: '820px', margin: '2rem auto', padding: '0 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <h1>Privacy Policy</h1>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Last updated: October 30, 2026</p>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', lineHeight: 1.7 }}>
        <section>
          <h3>1. Data Ownership & Transparency</h3>
          <p>
            At CodeTyper, we believe your typing performance data belongs exclusively to you. We do not sell your personal data, typing speed history, or practice transcripts to third parties or advertising brokers.
          </p>
        </section>

        <section>
          <h3>2. What We Collect</h3>
          <p>
            When you register, we collect your name, email address, username, and encrypted password hash (never stored in plaintext). When practicing, we store your WPM, accuracy %, session durations, and errors count to generate your personal statistics dashboard.
          </p>
        </section>

        <section>
          <h3>3. Complete Control</h3>
          <p>
            In your account settings, you have the granular ability to disable session history saving, toggle public profile visibility, export data, or delete your entire account permanently with one click.
          </p>
        </section>
      </div>
    </div>
  );
}

export function TermsPage() {
  return (
    <div style={{ maxWidth: '820px', margin: '2rem auto', padding: '0 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <h1>Terms of Service</h1>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Last updated: October 30, 2026</p>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', lineHeight: 1.7 }}>
        <section>
          <h3>1. Acceptance of Terms</h3>
          <p>
            By accessing or using CodeTyper, you agree to abide by these terms. The service is provided to help individuals improve their keyboard typing fluency and programming speed.
          </p>
        </section>

        <section>
          <h3>2. Fair Use</h3>
          <p>
            Users agree not to deploy automated scripts, headless bots, or abusive keypress injectors to artificially manipulate platform leaderboards or statistics.
          </p>
        </section>

        <section>
          <h3>3. Availability</h3>
          <p>
            We strive for 99.9% availability, and our offline sync architecture safeguards your completed typing sessions even if your network connection is momentarily disrupted.
          </p>
        </section>
      </div>
    </div>
  );
}
