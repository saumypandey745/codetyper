import React, { useState, useEffect } from 'react';
import { X, ArrowRight, LogIn } from 'lucide-react';

/**
 * GoogleLoginPopup
 * Landing page pe dikhne wala smart popup jo Google sign-in suggest karta hai.
 * 1.8s delay ke baad bottom-right corner se slide-in hota hai.
 */
export function GoogleLoginPopup({ onNavigate, onDismiss }) {
  const [visible, setVisible] = useState(false);
  const [slideIn, setSlideIn] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem('ct_google_popup_dismissed');
    if (dismissed) return;

    const showTimer = setTimeout(() => {
      setVisible(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setSlideIn(true));
      });
    }, 1800);

    return () => clearTimeout(showTimer);
  }, []);

  const handleDismiss = () => {
    setSlideIn(false);
    setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem('ct_google_popup_dismissed', '1');
      if (onDismiss) onDismiss();
    }, 350);
  };

  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google';
  };

  const handleEmailLogin = () => {
    handleDismiss();
    onNavigate('/login');
  };

  if (!visible) return null;

  return (
    <div
      className={`gl-popup-wrapper ${slideIn ? 'gl-popup-visible' : ''}`}
      role="dialog"
      aria-modal="false"
      aria-label="Sign in suggestion"
    >
      <button
        className="gl-popup-close"
        onClick={handleDismiss}
        aria-label="Dismiss sign-in suggestion"
        title="Dismiss"
      >
        <X size={15} />
      </button>

      <div className="gl-popup-header">
        <div className="gl-popup-google-icon">
          <svg width="22" height="22" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.616z" />
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
            <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" />
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z" />
          </svg>
        </div>
        <div className="gl-popup-title-block">
          <span className="gl-popup-title">Sign in with Google</span>
          <span className="gl-popup-subtitle">Use your Chrome account to continue</span>
        </div>
      </div>

      <p className="gl-popup-desc">
        Track your WPM progress, earn certificates and compete on leaderboards.
      </p>

      <button
        id="gl-popup-google-btn"
        className="gl-popup-btn gl-popup-btn-primary"
        onClick={handleGoogleLogin}
      >
        <svg width="16" height="16" viewBox="0 0 18 18" style={{ flexShrink: 0 }}>
          <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.616z" />
          <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
          <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" />
          <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z" />
        </svg>
        Continue with Google
        <ArrowRight size={14} style={{ marginLeft: 'auto' }} />
      </button>

      <button
        id="gl-popup-email-btn"
        className="gl-popup-btn gl-popup-btn-secondary"
        onClick={handleEmailLogin}
      >
        <LogIn size={15} />
        Sign in with email instead
      </button>

      <p className="gl-popup-footer-note">
        No account?{' '}
        <button
          className="gl-popup-link"
          onClick={() => { handleDismiss(); onNavigate('/signup'); }}
        >
          Create one free →
        </button>
      </p>
    </div>
  );
}
