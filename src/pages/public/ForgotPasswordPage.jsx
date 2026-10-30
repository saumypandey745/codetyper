import React, { useState } from 'react';
import { Mail, CheckCircle2, AlertCircle, ArrowLeft, KeyRound, Lock } from 'lucide-react';
import { api } from '../../utils/api.js';

export function ForgotPasswordPage({ onNavigate }) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRequestToken = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError('');
    try {
      const res = await api.auth.forgotPassword(email.trim());
      setSubmitted(true);
      if (res.devResetToken) {
        setToken(res.devResetToken);
      }
    } catch (err) {
      setError(err.message || 'Could not process request.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
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
      setResetSuccess(true);
    } catch (err) {
      setError(err.message || 'Could not reset password. The token may be expired or invalid.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '440px', margin: '3.5rem auto', padding: '0 1rem' }}>
      <div className="card" style={{ padding: '2.5rem' }}>
        <button
          className="btn btn-ghost btn-sm"
          style={{ marginBottom: '1rem', paddingLeft: 0 }}
          onClick={() => onNavigate('login')}
        >
          <ArrowLeft size={16} />
          <span>Back to Login</span>
        </button>

        <h2 style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>
          {resetSuccess ? 'Password Reset Complete' : submitted ? 'Complete Password Reset' : 'Reset Your Password'}
        </h2>
        <p style={{ fontSize: '0.925rem', marginBottom: '1.5rem', color: 'var(--color-text-secondary)' }}>
          {resetSuccess
            ? 'Your credentials have been securely updated. You can now log into your sanctuary.'
            : submitted
            ? 'Enter your reset token and new secure password below.'
            : 'Enter the email associated with your account and we will generate recovery instructions.'}
        </p>

        {error && (
          <div style={{ padding: '0.75rem', backgroundColor: 'var(--color-error-bg)', color: 'var(--color-error)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        {resetSuccess ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary-forest)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <CheckCircle2 size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Password Successfully Updated</h3>
            <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Your new password is now active and ready to use.
            </p>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => onNavigate('login')}>
              Proceed to Login
            </button>
          </div>
        ) : submitted ? (
          <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="reset-token">
                Security Reset Token
              </label>
              <input
                id="reset-token"
                type="text"
                className="form-input"
                placeholder="Paste your 64-character reset token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="new-password">
                New Password (8+ characters)
              </label>
              <input
                id="new-password"
                type="password"
                className="form-input"
                placeholder="••••••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirm-new-password">
                Confirm New Password
              </label>
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

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Updating Password...' : 'Save New Password'}
            </button>

            <button
              type="button"
              className="btn btn-ghost btn-sm"
              style={{ marginTop: '0.5rem' }}
              onClick={() => {
                setSubmitted(false);
                setError('');
              }}
            >
              Request Different Token
            </button>
          </form>
        ) : (
          <form onSubmit={handleRequestToken}>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" htmlFor="reset-email">Email Address</label>
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
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Sending...' : 'Send Recovery Instructions'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

