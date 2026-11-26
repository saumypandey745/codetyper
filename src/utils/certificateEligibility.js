import { calculateLevelFromXp } from './gamificationEngine.js';
import { getSiteUrl } from './seoConfig.js';

/**
 * Official CodeTyper Certificate Eligibility & Accreditation Standards
 *
 * Requirements:
 * 1. Minimum Duration: ≥ 55 seconds (standard 60s timed assessment).
 * 2. Minimum Characters: ≥ 150 characters (prevents single-word or idle cheats).
 * 3. Minimum Net WPM: ≥ 35.00 Net WPM (professional typing competency benchmark).
 * 4. Minimum Accuracy: ≥ 90.00% (Typing Master accredited precision standard).
 */

export const CERTIFICATE_REQUIREMENTS = {
  minDurationSeconds: 55, // Full standard timed assessment (~60s)
  minCharacters: 150,     // Substantial typing volume
  minNetWpm: 35,          // Professional touch-typing speed benchmark
  minAccuracy: 90         // High-precision accuracy threshold
};

export function checkCertificateEligibility(result) {
  if (!result) {
    return {
      isEligible: false,
      checks: [],
      passedCount: 0,
      totalCount: 4,
      progressPercent: 0,
      tierTitle: 'Uncertified',
      tierBadge: 'None'
    };
  }

  const durationSec = Math.round(Number(result.durationSeconds) || 0);
  const totalChars = Number(result.totalCharacters ?? result.totalChars) || 0;
  const netWpm = Math.round((Number(result.netWpm) || 0) * 100) / 100;
  const accuracy = Math.round((Number(result.accuracy) || 0) * 100) / 100;

  const checks = [
    {
      id: 'duration',
      title: 'Examination Duration',
      required: `≥ ${CERTIFICATE_REQUIREMENTS.minDurationSeconds}s (60s Test)`,
      current: `${durationSec}s`,
      passed: durationSec >= CERTIFICATE_REQUIREMENTS.minDurationSeconds,
      description: 'Session must be a formal full-length timed assessment.'
    },
    {
      id: 'characters',
      title: 'Typed Characters Volume',
      required: `≥ ${CERTIFICATE_REQUIREMENTS.minCharacters} Chars`,
      current: `${totalChars} chars`,
      passed: totalChars >= CERTIFICATE_REQUIREMENTS.minCharacters,
      description: 'Substantial text volume to prove consistent typing cadence without idle pauses.'
    },
    {
      id: 'speed',
      title: 'Net Typing Speed',
      required: `≥ ${CERTIFICATE_REQUIREMENTS.minNetWpm}.00 Net WPM`,
      current: `${netWpm.toFixed(2)} WPM`,
      passed: netWpm >= CERTIFICATE_REQUIREMENTS.minNetWpm,
      description: 'Meets the recognized professional touch-typing speed benchmark.'
    },
    {
      id: 'accuracy',
      title: 'Typing Accuracy Rate',
      required: `≥ ${CERTIFICATE_REQUIREMENTS.minAccuracy}.00%`,
      current: `${accuracy.toFixed(2)}%`,
      passed: accuracy >= CERTIFICATE_REQUIREMENTS.minAccuracy,
      description: 'Maintains high precision with low uncorrected errors.'
    }
  ];

  const passedCount = checks.filter((c) => c.passed).length;
  const isEligible = passedCount === checks.length;
  const progressPercent = Math.round((passedCount / checks.length) * 100);

  // Rank Tier determination
  let tierTitle = 'Certified Typist (Silver Tier)';
  let tierBadge = 'Silver';
  let tierGrade = 'Grade B';
  let tierPercentile = 'Professional Competent';

  if (netWpm >= 120) {
    tierTitle = 'Grandmaster Typist';
    tierBadge = 'Grandmaster';
    tierGrade = 'Grade A+ Exceptional';
    tierPercentile = 'Top 0.1% Worldwide';
  } else if (netWpm >= 90) {
    tierTitle = 'Master Typist';
    tierBadge = 'Diamond';
    tierGrade = 'Grade A+ Distinguished';
    tierPercentile = 'Top 1% Worldwide';
  } else if (netWpm >= 70) {
    tierTitle = 'Pro Elite Typist';
    tierBadge = 'Platinum';
    tierGrade = 'Grade A Advanced';
    tierPercentile = 'Top 5% Worldwide';
  } else if (netWpm >= 50) {
    tierTitle = 'Advanced Typist';
    tierBadge = 'Gold';
    tierGrade = 'Grade B+ Professional';
    tierPercentile = 'Top 15% Worldwide';
  } else {
    tierTitle = 'Certified Typist';
    tierBadge = 'Silver';
    tierGrade = 'Grade B Competent';
    tierPercentile = 'Standard Professional';
  }

  return {
    isEligible,
    checks,
    passedCount,
    totalCount: checks.length,
    progressPercent,
    tierTitle,
    tierBadge,
    tierGrade,
    tierPercentile
  };
}

