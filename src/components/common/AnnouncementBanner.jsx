import React, { useState, useEffect } from 'react';
import { Megaphone, AlertTriangle, Info, X } from 'lucide-react';
import { api } from '../../utils/api.js';

export function AnnouncementBanner() {
  const [announcement, setAnnouncement] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let isMounted = true;
    api.system.getAnnouncement()
      .then((data) => {
        if (isMounted && data?.enabled && data?.text?.trim()) {
          setAnnouncement(data);
        }
      })
      .catch(() => {
        // Fail silently if network/api is down
      });

    return () => { isMounted = false; };
  }, []);

  if (!announcement || !announcement.enabled || !announcement.text || dismissed) {
    return null;
  }

  const getTypeStyles = () => {
    switch (announcement.type) {
      case 'warning':
        return {
          bg: 'rgba(224, 159, 62, 0.14)',
          border: 'rgba(224, 159, 62, 0.4)',
          color: 'var(--color-text-primary)',
          iconColor: '#D97706',
          icon: <AlertTriangle size={17} color="#D97706" style={{ flexShrink: 0 }} />,
          label: 'System Notice'
        };
      case 'announcement':
        return {
          bg: 'rgba(35, 107, 77, 0.12)',
          border: 'rgba(35, 107, 77, 0.35)',
          color: 'var(--color-text-primary)',
          iconColor: 'var(--color-primary-forest)',
          icon: <Megaphone size={17} color="var(--color-primary-forest)" style={{ flexShrink: 0 }} />,
          label: 'Platform Update'
        };
      case 'info':
      default:
        return {
          bg: 'rgba(59, 130, 246, 0.12)',
          border: 'rgba(59, 130, 246, 0.35)',
          color: 'var(--color-text-primary)',
          iconColor: '#2563EB',
          icon: <Info size={17} color="#2563EB" style={{ flexShrink: 0 }} />,
          label: 'Information'
        };
    }
  };

  const style = getTypeStyles();

  return (
    <aside
      aria-label="Platform Announcement"
      style={{
        backgroundColor: style.bg,
        borderBottom: `1px solid ${style.border}`,
        color: style.color,
        padding: '0.65rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        fontSize: '0.88rem',
        position: 'relative',
        zIndex: 50,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0, justifyContent: 'center' }}>
        {style.icon}
        <span
          style={{
            fontSize: '0.72rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontWeight: 700,
            padding: '0.15rem 0.5rem',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'rgba(0,0,0,0.06)',
            color: style.iconColor
          }}
        >
          {style.label}
        </span>
        <span style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {announcement.text}
        </span>
      </div>

      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss Announcement"
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '0.25rem',
          display: 'flex',
          alignItems: 'center',
          color: 'var(--color-text-muted)',
          borderRadius: 'var(--radius-sm)',
          transition: 'color 0.15s ease'
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-text-primary)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-muted)'; }}
      >
        <X size={16} />
      </button>
    </aside>
  );
}
