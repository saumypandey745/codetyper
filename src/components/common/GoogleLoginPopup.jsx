import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useGoogleAuth } from '../../hooks/useGoogleAuth.js';

/**
 * GoogleLoginPopup — Ultra-Compact & Professional Google Sign-in Prompt.
 * - Displays in bottom-right with minimum space footprint (~76px height).
 * - Instant 1-click login on the spot via continueAsUser without any redirects.
 * - Hides automatically if dismissed or if native Chrome One Tap is showing.
 */
export function GoogleLoginPopup({ onNavigate, currentPath = '/' }) {
  const { continueAsUser } = useAuth();
  const toast = useToast();
  const { promptOneTap, isNativePromptShowing, isAuthenticating } = useGoogleAuth({
    onNavigate,
    autoPrompt: true,
    currentPath
  });

  const [dismissed, setDismissed] = useState(false);
  const [slideIn, setSlideIn] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [coords, setCoords] = useState({ top: 72, right: 24 });

  // Dynamically position card directly beneath the Sign Up / Get Started button
  useEffect(() => {
    const updatePosition = () => {
      const btn = document.getElementById('header-signup-btn') || document.querySelector('.header-auth-group');
      if (btn) {
        const rect = btn.getBoundingClientRect();
        setCoords({
          top: Math.round(rect.bottom + 8),
          right: Math.max(16, Math.round(window.innerWidth - rect.right))
        });
      }
    };

    updatePosition();
    const raf = requestAnimationFrame(updatePosition);
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [currentPath]);

  // Reset dismissal on route change or refresh so user is reminded
  useEffect(() => {
    setDismissed(false);
    setSlideIn(false);
    const t = setTimeout(() => {
      setSlideIn(true);
    }, 450);
    return () => clearTimeout(t);
  }, [currentPath]);

  // Account details
  const account = (() => {
    try {
      const raw = localStorage.getItem('codetyper_last_user');
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return {
      name: 'Saumy Pandey',
      email: 'saumypandey745@gmail.com',
      avatar: null
    };
  })();

  const firstName = account.name ? account.name.split(' ')[0] : 'Saumy';

  const handleSignIn = async () => {
    if (isLoggingIn || isAuthenticating) return;
    setIsLoggingIn(true);

    try {
      if (account.email) {
        // Direct 1-click login on the spot without ANY redirect or "Choose an account" screen!
        const res = await continueAsUser(account.email);
        toast.success(`Welcome to CodeTyper, ${res.user.full_name || res.user.username}!`);
        if (onNavigate) {
          onNavigate('dashboard');
        } else {
          window.location.href = '/dashboard';
        }
        return;
      }
    } catch (err) {
      console.warn('[Direct Login fallback to Google OAuth]', err);
      // Fallback: trigger Google OAuth with login_hint to auto-select account
      window.location.href = `/api/auth/google?login_hint=${encodeURIComponent(account.email || '')}`;
    } finally {
      setIsLoggingIn(false);
    }
  };

  // If dismissed manually in current view OR native Chrome prompt is already showing, hide card
  if (dismissed || isNativePromptShowing) {
    return null;
  }

  const popupContent = (
    <div
      className={`gl-google-card ${slideIn ? 'gl-google-card-visible' : ''}`}
      style={{
        top: `${coords.top}px`,
        right: `${coords.right}px`
      }}
      role="dialog"
      aria-label="Sign in with Google"
    >
      {/* Top Header */}
      <div className="gl-google-card-header">
        <div className="gl-google-card-brand">
          <svg width="16" height="16" viewBox="0 0 18 18" className="gl-google-svg">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.616z" />
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
            <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" />
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z" />
          </svg>
          <span className="gl-google-card-title">Sign in with Google</span>
        </div>
        <button
          className="gl-google-card-close"
          onClick={() => setDismissed(true)}
          title="Close"
          aria-label="Close"
        >
          <X size={13} />
        </button>
      </div>

      <div className="gl-google-card-divider" />

      {/* Account Info + Action Inline Row */}
      <div className="gl-google-card-body">
        <div
          className="gl-google-card-account"
          onClick={handleSignIn}
          title={`Sign in as ${account.name}`}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSignIn(); }}
        >
          <div className="gl-google-card-avatar">
            {account.avatar ? (
              <img src={account.avatar} alt={account.name} />
            ) : (
              <span>{firstName[0]}</span>
            )}
          </div>
          <div className="gl-google-card-account-text">
            <span className="gl-google-card-name">{account.name}</span>
            <span className="gl-google-card-email">{account.email}</span>
          </div>
        </div>

        <button
          id="btn-google-onetap-continue"
          className="gl-google-card-btn"
          onClick={handleSignIn}
          disabled={isLoggingIn || isAuthenticating}
        >
          {isLoggingIn ? 'Logging in...' : `Continue as ${firstName}`}
        </button>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? ReactDOM.createPortal(popupContent, document.body)
    : null;
}
