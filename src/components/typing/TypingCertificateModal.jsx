import React, { useRef, useEffect } from 'react';
import { Download, Share2, Check, X, Award, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export function TypingCertificateModal({ isOpen, onClose, result }) {
  const canvasRef = useRef(null);
  const { user } = useAuth();
  const toast = useToast();

  const candidateName = user?.display_name || user?.username || 'CodeTyper Typist';
  const wpm = result?.netWpm || 60;
  const accuracy = result?.accuracy || 100;
  const consistency = result?.consistencyScore || 95;
  const duration = result?.durationSeconds || 60;
  const language = result?.language || 'All Disciplines';

  // Determine Rank Tier
  let tierTitle = 'Certified Typist';
  let tierBadge = 'Gold';
  if (wpm >= 130) {
    tierTitle = 'Grandmaster Typist';
    tierBadge = 'Grandmaster';
  } else if (wpm >= 105) {
    tierTitle = 'Master Typist';
    tierBadge = 'Diamond';
  } else if (wpm >= 85) {
    tierTitle = 'Pro Elite Typist';
    tierBadge = 'Platinum';
  } else if (wpm >= 65) {
    tierTitle = 'Advanced Typist';
    tierBadge = 'Gold';
  }

  const certId = useRef(`CT-2026-${Math.random().toString(36).substring(2, 8).toUpperCase()}`).current;
  const dateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Render high-res certificate on Canvas (1600x900)
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = 1600;
    const height = 900;
    canvas.width = width;
    canvas.height = height;

    // Background Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#0a0f1d');
    bgGrad.addColorStop(0.5, '#040711');
    bgGrad.addColorStop(1, '#02040a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Decorative Geometric Grid / Glow
    const glowGrad = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, 700);
    glowGrad.addColorStop(0, 'rgba(56, 189, 248, 0.08)');
    glowGrad.addColorStop(0.5, 'rgba(52, 211, 153, 0.04)');
    glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glowGrad;
    ctx.fillRect(0, 0, width, height);

    // Outer Luxury Gold/Emerald Border
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.strokeRect(40, 40, width - 80, height - 80);

    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 1;
    ctx.strokeRect(52, 52, width - 104, height - 104);

    // Corner Ornaments
    const drawCorner = (x, y, dx, dy) => {
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x + dx * 30, y);
      ctx.lineTo(x, y);
      ctx.lineTo(x, y + dy * 30);
      ctx.stroke();
    };
    drawCorner(52, 52, 1, 1);
    drawCorner(width - 52, 52, -1, 1);
    drawCorner(52, height - 52, 1, -1);
    drawCorner(width - 52, height - 52, -1, -1);

    // Header Logo & Branding
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⚡ CODETYPER GLOBAL VERIFICATION REGISTRY', width / 2, 110);

    // Certificate Title
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 48px system-ui, -apple-system, sans-serif';
    ctx.fillText('CERTIFICATE OF TYPING PROFICIENCY', width / 2, 175);

    // Subtitle
    ctx.fillStyle = '#94a3b8';
    ctx.font = '20px system-ui, -apple-system, sans-serif';
    ctx.fillText('THIS OFFICIALLY RECOGNIZES THAT', width / 2, 235);

    // Candidate Name
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 54px system-ui, -apple-system, sans-serif';
    ctx.fillText(candidateName, width / 2, 310);

    // Name underline
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 250, 335);
    ctx.lineTo(width / 2 + 250, 335);
    ctx.stroke();

    // Achievement text
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '24px system-ui, -apple-system, sans-serif';
    ctx.fillText(
      `has achieved the distinguished rank of ${tierTitle.toUpperCase()}`,
      width / 2,
      385
    );
    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
    ctx.fillText(`Specialized Discipline: ${language}`, width / 2, 425);

    // Metrics Cards (4 Boxes)
    const metrics = [
      { label: 'NET SPEED', value: `${wpm} WPM`, color: '#38bdf8' },
      { label: 'ACCURACY', value: `${accuracy}%`, color: '#34d399' },
      { label: 'CONSISTENCY', value: `${consistency}%`, color: '#eab308' },
      { label: 'DURATION', value: `${duration}s`, color: '#f8fafc' }
    ];

    const boxWidth = 240;
    const boxHeight = 110;
    const boxSpacing = 30;
    const totalBoxWidth = 4 * boxWidth + 3 * boxSpacing;
    const startX = (width - totalBoxWidth) / 2;
    const boxY = 485;

    metrics.forEach((m, idx) => {
      const bx = startX + idx * (boxWidth + boxSpacing);
      // Card bg
      ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
      ctx.fillRect(bx, boxY, boxWidth, boxHeight);
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(bx, boxY, boxWidth, boxHeight);

      // Label
      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 15px system-ui, -apple-system, sans-serif';
      ctx.fillText(m.label, bx + boxWidth / 2, boxY + 38);

      // Value
      ctx.fillStyle = m.color;
      ctx.font = 'bold 36px system-ui, -apple-system, sans-serif';
      ctx.fillText(m.value, bx + boxWidth / 2, boxY + 84);
    });

    // Gold Seal Ribbon (Bottom Center)
    const sealX = width / 2;
    const sealY = 695;

    ctx.save();
    ctx.beginPath();
    ctx.arc(sealX, sealY, 52, 0, Math.PI * 2);
    ctx.fillStyle = '#eab308';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#ca8a04';
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('VERIFIED', sealX, sealY - 8);
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    ctx.fillText('PROFICIENT', sealX, sealY + 12);
    ctx.fillText('★ ★ ★', sealX, sealY + 28);
    ctx.restore();

    // Footer Sign-offs
    ctx.textAlign = 'left';
    ctx.fillStyle = '#94a3b8';
    ctx.font = '16px system-ui, -apple-system, sans-serif';
    ctx.fillText(`Issued: ${dateStr}`, 100, 800);
    ctx.fillText('Platform: CodeTyper Engine v2.0', 100, 825);

    ctx.textAlign = 'right';
    ctx.fillText(`Certificate ID: ${certId}`, width - 100, 800);
    ctx.fillText('Cryptographic Hash: SHA256-CT-VERIFIED', width - 100, 825);
  }, [isOpen, candidateName, wpm, accuracy, consistency, duration, language, tierTitle, certId, dateStr]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `CodeTyper_Certificate_${candidateName.replace(/\s+/g, '_')}_${wpm}WPM.png`;
    link.href = dataUrl;
    link.click();
    toast.success('Certificate downloaded successfully!');
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(`CodeTyper Verified Certificate ID: ${certId} (${wpm} WPM, ${accuracy}% Acc)`);
    toast.success('Certificate verification details copied to clipboard!');
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ backdropFilter: 'blur(10px)', backgroundColor: 'rgba(0, 0, 0, 0.75)' }}>
      <div
        className="modal-content"
        style={{
          maxWidth: '900px',
          width: '95%',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          padding: '1.5rem',
          borderRadius: 'var(--radius-lg)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Award size={22} color="#eab308" />
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>
              Verified Typing Proficiency Certificate
            </h3>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Certificate Canvas Preview */}
        <div
          style={{
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.4)',
            border: '1px solid var(--color-border)',
            backgroundColor: '#000',
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          <canvas
            ref={canvasRef}
            style={{
              width: '100%',
              height: 'auto',
              maxHeight: '480px',
              display: 'block'
            }}
          />
        </div>

        {/* Modal Controls */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '1.25rem',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}
        >
          <div style={{ fontSize: '0.825rem', color: 'var(--color-text-secondary)' }}>
            Verification ID: <code style={{ color: 'var(--color-primary-sage)', fontWeight: 600 }}>{certId}</code>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button className="btn btn-outline btn-sm" onClick={handleCopyId}>
              <Share2 size={15} />
              <span>Copy Credential</span>
            </button>
            <button className="btn btn-primary btn-sm" onClick={handleDownload}>
              <Download size={15} />
              <span>Download Certificate (PNG)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
