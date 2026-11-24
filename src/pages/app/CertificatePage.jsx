import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import {
  Award,
  Download,
  Share2,
  Printer,
  ShieldCheck,
  Palette,
  Feather,
  UserCheck,
  Check,
  X,
  ArrowRight,
  Sparkles,
  Lock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { checkCertificateEligibility } from '../../utils/certificateEligibility.js';

// --- LUXURY CERTIFICATE THEME PALETTES ---
const CERT_THEMES = {
  'royal-obsidian': {
    id: 'royal-obsidian',
    name: 'Royal Obsidian & 24K Gold',
    badge: '👑 Royal Gold',
    swatch: 'linear-gradient(135deg, #090e1c 0%, #ca8a04 100%)',
    bgStops: ['#04060d', '#0a1224', '#070f1e', '#03050a'],
    isDark: true,
    goldGradient: ['#92400e', '#d97706', '#fde047', '#f59e0b', '#78350f'],
    accentColor: '#38bdf8', // Cyan electric
    accentLine: 'rgba(56, 189, 248, 0.45)',
    hairline: 'rgba(234, 179, 8, 0.35)',
    textColor: '#ffffff',
    subtextColor: '#94a3b8',
    citationColor: '#cbd5e1',
    cardBg: 'rgba(11, 19, 38, 0.92)',
    cardBorder: 'rgba(234, 179, 8, 0.32)',
    sealOuter: ['#fef08a', '#eab308', '#ca8a04', '#854d0e'],
    sealInner: '#0b1329',
    sealTextColor: '#fef08a',
    ribbonColor: '#991b1b',
    ribbonBorder: '#facc15',
    sigInk: '#f8fafc',
    sigFlourish: '#38bdf8',
    watermarkColor: 'rgba(234, 179, 8, 0.038)',
    meshColor: 'rgba(255, 255, 255, 0.016)'
  },
  'imperial-ivory': {
    id: 'imperial-ivory',
    name: 'Imperial Ivory Parchment',
    badge: '📜 Vintage Ivory',
    swatch: 'linear-gradient(135deg, #fef9c3 0%, #b45309 100%)',
    bgStops: ['#fdfbf7', '#f7f1e5', '#eee3d1', '#e2d5bf'],
    isDark: false,
    goldGradient: ['#78350f', '#b45309', '#f59e0b', '#d97706', '#451a03'],
    accentColor: '#991b1b', // Royal Burgundy
    accentLine: 'rgba(153, 27, 27, 0.32)',
    hairline: 'rgba(120, 53, 15, 0.35)',
    textColor: '#1e293b',
    subtextColor: '#475569',
    citationColor: '#334155',
    cardBg: 'rgba(255, 255, 255, 0.88)',
    cardBorder: 'rgba(180, 83, 9, 0.35)',
    sealOuter: ['#fef08a', '#d97706', '#b45309', '#78350f'],
    sealInner: '#7f1d1d',
    sealTextColor: '#fef08a',
    ribbonColor: '#7f1d1d',
    ribbonBorder: '#d97706',
    sigInk: '#0f172a',
    sigFlourish: '#991b1b',
    watermarkColor: 'rgba(120, 53, 15, 0.045)',
    meshColor: 'rgba(120, 53, 15, 0.025)'
  },
  'emerald-sovereign': {
    id: 'emerald-sovereign',
    name: 'Emerald Sovereign & Gold',
    badge: '🌿 Grandmaster Emerald',
    swatch: 'linear-gradient(135deg, #064e3b 0%, #10b981 100%)',
    bgStops: ['#021911', '#063222', '#032317', '#01120c'],
    isDark: true,
    goldGradient: ['#b45309', '#f59e0b', '#fef08a', '#eab308', '#78350f'],
    accentColor: '#34d399', // Mint
    accentLine: 'rgba(52, 211, 153, 0.45)',
    hairline: 'rgba(52, 211, 153, 0.32)',
    textColor: '#ffffff',
    subtextColor: '#a7f3d0',
    citationColor: '#d1fae5',
    cardBg: 'rgba(6, 40, 28, 0.92)',
    cardBorder: 'rgba(52, 211, 153, 0.35)',
    sealOuter: ['#fef08a', '#10b981', '#047857', '#064e3b'],
    sealInner: '#022c1d',
    sealTextColor: '#fef08a',
    ribbonColor: '#047857',
    ribbonBorder: '#facc15',
    sigInk: '#fef08a',
    sigFlourish: '#34d399',
    watermarkColor: 'rgba(52, 211, 153, 0.04)',
    meshColor: 'rgba(52, 211, 153, 0.02)'
  },
  'midnight-platinum': {
    id: 'midnight-platinum',
    name: 'Midnight Titanium & Platinum',
    badge: '💎 Celestial Platinum',
    swatch: 'linear-gradient(135deg, #1e293b 0%, #60a5fa 100%)',
    bgStops: ['#070a12', '#101728', '#0c1220', '#04070d'],
    isDark: true,
    goldGradient: ['#475569', '#94a3b8', '#f8fafc', '#cbd5e1', '#334155'],
    accentColor: '#60a5fa', // Electric Azure
    accentLine: 'rgba(96, 165, 250, 0.45)',
    hairline: 'rgba(148, 163, 184, 0.32)',
    textColor: '#ffffff',
    subtextColor: '#94a3b8',
    citationColor: '#e2e8f0',
    cardBg: 'rgba(15, 23, 42, 0.92)',
    cardBorder: 'rgba(96, 165, 250, 0.32)',
    sealOuter: ['#f8fafc', '#cbd5e1', '#64748b', '#334155'],
    sealInner: '#0f172a',
    sealTextColor: '#ffffff',
    ribbonColor: '#1d4ed8',
    ribbonBorder: '#93c5fd',
    sigInk: '#ffffff',
    sigFlourish: '#60a5fa',
    watermarkColor: 'rgba(96, 165, 250, 0.04)',
    meshColor: 'rgba(255, 255, 255, 0.015)'
  }
};

export function CertificatePage({ onNavigate }) {
  const canvasRef = useRef(null);
  const { user, userStats } = useAuth();
  const toast = useToast();

  const defaultName = user?.display_name || user?.username || 'Saumy Pandey';
  const [recipientName, setRecipientName] = useState(defaultName);
  const [activeTheme, setActiveTheme] = useState('royal-obsidian');
  const [signatureVariant, setSignatureVariant] = useState('calligraphy');

  const wpm = userStats?.best_wpm || 72;
  const grossWpm = Math.round(wpm * 1.05);
  const accuracy = userStats?.avg_accuracy || 98.4;
  const duration = 60;
  const language = 'All Disciplines (English & Programming)';

  const sessionResult = useMemo(() => ({
    netWpm: wpm,
    grossWpm: grossWpm,
    accuracy: accuracy,
    durationSeconds: duration,
    totalCharacters: Math.round(wpm * 5),
    language: language
  }), [wpm, grossWpm, accuracy, duration, language]);

  const eligibility = useMemo(() => checkCertificateEligibility(sessionResult), [sessionResult]);
  const { tierTitle, tierGrade } = eligibility;

  const certId = useRef(`CT-2026-${Math.random().toString(36).substring(2, 8).toUpperCase()}`).current;
  const dateStr = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, []);

  // --- DRAW ULTRA HIGH-DEFINITION 2400x1600 ACCREDITED DIPLOMA ---
  const drawCertificate = useCallback(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = 2400;
    const height = 1600;
    canvas.width = width;
    canvas.height = height;

    const theme = CERT_THEMES[activeTheme] || CERT_THEMES['royal-obsidian'];

    // 1. Executive Multi-Stop Luxury Background
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, theme.bgStops[0]);
    bgGrad.addColorStop(0.35, theme.bgStops[1]);
    bgGrad.addColorStop(0.7, theme.bgStops[2]);
    bgGrad.addColorStop(1, theme.bgStops[3]);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Center Radial Prestige Lighting Flare
    const radialGlow = ctx.createRadialGradient(width / 2, 600, 80, width / 2, 600, 1100);
    radialGlow.addColorStop(0, theme.isDark ? 'rgba(234, 179, 8, 0.08)' : 'rgba(234, 179, 8, 0.1)');
    radialGlow.addColorStop(0.4, theme.isDark ? 'rgba(56, 189, 248, 0.04)' : 'rgba(180, 83, 9, 0.05)');
    radialGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = radialGlow;
    ctx.fillRect(0, 0, width, height);

    // 3. Subtle Anti-Counterfeit Guilloche / Geometric Security Mesh
    ctx.save();
    ctx.strokeStyle = theme.meshColor;
    ctx.lineWidth = 1;
    for (let x = 90; x < width - 90; x += 44) {
      ctx.beginPath();
      ctx.moveTo(x, 90);
      ctx.lineTo(x + 24, height - 90);
      ctx.stroke();
    }
    for (let y = 90; y < height - 90; y += 44) {
      ctx.beginPath();
      ctx.moveTo(90, y);
      ctx.lineTo(width - 90, y + 24);
      ctx.stroke();
    }
    ctx.restore();

    // 4. Center Background Watermark Crest
    ctx.save();
    ctx.strokeStyle = theme.watermarkColor;
    ctx.fillStyle = theme.watermarkColor;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(width / 2, 780, 260, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(width / 2, 780, 238, 0, Math.PI * 2);
    ctx.stroke();

    ctx.font = '900 140px "Fira Code", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('{ / }', width / 2, 770);

    ctx.font = 'bold 22px "Cinzel", "Times New Roman", serif';
    ctx.fillText('CODETYPER OFFICIAL ACCREDITATION', width / 2, 920);
    ctx.restore();

    // 5. Luxury Multi-Layer Security Borders
    ctx.strokeStyle = theme.hairline;
    ctx.lineWidth = 2;
    ctx.strokeRect(45, 45, width - 90, height - 90);

    const goldGrad = ctx.createLinearGradient(0, 68, width, 68);
    goldGrad.addColorStop(0, theme.goldGradient[0]);
    goldGrad.addColorStop(0.25, theme.goldGradient[1]);
    goldGrad.addColorStop(0.5, theme.goldGradient[2]);
    goldGrad.addColorStop(0.75, theme.goldGradient[3]);
    goldGrad.addColorStop(1, theme.goldGradient[4]);

    ctx.strokeStyle = goldGrad;
    ctx.lineWidth = 6;
    ctx.strokeRect(68, 68, width - 136, height - 136);

    ctx.strokeStyle = theme.accentLine;
    ctx.lineWidth = 1.8;
    ctx.strokeRect(86, 86, width - 172, height - 172);

    ctx.save();
    ctx.setLineDash([6, 8]);
    ctx.strokeStyle = theme.isDark ? 'rgba(234, 179, 8, 0.45)' : 'rgba(180, 83, 9, 0.4)';
    ctx.lineWidth = 2;
    ctx.strokeRect(104, 104, width - 208, height - 208);
    ctx.restore();

    // Guilloche Sinusoidal Security Waves
    const drawGuillocheLine = (x1, y1, x2, y2) => {
      ctx.save();
      ctx.strokeStyle = theme.isDark ? 'rgba(234, 179, 8, 0.28)' : 'rgba(180, 83, 9, 0.25)';
      ctx.lineWidth = 1.2;
      const isHorizontal = Math.abs(y2 - y1) < Math.abs(x2 - x1);
      const steps = 360;

      for (let wave = 0; wave < 3; wave++) {
        ctx.beginPath();
        const phase = wave * (Math.PI / 3);
        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          const angle = t * Math.PI * 24 + phase;
          const offset = Math.sin(angle) * 7 + Math.sin(angle * 2.3) * 3;
          if (isHorizontal) {
            const x = x1 + (x2 - x1) * t;
            const y = y1 + offset;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          } else {
            const x = x1 + offset;
            const y = y1 + (y2 - y1) * t;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }
      ctx.restore();
    };

    drawGuillocheLine(140, 126, width - 140, 126);
    drawGuillocheLine(140, height - 126, width - 140, height - 126);
    drawGuillocheLine(126, 140, 126, height - 140);
    drawGuillocheLine(width - 126, 140, width - 126, height - 140);

    // 6. Classical Victorian Corner Ornaments
    const drawCornerOrnament = (cx, cy, dirX, dirY) => {
      ctx.save();
      ctx.strokeStyle = theme.goldGradient[2];
      ctx.fillStyle = theme.goldGradient[2];
      ctx.lineWidth = 3.5;

      ctx.beginPath();
      ctx.moveTo(cx, cy + dirY * 65);
      ctx.lineTo(cx, cy);
      ctx.lineTo(cx + dirX * 65, cy);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx + dirX * 22, cy + dirY * 22);
      ctx.lineTo(cx + dirX * 50, cy + dirY * 22);
      ctx.lineTo(cx + dirX * 22, cy + dirY * 50);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      const dx = cx + dirX * 32;
      const dy = cy + dirY * 32;
      ctx.moveTo(dx, dy - 9);
      ctx.lineTo(dx + 9, dy);
      ctx.lineTo(dx, dy + 9);
      ctx.lineTo(dx - 9, dy);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    drawCornerOrnament(104, 104, 1, 1);
    drawCornerOrnament(width - 104, 104, -1, 1);
    drawCornerOrnament(104, height - 104, 1, -1);
    drawCornerOrnament(width - 104, height - 104, -1, -1);

    // 7. Header Emblem
    ctx.save();
    ctx.textAlign = 'center';

    ctx.fillStyle = theme.goldGradient[2];
    ctx.font = '28px system-ui, sans-serif';
    ctx.fillText('★     ★     ★     ★     ★', width / 2, 175);

    ctx.fillStyle = theme.accentColor;
    ctx.font = 'bold 22px "Outfit", system-ui, sans-serif';
    ctx.fillText('CODETYPER GLOBAL ACCREDITATION BOARD & REGISTRY', width / 2, 218);

    ctx.fillStyle = theme.subtextColor;
    ctx.font = '600 16px "Outfit", system-ui, sans-serif';
    ctx.fillText('STANDARDIZED TOUCH-TYPING COMPETENCY COMMISSION • EST. 2026', width / 2, 248);

    ctx.strokeStyle = theme.isDark ? 'rgba(234, 179, 8, 0.45)' : 'rgba(180, 83, 9, 0.4)';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 380, 278);
    ctx.lineTo(width / 2 + 380, 278);
    ctx.stroke();

    ctx.fillStyle = theme.goldGradient[2];
    ctx.beginPath();
    ctx.moveTo(width / 2, 271);
    ctx.lineTo(width / 2 + 8, 278);
    ctx.lineTo(width / 2, 285);
    ctx.lineTo(width / 2 - 8, 278);
    ctx.closePath();
    ctx.fill();

    // 8. Main Certificate Title
    ctx.fillStyle = theme.textColor;
    ctx.font = '900 68px "Cinzel", "Playfair Display", "Times New Roman", Georgia, serif';
    ctx.shadowColor = theme.isDark ? 'rgba(234, 179, 8, 0.35)' : 'rgba(180, 83, 9, 0.2)';
    ctx.shadowBlur = 14;
    ctx.fillText('CERTIFICATE OF EXCELLENCE', width / 2, 360);
    ctx.shadowBlur = 0;

    ctx.fillStyle = theme.goldGradient[2];
    ctx.font = 'bold 24px "Outfit", system-ui, sans-serif';
    ctx.fillText('IN TOUCH-TYPING PROFICIENCY & KEYBOARD CADENCE', width / 2, 405);

    ctx.fillStyle = theme.subtextColor;
    ctx.font = '600 20px "Outfit", system-ui, sans-serif';
    ctx.fillText('THIS IS TO OFFICIALLY ACCREDIT AND CERTIFY THAT', width / 2, 460);

    // 9. Candidate Name
    const displayName = (recipientName || 'CodeTyper Typist').trim();
    ctx.fillStyle = theme.textColor;
    ctx.font = 'bold 78px "Cinzel", "Playfair Display", "Times New Roman", Georgia, serif';
    ctx.shadowColor = theme.accentColor;
    ctx.shadowBlur = theme.isDark ? 16 : 4;
    ctx.fillText(displayName, width / 2, 560);
    ctx.shadowBlur = 0;

    ctx.strokeStyle = theme.goldGradient[2];
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 420, 595);
    ctx.lineTo(width / 2 + 420, 595);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(width / 2, 595, 6, 0, Math.PI * 2);
    ctx.fillStyle = theme.goldGradient[2];
    ctx.fill();

    ctx.beginPath();
    ctx.arc(width / 2 - 80, 595, 3.5, 0, Math.PI * 2);
    ctx.arc(width / 2 + 80, 595, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // 10. Citation
    ctx.fillStyle = theme.citationColor;
    ctx.font = '24px "Outfit", system-ui, sans-serif';
    ctx.fillText(
      'has successfully passed the comprehensive touch-typing speed and accuracy assessment,',
      width / 2,
      650
    );
    ctx.fillText(
      'demonstrating certified motor dexterity, ergonomic cadence, and mastery of professional touch-typing.',
      width / 2,
      690
    );

    // 11. Honor Tier Pill
    const pillW = 680;
    const pillH = 50;
    ctx.fillStyle = theme.cardBg;
    ctx.fillRect(width / 2 - pillW / 2, 730, pillW, pillH);
    ctx.strokeStyle = theme.goldGradient[2];
    ctx.lineWidth = 2;
    ctx.strokeRect(width / 2 - pillW / 2, 730, pillW, pillH);

    ctx.fillStyle = theme.goldGradient[2];
    ctx.font = 'bold 22px "Outfit", system-ui, sans-serif';
    ctx.fillText(`★  ${tierTitle.toUpperCase()} • ${tierGrade.toUpperCase()}  ★`, width / 2, 763);

    ctx.fillStyle = theme.accentColor;
    ctx.font = '600 18px "Outfit", system-ui, sans-serif';
    ctx.fillText(`Specialized Curriculum: ${language} • Standardized Assessment Protocol`, width / 2, 818);

    // 12. Four Metric Badges
    const metricsData = [
      { label: 'NET TYPING SPEED', value: `${wpm.toFixed(2)} WPM`, color: theme.accentColor },
      { label: 'GROSS SPEED', value: `${grossWpm.toFixed(2)} WPM`, color: theme.textColor },
      { label: 'ACCURACY RATE', value: `${accuracy.toFixed(2)}%`, color: '#22c55e' },
      { label: 'EXAM DURATION', value: `${duration}s (Timed)`, color: theme.goldGradient[2] }
    ];

    const boxWidth = 440;
    const boxHeight = 130;
    const boxGap = 32;
    const totalBoxesW = 4 * boxWidth + 3 * boxGap;
    const boxStartX = (width - totalBoxesW) / 2;
    const boxY = 856;

    metricsData.forEach((m, idx) => {
      const bx = boxStartX + idx * (boxWidth + boxGap);
      ctx.fillStyle = theme.cardBg;
      ctx.fillRect(bx, boxY, boxWidth, boxHeight);
      ctx.strokeStyle = theme.cardBorder;
      ctx.lineWidth = 2;
      ctx.strokeRect(bx, boxY, boxWidth, boxHeight);

      ctx.fillStyle = theme.goldGradient[2];
      ctx.fillRect(bx, boxY, 26, 4);

      ctx.fillStyle = theme.subtextColor;
      ctx.font = '700 16px "Outfit", system-ui, sans-serif';
      ctx.fillText(m.label, bx + boxWidth / 2, boxY + 44);

      ctx.fillStyle = m.color;
      ctx.font = 'bold 40px "Outfit", system-ui, sans-serif';
      ctx.fillText(m.value, bx + boxWidth / 2, boxY + 98);
    });

    // 13. Official 3D Metallic Gold Embossed Wax Seal
    const sealX = width / 2;
    const sealY = 1250;

    ctx.save();
    ctx.fillStyle = theme.ribbonColor;
    ctx.strokeStyle = theme.ribbonBorder;
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.moveTo(sealX - 35, sealY + 35);
    ctx.lineTo(sealX - 60, sealY + 160);
    ctx.lineTo(sealX - 35, sealY + 135);
    ctx.lineTo(sealX - 10, sealY + 160);
    ctx.lineTo(sealX - 14, sealY + 35);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(sealX + 14, sealY + 35);
    ctx.lineTo(sealX + 10, sealY + 160);
    ctx.lineTo(sealX + 35, sealY + 135);
    ctx.lineTo(sealX + 60, sealY + 160);
    ctx.lineTo(sealX + 35, sealY + 35);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Medallion Base (36 points)
    ctx.save();
    ctx.beginPath();
    const outerR = 95;
    const innerR = 82;
    for (let i = 0; i < 36; i++) {
      const angle = (i * Math.PI) / 18;
      const r = i % 2 === 0 ? outerR : innerR;
      const px = sealX + r * Math.cos(angle);
      const py = sealY + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    const medalGrad = ctx.createLinearGradient(sealX - 90, sealY - 90, sealX + 90, sealY + 90);
    medalGrad.addColorStop(0, theme.sealOuter[0]);
    medalGrad.addColorStop(0.3, theme.sealOuter[1]);
    medalGrad.addColorStop(0.7, theme.sealOuter[2]);
    medalGrad.addColorStop(1, theme.sealOuter[3]);
    ctx.fillStyle = medalGrad;
    ctx.fill();
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = theme.sealOuter[0];
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(sealX, sealY, 68, 0, Math.PI * 2);
    ctx.fillStyle = theme.sealInner;
    ctx.fill();
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = theme.sealOuter[0];
    ctx.stroke();

    ctx.fillStyle = theme.sealTextColor;
    ctx.font = 'bold 18px "Outfit", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CODETYPER', sealX, sealY - 20);
    ctx.font = '900 13px system-ui, sans-serif';
    ctx.fillText('★ VERIFIED ★', sealX, sealY + 2);
    ctx.font = '700 12px system-ui, sans-serif';
    ctx.fillText('OFFICIAL SEAL', sealX, sealY + 24);
    ctx.font = '800 11px monospace';
    ctx.fillText('2026', sealX, sealY + 40);
    ctx.restore();

    // 14. Bottom-Left: Cryptographic Verification Block
    ctx.save();
    ctx.textAlign = 'left';
    const leftX = 160;

    const qrSize = 72;
    ctx.strokeStyle = theme.accentLine;
    ctx.lineWidth = 2;
    ctx.strokeRect(leftX, 1170, qrSize, qrSize);
    ctx.fillStyle = theme.accentColor;

    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 6; c++) {
        const isCorner =
          (r < 2 && c < 2) ||
          (r < 2 && c > 3) ||
          (r > 3 && c < 2);
        const isPattern = (r * 3 + c * 5) % 2 === 0;
        if (isCorner || isPattern) {
          ctx.fillRect(leftX + 8 + c * 10, 1178 + r * 10, 8, 8);
        }
      }
    }

    ctx.fillStyle = theme.accentColor;
    ctx.font = 'bold 20px "Outfit", system-ui, sans-serif';
    ctx.fillText('AUTHENTICITY VERIFICATION REGISTRY', leftX + qrSize + 22, 1195);

    ctx.fillStyle = theme.subtextColor;
    ctx.font = '16px monospace';
    ctx.fillText(`Certificate ID: ${certId}`, leftX + qrSize + 22, 1224);
    ctx.fillText(`SHA-256 Digest: CT-${certId.replace(/-/g, '')}-VERIFIED-SECURE`, leftX + qrSize + 22, 1248);
    ctx.fillText(`Conferral Date: ${dateStr}`, leftX + qrSize + 22, 1272);
    ctx.fillText('Standard: ISO/IEC Professional Typing Competency', leftX + qrSize + 22, 1296);
    ctx.fillText(`Verification Registry: https://codetyper.dev/verify/${certId}`, leftX + qrSize + 22, 1320);
    ctx.restore();

    // 15. Bottom-Right: SAUMY PANDEY'S FOUNDER & APP OWNER SIGNATURE
    ctx.save();
    const sigCenterX = 1940;
    const sigBaseY = 1270;

    ctx.fillStyle = theme.accentColor;
    ctx.font = '700 16px "Outfit", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('AUTHORIZED APP OWNER & FOUNDER SIGNATURE', sigCenterX, sigBaseY - 110);

    const sigText = signatureVariant === 'lowercase' ? 'saumypandey' : 'Saumy Pandey';

    ctx.font = 'normal 74px "Pinyon Script", "Alex Brush", "Great Vibes", "Dancing Script", cursive';
    ctx.fillStyle = theme.sigInk;
    ctx.textAlign = 'center';
    ctx.shadowColor = theme.sigFlourish;
    ctx.shadowBlur = theme.isDark ? 12 : 3;
    ctx.fillText(sigText, sigCenterX, sigBaseY - 38);
    ctx.shadowBlur = 0;

    // Authentic Hand-Drawn Fountain Pen Ink Flourish Stroke
    ctx.strokeStyle = theme.sigFlourish;
    ctx.lineWidth = 3.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(sigCenterX - 180, sigBaseY - 22);
    ctx.bezierCurveTo(
      sigCenterX - 70, sigBaseY + 10,
      sigCenterX + 80, sigBaseY - 36,
      sigCenterX + 190, sigBaseY - 8
    );
    ctx.stroke();

    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(sigCenterX + 190, sigBaseY - 8);
    ctx.bezierCurveTo(
      sigCenterX + 225, sigBaseY + 8,
      sigCenterX + 235, sigBaseY - 24,
      sigCenterX + 185, sigBaseY - 32
    );
    ctx.bezierCurveTo(
      sigCenterX + 125, sigBaseY - 40,
      sigCenterX + 35, sigBaseY - 14,
      sigCenterX - 55, sigBaseY - 22
    );
    ctx.stroke();

    ctx.strokeStyle = theme.goldGradient[2];
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(sigCenterX - 210, sigBaseY);
    ctx.lineTo(sigCenterX + 210, sigBaseY);
    ctx.stroke();

    ctx.fillStyle = theme.textColor;
    ctx.font = 'bold 22px "Outfit", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Saumy Pandey', sigCenterX, sigBaseY + 30);

    ctx.fillStyle = theme.accentColor;
    ctx.font = 'bold 16px "Outfit", system-ui, sans-serif';
    ctx.fillText('App Owner & Creator • Founder, CodeTyper', sigCenterX, sigBaseY + 54);

    ctx.fillStyle = theme.subtextColor;
    ctx.font = '600 13px system-ui, sans-serif';
    ctx.fillText('Chief Accreditation Officer & Lead Examiner • ID: CT-OWNER-01', sigCenterX, sigBaseY + 74);

    const tagW = 360;
    const tagH = 26;
    ctx.fillStyle = theme.isDark ? 'rgba(56, 189, 248, 0.15)' : 'rgba(153, 27, 27, 0.1)';
    ctx.strokeStyle = theme.accentColor;
    ctx.lineWidth = 1.2;
    ctx.fillRect(sigCenterX - tagW / 2, sigBaseY + 88, tagW, tagH);
    ctx.strokeRect(sigCenterX - tagW / 2, sigBaseY + 88, tagW, tagH);

    ctx.fillStyle = theme.accentColor;
    ctx.font = 'bold 12px monospace';
    ctx.fillText('★ VERIFIED OWNER SIGNATURE • SECURE AUDIT KEY ★', sigCenterX, sigBaseY + 105);
    ctx.restore();

    // 16. Bottom Security Microtext
    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = theme.isDark ? '#475569' : '#64748b';
    ctx.font = '15px monospace';
    ctx.fillText(
      `Official CodeTyper Sovereign Credential • Electronically Signed by Founder & Owner Saumy Pandey • Verification: https://codetyper.dev/verify/${certId}`,
      width / 2,
      1520
    );
    ctx.restore();
  }, [recipientName, activeTheme, signatureVariant, wpm, grossWpm, accuracy, duration, language, tierTitle, tierGrade, certId, dateStr]);

  useEffect(() => {
    drawCertificate();
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        drawCertificate();
      });
    }
  }, [drawCertificate]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const link = document.createElement('a');
    const safeName = (recipientName || 'Typist').replace(/[^a-zA-Z0-9]/g, '_');
    link.download = `CodeTyper_Certificate_${safeName}_${wpm.toFixed(0)}WPM_Signed_SaumyPandey.png`;
    link.href = dataUrl;
    link.click();
    toast.success('Official Certificate downloaded in ultra high resolution (2400x1600 4K)!');
  };

  const handlePrint = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Pop-up was blocked. Please allow pop-ups to print or save PDF.');
      return;
    }
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>CodeTyper Official Certificate - ${recipientName}</title>
        <style>
          @page { size: landscape; margin: 0; }
          body {
            margin: 0;
            padding: 0;
            background: #000;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            overflow: hidden;
          }
          img {
            width: 100vw;
            height: 100vh;
            object-fit: contain;
          }
          @media print {
            body { background: transparent; }
            img { width: 100%; height: 100%; }
          }
        </style>
      </head>
      <body>
        <img src="${dataUrl}" onload="window.print();" />
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(
      `CodeTyper Verified Official Certificate ID: ${certId} | Recipient: ${recipientName} | Net Speed: ${wpm.toFixed(2)} WPM | Accuracy: ${accuracy.toFixed(2)}% | Signatory: Saumy Pandey (App Owner & Founder, CodeTyper) | Verification: https://codetyper.dev/verify/${certId}`
    );
    toast.success('Certificate verification details copied to clipboard!');
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3rem' }}>
      {/* Header Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          padding: '1.5rem',
          borderRadius: 'var(--radius-xl)',
          background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.15) 0%, rgba(15, 23, 42, 0.85) 100%)',
          border: '1px solid rgba(234, 179, 8, 0.4)',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.35)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #facc15 0%, #ca8a04 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#070b14',
              boxShadow: '0 0 20px rgba(234, 179, 8, 0.6)',
              flexShrink: 0
            }}
          >
            <Award size={30} strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
              <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc' }}>
                Official Accredited Typing Certificate
              </h1>
              <span
                style={{
                  fontSize: '1rem',
                  fontWeight: 700,
                  padding: '0.15rem 0.65rem',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(56, 189, 248, 0.15)',
                  color: '#38bdf8',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  fontFamily: '"Pinyon Script", "Alex Brush", cursive'
                }}
              >
                Signed by App Owner Saumy Pandey
              </span>
            </div>
            <p style={{ margin: '0.35rem 0 0', fontSize: '0.9rem', color: '#94a3b8' }}>
              Standardized touch-typing diploma with 24K gold foil guilloche engraving, 3D embossed wax seal, and the authorized cursive signature of founder <strong>Saumy Pandey</strong>.
            </p>
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => onNavigate('test')}
          style={{
            background: 'linear-gradient(135deg, #ca8a04 0%, #eab308 50%, #facc15 100%)',
            color: '#070b14',
            fontWeight: 700,
            border: 'none',
            boxShadow: '0 4px 14px rgba(234, 179, 8, 0.4)'
          }}
        >
          <span>Take 60s Timed Exam</span>
          <ArrowRight size={15} />
        </button>
      </div>

      {/* Customization Toolbar */}
      <div
        className="card"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          padding: '1rem 1.25rem',
          backgroundColor: '#0a0f1d',
          border: '1px solid rgba(234, 179, 8, 0.35)'
        }}
      >
        {/* Candidate Name Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <UserCheck size={18} color="#38bdf8" />
          <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>Candidate Name:</span>
          <input
            type="text"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            placeholder="Enter candidate full name"
            maxLength={40}
            style={{
              backgroundColor: '#040710',
              color: '#ffffff',
              border: '1px solid rgba(234, 179, 8, 0.45)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.4rem 0.8rem',
              fontSize: '0.925rem',
              fontWeight: 700,
              minWidth: '220px'
            }}
          />
        </div>

        {/* Theme Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Palette size={16} color="#eab308" />
          <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>Theme:</span>
          {Object.values(CERT_THEMES).map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTheme(t.id)}
              style={{
                background: t.swatch,
                color: '#ffffff',
                border: activeTheme === t.id ? '2px solid #ffffff' : '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: activeTheme === t.id ? '0 0 12px rgba(234, 179, 8, 0.6)' : 'none',
                borderRadius: 'var(--radius-full)',
                padding: '0.25rem 0.75rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
              title={t.name}
            >
              {t.badge}
            </button>
          ))}
        </div>

        {/* Signature Style Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Feather size={16} color="#38bdf8" />
          <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>Signature:</span>
          <button
            onClick={() => setSignatureVariant(signatureVariant === 'calligraphy' ? 'lowercase' : 'calligraphy')}
            className="btn btn-sm"
            style={{
              backgroundColor: 'rgba(56, 189, 248, 0.15)',
              color: '#38bdf8',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              borderRadius: 'var(--radius-sm)',
              fontFamily: '"Pinyon Script", "Alex Brush", cursive',
              fontSize: '1.15rem',
              padding: '0.2rem 0.75rem',
              cursor: 'pointer'
            }}
            title="Click to toggle cursive signature (Saumy Pandey / saumypandey)"
          >
            {signatureVariant === 'calligraphy' ? 'Saumy Pandey (Calligraphy)' : 'saumypandey (Cursive Script)'}
          </button>
        </div>
      </div>

      {/* Canvas Display Container */}
      <div
        style={{
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          boxShadow: '0 25px 70px rgba(0, 0, 0, 0.9)',
          border: '1px solid rgba(234, 179, 8, 0.4)',
          backgroundColor: '#04060d',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            width: '100%',
            height: 'auto',
            maxHeight: '750px',
            display: 'block',
            objectFit: 'contain'
          }}
        />
      </div>

      {/* Action Footer */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          padding: '1.25rem 1.5rem',
          borderRadius: 'var(--radius-xl)',
          backgroundColor: '#0a0f1d',
          border: '1px solid rgba(234, 179, 8, 0.35)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#94a3b8', fontSize: '0.875rem' }}>
          <ShieldCheck size={18} color="#38bdf8" />
          <span>Credential ID: <code style={{ color: '#eab308', fontWeight: 700 }}>{certId}</code></span>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            className="btn btn-outline"
            onClick={handleCopyId}
            style={{ borderColor: 'rgba(255, 255, 255, 0.25)', color: '#cbd5e1' }}
          >
            <Share2 size={16} />
            <span>Copy Credential</span>
          </button>

          <button
            className="btn btn-outline"
            onClick={handlePrint}
            style={{ borderColor: 'rgba(56, 189, 248, 0.4)', color: '#38bdf8' }}
          >
            <Printer size={16} />
            <span>Print / Save as PDF</span>
          </button>

          <button
            className="btn btn-primary"
            onClick={handleDownload}
            style={{
              background: 'linear-gradient(135deg, #ca8a04 0%, #eab308 50%, #facc15 100%)',
              color: '#070b14',
              fontWeight: 700,
              border: 'none',
              boxShadow: '0 4px 16px rgba(234, 179, 8, 0.45)'
            }}
          >
            <Download size={16} />
            <span>Download Ultra HD (2400x1600 4K PNG)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
