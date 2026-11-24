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
  const certUrl = `https://codetyper.dev/#verify/${encodeURIComponent(certId)}`;
  const dateObj = issueDate ? new Date(issueDate) : new Date();
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth() + 1;

  return `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(certName)}&organizationName=${encodeURIComponent(orgName)}&issueYear=${year}&issueMonth=${month}&certUrl=${encodeURIComponent(certUrl)}&certId=${encodeURIComponent(certId)}`;
}

export function getSocialShareUrls({ certId, recipientName, wpm, accuracy, tierTitle }) {
  const verifyUrl = `https://codetyper.dev/#verify/${encodeURIComponent(certId)}`;
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
 * 4-Tier Task-Based Certificate Theme Progression System
 * Divides the 4 luxury certificate themes into unlockable milestones & challenges
 * to drive daily user retention, practice depth, and social flex.
 */
export const CERTIFICATE_THEME_TIERS = {
  'imperial-ivory': {
    id: 'imperial-ivory',
    tier: 1,
    name: 'Imperial Ivory Parchment',
    badge: '📜 Vintage Ivory',
    roleTag: 'Touch-Typing Apprentice',
    shortDesc: 'Foundational touch-typing accreditation proving consistent finger cadence and precision.',
    swatch: 'linear-gradient(135deg, #fef9c3 0%, #b45309 100%)',
    accentColor: '#b45309',
    tasks: [
      {
        id: 'speed_35',
        title: 'Speed Benchmark',
        target: '≥ 35.00 Net WPM',
        actionText: 'Speed Drill',
        actionRoute: 'test',
        check: (u) => u.wpm >= 35,
        currentValue: (u) => `${u.wpm.toFixed(1)} WPM`
      },
      {
        id: 'acc_90',
        title: 'Precision Threshold',
        target: '≥ 90.00% Accuracy',
        actionText: 'Accuracy Drill',
        actionRoute: 'practice',
        check: (u) => u.accuracy >= 90,
        currentValue: (u) => `${u.accuracy.toFixed(1)}%`
      },
      {
        id: 'tests_5',
        title: 'Practice Volume',
        target: '≥ 5 Completed Tests',
        actionText: 'Take Test',
        actionRoute: 'test',
        check: (u) => u.totalTests >= 5,
        currentValue: (u) => `${u.totalTests}/5 tests`
      },
      {
        id: 'dur_55',
        title: 'Formal Assessment',
        target: '≥ 55s Timed Exam',
        actionText: '60s Test',
        actionRoute: 'test',
        check: (u) => u.duration >= 55 || u.totalTests >= 1,
        currentValue: (u) => `${Math.round(u.duration)}s`
      }
    ]
  },
  'royal-obsidian': {
    id: 'royal-obsidian',
    tier: 2,
    name: 'Royal Obsidian & 24K Gold',
    badge: '👑 Royal Gold',
    roleTag: 'Professional Typist',
    shortDesc: 'Executive accreditation for developers & writers demonstrating high typing velocity and daily discipline.',
    swatch: 'linear-gradient(135deg, #090e1c 0%, #ca8a04 100%)',
    accentColor: '#eab308',
    tasks: [
      {
        id: 'speed_60',
        title: 'Professional Velocity',
        target: '≥ 60.00 Net WPM',
        actionText: 'Practice Speed',
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
        id: 'streak_3',
        title: 'Daily Flow Habit',
        target: '≥ 3-Day Practice Streak',
        actionText: 'Keep Streak',
        actionRoute: 'practice',
        check: (u) => u.streak >= 3,
        currentValue: (u) => `${u.streak}/3 days`
      },
      {
        id: 'tests_15',
        title: 'Discipline Volume',
        target: '≥ 15 Practice Sessions',
        actionText: 'Complete Drills',
        actionRoute: 'practice',
        check: (u) => u.totalTests >= 15,
        currentValue: (u) => `${u.totalTests}/15 tests`
      }
    ]
  },
  'emerald-sovereign': {
    id: 'emerald-sovereign',
    tier: 3,
    name: 'Emerald Sovereign & Gold',
    badge: '🌿 Grandmaster Emerald',
    roleTag: 'Syntax Polyglot & Code Master',
    shortDesc: 'Honoring multi-stack programming fluency across languages, brackets, lambdas, and complex syntax.',
    swatch: 'linear-gradient(135deg, #064e3b 0%, #10b981 100%)',
    accentColor: '#10b981',
    tasks: [
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
        actionText: 'Flawless Coding',
        actionRoute: 'coding',
        check: (u) => u.accuracy >= 97,
        currentValue: (u) => `${u.accuracy.toFixed(1)}%`
      },
      {
        id: 'lang_3',
        title: 'Syntax Polyglot',
        target: '≥ 3 Coding Languages',
        actionText: 'Try Languages',
        actionRoute: 'coding',
        check: (u) => u.languagesCount >= 3,
        currentValue: (u) => `${u.languagesCount}/3 languages`
      },
      {
        id: 'zen_or_chars',
        title: 'Deep Code Volume',
        target: '≥ 1,500 Chars or 20+ Tests',
        actionText: 'Code Practice',
        actionRoute: 'coding',
        check: (u) => u.totalChars >= 1500 || u.totalTests >= 20,
        currentValue: (u) => `${u.totalChars} chars`
      }
    ]
  },
  'midnight-platinum': {
    id: 'midnight-platinum',
    tier: 4,
    name: 'Midnight Titanium & Platinum',
    badge: '💎 Celestial Platinum',
    roleTag: 'Apex Legend & Arena Champion',
    shortDesc: 'The ultimate distinction. Mastered under competitive pressure with hypersonic speed and zero hesitation.',
    swatch: 'linear-gradient(135deg, #1e293b 0%, #60a5fa 100%)',
    accentColor: '#60a5fa',
    tasks: [
      {
        id: 'speed_90',
        title: 'Apex Velocity',
        target: '≥ 90.00 Net WPM',
        actionText: 'Speed Benchmark',
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
        id: 'arena_or_volume',
        title: 'Arena Duel Champion',
        target: '≥ 3 Arena Wins or 25+ Tests',
        actionText: 'Enter Arena',
        actionRoute: 'multiplayer',
        check: (u) => u.arenaWins >= 3 || u.totalTests >= 25,
        currentValue: (u) => (u.arenaWins > 0 ? `${u.arenaWins} wins` : `${u.totalTests}/25 tests`)
      },
      {
        id: 'streak_or_endurance',
        title: 'Flow Endurance',
        target: '≥ 7-Day Streak or 35+ Tests',
        actionText: 'Maintain Flow',
        actionRoute: 'practice',
        check: (u) => u.streak >= 7 || u.totalTests >= 35,
        currentValue: (u) => (u.streak >= 7 ? `${u.streak} days` : `${u.totalTests}/35 tests`)
      }
    ]
  }
};

/**
 * Evaluates progress across all 4 theme tiers for a given user's statistics
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

  const normalized = {
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
    normalized
  };
}
