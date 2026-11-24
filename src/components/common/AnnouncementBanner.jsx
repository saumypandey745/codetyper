import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Megaphone, AlertTriangle, Info, X, Radio } from 'lucide-react';
import { api } from '../../utils/api.js';

export function AnnouncementBanner() {
  const [announcement, setAnnouncement] = useState(null);
  const [dismissedText, setDismissedText] = useState(() => {
    try {
      return sessionStorage.getItem('codetyper_dismissed_announcement_text') || '';
    } catch {
      return '';
    }
  });
  const [isFreshUpdate, setIsFreshUpdate] = useState(false);
  const lastCleanTextRef = useRef('');

  const updateAnnouncement = useCallback((data) => {
    if (!data) return;
    const isEnabled = Boolean(data.enabled && data.text && data.text.trim());
    if (!isEnabled) {
      setAnnouncement(null);
      return;
    }

    const cleanText = data.text.trim();
    if (lastCleanTextRef.current && lastCleanTextRef.current !== cleanText) {
      setIsFreshUpdate(true);
      setTimeout(() => setIsFreshUpdate(false), 1200);
    }
    lastCleanTextRef.current = cleanText;

    setAnnouncement({
      enabled: true,
      text: cleanText,
      type: data.type || 'info',
      maintenance_mode: Boolean(data.maintenance_mode),
      timestamp: data.timestamp || Date.now()
    });
  }, []);

  useEffect(() => {
    let isMounted = true;

    // 1. Initial snapshot fetch
    api.system.getAnnouncement()
      .then((data) => {
        if (isMounted) updateAnnouncement(data);
      })
      .catch(() => {});

    // 2. Real-Time Server-Sent Events (SSE) Live Stream
    let eventSource = null;
    let reconnectTimer = null;

    const connectSSE = () => {
      if (typeof window === 'undefined' || typeof EventSource === 'undefined') return;
      try {
        eventSource = new EventSource('/api/system/announcement/stream');

        eventSource.onmessage = (event) => {
          if (!isMounted) return;
          try {
            const data = JSON.parse(event.data);
            updateAnnouncement(data);
          } catch {}
        };

        eventSource.onerror = () => {
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }
          if (isMounted) {
            reconnectTimer = setTimeout(connectSSE, 4000);
          }
        };
      } catch {}
    };

    connectSSE();

    // 3. Instant Same-Window Custom Event Listener (0ms latency for admin changes)
    const handleLocalUpdate = (e) => {
      if (isMounted && e.detail) {
        updateAnnouncement(e.detail);
      }
    };
    window.addEventListener('codetyper:announcement_update', handleLocalUpdate);

    // 4. Cross-Tab Synchronization via BroadcastChannel (0ms latency across browser tabs)
    let broadcastChannel = null;
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        broadcastChannel = new BroadcastChannel('codetyper_announcements');
        broadcastChannel.onmessage = (event) => {
          if (isMounted && event.data) {
            updateAnnouncement(event.data);
          }
        };
      } catch {}
    }

    // 5. Window Focus / Tab Visibility Change Handler
    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible' && isMounted) {
        api.system.getAnnouncement()
          .then((data) => {
            if (isMounted) updateAnnouncement(data);
          })
          .catch(() => {});
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('focus', handleVisibilityOrFocus);

    // 6. Safety Periodic Poll (every 20s as fallback if SSE is disconnected)
    const pollInterval = setInterval(() => {
      if (isMounted && (!eventSource || eventSource.readyState === EventSource.CLOSED)) {
        api.system.getAnnouncement()
          .then((data) => {
            if (isMounted) updateAnnouncement(data);
          })
          .catch(() => {});
      }
    }, 20000);

    return () => {
      isMounted = false;
      if (eventSource) eventSource.close();
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (broadcastChannel) broadcastChannel.close();
      clearInterval(pollInterval);
      window.removeEventListener('codetyper:announcement_update', handleLocalUpdate);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('focus', handleVisibilityOrFocus);
    };
  }, [updateAnnouncement]);

  const handleDismiss = () => {
    if (announcement?.text) {
      setDismissedText(announcement.text);
      try {
        sessionStorage.setItem('codetyper_dismissed_announcement_text', announcement.text);
      } catch {}
    }
  };

  const isDismissed = announcement && dismissedText === announcement.text;

  if (!announcement || !announcement.enabled || !announcement.text || isDismissed) {
    return null;
  }

  const getTypeStyles = () => {
    switch (announcement.type) {
      case 'warning':
        return {
          bg: 'linear-gradient(90deg, rgba(224, 159, 62, 0.16) 0%, rgba(224, 159, 62, 0.08) 100%)',
          border: 'rgba(224, 159, 62, 0.45)',
          color: 'var(--color-text-primary)',
          iconColor: '#D97706',
          badgeBg: 'rgba(217, 119, 6, 0.14)',
          icon: <AlertTriangle size={16} color="#D97706" style={{ flexShrink: 0 }} />,
          label: 'System Notice'
        };
      case 'announcement':
        return {
          bg: 'linear-gradient(90deg, rgba(35, 107, 77, 0.15) 0%, rgba(35, 107, 77, 0.07) 100%)',
          border: 'rgba(35, 107, 77, 0.36)',
          color: 'var(--color-text-primary)',
          iconColor: 'var(--color-primary-forest)',
          badgeBg: 'rgba(35, 107, 77, 0.12)',
          icon: <Megaphone size={16} color="var(--color-primary-forest)" style={{ flexShrink: 0 }} />,
          label: 'Platform Update'
        };
      case 'info':
      default:
        return {
          bg: 'linear-gradient(90deg, rgba(59, 130, 246, 0.14) 0%, rgba(59, 130, 246, 0.06) 100%)',
          border: 'rgba(59, 130, 246, 0.36)',
          color: 'var(--color-text-primary)',
          iconColor: '#2563EB',
          badgeBg: 'rgba(37, 99, 235, 0.12)',
          icon: <Info size={16} color="#2563EB" style={{ flexShrink: 0 }} />,
          label: 'Information'
        };
    }
  };

  const style = getTypeStyles();

  return (
    <aside
      aria-label="Platform Announcement"
      className={`announcement-banner-root ${isFreshUpdate ? 'announcement-flash' : ''}`}
      style={{
        backgroundColor: style.bg,
        borderBottom: `1px solid ${style.border}`,
        color: style.color,
        padding: '0.6rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        fontSize: '0.88rem',
        position: 'relative',
        zIndex: 50,
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        animation: 'bannerSlideDown 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      <style>{`
        @keyframes bannerSlideDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .announcement-flash {
          animation: bannerSlideDown 0.35s ease, bannerPulse 1.2s ease !important;
        }
        @keyframes bannerPulse {
          0% { filter: brightness(1); }
          30% { filter: brightness(1.25); transform: scale(1.002); }
          100% { filter: brightness(1); transform: scale(1); }
        }
      `}</style>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          flex: 1,
          minWidth: 0,
          justifyContent: 'center'
        }}
      >
        {style.icon}
        <span
          style={{
            fontSize: '0.72rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontWeight: 700,
            padding: '0.15rem 0.55rem',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: style.badgeBg,
            color: style.iconColor,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            flexShrink: 0
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: style.iconColor,
              display: 'inline-block',
              animation: 'bannerDotPulse 2s infinite ease-in-out'
            }}
          />
          {style.label}
        </span>
        <span
          style={{
            fontWeight: 500,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            letterSpacing: '-0.01em'
          }}
          title={announcement.text}
        >
          {announcement.text}
        </span>
      </div>

      <button
        onClick={handleDismiss}
        aria-label="Dismiss Announcement"
        title="Dismiss announcement"
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '0.25rem',
          display: 'flex',
          alignItems: 'center',
          color: 'var(--color-text-muted)',
          borderRadius: 'var(--radius-sm)',
          transition: 'color 0.15s ease, background-color 0.15s ease',
          flexShrink: 0
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--color-text-primary)';
          e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--color-text-muted)';
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <X size={16} />
      </button>
    </aside>
  );
}
