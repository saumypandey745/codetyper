import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle2, AlertCircle, ArrowLeft, KeyRound, Lock, ExternalLink, Sparkles } from 'lucide-react';
import { api } from '../../utils/api.js';

export function ForgotPasswordPage({ onNavigate }) {
  const [email, setEmail] = useState('');
  const [stage, setStage] = useState('request'); // 'request' | 'sent' | 'reset' | 'success'
  const [token, setToken] = useState('');
  const [devToken, setDevToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-detect token if user clicked a reset link from email (e.g. #forgot-password?token=XYZ)
  useEffect(() => {
    const raw = window.location.hash.includes('?')
      ? window.location.hash.split('?')[1]
      : window.location.search.replace('?', '');
    if (raw) {
      const params = new URLSearchParams(raw);
      const urlToken = params.get('token');
      if (urlToken) {
        setToken(urlToken);
        setStage('reset');
      }
    }
  }, []);

  const handleRequestEmail = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError('');
    try {
      const res = await api.auth.forgotPassword(email.trim());
      setStage('sent');
      if (res.devResetToken) {
        setDevToken(res.devResetToken);
      }
    } catch (err) {
      setError(err.message || 'Could not process recovery request.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyReset = async (e) => {
    e.preventDefault();
    if (!token.trim() || !newPassword || !confirmPassword) return;

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await api.auth.resetPassword({
        token: token.trim(),
        new_password: newPassword,
        confirm_password: confirmPassword
      });
      setStage('success');
    } catch (err) {
      setError(err.message || 'Could not reset password. The link or token may be expired or invalid.');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateOpenEmail = () => {
    if (devToken) {
      setToken(devToken);
      setStage('reset');
      setError('');
    }
  };

  return (
    <div style={{ maxWidth: '460px', margin: '3.5rem auto', padding: '0 1rem' }}>
      <div className="card" style={{ padding: '2.5rem' }}>
        <button
          className="btn btn-ghost btn-sm"
          style={{ marginBottom: '1.25rem', paddingLeft: 0 }}
          onClick={() => onNavigate('login')}
        >
          <ArrowLeft size={16} />
          <span>Back to Login</span>
        </button>

        {error && (
          <div style={{ padding: '0.75rem', backgroundColor: 'var(--color-error-bg)', color: 'var(--color-error)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            {error}
          </div>
        )}

        {/* STAGE 1: Request Email Form */}
        {stage === 'request' && (
          <div>
            <h2 style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>Reset Your Password</h2>
            <p style={{ fontSize: '0.925rem', marginBottom: '1.5rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
              Enter the email address associated with your account and we will send a password recovery link to your inbox.
            </p>

            <form onSubmit={handleRequestEmail}>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" htmlFor="reset-email">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="reset-email"
                    type="email"
                    className="form-input"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                {loading ? 'Sending Recovery Link...' : 'Send Recovery Link'}
              </button>
            </form>
          </div>
        )}

        {/* STAGE 2: Email Dispatched Confirmation Screen */}
        {stage === 'sent' && (
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: 'rgba(47, 107, 82, 0.12)',
                color: 'var(--color-primary-forest)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem'
              }}
            >
              <Mail size={28} />
            </div>

            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Check Your Email</h2>
            <p style={{ fontSize: '0.925rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              We have dispatched recovery instructions to <strong>{email}</strong>. Please check your inbox and click the reset button inside the email.
            </p>

            <div style={{ padding: '0.85rem', backgroundColor: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-md)', textAlign: 'left', fontSize: '0.825rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              <strong>Didn't see the email?</strong>
              <ul style={{ margin: '0.35rem 0 0 1.1rem', padding: 0 }}>
                <li>Check your Spam, Junk, or Promotions folder.</li>
                <li>Make sure the email was typed correctly without typos.</li>
              </ul>
            </div>

            {/* In preview/test environments where SMTP is not active, allow 1-click test simulation */}
            {devToken && (
              <div
                style={{
                  padding: '0.85rem',
                  backgroundColor: 'rgba(47, 107, 82, 0.08)',
                  border: '1px dashed var(--color-primary-forest)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1.5rem',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, color: 'var(--color-primary-forest)', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                  <Sparkles size={15} />
                  <span>Preview Environment Simulation</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', margin: '0 0 0.75rem', lineHeight: 1.4 }}>
                  External SMTP delivery is not configured on this server. Click below to simulate opening the email link directly:
                </p>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%' }}
                  onClick={handleSimulateOpenEmail}
                >
                  <ExternalLink size={14} />
                  <span>Simulate Clicking Email Link</span>
                </button>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-outline"
                style={{ width: '100%' }}
                onClick={() => {
                  setStage('request');
                  setError('');
                }}
              >
                Try a Different Email
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => onNavigate('login')}
              >
                Return to Sign In
              </button>
            </div>
          </div>
        )}

        {/* STAGE 3: Set New Password Form (Arrived from email link) */}
        {stage === 'reset' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Lock size={22} color="var(--color-primary-forest)" />
              <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Set New Password</h2>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
              Enter and confirm your new secure password below to regain access.
            </p>

            <form onSubmit={handleApplyReset} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="new-password">New Password (8+ characters)</label>
                <input
                  id="new-password"
                  type="password"
                  className="form-input"
                  placeholder="••••••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="confirm-new-password">Confirm New Password</label>
                <input
                  id="confirm-new-password"
                  type="password"
                  className="form-input"
                  placeholder="••••••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
                {loading ? 'Updating Password...' : 'Save New Password'}
              </button>
            </form>
          </div>
        )}

        {/* STAGE 4: Password Successfully Reset */}
        {stage === 'success' && (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: 'rgba(47, 107, 82, 0.15)',
                color: 'var(--color-primary-forest)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem'
              }}
            >
              <CheckCircle2 size={32} />
            </div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Password Successfully Updated</h2>
            <p style={{ fontSize: '0.925rem', color: 'var(--color-text-secondary)', marginBottom: '1.75rem', lineHeight: 1.5 }}>
              Your credentials have been securely updated. You can now log into your CodeTyper sanctuary with your new password.
            </p>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => onNavigate('login')}>
              Proceed to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
