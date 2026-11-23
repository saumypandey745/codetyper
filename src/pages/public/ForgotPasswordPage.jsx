import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle2, AlertCircle, ArrowLeft, Lock, Eye, EyeOff } from 'lucide-react';
import { api } from '../../utils/api.js';

export function ForgotPasswordPage({ onNavigate }) {
  const [email, setEmail] = useState('');
  const [stage, setStage] = useState('request'); // 'request' | 'sent' | 'reset' | 'success'
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Auto-detect token if user clicked a reset link from email
  // Supports both: /#forgot-password?token=XYZ  and  /reset-password?token=XYZ
  useEffect(() => {
    const hashQuery = window.location.hash.includes('?')
      ? window.location.hash.split('?')[1]
      : '';
    const searchQuery = window.location.search.replace('?', '');
    const raw = hashQuery || searchQuery;

    if (raw) {
      const params = new URLSearchParams(raw);
      const urlToken = params.get('token');
      if (urlToken) {
        setToken(urlToken);
        setStage('reset');
        // Clean the token from URL to prevent accidental reuse
        if (window.history && window.history.replaceState) {
          const cleanHash = window.location.hash.split('?')[0];
          window.history.replaceState(null, '', cleanHash || window.location.pathname);
        }
      }
    }
  }, []);

  const handleRequestEmail = async (e) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await api.auth.forgotPassword(trimmed);
      if (res && res.devOtp) {
        setToken(res.devOtp);
      } else if (res && res.devResetToken) {
        setToken(res.devResetToken);
      }
      setCooldown(60);
      // Always show "sent" screen regardless of whether account exists (security: no account enumeration)
      setStage('sent');
    } catch (err) {
      setError(err.message || 'Could not process recovery request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyReset = async (e) => {
    e.preventDefault();

    if (!token.trim()) {
      setError('Please enter the reset token from your email.');
      return;
    }
    if (!newPassword) {
      setError('Please enter a new password.');
      return;
    }
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
      setError(err.message || 'Could not reset password. The link may be expired or invalid.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoToLogin = () => {
    // Navigate to login with success flag so it shows a confirmation banner
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, '', '#login?success=password_reset');
    }
    onNavigate('login');
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
          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--color-error-bg)',
              border: '1px solid var(--color-error-border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-error)',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.5rem',
              marginBottom: '1.25rem'
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
            <span>{error}</span>
          </div>
        )}

        {/* STAGE 1: Request Email Form */}
        {stage === 'request' && (
          <div>
            <h2 style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>Reset Your Password</h2>
            <p style={{ fontSize: '0.925rem', marginBottom: '1.5rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
              Enter the email address associated with your account. If it exists, we'll send a password reset link to your inbox.
            </p>

            <form onSubmit={handleRequestEmail}>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" htmlFor="reset-email">Email Address</label>
                <input
                  id="reset-email"
                  type="email"
                  className="form-input"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  autoFocus
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%' }}
                disabled={loading}
              >
                {loading ? 'Sending Recovery Link...' : 'Send Recovery Link'}
              </button>
            </form>
          </div>
        )}

        {/* STAGE 2: Email Dispatched Confirmation */}
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
              We've dispatched a <strong>6-digit OTP</strong> and secure reset link to <strong>{email}</strong>. Check your inbox to complete your password reset.
            </p>

            <div
              style={{
                padding: '0.85rem',
                backgroundColor: 'var(--color-bg-subtle)',
                borderRadius: 'var(--radius-md)',
                textAlign: 'left',
                fontSize: '0.825rem',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.5,
                marginBottom: '1.5rem'
              }}
            >
              <strong>Didn't receive the email?</strong>
              <ul style={{ margin: '0.35rem 0 0 1.1rem', padding: 0 }}>
                <li>Check your Spam, Junk, or Promotions folder.</li>
                <li>Make sure the email address was typed correctly.</li>
                <li>OTP and links expire in 15 minutes — request a new one if needed.</li>
              </ul>
            </div>

            {/* Enter OTP or token directly */}
            <div style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>
                Enter the 6-Digit OTP from your email:
              </p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 583920 or paste reset token"
                  value={token}
                  onChange={(e) => setToken(e.target.value.trim())}
                  style={{
                    flex: 1,
                    fontSize: '1rem',
                    letterSpacing: token && /^\d+$/.test(token) ? '4px' : 'normal',
                    fontWeight: token && /^\d+$/.test(token) ? 700 : 400
                  }}
                  autoFocus
                />
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  disabled={!token.trim()}
                  onClick={() => {
                    if (token.trim()) {
                      setError('');
                      setStage('reset');
                    }
                  }}
                >
                  Verify OTP
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <button
                type="button"
                className="btn btn-outline"
                style={{ width: '100%' }}
                disabled={loading || cooldown > 0}
                onClick={async () => {
                  if (cooldown > 0 || loading) return;
                  setLoading(true);
                  setError('');
                  try {
                    const res = await api.auth.forgotPassword(email.trim());
                    if (res && res.devOtp) {
                      setToken(res.devOtp);
                    }
                    setCooldown(60);
                  } catch (err) {
                    setError(err.message || 'Could not resend OTP.');
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                {cooldown > 0 ? `Resend OTP (${cooldown}s)` : 'Resend OTP to Email'}
              </button>

              <button
                type="button"
                className="btn btn-ghost btn-sm"
                style={{ width: '100%' }}
                onClick={() => {
                  setStage('request');
                  setToken('');
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

        {/* STAGE 3: Set New Password Form */}
        {stage === 'reset' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Lock size={22} color="var(--color-primary-forest)" />
              <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Set New Password</h2>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
              Enter and confirm your new password below.
            </p>

            <form onSubmit={handleApplyReset} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              {/* Show token field only if it wasn't auto-filled from URL */}
              {!token ? (
                <div className="form-group">
                  <label className="form-label" htmlFor="reset-token">6-Digit OTP or Reset Token</label>
                  <input
                    id="reset-token"
                    type="text"
                    className="form-input"
                    placeholder="Enter 6-digit OTP or paste token"
                    value={token}
                    onChange={(e) => setToken(e.target.value.trim())}
                    required
                  />
                </div>
              ) : (
                <div style={{
                  padding: '0.65rem 0.85rem',
                  backgroundColor: 'var(--color-bg-subtle)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.85rem',
                  color: 'var(--color-primary-forest)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <span>✓ Reset code / OTP entered</span>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                    onClick={() => setToken('')}
                  >
                    Change Code
                  </button>
                </div>
              )}

              <div className="form-group">
                <label className="form-label" htmlFor="new-password">New Password (8+ characters)</label>
                <div className="input-with-button">
                  <input
                    id="new-password"
                    type={showNewPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="••••••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    autoFocus
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="input-toggle-btn"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="confirm-new-password">Confirm New Password</label>
                <div className="input-with-button">
                  <input
                    id="confirm-new-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="••••••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="input-toggle-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {confirmPassword && newPassword && confirmPassword !== newPassword && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-error)', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <AlertCircle size={13} /> Passwords do not match.
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '0.5rem' }}
                disabled={loading || (confirmPassword && newPassword && confirmPassword !== newPassword)}
              >
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
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Password Updated!</h2>
            <p style={{ fontSize: '0.925rem', color: 'var(--color-text-secondary)', marginBottom: '1.75rem', lineHeight: 1.5 }}>
              Your password has been reset successfully. You can now sign in with your new password.
            </p>
            <button
              className="btn btn-primary"
              style={{ width: '100%' }}
              onClick={handleGoToLogin}
            >
              Go to Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
