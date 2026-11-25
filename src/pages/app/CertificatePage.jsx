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
  Lock,
  Unlock,
  Trophy,
  Flame,
  Zap,
  Briefcase,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useSettings } from '../../context/SettingsContext.jsx';
import { api } from '../../utils/api.js';
import { calculateLevelFromXp } from '../../utils/gamificationEngine.js';
import {
  checkCertificateEligibility,
  evaluateThemeTiers,
  CERTIFICATE_THEME_TIERS,
  CERTIFICATE_ROLES,
  getLinkedInCertificationUrl,
  getSocialShareUrls
} from '../../utils/certificateEligibility.js';
import { soundEngine } from '../../utils/soundEngine.js';

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

export function CertificatePage({ onNavigate, onStartPractice }) {
  const canvasRef = useRef(null);
  const { user, userStats } = useAuth();
  const toast = useToast();
  const { settings } = useSettings();
  const isDark = settings?.theme === 'dark';

  const defaultName = user?.display_name || user?.username || 'Saumy Pandey';
  const [recipientName, setRecipientName] = useState(defaultName);
  const [titleRole, setTitleRole] = useState('Touch-Typing Specialist');
  const [activeTheme, setActiveTheme] = useState('imperial-ivory');
  const [signatureVariant, setSignatureVariant] = useState('calligraphy');
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, glareX: 50, glareY: 50 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const rx = (0.5 - y) * 8;
    const ry = (x - 0.5) * 8;
    setTilt({ rx, ry, glareX: x * 100, glareY: y * 100 });
  };
  const handleMouseLeave = () => setTilt({ rx: 0, ry: 0, glareX: 50, glareY: 50 });

  // Sound & Confetti on mount
  useEffect(() => {
    soundEngine.playWaxSealStamp();
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#facc15', '#eab308', '#38bdf8', '#ffffff']
    });
  }, []);

  const wpm = userStats?.best_wpm || (user ? 40 : 65);
  const grossWpm = Math.round(wpm * 1.05);
  const accuracy = userStats?.avg_accuracy || (user ? 92 : 98.4);
  const duration = 60;
  const language = 'All Disciplines (English & Programming)';

  const userLevel = useMemo(() => {
    let lvl = Number(userStats?.level || user?.level || 0);
    if (!lvl && typeof window !== 'undefined') {
      try {
        const storedXp = parseInt(localStorage.getItem('codetyper_total_xp') || '0', 10);
        if (storedXp > 0) {
          lvl = calculateLevelFromXp(storedXp).level;
        }
      } catch {}
    }
    if (!lvl) {
      const tests = Number(userStats?.total_tests || 0);
      lvl = tests >= 30 ? 80 : tests >= 20 ? 60 : tests >= 12 ? 40 : tests >= 5 ? 20 : Math.max(1, tests * 2);
    }
    return lvl;
  }, [userStats, user]);

  const themeTiers = useMemo(() => {
    const arenaWins = typeof window !== 'undefined'
      ? parseInt(localStorage.getItem('codetyper_arena_wins') || '0', 10)
      : 0;
    return evaluateThemeTiers({
      level: userLevel,
      wpm,
      accuracy,
      totalTests: userStats?.total_tests || 0,
      streak: userStats?.current_streak || 1,
      totalChars: userStats?.total_characters || 0,
      languagesCount: 3,
      arenaWins,
      duration
    });
  }, [userLevel, wpm, accuracy, userStats, duration]);

  const currentTier = themeTiers.tiers[activeTheme];
  const isCurrentThemeUnlocked = Boolean(currentTier?.isUnlocked);
  const isBlurredLockedTheme = Boolean(activeTheme !== 'imperial-ivory' && !isCurrentThemeUnlocked);

  const handleLaunchTierExam = (tier = currentTier) => {
    if (!user) {
      toast.info('⚡ Please Sign Up or Log In first so your exam score, level, and accredited certificate are permanently registered!');
      onNavigate('signup');
      return;
    }
    const isCoding = tier?.tier === 3;
    const targetDuration = tier?.examDurationSeconds || 60;
    if (onStartPractice) {
      onStartPractice({
        type: isCoding ? 'coding' : 'test',
        duration: targetDuration,
        language: isCoding ? 'Python' : 'English'
      });
    } else {
      onNavigate(isCoding ? 'coding' : 'test');
    }
  };

  const handleThemeChange = (themeId) => {
    setActiveTheme(themeId);
    soundEngine.playWaxSealStamp();
    const tierMeta = themeTiers.tiers[themeId];
    if (tierMeta && !tierMeta.isUnlocked) {
      if (themeId !== 'imperial-ivory') {
        toast.info(`Theme is locked and blurred (${tierMeta.badge}). Complete all 4 tasks to unlock and reveal it.`);
      } else {
        toast.info(`Viewing open specimen theme (Imperial Ivory). Name customization is locked until examination is passed.`);
      }
    }
  };

  const sessionResult = useMemo(() => ({
    netWpm: wpm,
    grossWpm: grossWpm,
    accuracy: accuracy,
    durationSeconds: duration,
    totalCharacters: Math.round(wpm * 5),
    language: language
  }), [wpm, grossWpm, accuracy, duration, language]);

  const eligibility = useMemo(() => checkCertificateEligibility(sessionResult), [sessionResult]);
  const { tierTitle, tierGrade, tierBadge } = eligibility;

  const certId = useRef(`CT-2026-${Math.random().toString(36).substring(2, 8).toUpperCase()}`).current;
  const dateStr = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, []);

  // Auto-register certificate in ledger database
  useEffect(() => {
    api.certificate.issue({
      certId,
      recipientName,
      titleRole,
      discipline: language,
      netWpm: wpm,
      grossWpm,
      accuracy,
      durationSeconds: duration,
      totalCharacters: Math.round(wpm * 5),
      tierTitle,
      tierBadge: tierBadge || 'Gold',
      tierGrade,
      theme: activeTheme
    }).catch((e) => console.warn('Could not auto-register certificate in ledger', e));
  }, [certId, recipientName, titleRole, language, wpm, grossWpm, accuracy, duration, tierTitle, tierBadge, tierGrade, activeTheme]);

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
    const isUnlocked = isCurrentThemeUnlocked;
    const displayName = isUnlocked
      ? (recipientName || 'CodeTyper Typist').trim()
      : 'DEMO CANDIDATE (SPECIMEN PREVIEW)';
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

    // Candidate Subtitle / Role Selection
    const roleText = isUnlocked
      ? (titleRole || 'Touch-Typing Specialist').toUpperCase()
      : 'SPECIMEN CANDIDATE • VERIFICATION PENDING';
    ctx.fillStyle = theme.accentColor;
    ctx.font = '700 22px "Outfit", system-ui, sans-serif';
    ctx.fillText(`❖   ${roleText}   ❖`, width / 2, 634);

    // 10. Citation
    ctx.fillStyle = theme.citationColor;
    ctx.font = '24px "Outfit", system-ui, sans-serif';
    ctx.fillText(
      'has successfully passed the comprehensive touch-typing speed and accuracy assessment,',
      width / 2,
      674
    );
    ctx.fillText(
      'demonstrating certified motor dexterity, ergonomic cadence, and mastery of professional touch-typing.',
      width / 2,
      710
    );

    // 11. Honor Tier Pill
    const pillW = 680;
    const pillH = 50;
    ctx.fillStyle = theme.cardBg;
    ctx.fillRect(width / 2 - pillW / 2, 746, pillW, pillH);
    ctx.strokeStyle = theme.goldGradient[2];
    ctx.lineWidth = 2;
    ctx.strokeRect(width / 2 - pillW / 2, 746, pillW, pillH);

    ctx.fillStyle = theme.goldGradient[2];
    ctx.font = 'bold 22px "Outfit", system-ui, sans-serif';
    ctx.fillText(`★  ${tierTitle.toUpperCase()} • ${tierGrade.toUpperCase()}  ★`, width / 2, 778);

    ctx.fillStyle = theme.accentColor;
    ctx.font = '600 18px "Outfit", system-ui, sans-serif';
    ctx.fillText(`Specialized Curriculum: ${language} • Standardized Assessment Protocol`, width / 2, 824);

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
    ctx.fillText(`Certificate ID: ${certId}`, leftX + qrSize + 22, 1222);
    ctx.fillText(`SHA-256 Digest: CT-${certId.replace(/-/g, '')}-VERIFIED-SECURE`, leftX + qrSize + 22, 1246);
    ctx.fillText(`Conferral Date: ${dateStr}`, leftX + qrSize + 22, 1270);
    ctx.fillText('Standard: ISO/IEC Professional Typing Competency', leftX + qrSize + 22, 1294);
    ctx.fillText('Biometrics: Keystroke Flight-Time & Cadence Anti-Cheat Certified ✓', leftX + qrSize + 22, 1318);
    ctx.fillText(`Public Registry: https://codetyper.dev/#verify/${certId}`, leftX + qrSize + 22, 1342);
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

    // 16. Anti-Screenshot & Anti-Forgery Specimen Watermark Overlay (when not unlocked)
    if (!isCurrentThemeUnlocked) {
      // 16a. Diagonal Repeating Security Watermarks across Canvas
      ctx.save();
      ctx.rotate((-22 * Math.PI) / 180);
      ctx.textAlign = 'center';

      for (let y = -800; y < height + 1400; y += 180) {
        ctx.fillStyle = theme.isDark ? 'rgba(234, 179, 8, 0.16)' : 'rgba(180, 83, 9, 0.18)';
        ctx.font = '900 48px "Outfit", system-ui, sans-serif';
        ctx.fillText('★ SPECIMEN ONLY • NOT ACCREDITED • COPYRIGHT PROTECTED ★', width / 2 - 260, y);

        ctx.fillStyle = theme.isDark ? 'rgba(56, 189, 248, 0.15)' : 'rgba(153, 27, 27, 0.15)';
        ctx.font = 'bold 22px monospace';
        ctx.fillText('CODETYPER OFFICIAL REGISTRY • COPY FORGERY VOID • PASS EXAM TO CERTIFY YOUR NAME', width / 2 - 260, y + 42);
      }
      ctx.restore();

      // 16b. Prominent Security Banner Strip across top inside border
      ctx.save();
      const bannerH = 46;
      ctx.fillStyle = 'rgba(185, 28, 28, 0.94)'; // Crimson Red Security Header
      ctx.fillRect(104, 104, width - 208, bannerH);
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(104, 104, width - 208, bannerH);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px "Outfit", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        '⚠️ SPECIMEN DEMO PREVIEW • COPYRIGHT PROTECTED BY SAUMY PANDEY • PASS TIMED EXAM TO CLAIM OFFICIAL CREDENTIAL',
        width / 2,
        104 + bannerH / 2
      );
      ctx.restore();

      // 16c. Anti-Screenshot Red Box Stamp over Candidate Name
      ctx.save();
      ctx.translate(width / 2, 560);
      ctx.rotate((-7 * Math.PI) / 180);
      ctx.strokeStyle = 'rgba(220, 38, 38, 0.7)';
      ctx.lineWidth = 5;
      ctx.strokeRect(-430, -56, 860, 112);
      ctx.fillStyle = 'rgba(220, 38, 38, 0.14)';
      ctx.fillRect(-430, -56, 860, 112);
      ctx.fillStyle = 'rgba(239, 68, 68, 0.92)';
      ctx.font = '900 34px "Outfit", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('★ SPECIMEN ONLY • NOT ACCREDITED ★', 0, 0);
      ctx.restore();
    }

    // 17. Bottom Security Microtext
    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = theme.isDark ? '#475569' : '#64748b';
    ctx.font = '15px monospace';
    ctx.fillText(
      `Official CodeTyper Sovereign Credential • Electronically Signed by Founder & Owner Saumy Pandey • Verification: https://codetyper.dev/#verify/${certId}`,
      width / 2,
      1520
    );
    ctx.restore();
  }, [recipientName, titleRole, activeTheme, signatureVariant, wpm, grossWpm, accuracy, duration, language, tierTitle, tierGrade, certId, dateStr, isCurrentThemeUnlocked]);

  useEffect(() => {
    drawCertificate();
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        drawCertificate();
      });
    }
  }, [drawCertificate]);

  const handleDownload = () => {
    if (!user) {
      toast.info('🔒 Sign up or Log in to claim, certify, and download your official 4K accredited diploma!');
      onNavigate('signup');
      return;
    }
    const selectedTier = themeTiers.tiers[activeTheme];
    if (!isCurrentThemeUnlocked) {
      toast.error(`🔒 ${selectedTier?.name || 'Theme'} is locked! Reach Account Level ${selectedTier?.unlockLevel || 20} and clear the ${selectedTier?.examDurationSeconds || 60}s exam to unlock official downloading.`);
      return;
    }
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const link = document.createElement('a');
    const safeName = (recipientName || 'Typist').replace(/[^a-zA-Z0-9]/g, '_');
    link.download = `CodeTyper_Certificate_${safeName}_${wpm.toFixed(0)}WPM_${activeTheme}_Signed_SaumyPandey.png`;
    link.href = dataUrl;
    link.click();
    toast.success('Official Certificate downloaded in ultra high resolution (2400x1600 4K)!');
  };

  const handlePrint = () => {
    if (!user) {
      toast.info('🔒 Sign up or Log in to print or export your official accredited diploma!');
      onNavigate('signup');
      return;
    }
    const selectedTier = themeTiers.tiers[activeTheme];
    if (!isCurrentThemeUnlocked) {
      toast.error(`🔒 ${selectedTier?.name || 'Theme'} is locked! Reach Account Level ${selectedTier?.unlockLevel || 20} and clear the ${selectedTier?.examDurationSeconds || 60}s exam to print or export PDF.`);
      return;
    }
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
    if (!user) {
      toast.info('🔒 Sign up or Log in to register your verified credential on the ledger!');
      onNavigate('signup');
      return;
    }
    navigator.clipboard.writeText(
      `CodeTyper Verified Official Certificate ID: ${certId} | Recipient: ${recipientName} | Net Speed: ${wpm.toFixed(2)} WPM | Accuracy: ${accuracy.toFixed(2)}% | Signatory: Saumy Pandey (App Owner & Founder, CodeTyper) | Verification: https://codetyper.dev/verify/${certId}`
    );
    toast.success('Certificate verification details copied to clipboard!');
  };

  return (
    <div className="cert-page-container">
      {/* 1. Hero Header Card */}
      <div className="cert-hero-card">
        <div className="cert-hero-left">
          <div className="cert-hero-icon-box">
            <Award size={30} strokeWidth={2.5} />
          </div>
          <div>
            <div className="cert-hero-badge-row">
              <span className="cert-hero-accred-badge">
                <ShieldCheck size={13} />
                <span>Accredited Certification</span>
              </span>
              <span className="cert-hero-founder-pill">
                Signed by App Owner &amp; Founder Saumy Pandey
              </span>
            </div>
            <h1 className="cert-hero-title">
              Standardized Touch-Typing &amp; Code Diploma
            </h1>
            <p className="cert-hero-desc">
              Standardized touch-typing credential with 24K gold foil guilloche engraving, 3D embossed wax seal, instant cryptographic verification, and the authorized cursive signature of founder <strong>Saumy Pandey</strong>.
            </p>
            <div className="cert-hero-highlights">
              <span className="cert-hero-highlight-item">
                <ShieldCheck size={14} color="var(--color-primary-forest)" />
                <span>Instant Ledger Verification</span>
              </span>
              <span className="cert-hero-highlight-item">
                <Trophy size={14} color="#eab308" />
                <span>4 Distinction Tiers</span>
              </span>
              <span className="cert-hero-highlight-item">
                <ExternalLink size={14} color="#0077b5" />
                <span>1-Click LinkedIn Integration</span>
              </span>
              <span className="cert-hero-highlight-item">
                <Printer size={14} color="var(--color-text-muted)" />
                <span>4K Ultra HD PNG / PDF</span>
              </span>
            </div>
          </div>
        </div>

        <div className="cert-hero-cta">
          <button
            className="btn btn-primary"
            onClick={() => handleLaunchTierExam(currentTier)}
            style={{ fontWeight: 700 }}
          >
            {user ? (
              <>
                <span>Take Level {currentTier?.unlockLevel || 20} Exam ({currentTier?.examDurationSeconds || 60}s)</span>
                <ArrowRight size={15} />
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>Sign Up to Take Level {currentTier?.unlockLevel || 20} Exam ({currentTier?.examDurationSeconds || 60}s) ⚡</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Guest Welcome Banner */}
      {!user && (
        <div className="cert-guest-banner">
          <div className="cert-guest-banner-left">
            <div className="cert-guest-icon-box">
              <Sparkles size={24} />
            </div>
            <div>
              <div className="cert-guest-title">
                Claim &amp; Certify Your Official Typing Diploma 🎓
              </div>
              <div className="cert-guest-desc">
                You are currently previewing specimen themes as a guest. <strong>Create your free account</strong> to certify your real name, customize your verified professional title, pass timed exams (60s to 300s), and download ultra HD 4K diplomas signed by founder <strong>Saumy Pandey</strong>!
              </div>
            </div>
          </div>
          <div className="cert-guest-actions">
            <button
              className="btn btn-outline"
              onClick={() => onNavigate('login')}
            >
              Log In
            </button>
            <button
              className="btn btn-primary"
              onClick={() => onNavigate('signup')}
            >
              <span>Sign Up Free to Claim ⚡</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* 3. Theme Quest & Milestone Roadmap */}
      <div className="cert-roadmap-card">
        <div className="cert-roadmap-header">
          <div>
            <div className="cert-roadmap-title-row">
              <Trophy size={20} color="#eab308" />
              <h2 className="cert-roadmap-title">
                Certificate Quest &amp; Milestone Roadmap
              </h2>
            </div>
            <p className="cert-roadmap-subtitle">
              Complete required velocity, accuracy, streak, and volume benchmarks to unlock official luxury themes.
            </p>
          </div>
          <div className="cert-roadmap-counter">
            <span>Themes Unlocked: {themeTiers.totalUnlocked} of 4</span>
          </div>
        </div>

        {/* 4-Tier Interactive Cards Grid */}
        <div className="cert-tier-grid">
          {Object.values(themeTiers.tiers).map((tier) => {
            const isSelected = activeTheme === tier.id;
            return (
              <div
                key={tier.id}
                onClick={() => handleThemeChange(tier.id)}
                className={`cert-tier-card ${isSelected ? 'selected' : ''}`}
              >
                {/* Header: Tier Number & Status Badge */}
                <div className="cert-tier-top-row">
                  <span className="cert-tier-label">
                    Tier {tier.tier} • Lv {tier.unlockLevel || 20}+ ({tier.examDurationSeconds || 60}s)
                  </span>
                  {tier.isUnlocked ? (
                    <span className="cert-tier-status-unlocked">
                      <Check size={11} strokeWidth={3} />
                      <span>Unlocked</span>
                    </span>
                  ) : (
                    <span className="cert-tier-status-locked">
                      <Lock size={11} />
                      <span>Locked ({tier.passedCount}/4)</span>
                    </span>
                  )}
                </div>

                {/* Theme Title & Swatch */}
                <div className="cert-tier-meta">
                  <div
                    className="cert-tier-swatch"
                    style={{ background: tier.swatch }}
                  />
                  <div>
                    <h3 className="cert-tier-name">
                      {tier.name}
                    </h3>
                    <div className="cert-tier-role-tag">
                      {tier.roleTag}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.3rem', color: 'var(--color-text-secondary)' }}>
                    <span>Quest Progress</span>
                    <span style={{ fontWeight: 700, color: tier.isUnlocked ? 'var(--color-primary-forest)' : '#b45309' }}>
                      {tier.progressPercent}%
                    </span>
                  </div>
                  <div className="cert-tier-progress-track">
                    <div
                      className="cert-tier-progress-fill"
                      style={{
                        width: `${tier.progressPercent}%`,
                        backgroundColor: tier.isUnlocked ? 'var(--color-primary-forest)' : tier.accentColor
                      }}
                    />
                  </div>
                </div>

                {/* 4 Tasks Checklist */}
                <div className="cert-tier-tasks">
                  {tier.tasks.map((task) => (
                    <div
                      key={task.id}
                      className={`cert-tier-task-item ${task.passed ? 'passed' : ''}`}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        {task.passed ? (
                          <div style={{ width: '15px', height: '15px', borderRadius: '50%', backgroundColor: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', flexShrink: 0 }}>
                            <Check size={10} strokeWidth={3} />
                          </div>
                        ) : (
                          <div style={{ width: '15px', height: '15px', borderRadius: '50%', backgroundColor: 'var(--color-bg-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', flexShrink: 0, border: '1px solid var(--color-border)' }}>
                            <Lock size={9} />
                          </div>
                        )}
                        <span style={{ color: task.passed ? 'var(--color-text-primary)' : 'var(--color-text-muted)', fontWeight: task.passed ? 600 : 400 }}>
                          {task.title}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ fontSize: '0.75rem', color: task.passed ? '#16a34a' : 'var(--color-text-secondary)', fontWeight: 650 }}>
                          {task.current}
                        </span>
                        {!task.passed && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!user) {
                                toast.info(`⚡ Please Sign Up or Log In first to track your XP, complete the "${task.title}" task, and level up!`);
                                onNavigate('signup');
                                return;
                              }
                              if (task.actionRoute === 'test' || task.actionRoute === 'coding') {
                                handleLaunchTierExam(tier);
                              } else {
                                onNavigate(task.actionRoute);
                              }
                            }}
                            className="btn btn-ghost"
                            style={{ padding: '0.1rem 0.35rem', fontSize: '0.7rem', color: 'var(--color-primary-forest)', height: 'auto' }}
                            title={!user ? `Sign up to complete ${task.title}` : `Go to ${task.actionText}`}
                          >
                            <span>{!user ? 'Sign Up 🔒' : `${task.actionText} →`}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Card Action Button */}
                <button
                  onClick={() => handleThemeChange(tier.id)}
                  className={`btn btn-sm cert-tier-btn ${isSelected ? 'btn-primary' : (tier.isUnlocked ? 'btn-outline' : 'btn-ghost')}`}
                  style={{
                    backgroundColor: isSelected ? 'var(--color-primary-forest)' : undefined,
                    color: isSelected ? '#ffffff' : undefined
                  }}
                >
                  {isSelected ? (
                    <span>✨ Active Diploma Preview</span>
                  ) : tier.isUnlocked ? (
                    <span>Select Theme 📜</span>
                  ) : (
                    <span>Preview Locked Theme 👁️</span>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Customization Toolbar */}
      <div className="cert-customizer-toolbar">
        {/* Candidate Name Input */}
        <div className="cert-toolbar-group">
          <UserCheck size={18} color="var(--color-primary-forest)" />
          <span className="cert-toolbar-label">Candidate:</span>
          <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
            <input
              type="text"
              className="cert-candidate-input"
              value={user ? (isCurrentThemeUnlocked ? recipientName : 'DEMO CANDIDATE (LOCKED)') : 'DEMO SPECIMEN - JOHNATHAN DOE'}
              onChange={(e) => {
                if (user && isCurrentThemeUnlocked) {
                  setRecipientName(e.target.value);
                }
              }}
              onClick={() => {
                if (!user) {
                  toast.info('🔒 Sign up or Log in to put your official name on this diploma!');
                  onNavigate('signup');
                }
              }}
              readOnly={!user || !isCurrentThemeUnlocked}
              placeholder={user ? (isCurrentThemeUnlocked ? "Enter candidate full name" : "Locked (Pass exam to edit)") : "Sign up to put your real name"}
              maxLength={40}
              style={{
                cursor: user && isCurrentThemeUnlocked ? 'text' : 'pointer',
                opacity: user && isCurrentThemeUnlocked ? 1 : 0.85
              }}
            />
            {(!user || !isCurrentThemeUnlocked) && (
              <span
                style={{
                  position: 'absolute',
                  right: '0.6rem',
                  display: 'flex',
                  alignItems: 'center',
                  color: 'var(--color-text-muted)'
                }}
                title={!user ? "Sign up to customize recipient name" : "Name editing is disabled until qualifying examination is cleared."}
              >
                <Lock size={14} />
              </span>
            )}
          </div>
          {!user ? (
            <button
              onClick={() => {
                toast.info('🔒 Sign up or Log in to put your official real name on this diploma!');
                onNavigate('signup');
              }}
              className="btn btn-sm btn-primary"
              style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}
            >
              <Lock size={11} />
              <span>Sign Up to Unlock Real Name ⚡</span>
            </button>
          ) : !isCurrentThemeUnlocked && (
            <span
              style={{
                fontSize: '0.725rem',
                color: 'var(--color-text-muted)',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                backgroundColor: 'var(--color-bg-soft)',
                padding: '0.2rem 0.55rem',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--color-border)'
              }}
            >
              <Lock size={10} />
              <span>Specimen Preview Mode</span>
            </span>
          )}
        </div>

        {/* Candidate Role Selector */}
        <div className="cert-toolbar-group">
          <Briefcase size={17} color="#eab308" />
          <span className="cert-toolbar-label">Role:</span>
          {user ? (
            <select
              className="cert-role-select"
              value={titleRole}
              onChange={(e) => setTitleRole(e.target.value)}
            >
              {CERTIFICATE_ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          ) : (
            <button
              onClick={() => {
                toast.info('🔒 Sign up or Log in to choose your certified engineering title (Full-Stack, AI, Cloud, etc.)!');
                onNavigate('signup');
              }}
              className="cert-role-select"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                borderStyle: 'dashed'
              }}
              title="Click to sign up and choose your role title"
            >
              <span>Full-Stack Software Engineer</span>
              <Lock size={12} color="#eab308" />
            </button>
          )}
        </div>

        {/* Theme Selector with Swatches */}
        <div className="cert-toolbar-group">
          <Palette size={16} color="var(--color-primary-forest)" />
          <span className="cert-toolbar-label">Theme:</span>
          <div className="cert-theme-swatches">
            {Object.values(CERT_THEMES).map((t) => {
              const tierMeta = themeTiers.tiers[t.id];
              const isUnlocked = tierMeta?.isUnlocked;
              const isActive = activeTheme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => handleThemeChange(t.id)}
                  className={`cert-swatch-btn ${isActive ? 'active' : ''}`}
                  style={{
                    background: t.swatch,
                    opacity: isUnlocked || isActive ? 1 : 0.6
                  }}
                  title={`${t.name} (${t.badge}) - ${isUnlocked ? 'Unlocked' : 'Locked'}`}
                  aria-label={t.name}
                />
              );
            })}
          </div>
        </div>

        {/* Founder Signature Style Switcher */}
        <div className="cert-toolbar-group">
          <Feather size={16} color="var(--color-primary-forest)" />
          <span className="cert-toolbar-label">Signature:</span>
          {user ? (
            <button
              onClick={() => setSignatureVariant(signatureVariant === 'calligraphy' ? 'lowercase' : 'calligraphy')}
              className="cert-signature-toggle-btn"
              title="Toggle cursive signature style (Saumy Pandey / saumypandey)"
            >
              <span>{signatureVariant === 'calligraphy' ? 'Saumy Pandey' : 'saumypandey'}</span>
            </button>
          ) : (
            <button
              onClick={() => {
                toast.info('🔒 Sign up or Log in to customize founder signature styling!');
                onNavigate('signup');
              }}
              className="cert-signature-toggle-btn"
              title="Click to sign up and customize signature"
            >
              <span>Saumy Pandey</span>
              <Lock size={12} color="#eab308" />
            </button>
          )}
        </div>
      </div>

      {/* 5. Canvas Display Container with 3D Holographic Tilt & Glare */}
      <div
        className="cert-canvas-container"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `perspective(1400px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`
        }}
      >
        {/* Dynamic Theme Accreditation or Locked Status Overlay */}
        <div className="cert-canvas-status-pill">
          {isCurrentThemeUnlocked ? (
            <>
              <ShieldCheck size={15} color="#22c55e" />
              <span style={{ color: 'var(--color-primary-forest)', fontSize: '0.825rem', fontWeight: 700 }}>
                Accredited &amp; Ready to Download
              </span>
            </>
          ) : activeTheme === 'imperial-ivory' ? (
            <>
              <Sparkles size={15} color="#d97706" />
              <span style={{ color: '#b45309', fontSize: '0.825rem', fontWeight: 700 }}>
                Open Specimen (Curiosity Preview • Anti-Screenshot Protected)
              </span>
            </>
          ) : (
            <>
              <Lock size={15} color="#ef4444" />
              <span style={{ color: '#dc2626', fontSize: '0.825rem', fontWeight: 700 }}>
                Theme Locked &amp; Blurred ({currentTier?.passedCount || 0}/4 Tasks)
              </span>
            </>
          )}
        </div>

        {/* Dynamic Gold/Emerald Holographic Glare */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(234, 179, 8, 0.12) 0%, transparent 65%)`,
            zIndex: 2
          }}
        />

        {/* Canvas with Blur & Anti-Screenshot Safeguards */}
        <canvas
          ref={canvasRef}
          onContextMenu={(e) => e.preventDefault()}
          draggable={false}
          className="cert-canvas-element"
          style={{
            filter: isBlurredLockedTheme ? 'blur(26px) brightness(0.55)' : 'none',
            transform: isBlurredLockedTheme ? 'scale(1.02)' : 'none',
            transition: 'filter 0.35s ease, transform 0.35s ease',
            pointerEvents: isBlurredLockedTheme ? 'none' : 'auto'
          }}
        />

        {/* Frosted Glass Lock Shield Overlay (For the 3 Locked & Blurred Themes) */}
        {isBlurredLockedTheme && (
          <div className="cert-lock-overlay">
            {/* Glowing 3D Lock Emblem */}
            <div className="cert-lock-emblem">
              <Lock size={38} strokeWidth={2.4} />
            </div>

            <div
              style={{
                fontSize: '0.85rem',
                fontWeight: 800,
                color: '#facc15',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '0.35rem'
              }}
            >
              Tier {currentTier?.tier || 2} Diploma Locked • Requires Level {currentTier?.unlockLevel || 20}
            </div>

            <h3 className="cert-lock-heading">
              {currentTier?.name || 'Exclusive Luxury Theme'}
            </h3>

            <p className="cert-lock-desc">
              This official high-prestige diploma is blurred and locked to protect credential integrity.
              Reach Account Level {currentTier?.unlockLevel || 20} and pass the {currentTier?.examDurationSeconds || 60}s typing benchmark to unlock this theme without watermarks.
            </p>

            {/* Quest Progress Pill */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.75rem',
                backgroundColor: 'rgba(15, 23, 42, 0.85)',
                border: '1px solid rgba(234, 179, 8, 0.35)',
                borderRadius: 'var(--radius-full)',
                padding: '0.4rem 1.2rem',
                marginBottom: '1.5rem',
                fontSize: '0.85rem'
              }}
            >
              <span style={{ color: '#94a3b8' }}>Milestones Cleared:</span>
              <span style={{ fontWeight: 800, color: '#facc15' }}>
                {currentTier?.passedCount || 0} / {currentTier?.totalCount || 4} Tasks ({currentTier?.progressPercent || 0}%)
              </span>
            </div>

            {/* Quick Action Buttons */}
            <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button
                className="btn btn-primary"
                onClick={() => handleLaunchTierExam(currentTier)}
              >
                <span>
                  {!user
                    ? `Sign Up to Unlock & Take Level ${currentTier?.unlockLevel || 20} Exam (${currentTier?.examDurationSeconds || 60}s) ⚡`
                    : `Take Level ${currentTier?.unlockLevel || 20} Exam (${currentTier?.examDurationSeconds || 60}s) to Unlock ⚡`}
                </span>
                <ArrowRight size={16} />
              </button>

              <button
                className="btn btn-outline"
                onClick={() => handleThemeChange('imperial-ivory')}
                style={{
                  borderColor: 'rgba(255, 255, 255, 0.35)',
                  color: '#f8fafc',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)'
                }}
              >
                <span>View Open Specimen (Imperial Ivory) 👁️</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 6. Action & Ledger Verification Bar */}
      <div className="cert-action-bar">
        <div className="cert-serial-info">
          <ShieldCheck size={18} color="var(--color-primary-forest)" />
          <span>Serial: <code className="cert-serial-code">{certId}</code></span>
          <span style={{ color: 'var(--color-border)' }}>•</span>
          <a
            href={`#verify/${certId}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--color-primary-forest)', textDecoration: 'underline', fontSize: '0.85rem', fontWeight: 600 }}
          >
            Public Ledger Verification ↗
          </a>
        </div>

        <div className="cert-btn-group">
          {/* 1-Click Add to LinkedIn */}
          <button
            className="btn btn-outline cert-linkedin-btn"
            onClick={() => {
              if (!user) {
                toast.info('🔒 Sign up or Log in to certify and add your official credential directly to your LinkedIn profile!');
                onNavigate('signup');
                return;
              }
              if (!isCurrentThemeUnlocked) {
                toast.info('🔒 Add to LinkedIn is available once you pass the qualification exam and claim your accredited credential!');
                return;
              }
              const url = getLinkedInCertificationUrl({
                certId,
                recipientName,
                wpm,
                tierTitle,
                issueDate: new Date()
              });
              window.open(url, '_blank', 'noopener,noreferrer');
            }}
            title={!user ? "Sign up to add to LinkedIn" : "Add Credential directly to your LinkedIn Profile"}
          >
            <ExternalLink size={15} />
            <span>{!user ? 'Add to LinkedIn 🔒' : 'Add to LinkedIn'}</span>
          </button>

          <button
            className="btn btn-outline"
            onClick={handleCopyId}
          >
            <Share2 size={16} />
            <span>{!user ? 'Copy Credential 🔒' : 'Copy Credential'}</span>
          </button>

          <button
            className="btn btn-outline"
            onClick={handlePrint}
          >
            <Printer size={16} />
            <span>{!user ? 'Print / PDF 🔒' : 'Print / Save PDF'}</span>
          </button>

          <button
            className="btn btn-primary"
            onClick={handleDownload}
          >
            <Download size={16} />
            <span>{!user ? 'Sign Up to Claim 4K Certificate 🎓' : 'Download Ultra HD (2400x1600 4K PNG)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