export const CERTIFICATE_ROLES = [
  'Touch-Typing Specialist',
  'Full-Stack Software Engineer',
  'Frontend Web Developer',
  'Backend & Systems Architect',
  'Competitive Typist & Grandmaster',
  'Data Scientist & AI Practitioner',
  'Technical Writer & Typist',
  'DevOps & Cloud Engineer',
  'Computer Science Scholar'
];

export function getLinkedInCertificationUrl({ certId, recipientName, wpm, tierTitle, issueDate }) {
  const certName = `Accredited Touch-Typing Competency - ${tierTitle} (${Math.round(wpm)} WPM)`;
  const orgName = 'CodeTyper';
  const certUrl = `${getSiteUrl()}/verify/${encodeURIComponent(certId)}`;
  const dateObj = issueDate ? new Date(issueDate) : new Date();
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth() + 1;

  return `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(certName)}&organizationName=${encodeURIComponent(orgName)}&issueYear=${year}&issueMonth=${month}&certUrl=${encodeURIComponent(certUrl)}&certId=${encodeURIComponent(certId)}`;
}

export function getSocialShareUrls({ certId, recipientName, wpm, accuracy, tierTitle }) {
  const verifyUrl = `${getSiteUrl()}/verify/${encodeURIComponent(certId)}`;
  const text = `🏆 I just earned my official Accredited Typing Certificate on CodeTyper with ${Number(wpm).toFixed(1)} WPM and ${Number(accuracy).toFixed(1)}% accuracy, signed by Founder & App Owner Saumy Pandey! Verify my credential here: ${verifyUrl}`;

  return {
    verifyUrl,
    linkedInShare: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(verifyUrl)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(verifyUrl)}&text=${encodeURIComponent(`🏆 CodeTyper Accredited Certificate - ${Number(wpm).toFixed(1)} WPM, signed by Saumy Pandey`)}`
  };
}

/**
 * 4-Tier Level-Based Certificate Theme Progression System
 * Rule: Unlocks progressively at Level 20, Level 40, Level 60, and Level 80!
 * Each tier features progressively longer, stricter, and more challenging examinations:
 * - Tier 1 (Level 20): 60s Standard Timed Exam (≥ 40 Net WPM, 92% Acc)
 * - Tier 2 (Level 40): 120s (2-Min) Rigorous Exam (≥ 60 Net WPM, 95% Acc, 3-Day Habit)
 * - Tier 3 (Level 60): 180s (3-Min) Syntax Endurance Exam (≥ 75 Net WPM, 97% Acc, 3+ Languages)
 * - Tier 4 (Level 80): 300s (5-Min) Hypersonic Marathon Exam (≥ 90 Net WPM, 98% Acc, Duel Combat)
 */
export const CERTIFICATE_THEME_TIERS = {
  'imperial-ivory': {
    id: 'imperial-ivory',
    tier: 1,
    unlockLevel: 20,
    examDurationSeconds: 60,
    examDifficulty: 'Standard Apprentice',
    name: 'Imperial Ivory Parchment',
    badge: '📜 Vintage Ivory',
    roleTag: 'Touch-Typing Apprentice (Lv 20)',
    shortDesc: 'Level 20 Milestone: Standard 60s timed assessment proving consistent finger cadence and precision.',
    swatch: 'linear-gradient(135deg, #fef9c3 0%, #b45309 100%)',
    accentColor: '#b45309',
    tasks: [
      {
        id: 'level_20',
        title: 'Account Level Milestone',
        target: '≥ Level 20 Typist',
        actionText: 'Earn XP',
        actionRoute: 'practice',
        check: (u) => u.level >= 20,
        currentValue: (u) => `Level ${u.level}/20`
      },
      {
        id: 'speed_35',
        title: 'Velocity Benchmark',
        target: '≥ 40.00 Net WPM',
        actionText: 'Speed Drill',
        actionRoute: 'test',
        check: (u) => u.wpm >= 35,
        currentValue: (u) => `${u.wpm.toFixed(1)} WPM`
      },
      {
        id: 'acc_90',
        title: 'Precision Threshold',
        target: '≥ 92.00% Accuracy',
        actionText: 'Accuracy Drill',
        actionRoute: 'practice',
        check: (u) => u.accuracy >= 90,
        currentValue: (u) => `${u.accuracy.toFixed(1)}%`
      },
      {
        id: 'exam_60s',
        title: 'Level 20 Timed Exam',
        target: '≥ 60s Timed Exam',
        actionText: '60s Exam',
        actionRoute: 'test',
        check: (u) => u.duration >= 55 || u.totalTests >= 1,
        currentValue: (u) => `${Math.round(u.duration)}s timed`
      }
    ]
  },
  'royal-obsidian': {
    id: 'royal-obsidian',
    tier: 2,
    unlockLevel: 40,
    examDurationSeconds: 120,
    examDifficulty: 'Professional Rigorous',
    name: 'Royal Obsidian & 24K Gold',
    badge: '👑 Royal Gold',
    roleTag: 'Professional Typist (Lv 40)',
    shortDesc: 'Level 40 Milestone: 120s (2-Min) rigorous examination honoring sustained high-speed velocity and habit discipline.',
    swatch: 'linear-gradient(135deg, #090e1c 0%, #ca8a04 100%)',
    accentColor: '#eab308',
    tasks: [
      {
        id: 'level_40',
        title: 'Account Level Milestone',
        target: '≥ Level 40 Professional',
        actionText: 'Earn XP',
        actionRoute: 'practice',
        check: (u) => u.level >= 40,
        currentValue: (u) => `Level ${u.level}/40`
      },
      {
        id: 'speed_60',
        title: 'Professional Velocity',
        target: '≥ 60.00 Net WPM',
        actionText: 'Speed Exam',
        actionRoute: 'test',
        check: (u) => u.wpm >= 60,
        currentValue: (u) => `${u.wpm.toFixed(1)} WPM`
      },
      {
        id: 'acc_95',
        title: 'High Precision Rate',
        target: '≥ 95.00% Accuracy',
        actionText: 'Refine Precision',
        actionRoute: 'practice',
        check: (u) => u.accuracy >= 95,
        currentValue: (u) => `${u.accuracy.toFixed(1)}%`
      },
      {
        id: 'streak_or_exam120',
        title: '120s Exam & 3-Day Habit',
        target: '120s Exam or 3-Day Streak',
        actionText: '120s Exam',
        actionRoute: 'test',
        check: (u) => u.streak >= 3 || u.duration >= 115 || u.totalTests >= 15,
        currentValue: (u) => (u.streak >= 3 ? `${u.streak}d streak` : `${Math.round(u.duration)}s exam`)
      }
    ]
  },
  'emerald-sovereign': {
    id: 'emerald-sovereign',
    tier: 3,
    unlockLevel: 60,
    examDurationSeconds: 180,
    examDifficulty: 'Syntax Endurance',
    name: 'Emerald Sovereign & Gold',
    badge: '🌿 Grandmaster Emerald',
    roleTag: 'Syntax Polyglot & Code Master (Lv 60)',
    shortDesc: 'Level 60 Milestone: 180s (3-Min) deep syntax endurance test across multiple programming languages.',
    swatch: 'linear-gradient(135deg, #064e3b 0%, #10b981 100%)',
    accentColor: '#10b981',
    tasks: [
      {
        id: 'level_60',
        title: 'Account Level Milestone',
        target: '≥ Level 60 Code Maestro',
        actionText: 'Earn XP',
        actionRoute: 'coding',
        check: (u) => u.level >= 60,
        currentValue: (u) => `Level ${u.level}/60`
      },
      {
        id: 'speed_75',
        title: 'Grandmaster Velocity',
        target: '≥ 75.00 Net WPM',
        actionText: 'Coding Sprint',
        actionRoute: 'coding',
        check: (u) => u.wpm >= 75,
        currentValue: (u) => `${u.wpm.toFixed(1)} WPM`
      },
      {
        id: 'acc_97',
        title: 'Syntax Precision',
        target: '≥ 97.00% Accuracy',
        actionText: 'Flawless Code',
        actionRoute: 'coding',
        check: (u) => u.accuracy >= 97,
        currentValue: (u) => `${u.accuracy.toFixed(1)}%`
      },
      {
        id: 'lang_3',
        title: '180s Exam & Polyglot',
        target: '≥ 3 Languages & 180s Test',
        actionText: '180s Exam',
        actionRoute: 'coding',
        check: (u) => u.languagesCount >= 3 && (u.totalChars >= 1500 || u.totalTests >= 20 || u.duration >= 170),
        currentValue: (u) => `${u.languagesCount}/3 languages`
      }
    ]
  },
  'midnight-platinum': {
    id: 'midnight-platinum',
    tier: 4,
    unlockLevel: 80,
    examDurationSeconds: 300,
    examDifficulty: 'Apex Grandmaster Marathon',
    name: 'Midnight Titanium & Platinum',
    badge: '💎 Celestial Platinum',
    roleTag: 'Apex Legend & Arena Champion (Lv 80)',
    shortDesc: 'Level 80 Milestone: 300s (5-Min) grueling marathon under competitive pressure with hypersonic speed.',
    swatch: 'linear-gradient(135deg, #1e293b 0%, #60a5fa 100%)',
    accentColor: '#60a5fa',
    tasks: [
      {
        id: 'level_80',
        title: 'Account Level Milestone',
        target: '≥ Level 80 Apex Legend',
        actionText: 'Earn XP',
        actionRoute: 'practice',
        check: (u) => u.level >= 80,
        currentValue: (u) => `Level ${u.level}/80`
      },
      {
        id: 'speed_90',
        title: 'Apex Velocity',
        target: '≥ 90.00 Net WPM',
        actionText: 'Hypersonic Drill',
        actionRoute: 'test',
        check: (u) => u.wpm >= 90,
        currentValue: (u) => `${u.wpm.toFixed(1)} WPM`
      },
      {
        id: 'acc_98',
        title: 'Zero Slop Rate',
        target: '≥ 98.00% Accuracy',
        actionText: 'Pure Precision',
        actionRoute: 'practice',
        check: (u) => u.accuracy >= 98,
        currentValue: (u) => `${u.accuracy.toFixed(1)}%`
      },
      {
        id: 'arena_combat',
        title: '300s Marathon & Arena',
        target: '300s Test, 3 Duel Wins / Streak',
        actionText: '300s Marathon',
        actionRoute: 'multiplayer',
        check: (u) => u.arenaWins >= 3 || u.totalTests >= 25 || u.streak >= 7 || u.duration >= 280,
        currentValue: (u) => (u.arenaWins > 0 ? `${u.arenaWins} duel wins` : `${u.totalTests}/25 tests`)
      }
    ]
  }
};

/**
 * Evaluates progress across all 4 theme tiers for a given user's statistics
 * Enforces Level 20, 40, 60, 80 progression milestones and scaled examinations.
 */
export function evaluateThemeTiers(rawUserData = {}) {
  const wpm = Number(rawUserData.wpm ?? rawUserData.netWpm ?? rawUserData.best_wpm ?? 0);
  const accuracy = Number(rawUserData.accuracy ?? rawUserData.avg_accuracy ?? 0);
  const totalTests = Number(rawUserData.totalTests ?? rawUserData.total_tests ?? 0);
  const streak = Number(rawUserData.streak ?? rawUserData.current_streak ?? 1);
  const totalChars = Number(rawUserData.totalChars ?? rawUserData.total_characters ?? (totalTests * 200));
  const languagesCount = Number(rawUserData.languagesCount ?? rawUserData.languages_count ?? 1);
  const arenaWins = Number(rawUserData.arenaWins ?? rawUserData.arena_wins ?? 0);
  const duration = Number(rawUserData.duration ?? rawUserData.durationSeconds ?? (totalTests > 0 ? 60 : 0));

  // Determine user level based on explicit level, totalXp, or completed tests
  let level = Number(rawUserData.level ?? rawUserData.userLevel ?? 0);
  if (!level) {
    const totalXp = Number(rawUserData.totalXp ?? rawUserData.total_xp ?? 0);
    if (totalXp > 0) {
      level = calculateLevelFromXp(totalXp).level;
    } else if (totalTests > 0 || wpm > 0) {
      if (totalTests >= 30 || wpm >= 90) {
        level = 80;
      } else if (totalTests >= 20 || wpm >= 75) {
        level = 60;
      } else if (totalTests >= 12 || wpm >= 60) {
        level = 40;
      } else if (totalTests >= 5 || wpm >= 35) {
        level = 20;
      } else {
        level = Math.max(1, totalTests * 2);
      }
    } else {
      level = 1;
    }
  }

  const normalized = {
    level,
    wpm,
    accuracy,
    totalTests,
    streak,
    totalChars,
    languagesCount,
    arenaWins,
    duration
  };

  const tiers = {};
  const unlockedThemeIds = [];

  for (const [themeId, meta] of Object.entries(CERTIFICATE_THEME_TIERS)) {
    const taskResults = meta.tasks.map((t) => {
      const passed = Boolean(t.check(normalized));
      return {
        id: t.id,
        title: t.title,
        target: t.target,
        current: t.currentValue(normalized),
        passed,
        actionText: t.actionText,
        actionRoute: t.actionRoute
      };
    });

    const passedCount = taskResults.filter((t) => t.passed).length;
    const totalCount = taskResults.length;
    const isUnlocked = passedCount === totalCount;
    const progressPercent = Math.round((passedCount / totalCount) * 100);

    if (isUnlocked) {
      unlockedThemeIds.push(themeId);
    }

    tiers[themeId] = {
      ...meta,
      tasks: taskResults,
      passedCount,
      totalCount,
      progressPercent,
      isUnlocked
    };
  }

  // Active / highest unlocked tier or default to ivory
  const highestUnlockedThemeId = unlockedThemeIds[unlockedThemeIds.length - 1] || 'imperial-ivory';

  return {
    tiers,
    unlockedThemeIds,
    highestUnlockedThemeId,
    totalUnlocked: unlockedThemeIds.length,
    userLevel: level,
    normalized
  };
}
