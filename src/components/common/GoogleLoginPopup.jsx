import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';

/**
 * GoogleLoginPopup — landing page pe 1.8s baad bottom-right mein slide-in hota hai.
 * Portal ke through document.body mein render hota hai.
 */
export function GoogleLoginPopup({ onNavigate, onDismiss }) {
  const [visible, setVisible] = useState(false);
  const [slideIn, setSlideIn] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem('ct_google_popup_dismissed');
    if (dismissed) return;

    const t = setTimeout(() => {
      setVisible(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setSlideIn(true)));
    }, 1800);

    return () => clearTimeout(t);
  }, []);

  const handleDismiss = () => {
    setSlideIn(false);
    setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem('ct_google_popup_dismissed', '1');
      if (onDismiss) onDismiss();
    }, 350);
  };

  if (!visible) return null;

  const popup = (
    <div
      className={`gl-popup-wrapper ${slideIn ? 'gl-popup-visible' : ''}`}
      role="dialog"
      aria-label="Sign in with Google"
    >
      {/* Close */}
      <button className="gl-popup-close" onClick={handleDismiss} aria-label="Dismiss">
        <X size={14} />
      </button>

      {/* Header */}
      <div className="gl-popup-header">
        <div className="gl-popup-google-icon">
          <svg width="20" height="20" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.616z" />
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
            <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" />
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z" />
          </svg>
        </div>
        <div className="gl-popup-title-block">
          <span className="gl-popup-title">Continue with Google</span>
          <span className="gl-popup-subtitle">Sign in to track your progress</span>
        </div>
      </div>

      {/* Single CTA */}
      <a
        id="gl-popup-google-btn"
        href="/api/auth/google"
        className="gl-popup-btn gl-popup-btn-primary"
      >
        <svg width="16" height="16" viewBox="0 0 18 18" style={{ flexShrink: 0 }}>
          <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.616z" />
          <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
          <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" />
          <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z" />
        </svg>
        Sign in with Google
      </a>
    </div>
  );

  return ReactDOM.createPortal(popup, document.body);
}
