import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { Download, Share2, Check, X, Award, ShieldCheck, Sparkles, Lock, AlertTriangle, ArrowRight, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { checkCertificateEligibility } from '../../utils/certificateEligibility.js';

export function TypingCertificateModal({ isOpen, onClose, result, onStartCertTest }) {
  const canvasRef = useRef(null);
  const { user } = useAuth();
  const toast = useToast();

  const defaultName = user?.display_name || user?.username || 'Saumy Pandey';
  const [recipientName, setRecipientName] = useState(defaultName);
  const [isEditingName, setIsEditingName] = useState(false);

  // Re-sync recipient name if defaultName changes
  useEffect(() => {
    if (defaultName && !recipientName) {
      setRecipientName(defaultName);
    }
  }, [defaultName]);

  const eligibility = useMemo(() => checkCertificateEligibility(result), [result]);

  const wpm = result?.netWpm !== undefined ? Number(result.netWpm) : 60;
  const grossWpm = result?.grossWpm !== undefined ? Number(result.grossWpm) : wpm;
  const accuracy = result?.accuracy !== undefined ? Number(result.accuracy) : 100;
  const duration = result?.durationSeconds !== undefined ? Math.round(Number(result.durationSeconds)) : 60;
  const language = result?.language || 'All Disciplines (English & Code)';

  const { tierTitle, tierGrade, tierBadge } = eligibility;

  const certId = useRef(`CT-2026-${Math.random().toString(36).substring(2, 8).toUpperCase()}`).current;
  const dateStr = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, []);

  // Draw high-resolution accredited diploma on Canvas (1600x1100)
  const drawCertificate = useCallback(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = 1600;
    const height = 1100;
    canvas.width = width;
    canvas.height = height;

    // 1. Executive Multi-Stop Dark Obsidian / Navy Background
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#060913');
    bgGrad.addColorStop(0.3, '#091224');
    bgGrad.addColorStop(0.7, '#081020');
    bgGrad.addColorStop(1, '#040710');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Center Radial Prestige Lighting
    const radialGlow = ctx.createRadialGradient(width / 2, 450, 60, width / 2, 450, 750);
    radialGlow.addColorStop(0, 'rgba(234, 179, 8, 0.06)');
    radialGlow.addColorStop(0.4, 'rgba(56, 189, 248, 0.03)');
    radialGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = radialGlow;
    ctx.fillRect(0, 0, width, height);

    // 3. Subtle Anti-Counterfeit Guilloche / Geometric Security Mesh
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.018)';
    ctx.lineWidth = 1;
    for (let x = 80; x < width - 80; x += 36) {
      ctx.beginPath();
      ctx.moveTo(x, 80);
      ctx.lineTo(x + 20, height - 80);
      ctx.stroke();
    }
    for (let y = 80; y < height - 80; y += 36) {
      ctx.beginPath();
      ctx.moveTo(80, y);
      ctx.lineTo(width - 80, y + 20);
      ctx.stroke();
    }
    ctx.restore();

    // 4. Luxury Multi-Layer Security Borders
    // Outer hairline
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(30, 30, width - 60, height - 60);

    // Primary Gold Guilloche Border
    const goldGrad = ctx.createLinearGradient(0, 45, width, 45);
    goldGrad.addColorStop(0, '#b45309');
    goldGrad.addColorStop(0.25, '#eab308');
    goldGrad.addColorStop(0.5, '#fef08a');
    goldGrad.addColorStop(0.75, '#eab308');
    goldGrad.addColorStop(1, '#b45309');
    ctx.strokeStyle = goldGrad;
    ctx.lineWidth = 4;
    ctx.strokeRect(46, 46, width - 92, height - 92);

    // Secondary Emerald / Cyan Accent Line
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(58, 58, width - 116, height - 116);

    // Inner Dotted Security Line
    ctx.save();
    ctx.setLineDash([4, 6]);
    ctx.strokeStyle = 'rgba(234, 179, 8, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(70, 70, width - 140, height - 140);
    ctx.restore();

    // Classical Ornate Victorian Corner Brackets
    const drawCornerOrnament = (cx, cy, dirX, dirY) => {
      ctx.save();
      ctx.strokeStyle = '#eab308';
      ctx.fillStyle = '#eab308';
      ctx.lineWidth = 2.5;

      // Outer bracket
      ctx.beginPath();
      ctx.moveTo(cx, cy + dirY * 45);
      ctx.lineTo(cx, cy);
      ctx.lineTo(cx + dirX * 45, cy);
      ctx.stroke();

      // Inner diagonal flourish
      ctx.beginPath();
      ctx.moveTo(cx + dirX * 15, cy + dirY * 15);
      ctx.lineTo(cx + dirX * 35, cy + dirY * 15);
      ctx.lineTo(cx + dirX * 15, cy + dirY * 35);
      ctx.closePath();
      ctx.fill();

      // Corner lozenge diamond
      ctx.beginPath();
      const dx = cx + dirX * 22;
      const dy = cy + dirY * 22;
      ctx.moveTo(dx, dy - 6);
      ctx.lineTo(dx + 6, dy);
      ctx.lineTo(dx, dy + 6);
      ctx.lineTo(dx - 6, dy);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    drawCornerOrnament(70, 70, 1, 1);
    drawCornerOrnament(width - 70, 70, -1, 1);
    drawCornerOrnament(70, height - 70, 1, -1);
    drawCornerOrnament(width - 70, height - 70, -1, -1);

    // 5. Header Emblem: Golden Laurels & Stars
    ctx.save();
    ctx.textAlign = 'center';

    // 5 Stars
    ctx.fillStyle = '#eab308';
    ctx.font = '22px system-ui, sans-serif';
    ctx.fillText('★   ★   ★   ★   ★', width / 2, 115);

    // Accreditation Authority Header
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 16px "Outfit", system-ui, sans-serif';
    ctx.fillText('CODETYPER GLOBAL ACCREDITATION BOARD & REGISTRY', width / 2, 145);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 13px system-ui, sans-serif';
    ctx.fillText('STANDARDIZED TOUCH-TYPING COMPETENCY EXAMINATION • EST. 2026', width / 2, 168);

    // Decorative Horizontal Gold Filigree Divider
    ctx.strokeStyle = 'rgba(234, 179, 8, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 280, 190);
    ctx.lineTo(width / 2 + 280, 190);
    ctx.stroke();

    // Center Gold Diamond
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.moveTo(width / 2, 185);
    ctx.lineTo(width / 2 + 6, 190);
    ctx.lineTo(width / 2, 195);
    ctx.lineTo(width / 2 - 6, 190);
    ctx.closePath();
    ctx.fill();

    // 6. Main Certificate Title
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 50px "Cinzel", "Times New Roman", Georgia, serif';
    ctx.shadowColor = 'rgba(234, 179, 8, 0.25)';
    ctx.shadowBlur = 12;
    ctx.fillText('CERTIFICATE OF TYPING PROFICIENCY', width / 2, 248);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 16px "Outfit", system-ui, sans-serif';
    ctx.fillText('THIS IS TO OFFICIALLY CERTIFY THAT', width / 2, 305);

    // 7. Candidate Name (Prominent & Majestic)
    const displayName = (recipientName || 'CodeTyper Typist').trim();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 58px "Cinzel", "Times New Roman", Georgia, serif';
    ctx.shadowColor = 'rgba(56, 189, 248, 0.3)';
    ctx.shadowBlur = 14;
    ctx.fillText(displayName, width / 2, 385);
    ctx.shadowBlur = 0;

    // Elegant Underline with Center Lozenge
    ctx.strokeStyle = 'rgba(234, 179, 8, 0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 320, 412);
    ctx.lineTo(width / 2 + 320, 412);
    ctx.stroke();

    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.arc(width / 2, 412, 4.5, 0, Math.PI * 2);
    ctx.fill();

    // 8. Citation & Achievement Text
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '20px "Outfit", system-ui, sans-serif';
    ctx.fillText(
      'has successfully passed the standardized professional typing speed and accuracy assessment,',
      width / 2,
      458
    );
    ctx.fillText(
      'demonstrating certified motor dexterity and adherence to international touch-typing standards.',
      width / 2,
      488
    );

    // Rank Tier Honor Pill
    ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
    ctx.fillRect(width / 2 - 280, 520, 560, 40);
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(width / 2 - 280, 520, 560, 40);

    ctx.fillStyle = '#eab308';
    ctx.font = 'bold 16px "Outfit", system-ui, sans-serif';
    ctx.fillText(`★  ${tierTitle.toUpperCase()} • ${tierGrade.toUpperCase()}  ★`, width / 2, 546);

    ctx.fillStyle = '#34d399';
    ctx.font = '600 15px "Outfit", system-ui, sans-serif';
    ctx.fillText(`Specialized Examination Curriculum: ${language}`, width / 2, 584);

    // 9. Four Verified Metric Examination Badges
    const metricsData = [
      { label: 'NET TYPING SPEED', value: `${wpm.toFixed(2)} WPM`, color: '#38bdf8' },
      { label: 'GROSS SPEED', value: `${grossWpm.toFixed(2)} WPM`, color: '#f8fafc' },
      { label: 'ACCURACY RATE', value: `${accuracy.toFixed(2)}%`, color: '#34d399' },
      { label: 'EXAM DURATION', value: `${duration}s (Timed)`, color: '#eab308' }
    ];

    const boxWidth = 270;
    const boxHeight = 96;
    const boxGap = 24;
    const totalBoxesW = 4 * boxWidth + 3 * boxGap;
    const boxStartX = (width - totalBoxesW) / 2;
    const boxY = 616;

    metricsData.forEach((m, idx) => {
      const bx = boxStartX + idx * (boxWidth + boxGap);
      // Card bg
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(bx, boxY, boxWidth, boxHeight);
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(bx, boxY, boxWidth, boxHeight);

      // Top corner gold notch
      ctx.fillStyle = '#eab308';
      ctx.fillRect(bx, boxY, 18, 3);

      // Label
      ctx.fillStyle = '#94a3b8';
      ctx.font = '700 13px "Outfit", system-ui, sans-serif';
      ctx.fillText(m.label, bx + boxWidth / 2, boxY + 34);

      // Value
      ctx.fillStyle = m.color;
      ctx.font = 'bold 30px "Outfit", system-ui, sans-serif';
      ctx.fillText(m.value, bx + boxWidth / 2, boxY + 74);
    });

    // 10. Official 3D Metallic Gold Embossed Wax Seal (Bottom-Center)
    const sealX = width / 2;
    const sealY = 860;

    // Hanging Crimson Ribbon Tails
    ctx.save();
    ctx.fillStyle = '#991b1b';
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 1.5;

    // Left Ribbon
    ctx.beginPath();
    ctx.moveTo(sealX - 25, sealY + 25);
    ctx.lineTo(sealX - 42, sealY + 110);
    ctx.lineTo(sealX - 25, sealY + 95);
    ctx.lineTo(sealX - 8, sealY + 110);
    ctx.lineTo(sealX - 10, sealY + 25);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Right Ribbon
    ctx.beginPath();
    ctx.moveTo(sealX + 10, sealY + 25);
    ctx.lineTo(sealX + 8, sealY + 110);
    ctx.lineTo(sealX + 25, sealY + 95);
    ctx.lineTo(sealX + 42, sealY + 110);
    ctx.lineTo(sealX + 25, sealY + 25);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Starburst Medallion Base (32 points)
    ctx.save();
    ctx.beginPath();
    const outerR = 64;
    const innerR = 56;
    for (let i = 0; i < 32; i++) {
      const angle = (i * Math.PI) / 16;
      const r = i % 2 === 0 ? outerR : innerR;
      const px = sealX + r * Math.cos(angle);
      const py = sealY + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    const medalGrad = ctx.createLinearGradient(sealX - 60, sealY - 60, sealX + 60, sealY + 60);
    medalGrad.addColorStop(0, '#fef08a');
    medalGrad.addColorStop(0.3, '#eab308');
    medalGrad.addColorStop(0.7, '#ca8a04');
    medalGrad.addColorStop(1, '#854d0e');
    ctx.fillStyle = medalGrad;
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#fef08a';
    ctx.stroke();

    // Inner Concentric Gold Ring
    ctx.beginPath();
    ctx.arc(sealX, sealY, 46, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#eab308';
    ctx.stroke();

    // Seal Core Text & Emblem
    ctx.fillStyle = '#eab308';
    ctx.font = 'bold 12px "Outfit", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CODETYPER', sealX, sealY - 14);
    ctx.font = '900 10px system-ui, sans-serif';
    ctx.fillText('★ VERIFIED ★', sealX, sealY + 2);
    ctx.font = '700 9px system-ui, sans-serif';
    ctx.fillText('OFFICIAL SEAL', sealX, sealY + 18);
    ctx.font = '700 8px monospace';
    ctx.fillText('2026', sealX, sealY + 30);
    ctx.restore();

    // 11. Bottom-Left: Cryptographic Verification & Anti-Counterfeit Block
    ctx.save();
    ctx.textAlign = 'left';
    const leftX = 110;

    // Digital Security Matrix block (representation of encrypted authenticity)
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(leftX, 810, 48, 48);
    ctx.fillStyle = 'rgba(56, 189, 248, 0.8)';
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if ((r + c) % 2 === 0 || (r === 0 && c === 0) || (r === 3 && c === 3)) {
          ctx.fillRect(leftX + 6 + c * 10, 816 + r * 10, 7, 7);
        }
      }
    }

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 15px "Outfit", system-ui, sans-serif';
    ctx.fillText('AUTHENTICITY VERIFICATION REGISTRY', leftX + 62, 825);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px monospace';
    ctx.fillText(`Certificate ID: ${certId}`, leftX + 62, 846);
    ctx.fillText(`SHA-256 Digest: CT-${certId.replace(/-/g, '')}-VERIFIED-SECURE`, leftX + 62, 864);
    ctx.fillText(`Conferral Date: ${dateStr}`, leftX + 62, 882);
    ctx.fillText('Standard: ISO/IEC Professional Typing Competency', leftX + 62, 900);
    ctx.restore();

    // 12. Bottom-Right: SAUMY PANDEY'S EXECUTIVE CURSIVE SIGNATURE
    ctx.save();
    const sigCenterX = 1320;
    const sigBaseY = 875;

    // Executive Signature Flourish & Text
    // Cursive Font Rendering
    ctx.font = 'normal 62px "Great Vibes", "Dancing Script", "Brush Script MT", "Segoe Script", cursive';
    ctx.fillStyle = '#f8fafc';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(56, 189, 248, 0.4)';
    ctx.shadowBlur = 8;
    ctx.fillText('Saumy Pandey', sigCenterX, sigBaseY - 32);
    ctx.shadowBlur = 0;

    // Authentic Hand-Drawn Fountain Pen Ink Flourish Stroke
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(sigCenterX - 130, sigBaseY - 20);
    ctx.bezierCurveTo(
      sigCenterX - 60, sigBaseY + 4,
      sigCenterX + 60, sigBaseY - 38,
      sigCenterX + 140, sigBaseY - 14
    );
    ctx.stroke();

    // Secondary delicate gold flourish loop
    ctx.strokeStyle = 'rgba(234, 179, 8, 0.65)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(sigCenterX + 30, sigBaseY - 16);
    ctx.bezierCurveTo(
      sigCenterX + 85, sigBaseY - 2,
      sigCenterX + 135, sigBaseY - 28,
      sigCenterX + 165, sigBaseY - 10
    );
    ctx.stroke();

    // Horizontal Signature Rule Line
    ctx.strokeStyle = 'rgba(234, 179, 8, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(sigCenterX - 160, sigBaseY);
    ctx.lineTo(sigCenterX + 160, sigBaseY);
    ctx.stroke();

    // Official Title & Details
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 17px "Outfit", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Saumy Pandey', sigCenterX, sigBaseY + 22);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 13px "Outfit", system-ui, sans-serif';
    ctx.fillText('Founder & Lead Examiner, CodeTyper', sigCenterX, sigBaseY + 40);

    ctx.fillStyle = '#ca8a04';
    ctx.font = '600 11px system-ui, sans-serif';
    ctx.fillText('Authorized Accreditation Signatory • Examiner ID: CT-EXEC-01', sigCenterX, sigBaseY + 56);
    ctx.restore();

    // 13. Bottom Security Microtext
    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#475569';
    ctx.font = '12px monospace';
    ctx.fillText(
      `Official CodeTyper Document • Tamper Evident Electronic Verification Credential: https://codetyper.dev/verify/${certId}`,
      width / 2,
      1045
    );
    ctx.restore();
  }, [recipientName, wpm, grossWpm, accuracy, duration, language, tierTitle, tierGrade, certId, dateStr]);

  // Redraw when modal opens, font is loaded, or recipient name changes
  useEffect(() => {
    if (!isOpen || !eligibility.isEligible) return;

    drawCertificate();

    // Redraw after web fonts finish loading for perfect typography
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        drawCertificate();
      });
    }
  }, [isOpen, eligibility.isEligible, drawCertificate]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const link = document.createElement('a');
    const safeName = (recipientName || 'Typist').replace(/[^a-zA-Z0-9]/g, '_');
    link.download = `CodeTyper_Official_Certificate_${safeName}_${wpm.toFixed(0)}WPM.png`;
    link.href = dataUrl;
    link.click();
    toast.success('Official Certificate downloaded in high resolution (1600x1100)!');
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(
      `CodeTyper Verified Official Certificate ID: ${certId} | Recipient: ${recipientName} | Net Speed: ${wpm.toFixed(2)} WPM | Accuracy: ${accuracy.toFixed(2)}% | Signatory: Saumy Pandey (Founder & Lead Examiner)`
    );
    toast.success('Certificate verification details copied to clipboard!');
  };

  if (!isOpen) return null;

  // --- RENDER 1: Locked State (Requirements Not Yet Met) ---
  if (!eligibility.isEligible) {
    return (
      <div className="modal-backdrop" onClick={onClose} style={{ backdropFilter: 'blur(12px)', backgroundColor: 'rgba(0, 0, 0, 0.8)' }}>
        <div
          className="modal-content"
          style={{
            maxWidth: '680px',
            width: '95%',
            padding: '2rem',
            borderRadius: 'var(--radius-xl)',
            backgroundColor: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'rgba(234, 179, 8, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#eab308'
                }}
              >
                <Lock size={22} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                  Certificate Examination Requirements
                </h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                  Standardized Touch-Typing Competency Verification
                </span>
              </div>
            </div>
            <button className="modal-close" onClick={onClose}>
              <X size={18} />
            </button>
          </div>

          {/* Explanation Banner */}
          <div
            style={{
              backgroundColor: 'var(--color-bg-soft)',
              borderRadius: 'var(--radius-md)',
              padding: '0.9rem 1.1rem',
              border: '1px solid var(--color-border)',
              marginBottom: '1.5rem',
              fontSize: '0.875rem',
              lineHeight: 1.5,
              color: 'var(--color-text-secondary)'
            }}
          >
            CodeTyper certificates are signed by <strong>Saumy Pandey</strong> and require verified proof of touch-typing competency. To prevent fraudulent claims from short or 1-word sessions, all 4 standards must be achieved in a single timed examination.
          </div>

          {/* Requirements Progress Bar */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600 }}>
              <span>Requirements Progress</span>
              <span style={{ color: eligibility.passedCount === 4 ? 'var(--color-primary-forest)' : '#eab308' }}>
                {eligibility.passedCount} of 4 Criteria Met ({eligibility.progressPercent}%)
              </span>
            </div>
            <div
              style={{
                height: '8px',
                width: '100%',
                backgroundColor: 'var(--color-bg-soft)',
                borderRadius: 'var(--radius-full)',
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${eligibility.progressPercent}%`,
                  backgroundColor: eligibility.passedCount === 4 ? '#22c55e' : '#eab308',
                  transition: 'width 0.4s ease'
                }}
              />
            </div>
          </div>

          {/* Criteria Checklist Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.75rem' }}>
            {eligibility.checks.map((c) => (
              <div
                key={c.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1.1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: c.passed ? 'rgba(34, 197, 94, 0.08)' : 'rgba(239, 68, 68, 0.06)',
                  border: `1px solid ${c.passed ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.25)'}`
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: c.passed ? '#22c55e' : '#ef4444',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    {c.passed ? <Check size={14} strokeWidth={3} /> : <X size={14} strokeWidth={3} />}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.925rem', color: 'var(--color-text-primary)' }}>
                      {c.title}
                    </div>
                    <div style={{ fontSize: '0.775rem', color: 'var(--color-text-secondary)' }}>
                      {c.description}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: c.passed ? '#22c55e' : '#ef4444' }}>
                    {c.current}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    Need {c.required}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button className="btn btn-outline" onClick={onClose}>
              Dismiss
            </button>
            {onStartCertTest && (
              <button
                className="btn btn-primary"
                onClick={() => {
                  onClose();
                  onStartCertTest();
                }}
                style={{
                  background: 'linear-gradient(135deg, #ca8a04 0%, #eab308 100%)',
                  color: '#0f172a',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem'
                }}
              >
                <span>Take 60s Certification Exam</span>
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER 2: Eligible State (High-Level Official Certificate Preview) ---
  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      style={{
        backdropFilter: 'blur(12px)',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        zIndex: 9999
      }}
    >
      <div
        className="modal-content"
        style={{
          maxWidth: '1020px',
          width: '96%',
          maxHeight: '96vh',
          display: 'flex',
          flexDirection: 'column',
          padding: '1.25rem',
          borderRadius: 'var(--radius-xl)',
          backgroundColor: '#0a0f1d',
          border: '1px solid rgba(234, 179, 8, 0.4)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Award size={24} color="#eab308" />
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc' }}>
                Official Accredited Typing Certificate
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Certified & Signed by Saumy Pandey • Verified Authentic
              </span>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} style={{ color: '#cbd5e1' }}>
            <X size={18} />
          </button>
        </div>

        {/* Recipient Name Customization Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '0.5rem 0.85rem',
            marginBottom: '0.75rem',
            gap: '0.75rem',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserCheck size={16} color="#38bdf8" />
            <span style={{ fontSize: '0.825rem', color: '#94a3b8', fontWeight: 600 }}>Recipient Name:</span>
            <input
              type="text"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="Enter candidate full name"
              maxLength={40}
              style={{
                backgroundColor: '#070b14',
                color: '#ffffff',
                border: '1px solid rgba(234, 179, 8, 0.4)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.3rem 0.6rem',
                fontSize: '0.9rem',
                fontWeight: 700,
                minWidth: '220px'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem', color: '#34d399' }}>
            <span>✓ Exam Standards Verified</span>
            <span>•</span>
            <span>Signatory: <strong>Saumy Pandey (Cursive)</strong></span>
          </div>
        </div>

        {/* Certificate Canvas Container */}
        <div
          style={{
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.7)',
            border: '1px solid rgba(234, 179, 8, 0.3)',
            backgroundColor: '#050811',
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          <canvas
            ref={canvasRef}
            style={{
              width: '100%',
              height: 'auto',
              maxHeight: '520px',
              display: 'block'
            }}
          />
        </div>

        {/* Modal Action Controls */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '1rem',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}
        >
          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            Registry Serial: <code style={{ color: '#eab308', fontWeight: 700 }}>{certId}</code>
          </div>

          <div style={{ display: 'flex', gap: '0.65rem' }}>
            <button className="btn btn-outline btn-sm" onClick={handleCopyId} style={{ borderColor: '#475569', color: '#cbd5e1' }}>
              <Share2 size={15} />
              <span>Copy Credential</span>
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={handleDownload}
              style={{
                background: 'linear-gradient(135deg, #ca8a04 0%, #eab308 50%, #facc15 100%)',
                color: '#0f172a',
                fontWeight: 700,
                border: 'none',
                boxShadow: '0 4px 14px rgba(234, 179, 8, 0.4)'
              }}
            >
              <Download size={15} />
              <span>Download Official Certificate (PNG 1600x1100)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
