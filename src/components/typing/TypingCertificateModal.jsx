import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import {
  Download,
  Share2,
  Check,
  X,
  Award,
  ShieldCheck,
  Sparkles,
  Lock,
  ArrowRight,
  UserCheck,
  Printer,
  Palette,
  Maximize2,
  Minimize2,
  Feather,
  ExternalLink,
  Briefcase
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { api } from '../../utils/api.js';
import {
  checkCertificateEligibility,
  evaluateThemeTiers,
  CERTIFICATE_THEME_TIERS,
  CERTIFICATE_ROLES,
  getLinkedInCertificationUrl,
  getSocialShareUrls
} from '../../utils/certificateEligibility.js';
import { soundEngine } from '../../utils/soundEngine.js';
import { calculateLevelFromXp } from '../../utils/gamificationEngine.js';
import { getSiteUrl } from '../../utils/seoConfig.js';

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

export function TypingCertificateModal({ isOpen, onClose, result, onStartCertTest }) {
  const canvasRef = useRef(null);
  const { user, userStats } = useAuth();
  const toast = useToast();

  const defaultName = user ? (user?.display_name || user?.username || 'Saumy Pandey') : 'DEMO SPECIMEN - JOHNATHAN DOE';
  const [recipientName, setRecipientName] = useState(defaultName);
  const [titleRole, setTitleRole] = useState(result?.titleRole || 'Touch-Typing Specialist');
  const [activeTheme, setActiveTheme] = useState('imperial-ivory');
  const [signatureVariant, setSignatureVariant] = useState('calligraphy'); // 'calligraphy' | 'lowercase'
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, glareX: 50, glareY: 50 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const rx = (0.5 - y) * 10;
    const ry = (x - 0.5) * 10;
    setTilt({ rx, ry, glareX: x * 100, glareY: y * 100 });
  };
  const handleMouseLeave = () => setTilt({ rx: 0, ry: 0, glareX: 50, glareY: 50 });

  // Re-sync recipient name if defaultName changes
  useEffect(() => {
    if (defaultName && !recipientName) {
      setRecipientName(defaultName);
    }
  }, [defaultName, recipientName]);

  const eligibility = useMemo(() => checkCertificateEligibility(result), [result]);
  const [activeTab, setActiveTab] = useState(eligibility.isEligible ? 'certificate' : 'requirements');

  const wpm = result?.netWpm !== undefined ? Number(result.netWpm) : 60;
  const grossWpm = result?.grossWpm !== undefined ? Number(result.grossWpm) : wpm;
  const accuracy = result?.accuracy !== undefined ? Number(result.accuracy) : 100;
  const duration = result?.durationSeconds !== undefined ? Math.round(Number(result.durationSeconds)) : 60;
  const language = result?.language || 'All Disciplines (English & Code)';

  const userLevel = useMemo(() => {
    if (userStats?.level && userStats.level > 1) return userStats.level;
    const storedXp = typeof window !== 'undefined'
      ? parseInt(localStorage.getItem('codetyper_total_xp') || '0', 10)
      : 0;
    if (storedXp > 0) return calculateLevelFromXp(storedXp);
    const tests = userStats?.total_tests || 0;
    return tests >= 30 ? 80 : tests >= 20 ? 60 : tests >= 12 ? 40 : tests >= 5 ? 20 : Math.max(1, tests * 2);
  }, [userStats]);

  const themeTiers = useMemo(() => {
    const arenaWins = typeof window !== 'undefined'
      ? parseInt(localStorage.getItem('codetyper_arena_wins') || '0', 10)
      : 0;
    return evaluateThemeTiers({
      level: userLevel,
      wpm: Math.max(wpm, userStats?.best_wpm || 0),
      accuracy: Math.max(accuracy, userStats?.avg_accuracy || 0),
      totalTests: (userStats?.total_tests || 0) + 1,
      streak: userStats?.current_streak || 1,
      totalChars: (userStats?.total_characters || 0) + Math.round(wpm * 5),
      languagesCount: 3,
      arenaWins,
      duration
    });
  }, [userLevel, wpm, accuracy, userStats, duration]);

  const currentTier = themeTiers.tiers[activeTheme];
  const isCurrentThemeUnlocked = Boolean(user && currentTier?.isUnlocked && eligibility.isEligible);
  const isBlurredLockedTheme = Boolean(activeTheme !== 'imperial-ivory' && !isCurrentThemeUnlocked);

  // When eligibility changes, update activeTab accordingly
  useEffect(() => {
    if (eligibility.isEligible) {
      setActiveTab('certificate');
    }
  }, [eligibility.isEligible]);

  // Wax seal sound & celebratory confetti on modal open
  useEffect(() => {
    if (isOpen) {
      soundEngine.playWaxSealStamp();
      if (eligibility.isEligible) {
        confetti({
          particleCount: 45,
          spread: 70,
          origin: { y: 0.65 },
          colors: ['#facc15', '#eab308', '#38bdf8', '#ffffff']
        });
      }
    }
  }, [isOpen, eligibility.isEligible]);

  const handleThemeChange = (themeId) => {
    setActiveTheme(themeId);
    soundEngine.playWaxSealStamp();
    const tierMeta = themeTiers.tiers[themeId];
    if (tierMeta && !tierMeta.isUnlocked) {
      toast.info(`Previewing locked theme: ${tierMeta.name} (${tierMeta.passedCount}/4 Tasks Cleared). Complete its tasks to unlock official downloading.`);
    }
  };

  const { tierTitle, tierGrade, tierBadge } = eligibility;

  const certId = useRef(result?.certId || `CT-2026-${Math.random().toString(36).substring(2, 8).toUpperCase()}`).current;
  const dateStr = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, []);

  // Auto-record certificate in ledger database
  useEffect(() => {
    if (isOpen && eligibility.isEligible) {
      api.certificate.issue({
        certId,
        recipientName,
        titleRole,
        discipline: language,
        netWpm: wpm,
        grossWpm,
        accuracy,
        durationSeconds: duration,
        totalCharacters: result?.totalCharacters || 250,
        tierTitle,
        tierBadge,
        tierGrade,
        theme: activeTheme
      }).catch((e) => console.warn('Could not auto-register certificate in ledger', e));
    }
  }, [isOpen, eligibility.isEligible, certId, recipientName, titleRole, language, wpm, grossWpm, accuracy, duration, tierTitle, tierBadge, tierGrade, activeTheme]);

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
    // Layer A: Outer hairline border
    ctx.strokeStyle = theme.hairline;
    ctx.lineWidth = 2;
    ctx.strokeRect(45, 45, width - 90, height - 90);

    // Layer B: Primary 24K Gold Foil Embossed Border
    const goldGrad = ctx.createLinearGradient(0, 68, width, 68);
    goldGrad.addColorStop(0, theme.goldGradient[0]);
    goldGrad.addColorStop(0.25, theme.goldGradient[1]);
    goldGrad.addColorStop(0.5, theme.goldGradient[2]);
    goldGrad.addColorStop(0.75, theme.goldGradient[3]);
    goldGrad.addColorStop(1, theme.goldGradient[4]);

    ctx.strokeStyle = goldGrad;
    ctx.lineWidth = 6;
    ctx.strokeRect(68, 68, width - 136, height - 136);

    // Layer C: Accent Security Line
    ctx.strokeStyle = theme.accentLine;
    ctx.lineWidth = 1.8;
    ctx.strokeRect(86, 86, width - 172, height - 172);

    // Layer D: Inner Dotted Security Line
    ctx.save();
    ctx.setLineDash([6, 8]);
    ctx.strokeStyle = theme.isDark ? 'rgba(234, 179, 8, 0.45)' : 'rgba(180, 83, 9, 0.4)';
    ctx.lineWidth = 2;
    ctx.strokeRect(104, 104, width - 208, height - 208);
    ctx.restore();

    // Layer E: Mathematical Guilloche Sinusoidal Security Waves on all 4 margins
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

    // 6. Classical Victorian Corner Ornaments (Filigree & Diamonds)
    const drawCornerOrnament = (cx, cy, dirX, dirY) => {
      ctx.save();
      ctx.strokeStyle = theme.goldGradient[2];
      ctx.fillStyle = theme.goldGradient[2];
      ctx.lineWidth = 3.5;

      // Outer Bracket
      ctx.beginPath();
      ctx.moveTo(cx, cy + dirY * 65);
      ctx.lineTo(cx, cy);
      ctx.lineTo(cx + dirX * 65, cy);
      ctx.stroke();

      // Inner flourish triangle
      ctx.beginPath();
      ctx.moveTo(cx + dirX * 22, cy + dirY * 22);
      ctx.lineTo(cx + dirX * 50, cy + dirY * 22);
      ctx.lineTo(cx + dirX * 22, cy + dirY * 50);
      ctx.closePath();
      ctx.fill();

      // Corner Lozenge Diamond
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

    // 7. Header Emblem: 5 Golden Stars & Accreditation Commission
    ctx.save();
    ctx.textAlign = 'center';

    // 5 Stars
    ctx.fillStyle = theme.goldGradient[2];
    ctx.font = '28px system-ui, sans-serif';
    ctx.fillText('★     ★     ★     ★     ★', width / 2, 175);

    // Accreditation Authority Header
    ctx.fillStyle = theme.accentColor;
    ctx.font = 'bold 22px "Outfit", system-ui, sans-serif';
    ctx.fillText('CODETYPER GLOBAL ACCREDITATION BOARD & REGISTRY', width / 2, 218);

    ctx.fillStyle = theme.subtextColor;
    ctx.font = '600 16px "Outfit", system-ui, sans-serif';
    ctx.fillText('STANDARDIZED TOUCH-TYPING COMPETENCY COMMISSION • EST. 2026', width / 2, 248);

    // Decorative Horizontal Gold Filigree Divider
    ctx.strokeStyle = theme.isDark ? 'rgba(234, 179, 8, 0.45)' : 'rgba(180, 83, 9, 0.4)';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 380, 278);
    ctx.lineTo(width / 2 + 380, 278);
    ctx.stroke();

    // Center Gold Diamond Cartouche
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

    // 9. Candidate Name (Majestic Centerpiece)
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

    // Elegant Gold Twin Underline with Center Jewels
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

    // 10. Citation & Achievement Text
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

    // 11. Honor Tier Honor Pill
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

    // 12. Four Verified Metric Examination Badges
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
      // Card Background
      ctx.fillStyle = theme.cardBg;
      ctx.fillRect(bx, boxY, boxWidth, boxHeight);
      ctx.strokeStyle = theme.cardBorder;
      ctx.lineWidth = 2;
      ctx.strokeRect(bx, boxY, boxWidth, boxHeight);

      // Top corner gold notch
      ctx.fillStyle = theme.goldGradient[2];
      ctx.fillRect(bx, boxY, 26, 4);

      // Label
      ctx.fillStyle = theme.subtextColor;
      ctx.font = '700 16px "Outfit", system-ui, sans-serif';
      ctx.fillText(m.label, bx + boxWidth / 2, boxY + 44);

      // Value
      ctx.fillStyle = m.color;
      ctx.font = 'bold 40px "Outfit", system-ui, sans-serif';
      ctx.fillText(m.value, bx + boxWidth / 2, boxY + 98);
    });

    // 13. Official 3D Metallic Gold Embossed Wax Seal (Bottom-Center)
    const sealX = width / 2;
    const sealY = 1250;

    // Hanging Satin Ribbon Tails
    ctx.save();
    ctx.fillStyle = theme.ribbonColor;
    ctx.strokeStyle = theme.ribbonBorder;
    ctx.lineWidth = 2.5;

    // Left Ribbon
    ctx.beginPath();
    ctx.moveTo(sealX - 35, sealY + 35);
    ctx.lineTo(sealX - 60, sealY + 160);
    ctx.lineTo(sealX - 35, sealY + 135);
    ctx.lineTo(sealX - 10, sealY + 160);
    ctx.lineTo(sealX - 14, sealY + 35);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Right Ribbon
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

    // Starburst Medallion Base (36 points)
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

    // Inner Concentric Ring
    ctx.beginPath();
    ctx.arc(sealX, sealY, 68, 0, Math.PI * 2);
    ctx.fillStyle = theme.sealInner;
    ctx.fill();
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = theme.sealOuter[0];
    ctx.stroke();

    // Seal Core Text & Emblem
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

    // 14. Bottom-Left: Cryptographic Verification & Anti-Counterfeit Block
    ctx.save();
    ctx.textAlign = 'left';
    const leftX = 160;

    // Digital Security Matrix Block (Representing Encrypted QR Proof)
    const qrSize = 72;
    ctx.strokeStyle = theme.accentLine;
    ctx.lineWidth = 2;
    ctx.strokeRect(leftX, 1170, qrSize, qrSize);
    ctx.fillStyle = theme.accentColor;

    // Draw QR pattern simulation with corner markers
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
    ctx.fillText(`Public Registry: ${getSiteUrl()}/verify/${certId}`, leftX + qrSize + 22, 1342);
    ctx.restore();

    // 15. Bottom-Right: SAUMY PANDEY'S FOUNDER & APP OWNER SIGNATURE
    ctx.save();
    const sigCenterX = 1940;
    const sigBaseY = 1270;

    // Section Label: Authorized Founder Signature
    ctx.fillStyle = theme.accentColor;
    ctx.font = '700 16px "Outfit", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('AUTHORIZED APP OWNER & FOUNDER SIGNATURE', sigCenterX, sigBaseY - 110);

    // Signature Text in Cursive Calligraphy
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

    // Dynamic underline swoosh
    ctx.beginPath();
    ctx.moveTo(sigCenterX - 180, sigBaseY - 22);
    ctx.bezierCurveTo(
      sigCenterX - 70, sigBaseY + 10,
      sigCenterX + 80, sigBaseY - 36,
      sigCenterX + 190, sigBaseY - 8
    );
    ctx.stroke();

    // Elegant return loop flourish
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

    // Horizontal Signature Rule Line
    ctx.strokeStyle = theme.goldGradient[2];
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(sigCenterX - 210, sigBaseY);
    ctx.lineTo(sigCenterX + 210, sigBaseY);
    ctx.stroke();

    // Official Title & Details
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

    // Verified Signature Stamp Tag
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
      `Official CodeTyper Sovereign Credential • Electronically Signed by Founder & Owner Saumy Pandey • Verification: ${getSiteUrl()}/verify/${certId}`,
      width / 2,
      1520
    );
    ctx.restore();
  }, [recipientName, titleRole, activeTheme, signatureVariant, wpm, grossWpm, accuracy, duration, language, tierTitle, tierGrade, certId, dateStr, isCurrentThemeUnlocked]);

  // Redraw when modal opens, font is loaded, or settings change
  useEffect(() => {
    if (!isOpen) return;

    drawCertificate();

    // Re-draw after Google Fonts finish loading
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        drawCertificate();
      });
    }
  }, [isOpen, activeTab, drawCertificate]);

  // --- ACTIONS ---
  const handleDownload = () => {
    if (!user) {
      toast.info('🔒 Please Sign Up or Log In first to claim, certify, and download your official 4K accredited diploma!');
      if (typeof window !== 'undefined') {
        window.location.hash = '#signup';
      }
      if (onClose) onClose();
      return;
    }
    if (!isCurrentThemeUnlocked) {
      toast.error(`🔒 ${currentTier?.name || 'Theme'} is locked! Reach Account Level ${currentTier?.unlockLevel || 20} and pass the ${currentTier?.examDurationSeconds || 60}s exam to unlock official downloading without watermarks.`);
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
      toast.info('🔒 Please Sign Up or Log In first to print or export your official accredited diploma!');
      if (typeof window !== 'undefined') {
        window.location.hash = '#signup';
      }
      if (onClose) onClose();
      return;
    }
    if (!isCurrentThemeUnlocked) {
      toast.error(`🔒 ${currentTier?.name || 'Theme'} is locked! Reach Account Level ${currentTier?.unlockLevel || 20} and pass the ${currentTier?.examDurationSeconds || 60}s exam to print or export PDF.`);
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
    navigator.clipboard.writeText(
      `CodeTyper Verified Official Certificate ID: ${certId} | Recipient: ${recipientName} | Net Speed: ${wpm.toFixed(2)} WPM | Accuracy: ${accuracy.toFixed(2)}% | Signatory: Saumy Pandey (App Owner & Founder, CodeTyper) | Verification: ${getSiteUrl()}/verify/${certId}`
    );
    toast.success('Certificate verification details copied to clipboard!');
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      style={{
        backdropFilter: 'blur(16px)',
        backgroundColor: 'rgba(3, 5, 12, 0.88)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isFullscreen ? 0 : '1rem'
      }}
    >
      <div
        className="modal-content"
        style={{
          maxWidth: isFullscreen ? '100vw' : '1100px',
          width: isFullscreen ? '100vw' : '96%',
          height: isFullscreen ? '100vh' : 'auto',
          maxHeight: isFullscreen ? '100vh' : '96vh',
          display: 'flex',
          flexDirection: 'column',
          padding: isFullscreen ? '1.5rem' : '1.25rem',
          borderRadius: isFullscreen ? 0 : 'var(--radius-xl)',
          backgroundColor: '#070b14',
          border: '1px solid rgba(234, 179, 8, 0.4)',
          boxShadow: '0 25px 70px rgba(0, 0, 0, 0.9)',
          overflowY: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#070b14',
                boxShadow: '0 0 15px rgba(234, 179, 8, 0.5)'
              }}
            >
              <Award size={22} strokeWidth={2.5} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.01em' }}>
                Official Accredited Typing Certificate
              </h3>
              <span style={{ fontSize: '0.775rem', color: '#94a3b8' }}>
                Signed by App Owner & Founder <strong>Saumy Pandey</strong> (Cursive Calligraphy) • Verified Authentic
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {/* Tab Switcher */}
            <div
              style={{
                display: 'inline-flex',
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                borderRadius: 'var(--radius-md)',
                padding: '0.2rem',
                border: '1px solid rgba(234, 179, 8, 0.25)'
              }}
            >
              <button
                className="btn btn-xs"
                onClick={() => setActiveTab('certificate')}
                style={{
                  backgroundColor: activeTab === 'certificate' ? '#eab308' : 'transparent',
                  color: activeTab === 'certificate' ? '#070b14' : '#cbd5e1',
                  fontWeight: 700,
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  padding: '0.35rem 0.75rem',
                  cursor: 'pointer'
                }}
              >
                📜 Certificate
              </button>
              <button
                className="btn btn-xs"
                onClick={() => setActiveTab('requirements')}
                style={{
                  backgroundColor: activeTab === 'requirements' ? '#eab308' : 'transparent',
                  color: activeTab === 'requirements' ? '#070b14' : '#cbd5e1',
                  fontWeight: 700,
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  padding: '0.35rem 0.75rem',
                  cursor: 'pointer'
                }}
              >
                {eligibility.isEligible ? '✓ Criteria Met (4/4)' : `🔒 Criteria (${eligibility.passedCount}/4)`}
              </button>
            </div>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="btn btn-ghost btn-sm"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              style={{ color: '#94a3b8', padding: '0.4rem' }}
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>

            <button className="modal-close" onClick={onClose} style={{ color: '#cbd5e1' }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* --- VIEW 1: REQUIREMENTS TAB --- */}
        {activeTab === 'requirements' && (
          <div style={{ marginBottom: '1rem' }}>
            {/* Explanation Banner */}
            <div
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.8)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem 1.25rem',
                border: '1px solid rgba(234, 179, 8, 0.3)',
                marginBottom: '1.25rem',
                fontSize: '0.875rem',
                lineHeight: 1.6,
                color: '#cbd5e1'
              }}
            >
              CodeTyper certificates are signed personally by <strong>Saumy Pandey</strong> (App Owner & Creator) and represent verified proof of touch-typing proficiency. All 4 standardized requirements must be met to earn official accreditation.
            </div>

            {/* Progress Bar */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600 }}>
                <span style={{ color: '#cbd5e1' }}>Accreditation Standards Progress</span>
                <span style={{ color: eligibility.passedCount === 4 ? '#22c55e' : '#eab308' }}>
                  {eligibility.passedCount} of 4 Criteria Met ({eligibility.progressPercent}%)
                </span>
              </div>
              <div
                style={{
                  height: '8px',
                  width: '100%',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
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

            {/* Criteria Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
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
                      <div style={{ fontWeight: 700, fontSize: '0.925rem', color: '#f8fafc' }}>
                        {c.title}
                      </div>
                      <div style={{ fontSize: '0.775rem', color: '#94a3b8' }}>
                        {c.description}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: c.passed ? '#22c55e' : '#ef4444' }}>
                      {c.current}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      Need {c.required}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Action to preview certificate anyway */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setActiveTab('certificate')}
                style={{ borderColor: 'rgba(234, 179, 8, 0.4)', color: '#eab308' }}
              >
                <span>Preview Certificate with Saumy Pandey's Signature</span>
                <ArrowRight size={14} />
              </button>

              {onStartCertTest && (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    onClose();
                    onStartCertTest();
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #ca8a04 0%, #eab308 100%)',
                    color: '#070b14',
                    fontWeight: 700,
                    boxShadow: '0 4px 14px rgba(234, 179, 8, 0.35)'
                  }}
                >
                  <span>Take Level {currentTier?.unlockLevel || 20} Exam ({currentTier?.examDurationSeconds || 60}s)</span>
                  <ArrowRight size={14} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* --- VIEW 2: CERTIFICATE PREVIEW & CUSTOMIZATION --- */}
        {activeTab === 'certificate' && (
          <>
            {/* Guest Conversion Hook Banner */}
            {!user && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                  padding: '0.65rem 1rem',
                  marginBottom: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'linear-gradient(135deg, #090e1c 0%, #0d1a33 100%)',
                  border: '1px solid rgba(234, 179, 8, 0.45)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sparkles size={16} color="#facc15" />
                  <span style={{ fontSize: '0.825rem', color: '#f8fafc', fontWeight: 600 }}>
                    Viewing Specimen Preview! Sign up free to certify your real name & download without watermarks.
                  </span>
                </div>
                <button
                  className="btn btn-sm"
                  onClick={() => {
                    if (typeof window !== 'undefined') window.location.hash = '#signup';
                    if (onClose) onClose();
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #eab308 0%, #facc15 100%)',
                    color: '#070b14',
                    fontWeight: 800,
                    fontSize: '0.75rem',
                    padding: '0.3rem 0.75rem',
                    border: 'none',
                    borderRadius: '9999px',
                    cursor: 'pointer'
                  }}
                >
                  <span>Sign Up Free to Claim ⚡</span>
                </button>
              </div>
            )}

            {/* Customization Toolbar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: 'rgba(15, 23, 42, 0.92)',
                border: '1px solid rgba(234, 179, 8, 0.3)',
                borderRadius: 'var(--radius-md)',
                padding: '0.6rem 0.9rem',
                marginBottom: '0.75rem',
                gap: '0.75rem',
                flexWrap: 'wrap'
              }}
            >
              {/* Recipient Name Input */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <UserCheck size={16} color={user && isCurrentThemeUnlocked ? "#38bdf8" : "#94a3b8"} />
                <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Candidate:</span>
                <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={user ? (isCurrentThemeUnlocked ? recipientName : 'DEMO CANDIDATE (LOCKED)') : 'DEMO SPECIMEN - JOHNATHAN DOE'}
                    onChange={(e) => {
                      if (user && isCurrentThemeUnlocked) {
                        setRecipientName(e.target.value);
                      }
                    }}
                    onClick={() => {
                      if (!user) {
                        toast.info('🔒 Sign up or Log in to put your official name on this diploma!');
                        if (typeof window !== 'undefined') window.location.hash = '#signup';
                        if (onClose) onClose();
                      }
                    }}
                    readOnly={!user || !isCurrentThemeUnlocked}
                    placeholder={user ? (isCurrentThemeUnlocked ? "Enter candidate full name" : "Locked (Pass exam to edit)") : "Sign up to put your real name"}
                    maxLength={40}
                    style={{
                      backgroundColor: user && isCurrentThemeUnlocked ? '#070b14' : 'rgba(15, 23, 42, 0.75)',
                      color: user && isCurrentThemeUnlocked ? '#ffffff' : '#facc15',
                      border: user && isCurrentThemeUnlocked
                        ? '1px solid rgba(234, 179, 8, 0.4)'
                        : '1px dashed rgba(234, 179, 8, 0.35)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.25rem 1.8rem 0.25rem 0.6rem',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      minWidth: '190px',
                      cursor: user && isCurrentThemeUnlocked ? 'text' : 'pointer',
                      opacity: user && isCurrentThemeUnlocked ? 1 : 0.85
                    }}
                  />
                  {(!user || !isCurrentThemeUnlocked) && (
                    <span
                      style={{
                        position: 'absolute',
                        right: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        color: '#facc15'
                      }}
                      title={!user ? "Sign up to customize recipient name" : "Name editing is disabled until qualification benchmarks are cleared."}
                    >
                      <Lock size={13} />
                    </span>
                  )}
                </div>
                {!user ? (
                  <button
                    onClick={() => {
                      toast.info('🔒 Sign up or Log in to put your official real name on this diploma!');
                      if (typeof window !== 'undefined') window.location.hash = '#signup';
                      if (onClose) onClose();
                    }}
                    style={{
                      fontSize: '0.7rem',
                      color: '#070b14',
                      fontWeight: 800,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      background: 'linear-gradient(135deg, #eab308 0%, #facc15 100%)',
                      padding: '0.2rem 0.55rem',
                      borderRadius: '9999px',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <Lock size={10} />
                    <span>Sign Up to Unlock Real Name ⚡</span>
                  </button>
                ) : !isCurrentThemeUnlocked && (
                  <span
                    style={{
                      fontSize: '0.7rem',
                      color: '#facc15',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      backgroundColor: 'rgba(234, 179, 8, 0.1)',
                      padding: '0.15rem 0.45rem',
                      borderRadius: '9999px',
                      border: '1px solid rgba(234, 179, 8, 0.25)'
                    }}
                  >
                    <Lock size={9} />
                    <span>Name Editor Off</span>
                  </span>
                )}
              </div>

              {/* Title / Role Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Briefcase size={15} color="#eab308" />
                <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Role:</span>
                {user ? (
                  <select
                    value={titleRole}
                    onChange={(e) => setTitleRole(e.target.value)}
                    style={{
                      backgroundColor: '#070b14',
                      color: '#facc15',
                      border: '1px solid rgba(234, 179, 8, 0.4)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.25rem 0.6rem',
                      fontSize: '0.825rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
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
                      if (typeof window !== 'undefined') window.location.hash = '#signup';
                      if (onClose) onClose();
                    }}
                    style={{
                      backgroundColor: '#070b14',
                      color: '#94a3b8',
                      border: '1px dashed rgba(234, 179, 8, 0.4)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.25rem 0.6rem',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}
                    title="Click to sign up and choose role title"
                  >
                    <span>Full-Stack Software Engineer</span>
                    <Lock size={11} color="#facc15" />
                  </button>
                )}
              </div>

              {/* Theme Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                <Palette size={15} color="#eab308" />
                <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Theme:</span>
                {Object.values(CERT_THEMES).map((t) => {
                  const tierMeta = themeTiers.tiers[t.id];
                  const isUnlocked = tierMeta?.isUnlocked;
                  return (
                    <button
                      key={t.id}
                      onClick={() => handleThemeChange(t.id)}
                      style={{
                        background: t.swatch,
                        color: '#ffffff',
                        border: activeTheme === t.id ? '2px solid #ffffff' : (isUnlocked ? '1px solid rgba(234, 179, 8, 0.4)' : '1px dashed rgba(255, 255, 255, 0.25)'),
                        boxShadow: activeTheme === t.id ? '0 0 10px rgba(234, 179, 8, 0.6)' : 'none',
                        borderRadius: 'var(--radius-full)',
                        padding: '0.2rem 0.65rem',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        opacity: isUnlocked || activeTheme === t.id ? 1 : 0.75,
                        transition: 'transform 0.15s ease'
                      }}
                      title={`${t.name} - ${isUnlocked ? 'Unlocked' : `Locked (${tierMeta?.passedCount || 0}/4 tasks completed)`}`}
                    >
                      <span>{t.badge}</span>
                      {isUnlocked ? (
                        <Check size={11} color="#4ade80" strokeWidth={3} />
                      ) : (
                        <Lock size={11} color="#facc15" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Signature Style Switcher */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Feather size={15} color="#38bdf8" />
                <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Sign:</span>
                {user ? (
                  <button
                    onClick={() => setSignatureVariant(signatureVariant === 'calligraphy' ? 'lowercase' : 'calligraphy')}
                    className="btn btn-xs"
                    style={{
                      backgroundColor: 'rgba(56, 189, 248, 0.15)',
                      color: '#38bdf8',
                      border: '1px solid rgba(56, 189, 248, 0.4)',
                      borderRadius: 'var(--radius-sm)',
                      fontFamily: '"Pinyon Script", "Alex Brush", cursive',
                      fontSize: '1rem',
                      padding: '0.15rem 0.6rem',
                      cursor: 'pointer'
                    }}
                    title="Click to toggle signature cursive variant (Saumy Pandey / saumypandey)"
                  >
                    {signatureVariant === 'calligraphy' ? 'Saumy Pandey' : 'saumypandey'}
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      toast.info('🔒 Sign up or Log in to customize founder signature styling!');
                      if (typeof window !== 'undefined') window.location.hash = '#signup';
                      if (onClose) onClose();
                    }}
                    className="btn btn-xs"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      color: '#94a3b8',
                      border: '1px dashed rgba(255, 255, 255, 0.2)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem',
                      padding: '0.15rem 0.5rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}
                    title="Click to sign up and customize signature"
                  >
                    <span style={{ fontFamily: '"Pinyon Script", cursive', fontSize: '0.95rem', color: '#e2e8f0' }}>Saumy Pandey</span>
                    <Lock size={11} color="#facc15" />
                  </button>
                )}
              </div>
            </div>

            {/* Certificate Canvas Container with 3D Holographic Tilt & Glare */}
            <div
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.85)',
                border: '1px solid rgba(234, 179, 8, 0.35)',
                backgroundColor: '#04060d',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
                transform: `perspective(1200px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
                transition: 'transform 0.1s ease-out'
              }}
            >
              {/* Dynamic Theme Status Overlay */}
              <div
                style={{
                  position: 'absolute',
                  top: '0.75rem',
                  right: '0.75rem',
                  zIndex: 10,
                  background: 'rgba(7, 11, 22, 0.88)',
                  backdropFilter: 'blur(10px)',
                  border: isCurrentThemeUnlocked
                    ? '1px solid #22c55e'
                    : '1px solid rgba(234, 179, 8, 0.5)',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '9999px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)'
                }}
              >
                {isCurrentThemeUnlocked ? (
                  <>
                    <ShieldCheck size={13} color="#4ade80" />
                    <span style={{ color: '#4ade80', fontSize: '0.75rem', fontWeight: 700 }}>
                      Accredited & Ready
                    </span>
                  </>
                ) : activeTheme === 'imperial-ivory' ? (
                  <>
                    <Sparkles size={13} color="#facc15" />
                    <span style={{ color: '#fde047', fontSize: '0.75rem', fontWeight: 700 }}>
                      Open Specimen (Curiosity Preview • Anti-Screenshot Active)
                    </span>
                  </>
                ) : (
                  <>
                    <Lock size={13} color="#f87171" />
                    <span style={{ color: '#f87171', fontSize: '0.75rem', fontWeight: 700 }}>
                      Theme Locked & Blurred ({currentTier?.passedCount || 0}/4)
                    </span>
                  </>
                )}
              </div>

              {/* Dynamic Gold Holographic Glare */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  pointerEvents: 'none',
                  background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(234, 179, 8, 0.14) 0%, transparent 65%)`,
                  zIndex: 2
                }}
              />

              {/* Canvas with Blur & Anti-Screenshot Safeguards */}
              <canvas
                ref={canvasRef}
                onContextMenu={(e) => e.preventDefault()}
                draggable={false}
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: isFullscreen ? '78vh' : '540px',
                  display: 'block',
                  objectFit: 'contain',
                  filter: isBlurredLockedTheme ? 'blur(24px) brightness(0.55)' : 'none',
                  transform: isBlurredLockedTheme ? 'scale(1.02)' : 'none',
                  transition: 'filter 0.35s ease, transform 0.35s ease',
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  pointerEvents: isBlurredLockedTheme ? 'none' : 'auto'
                }}
              />

              {/* Frosted Glass Lock Shield Overlay (For the 3 Locked & Blurred Themes) */}
              {isBlurredLockedTheme && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 5,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1.5rem',
                    textAlign: 'center',
                    background: 'radial-gradient(circle at center, rgba(3, 7, 18, 0.75) 0%, rgba(3, 7, 18, 0.94) 100%)',
                    backdropFilter: 'blur(8px)'
                  }}
                >
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.25) 0%, rgba(239, 68, 68, 0.25) 100%)',
                      border: '2px solid rgba(234, 179, 8, 0.6)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#facc15',
                      boxShadow: '0 0 25px rgba(234, 179, 8, 0.4)',
                      marginBottom: '0.75rem'
                    }}
                  >
                    <Lock size={32} strokeWidth={2.4} />
                  </div>

                  <div
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      color: '#facc15',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      marginBottom: '0.25rem'
                    }}
                  >
                    Tier {currentTier?.tier || 2} Theme Locked & Blurred • Requires Level {currentTier?.unlockLevel || 20}
                  </div>

                  <h3
                    style={{
                      fontSize: '1.35rem',
                      fontWeight: 900,
                      color: '#ffffff',
                      margin: '0 0 0.35rem'
                    }}
                  >
                    {currentTier?.name || 'Exclusive Luxury Theme'}
                  </h3>

                  <p
                    style={{
                      maxWidth: '460px',
                      fontSize: '0.85rem',
                      color: '#cbd5e1',
                      margin: '0 0 1rem',
                      lineHeight: 1.45
                    }}
                  >
                    This theme is blurred and locked to protect credential value. Reach Account Level {currentTier?.unlockLevel || 20} and pass the {currentTier?.examDurationSeconds || 60}s typing benchmark to unlock this prestigious certificate.
                  </p>

                  <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => handleThemeChange('imperial-ivory')}
                      style={{ borderColor: 'rgba(255, 255, 255, 0.35)', color: '#f8fafc', backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
                    >
                      <span>View Open Specimen (Imperial Ivory) 👁️</span>
                    </button>
                    {onStartCertTest && (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => {
                          if (!user) {
                            toast.info(`⚡ Please Sign Up or Log In first so your exam score, level, and accredited certificate are permanently registered!`);
                            if (typeof window !== 'undefined') window.location.hash = '#signup';
                            if (onClose) onClose();
                            return;
                          }
                          onClose();
                          onStartCertTest();
                        }}
                        style={{
                          background: 'linear-gradient(135deg, #ca8a04 0%, #eab308 100%)',
                          color: '#070b14',
                          fontWeight: 700
                        }}
                      >
                        <span>
                          {!user
                            ? `Sign Up to Take Level ${currentTier?.unlockLevel || 20} Exam (${currentTier?.examDurationSeconds || 60}s) ⚡`
                            : `Take Level ${currentTier?.unlockLevel || 20} Exam (${currentTier?.examDurationSeconds || 60}s) ⚡`}
                        </span>
                        <ArrowRight size={14} />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Bottom Action Controls */}
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
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                <ShieldCheck size={16} color="#38bdf8" />
                <span>Serial: <code style={{ color: '#eab308', fontWeight: 700 }}>{certId}</code></span>
                <span style={{ color: '#64748b' }}>•</span>
                <a
                  href={`#verify/${certId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#38bdf8', textDecoration: 'underline', fontSize: '0.775rem' }}
                >
                  Verify Publicly ↗
                </a>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                {/* 1-Click Add to LinkedIn */}
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    if (!user) {
                      toast.info('🔒 Please Sign Up or Log In first to certify and add your official credential directly to your LinkedIn profile!');
                      if (typeof window !== 'undefined') window.location.hash = '#signup';
                      if (onClose) onClose();
                      return;
                    }
                    if (!isCurrentThemeUnlocked) {
                      toast.info('🔒 Add to LinkedIn is available once you pass the qualification exam and claim your accredited credential!');
                      return;
                    }
                    const linkedInUrl = getLinkedInCertificationUrl({
                      certId,
                      recipientName,
                      wpm,
                      tierTitle,
                      issueDate: new Date()
                    });
                    window.open(linkedInUrl, '_blank', 'noopener,noreferrer');
                  }}
                  style={{ borderColor: '#0077b5', color: '#38bdf8', backgroundColor: 'rgba(0, 119, 181, 0.1)' }}
                  title={!user ? "Sign up to add to LinkedIn" : "Add to your LinkedIn Profile"}
                >
                  <ExternalLink size={14} />
                  <span>{!user ? 'Add to LinkedIn 🔒' : 'Add to LinkedIn'}</span>
                </button>

                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    if (!user) {
                      toast.info('🔒 Sign up or Log in to register your verified credential on the ledger!');
                      if (typeof window !== 'undefined') window.location.hash = '#signup';
                      if (onClose) onClose();
                      return;
                    }
                    handleCopyId();
                  }}
                  style={{ borderColor: 'rgba(255, 255, 255, 0.2)', color: '#cbd5e1' }}
                  title={!user ? "Sign up to copy credential" : "Copy verification link"}
                >
                  <Share2 size={14} />
                  <span>{!user ? 'Copy Credential 🔒' : 'Copy Credential'}</span>
                </button>

                <button
                  className="btn btn-outline btn-sm"
                  onClick={handlePrint}
                  style={{ borderColor: 'rgba(56, 189, 248, 0.4)', color: '#38bdf8' }}
                  title="Print or Save as PDF"
                >
                  <Printer size={14} />
                  <span>{!user ? 'Print PDF 🔒' : 'Print PDF'}</span>
                </button>

                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleDownload}
                  style={{
                    background: 'linear-gradient(135deg, #ca8a04 0%, #eab308 50%, #facc15 100%)',
                    color: '#070b14',
                    fontWeight: 700,
                    border: 'none',
                    boxShadow: '0 4px 14px rgba(234, 179, 8, 0.4)'
                  }}
                >
                  <Download size={14} />
                  <span>{!user ? 'Sign Up to Claim (4K) 🎓' : 'Download Ultra HD (4K PNG)'}</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
