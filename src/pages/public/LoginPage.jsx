import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Lock, Mail, User, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export function LoginPage({ onNavigate }) {
  const { login } = useAuth();
  const toast = useToast();

  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const raw = window.location.hash.includes('?')
      ? window.location.hash.split('?')[1]
      : window.location.search.replace('?', '');
    if (raw) {
      const params = new URLSearchParams(raw);
      const urlError = params.get('error');
      if (urlError === 'google_not_configured') {
        setError('Google Sign-In is not configured yet. Please configure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env file.');
      } else if (urlError === 'google_cancelled') {
        setError('Google Sign-In was cancelled.');
      } else if (urlError) {
        setError(decodeURIComponent(urlError));
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!loginIdentifier.trim() || !password) {
      setError('Please provide your username/email and password.');
      return;
    }

    setLoading(true);
    try {
      await login({
        login: loginIdentifier.trim(),
        password,
        remember_me: rememberMe
      });
      toast.success('Welcome back to CodeTyper!');
      onNavigate('dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = () => {
    setLoginIdentifier('demo@codetyper.dev');
    setPassword('Peaceful_Demo_2026');
  };

  return (
    <div style={{ maxWidth: '440px', margin: '3rem auto', padding: '0 1rem' }}>
      <div className="card" style={{ padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Welcome Back</h2>
          <p style={{ fontSize: '0.925rem' }}>Log in to access your personalized practice and history.</p>
        </div>

        {error && (
          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--color-error-bg)',
              border: '1px solid var(--color-error-border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-error)',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.5rem'
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <a
          href="/api/auth/google"
          className="btn"
          id="btn-google-login"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            width: '100%',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            textDecoration: 'none',
            fontWeight: 500,
            fontSize: '0.925rem',
            border: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-bg-card)',
            color: 'var(--color-text-main)',
            boxShadow: 'var(--shadow-sm)',
            cursor: 'pointer',
            transition: 'background-color 150ms ease, border-color 150ms ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)';
            e.currentTarget.style.borderColor = 'var(--color-primary-sage)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-bg-card)';
            e.currentTarget.style.borderColor = 'var(--color-border)';
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" style={{ flexShrink: 0 }}>
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.616z" />
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
            <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" />
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z" />
          </svg>
          <span>Continue with Google</span>
        </a>

        <div style={{ display: 'flex', alignItems: 'center', margin: '1.25rem 0', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border-subtle)' }} />
          <span style={{ padding: '0 0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>or sign in with email</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border-subtle)' }} />
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-id">
              Username or Email
            </label>
            <input
              id="login-id"
              type="text"
              className="form-input"
              placeholder="e.g. sarah_coder or sarah@example.com"
              value={loginIdentifier}
              onChange={(e) => setLoginIdentifier(e.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <div className="form-group">
            <div className="form-label">
              <label htmlFor="login-password">Password</label>
              <button
                type="button"
                className="public-nav-link"
                style={{ fontSize: '0.8rem', color: 'var(--color-primary-forest)' }}
                onClick={() => onNavigate('forgot-password')}
              >
                Forgot Password?
              </button>
            </div>
            <div className="input-with-button">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="input-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            <input
              id="remember"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{ accentColor: 'var(--color-primary-forest)', width: '16px', height: '16px' }}
            />
            <label htmlFor="remember" style={{ color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
              Remember me on this browser
            </label>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginBottom: '1rem' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>

          {/* Quick Demo Fill button */}
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ width: '100%', marginBottom: '1.5rem' }}
            onClick={fillDemoAccount}
          >
            <Sparkles size={14} />
            <span>Use Demo Account (Sarah Jenkins)</span>
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--color-text-secondary)', borderTop: '1px solid var(--color-border-subtle)', paddingTop: '1.25rem' }}>
          Don't have an account yet?{' '}
          <button
            className="public-nav-link"
            style={{ fontWeight: 600, color: 'var(--color-primary-forest)' }}
            onClick={() => onNavigate('signup')}
          >
            Sign up free
          </button>
        </div>
      </div>
    </div>
  );
}
