import React, { useState } from 'react';
import { Send, CheckCircle2, Shield, Heart, Terminal, Sparkles } from 'lucide-react';
import { useToast } from '../../context/ToastContext.jsx';

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
    </div>
  );
}

export function ContactPage() {
  const toast = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Feedback');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setSubmitted(true);
    toast.success('Thank you! Your note has been received.');
  };

  return (
    <div style={{ maxWidth: '640px', margin: '2.5rem auto', padding: '0 1.5rem' }}>
      <div className="card" style={{ padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span className="badge badge-sage" style={{ marginBottom: '0.5rem' }}>We Value Your Thoughts</span>
          <h2>Get in Touch</h2>
          <p style={{ fontSize: '0.95rem' }}>Have a question, language snippet suggestion, or feedback?</p>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <CheckCircle2 size={42} color="var(--color-primary-forest)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ marginBottom: '0.5rem' }}>Message Dispatched</h3>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
              Thank you for reaching out, {name}. Our maintainers read every note and will get back to you promptly.
            </p>
            <button className="btn btn-outline" onClick={() => setSubmitted(false)}>
              Send Another Note
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Your Name</label>
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
              <label className="form-label">Email Address</label>
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
              <label className="form-label">Subject</label>
              <select className="form-select" value={subject} onChange={(e) => setSubject(e.target.value)}>
                <option value="Feedback">General Feedback & Ideas</option>
                <option value="Bug">Report an Issue / Bug</option>
                <option value="Snippet">Suggest Practice Content or Language</option>
                <option value="Account">Account or Data Inquiry</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Message</label>
              <textarea
                className="form-textarea"
                rows={5}
                placeholder="Share your experience or inquiry..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              <Send size={16} />
              <span>Send Message</span>
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
