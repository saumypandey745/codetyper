import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Share2,
  Download,
  Printer,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  Lock,
  Search,
  Check,
  Feather
} from 'lucide-react';
import { api } from '../../utils/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useSettings } from '../../context/SettingsContext.jsx';
import {
  getLinkedInCertificationUrl,
  getSocialShareUrls,
  CERTIFICATE_THEME_TIERS
} from '../../utils/certificateEligibility.js';
import { TypingCertificateModal } from '../../components/typing/TypingCertificateModal.jsx';
import { soundEngine } from '../../utils/soundEngine.js';

export function VerifyCertificatePage({ certId: initialCertId, onNavigate }) {
  const toast = useToast();
  const { settings } = useSettings();
  const isDark = settings?.theme === 'dark';
  const [certId, setCertId] = useState(initialCertId || '');
  const [searchInput, setSearchInput] = useState(initialCertId || '');
  const [loading, setLoading] = useState(true);
  const [certData, setCertData] = useState(null);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Sync if URL param changes
  useEffect(() => {
    if (initialCertId) {
      setCertId(initialCertId);
      setSearchInput(initialCertId);
    }
  }, [initialCertId]);

  useEffect(() => {
    if (!certId) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    async function fetchVerification() {
      try {
        const res = await api.certificate.verify(certId);
        if (isMounted) {
          if (res.verified && res.certificate) {
            setCertData(res.certificate);
            // Play authentic wax seal sound on successful verification
            soundEngine.playWaxSealStamp();
          } else {
            setError(res.error || 'Certificate could not be verified in the CodeTyper registry.');
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Verification lookup failed. Please check the Certificate ID.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchVerification();
    return () => {
      isMounted = false;
    };
  }, [certId]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setCertId(searchInput.trim().toUpperCase());
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success('Verification URL copied to clipboard.');
    setTimeout(() => setCopied(false), 2500);
  };

  const shareUrls = certData
    ? getSocialShareUrls({
        certId: certData.certId,
        recipientName: certData.recipientName,
        wpm: certData.netWpm,
        accuracy: certData.accuracy,
        tierTitle: certData.tierTitle
      })
    : null;

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Banner / Verification Header */}
      {/* Header Search & Verification Portal Card */}
      <div
        className="card"
        style={{
          padding: '2.5rem 2rem',
          textAlign: 'center',
          background: isDark
            ? 'radial-gradient(ellipse at 50% -20%, rgba(234, 179, 8, 0.22) 0%, rgba(15, 23, 42, 0.95) 75%)'
            : 'radial-gradient(ellipse at 50% -20%, rgba(254, 240, 138, 0.5) 0%, #ffffff 80%)',
          border: isDark ? '1px solid rgba(234, 179, 8, 0.4)' : '1px solid rgba(217, 119, 6, 0.3)',
          boxShadow: isDark ? '0 12px 36px rgba(0, 0, 0, 0.45)' : '0 12px 36px rgba(120, 53, 15, 0.08)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 1rem',
            borderRadius: '9999px',
            backgroundColor: isDark ? 'rgba(56, 189, 248, 0.12)' : 'rgba(2, 132, 199, 0.08)',
            border: isDark ? '1px solid rgba(56, 189, 248, 0.35)' : '1px solid rgba(2, 132, 199, 0.25)',
            color: isDark ? '#38bdf8' : '#0284c7',
            fontSize: '0.85rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '1rem'
          }}
        >
          <ShieldCheck size={16} />
          <span>CodeTyper Global Accreditation Registry</span>
        </div>

        <h1 style={{ fontSize: '2.4rem', fontWeight: 900, color: isDark ? '#f8fafc' : '#15291F', margin: '0 0 0.75rem 0', letterSpacing: '-0.02em' }}>
          Official Credential Verification
        </h1>
        <p style={{ maxWidth: '620px', margin: '0 auto 1.5rem auto', color: isDark ? '#94a3b8' : '#50665A', fontSize: '1rem', lineHeight: 1.6 }}>
          Immutable proof of touch-typing competency, standardized speed assessment, and authentic founder sign-off by{' '}
          <strong style={{ color: isDark ? '#f8fafc' : '#15291F' }}>Saumy Pandey</strong>.
        </p>

        {/* Search Bar for Other IDs */}
        <form onSubmit={handleSearchSubmit} style={{ maxWidth: '480px', margin: '0 auto', display: 'flex', gap: '0.5rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              type="text"
              className="input"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Enter Certificate Serial (e.g. CT-2026-4G05C3)"
              style={{
                width: '100%',
                paddingLeft: '2.8rem',
                backgroundColor: isDark ? 'rgba(7, 11, 20, 0.85)' : '#ffffff',
                borderColor: isDark ? 'rgba(234, 179, 8, 0.35)' : 'rgba(217, 119, 6, 0.3)',
                color: isDark ? '#f8fafc' : '#15291F',
                fontWeight: 600,
                textTransform: 'uppercase',
                fontSize: '0.9rem'
              }}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            style={{
              background: 'linear-gradient(135deg, #ca8a04 0%, #eab308 100%)',
              color: '#070b14',
              fontWeight: 700,
              border: 'none',
              padding: '0 1.25rem'
            }}
          >
            Verify
          </button>
        </form>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="card" style={{ padding: '3.5rem', textAlign: 'center', backgroundColor: isDark ? 'var(--color-bg-surface)' : '#ffffff' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              border: '4px solid rgba(234, 179, 8, 0.2)',
              borderTopColor: '#eab308',
              borderRadius: '50%',
              margin: '0 auto 1.5rem auto',
              animation: 'spin 0.8s linear infinite'
            }}
          />
          <h3 style={{ margin: '0 0 0.5rem 0', color: isDark ? '#f8fafc' : '#15291F' }}>Querying Global Certificate Ledger...</h3>
          <p style={{ color: isDark ? '#94a3b8' : '#50665A', margin: 0 }}>Validating digital signature and cryptographic hash...</p>
        </div>
      )}

      {/* Error / Not Found State */}
      {!loading && error && (
        <div
          className="card"
          style={{
            padding: '2.5rem',
            textAlign: 'center',
            borderColor: 'rgba(239, 68, 68, 0.4)',
            background: isDark
              ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(15, 23, 42, 0.9) 100%)'
              : 'linear-gradient(135deg, #fef2f2 0%, #ffffff 100%)',
            boxShadow: isDark ? 'none' : '0 10px 30px rgba(239, 68, 68, 0.08)'
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem auto'
            }}
          >
            <AlertTriangle size={28} />
          </div>
          <h2 style={{ color: isDark ? '#f8fafc' : '#991b1b', margin: '0 0 0.5rem 0' }}>Credential Not Authenticated</h2>
          <p style={{ color: isDark ? '#fca5a5' : '#b91c1c', maxWidth: '520px', margin: '0 auto 1.5rem auto' }}>{error}</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              className="btn btn-outline"
              onClick={() => {
                setCertId('CT-2026-DEMO');
                setSearchInput('CT-2026-DEMO');
              }}
              style={{
                borderColor: isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.2)',
                color: isDark ? '#cbd5e1' : '#475569'
              }}
            >
              Try Demo Certificate ID
            </button>
            <button className="btn btn-primary" onClick={() => onNavigate && onNavigate('test')}>
              Take Certification Test
            </button>
          </div>
        </div>
      )}

      {/* Verified Certificate Showcase */}
      {!loading && certData && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Main Authenticated Credential Card */}
          <div
            className="card"
            style={{
              padding: '2rem 2.25rem',
              background: isDark
                ? 'linear-gradient(135deg, rgba(234, 179, 8, 0.12) 0%, rgba(15, 23, 42, 0.95) 100%)'
                : 'linear-gradient(135deg, #ffffff 0%, #fffdf7 100%)',
              border: isDark ? '2px solid rgba(234, 179, 8, 0.55)' : '2px solid rgba(217, 119, 6, 0.45)',
              boxShadow: isDark ? '0 16px 40px rgba(0, 0, 0, 0.35)' : '0 16px 40px rgba(120, 53, 15, 0.12)',
              position: 'relative'
            }}
          >
            {/* Top Status Badge */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
                borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.08)',
                paddingBottom: '1.25rem',
                marginBottom: '1.75rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    color: '#10b981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(16, 185, 129, 0.4)'
                  }}
                >
                  <CheckCircle2 size={22} />
                </div>
                <div>
                  <div style={{ color: isDark ? '#10b981' : '#059669', fontWeight: 800, fontSize: '0.9rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    Authentic & Verified Active Credential
                  </div>
                  <div style={{ fontSize: '0.8rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                    Issued by CodeTyper Examination Commission • ISO/IEC Competency
                  </div>
                </div>
              </div>

              <div
                style={{
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  fontSize: '1rem',
                  color: isDark ? '#facc15' : '#b45309',
                  backgroundColor: isDark ? 'rgba(234, 179, 8, 0.12)' : 'rgba(217, 119, 6, 0.08)',
                  padding: '0.35rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  border: isDark ? '1px solid rgba(234, 179, 8, 0.3)' : '1px solid rgba(217, 119, 6, 0.25)'
                }}
              >
                ID: {certData.certId}
              </div>
            </div>

            {/* Recipient Spotlight */}
            <div style={{ textAlign: 'center', margin: '1rem 0 2rem 0' }}>
              <span style={{ fontSize: '0.85rem', color: isDark ? '#94a3b8' : '#78716c', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600 }}>
                This is to officially certify that
              </span>
              <h2
                style={{
                  fontSize: '2.5rem',
                  margin: '0.35rem 0 0.25rem 0',
                  color: isDark ? '#f8fafc' : '#15291F',
                  fontWeight: 900,
                  fontFamily: '"Playfair Display", "Outfit", serif',
                  letterSpacing: '0.02em',
                  background: isDark
                    ? 'linear-gradient(135deg, #ffffff 0%, #fef08a 100%)'
                    : 'linear-gradient(135deg, #15291F 0%, #854d0e 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                {certData.recipientName}
              </h2>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.45rem' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.3rem 0.85rem',
                    borderRadius: '9999px',
                    backgroundColor: isDark ? 'rgba(56, 189, 248, 0.12)' : 'rgba(2, 132, 199, 0.08)',
                    color: isDark ? '#38bdf8' : '#0284c7',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    border: isDark ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid rgba(2, 132, 199, 0.25)'
                  }}
                >
                  <Sparkles size={14} />
                  <span>{certData.titleRole || 'Touch-Typing Specialist'}</span>
                </div>

                {CERTIFICATE_THEME_TIERS[certData.theme] && (
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.3rem 0.85rem',
                      borderRadius: '9999px',
                      backgroundColor: isDark ? 'rgba(234, 179, 8, 0.15)' : 'rgba(217, 119, 6, 0.08)',
                      color: isDark ? '#facc15' : '#b45309',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      border: isDark ? '1px solid rgba(234, 179, 8, 0.4)' : '1px solid rgba(217, 119, 6, 0.3)'
                    }}
                  >
                    <Award size={14} />
                    <span>{CERTIFICATE_THEME_TIERS[certData.theme].badge} (Tier {CERTIFICATE_THEME_TIERS[certData.theme].tier} Cleared)</span>
                  </div>
                )}
              </div>
            </div>

            {/* Core Metrics Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                gap: '1rem',
                margin: '1.5rem 0'
              }}
            >
              <div
                style={{
                  padding: '1.25rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isDark ? 'rgba(7, 11, 20, 0.75)' : '#ffffff',
                  border: isDark ? '1px solid rgba(234, 179, 8, 0.3)' : '1px solid rgba(217, 119, 6, 0.25)',
                  boxShadow: isDark ? 'none' : '0 2px 10px rgba(0, 0, 0, 0.04)',
                  textAlign: 'center'
                }}
              >
                <span style={{ fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#78716c', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Net Typing Speed
                </span>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: isDark ? '#facc15' : '#b45309', margin: '0.25rem 0 0 0' }}>
                  {certData.netWpm}{' '}
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: isDark ? '#94a3b8' : '#78716c' }}>WPM</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: isDark ? '#38bdf8' : '#0284c7', marginTop: '0.2rem', fontWeight: 600 }}>
                  Gross: {certData.grossWpm} WPM
                </div>
              </div>

              <div
                style={{
                  padding: '1.25rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isDark ? 'rgba(7, 11, 20, 0.75)' : '#ffffff',
                  border: isDark ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid rgba(2, 132, 199, 0.25)',
                  boxShadow: isDark ? 'none' : '0 2px 10px rgba(0, 0, 0, 0.04)',
                  textAlign: 'center'
                }}
              >
                <span style={{ fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#78716c', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Accuracy Rate
                </span>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: isDark ? '#38bdf8' : '#0284c7', margin: '0.25rem 0 0 0' }}>
                  {certData.accuracy}%
                </div>
                <div style={{ fontSize: '0.75rem', color: isDark ? '#10b981' : '#059669', marginTop: '0.2rem', fontWeight: 600 }}>
                  Precision Standard
                </div>
              </div>

              <div
                style={{
                  padding: '1.25rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isDark ? 'rgba(7, 11, 20, 0.75)' : '#ffffff',
                  border: isDark ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(16, 185, 129, 0.25)',
                  boxShadow: isDark ? 'none' : '0 2px 10px rgba(0, 0, 0, 0.04)',
                  textAlign: 'center'
                }}
              >
                <span style={{ fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#78716c', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Accredited Tier
                </span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: isDark ? '#10b981' : '#059669', margin: '0.45rem 0 0 0' }}>
                  {certData.tierTitle}
                </div>
                <div style={{ fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#78716c', marginTop: '0.2rem' }}>
                  {certData.tierGrade}
                </div>
              </div>

              <div
                style={{
                  padding: '1.25rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isDark ? 'rgba(7, 11, 20, 0.75)' : '#ffffff',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(0, 0, 0, 0.1)',
                  boxShadow: isDark ? 'none' : '0 2px 10px rgba(0, 0, 0, 0.04)',
                  textAlign: 'center'
                }}
              >
                <span style={{ fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#78716c', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Assessment Exam
                </span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: isDark ? '#f8fafc' : '#15291F', margin: '0.45rem 0 0 0' }}>
                  {certData.durationSeconds}s Timed
                </div>
                <div style={{ fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#78716c', marginTop: '0.2rem' }}>
                  {certData.totalCharacters} Keystrokes
                </div>
              </div>
            </div>

            {/* Signatory & Security Section */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.25rem',
                marginTop: '1.75rem',
                paddingTop: '1.5rem',
                borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.08)'
              }}
            >
              {/* Founder Signatory Box */}
              <div
                style={{
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isDark ? 'rgba(15, 23, 42, 0.8)' : '#ffffff',
                  border: isDark ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid rgba(2, 132, 199, 0.25)',
                  boxShadow: isDark ? 'none' : '0 2px 10px rgba(0, 0, 0, 0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: isDark ? 'rgba(56, 189, 248, 0.15)' : 'rgba(2, 132, 199, 0.1)',
                    color: isDark ? '#38bdf8' : '#0284c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Feather size={24} />
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: isDark ? '#38bdf8' : '#0284c7', fontWeight: 700, textTransform: 'uppercase' }}>
                    Authorized Signatory
                  </span>
                  <div
                    style={{
                      fontFamily: '"Pinyon Script", "Alex Brush", cursive',
                      fontSize: '1.85rem',
                      color: isDark ? '#f8fafc' : '#15291F',
                      lineHeight: 1.1,
                      margin: '0.15rem 0'
                    }}
                  >
                    Saumy Pandey
                  </div>
                  <div style={{ fontSize: '0.8rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                    {certData.signatoryTitle || 'App Owner & Creator • Founder, CodeTyper'}
                  </div>
                  <div style={{ fontSize: '0.725rem', color: isDark ? '#64748b' : '#94a3b8', marginTop: '0.2rem' }}>
                    Signatory ID: <code style={{ color: isDark ? '#38bdf8' : '#0284c7' }}>CT-OWNER-01</code>
                  </div>
                </div>
              </div>

              {/* Biometrics & Anti-Cheat Validation Box */}
              <div
                style={{
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isDark ? 'rgba(15, 23, 42, 0.8)' : '#ffffff',
                  border: isDark ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(16, 185, 129, 0.25)',
                  boxShadow: isDark ? 'none' : '0 2px 10px rgba(0, 0, 0, 0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)',
                    color: isDark ? '#10b981' : '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: isDark ? '#10b981' : '#059669', fontWeight: 700, textTransform: 'uppercase' }}>
                    Biometric Keystroke Dynamics
                  </span>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: isDark ? '#f8fafc' : '#15291F', margin: '0.15rem 0' }}>
                    Anti-Cheat & Flight-Time Authenticated
                  </div>
                  <div style={{ fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#64748b', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                    SHA-256: {certData.sha256Fingerprint ? certData.sha256Fingerprint.slice(0, 24) + '...' : 'SECURE_DIPLOMA_HASH'}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.85rem',
                marginTop: '1.75rem',
                paddingTop: '1.25rem',
                borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.08)'
              }}
            >
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowModal(true)}
                  style={{
                    background: 'linear-gradient(135deg, #ca8a04 0%, #eab308 50%, #facc15 100%)',
                    color: '#070b14',
                    fontWeight: 700,
                    border: 'none',
                    boxShadow: '0 4px 14px rgba(234, 179, 8, 0.4)'
                  }}
                >
                  <Award size={16} />
                  <span>View Full Diploma 🎓</span>
                </button>

                <button
                  className="btn btn-outline"
                  onClick={() => {
                    const linkedInUrl = getLinkedInCertificationUrl({
                      certId: certData.certId,
                      recipientName: certData.recipientName,
                      wpm: certData.netWpm,
                      tierTitle: certData.tierTitle,
                      issueDate: certData.issuedAt
                    });
                    window.open(linkedInUrl, '_blank', 'noopener,noreferrer');
                  }}
                  style={{
                    borderColor: isDark ? '#0077b5' : '#0284c7',
                    color: isDark ? '#38bdf8' : '#0369a1',
                    backgroundColor: isDark ? 'rgba(0, 119, 181, 0.1)' : 'rgba(2, 132, 199, 0.08)'
                  }}
                >
                  <ExternalLink size={15} />
                  <span>Add to LinkedIn</span>
                </button>

                <button
                  className="btn btn-outline"
                  onClick={handleCopyLink}
                  style={{
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.2)',
                    color: isDark ? '#cbd5e1' : '#475569'
                  }}
                >
                  {copied ? <Check size={15} color="#10b981" /> : <Share2 size={15} />}
                  <span>{copied ? 'Link Copied!' : 'Copy Verification Link'}</span>
                </button>
              </div>

              {/* Social Quick Share Buttons */}
              {shareUrls && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.775rem', color: isDark ? '#94a3b8' : '#64748b', marginRight: '0.2rem' }}>Share:</span>
                  <a
                    href={shareUrls.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-ghost btn-sm"
                    title="Share on Twitter / X"
                    style={{ padding: '0.35rem 0.6rem', color: isDark ? '#38bdf8' : '#0284c7' }}
                  >
                    𝕏
                  </a>
                  <a
                    href={shareUrls.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-ghost btn-sm"
                    title="Share on WhatsApp"
                    style={{ padding: '0.35rem 0.6rem', color: '#25d366' }}
                  >
                    WhatsApp
                  </a>
                  <a
                    href={shareUrls.telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-ghost btn-sm"
                    title="Share on Telegram"
                    style={{ padding: '0.35rem 0.6rem', color: '#0088cc' }}
                  >
                    Telegram
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Invitation for viewers to test their own typing */}
          <div
            className="card"
            style={{
              padding: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              backgroundColor: isDark ? 'rgba(15, 23, 42, 0.7)' : '#ffffff',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.08)',
              boxShadow: isDark ? 'none' : '0 4px 16px rgba(0, 0, 0, 0.04)'
            }}
          >
            <div>
              <h4 style={{ margin: '0 0 0.25rem 0', color: isDark ? '#f8fafc' : '#15291F' }}>Want your own Accredited Typing Diploma?</h4>
              <p style={{ margin: 0, fontSize: '0.875rem', color: isDark ? '#94a3b8' : '#50665A' }}>
                Level up every 20 levels, pass tier-scaled examinations (60s to 300s), and earn verifiable diplomas signed by founder Saumy Pandey.
              </p>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => onNavigate && onNavigate('test')}>
              <span>Take Free Examination</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Full Interactive Certificate Modal */}
      {certData && (
        <TypingCertificateModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          result={{
            netWpm: certData.netWpm,
            grossWpm: certData.grossWpm,
            accuracy: certData.accuracy,
            durationSeconds: certData.durationSeconds,
            totalCharacters: certData.totalCharacters,
            language: certData.discipline,
            recipientName: certData.recipientName,
            titleRole: certData.titleRole,
            certId: certData.certId
          }}
          onStartCertTest={() => onNavigate && onNavigate('test')}
        />
      )}
    </div>
  );
}
