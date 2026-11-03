// CodeTyper Gamification Engine
// Handles XP calculations, Level Progression (Lv 1 - 100), Unlockable Badges,
// Daily Quests, and Keystroke Heatmap statistics.

export const BADGES = [
  {
    id: 'first_keystroke',
    title: 'First Keystroke',
    description: 'Completed your very first typing practice session.',
    icon: 'Sparkles',
    tier: 'bronze'
  },
  {
    id: 'speed_demon_60',
    title: 'Velocity 60',
    description: 'Achieved a typing speed of 60+ Net WPM.',
    icon: 'Zap',
    tier: 'bronze'
  },
  {
    id: 'speed_demon_80',
    title: 'Velocity 80',
    description: 'Achieved a typing speed of 80+ Net WPM.',
    icon: 'Flame',
    tier: 'silver'
  },
  {
    id: 'century_club',
    title: 'Century Club (100 WPM)',
    description: 'Entered the elite 100+ Net WPM typing bracket.',
    icon: 'Gauge',
    tier: 'gold'
  },
  {
    id: 'hypersonic_120',
    title: 'Hypersonic (120 WPM)',
    description: 'Transcended mortal limits with 120+ Net WPM.',
    icon: 'Rocket',
    tier: 'platinum'
  },
  {
    id: 'flawless_accuracy',
    title: 'Flawless Mind',
    description: 'Completed a session with 100% accuracy on 150+ characters.',
    icon: 'Target',
    tier: 'gold'
  },
  {
    id: 'polyglot_coder',
    title: 'Syntax Polyglot',
    description: 'Practiced in 4 or more different programming languages.',
    icon: 'Layers',
    tier: 'silver'
  },
  {
    id: 'zen_master',
    title: 'Zen Seeker',
    description: 'Completed 5 sessions in Pure Zen distraction-free mode.',
    icon: 'Leaf',
    tier: 'silver'
  },
  {
    id: 'night_owl',
    title: 'Midnight Hacker',
    description: 'Practiced between 11 PM and 5 AM.',
    icon: 'Moon',
    tier: 'bronze'
  },
  {
    id: 'streak_warrior_7',
    title: '7-Day Flow Streak',
    description: 'Maintained a peaceful daily streak for 7 consecutive days.',
    icon: 'CalendarCheck',
    tier: 'gold'
  },
  {
    id: 'custom_artisan',
    title: 'Custom Artisan',
    description: 'Practiced custom user-imported code or a GitHub repository.',
    icon: 'Code2',
    tier: 'silver'
  },
  {
    id: 'marathon_runner',
    title: 'Keystroke Marathon',
    description: 'Accumulated over 1 hour of total focused practice time.',
    icon: 'Timer',
    tier: 'gold'
  }
];

// Level Titles progression (1 - 100)
export function getLevelTitle(level) {
  if (level >= 90) return 'Legend of CodeTyper';
  if (level >= 75) return 'Grandmaster Zen Typer';
  if (level >= 60) return 'Keystroke Maestro';
  if (level >= 45) return 'Syntax Artisan';
  if (level >= 30) return 'Flow State Adept';
  if (level >= 15) return 'Calm Disciplined Typist';
  if (level >= 5)  return 'Keystroke Apprentice';
  return 'Keystroke Novice';
}

// XP needed for a specific level: Level L requires base 250 * L^1.35
export function getXpForLevel(level) {
  if (level <= 1) return 0;
  return Math.floor(250 * Math.pow(level - 1, 1.35));
}

// Convert cumulative XP into level and progress percentage
export function calculateLevelFromXp(totalXp = 0) {
  let level = 1;
  while (level < 100 && totalXp >= getXpForLevel(level + 1)) {
    level++;
  }
  const currentLevelBaseXp = getXpForLevel(level);
  const nextLevelXp = getXpForLevel(level + 1);
  const xpInCurrentLevel = totalXp - currentLevelBaseXp;
  const xpNeededForNext = nextLevelXp - currentLevelBaseXp;
  const progressPercent = level >= 100 ? 100 : Math.min(100, Math.floor((xpInCurrentLevel / xpNeededForNext) * 100));

  return {
    level,
    title: getLevelTitle(level),
    totalXp,
    currentLevelBaseXp,
    nextLevelXp,
    xpInCurrentLevel,
    xpNeededForNext,
    progressPercent
  };
}

// Compute XP earned for a session
export function computeSessionXp({ correctCharacters = 0, netWpm = 0, accuracy = 0, durationSeconds = 0, isZen = false }) {
  if (correctCharacters <= 0) return 0;
  // Base XP from correct keystrokes
  let xp = correctCharacters * 1.5;
  // Speed multiplier
  xp += (netWpm * 2);
  // Accuracy weight
  const accMultiplier = Math.max(0.5, accuracy / 100);
  xp *= accMultiplier;
  // Zen mode bonus
  if (isZen) {
    xp *= 1.2;
  }
  return Math.max(10, Math.round(xp));
}

// Daily Quests Generator (Deterministic by date)
export function getDailyQuests(dateStr = new Date().toISOString().split('T')[0]) {
  // Simple seed from date
  let seed = 0;
  for (let i = 0; i < dateStr.length; i++) {
    seed = (seed * 31 + dateStr.charCodeAt(i)) & 0xffffffff;
  }
  const absSeed = Math.abs(seed);

  const questPool = [
    { id: 'q_speed', title: 'Speed Burst', description: 'Complete a session with at least 65 Net WPM', target: 65, unit: 'WPM', xpReward: 150 },
    { id: 'q_accuracy', title: 'Precision Touch', description: 'Complete a session with 97%+ accuracy', target: 97, unit: '%', xpReward: 200 },
    { id: 'q_coding', title: 'Code Builder', description: 'Complete 2 coding practice sessions', target: 2, unit: 'sessions', xpReward: 180 },
    { id: 'q_chars', title: 'Keystroke Volume', description: 'Type 400 total correct characters today', target: 400, unit: 'chars', xpReward: 220 },
    { id: 'q_zen', title: 'Mindful Session', description: 'Complete a session in Pure Zen mode', target: 1, unit: 'zen', xpReward: 160 },
    { id: 'q_lang', title: 'Language Explorer', description: 'Practice a Python or Rust snippet', target: 1, unit: 'lang', xpReward: 175 }
  ];

  const q1 = questPool[absSeed % questPool.length];
  const q2 = questPool[(absSeed + 2) % questPool.length];
  const q3 = questPool[(absSeed + 4) % questPool.length];

  return [q1, q2, q3];
}

// Keystroke Heatmap Storage and Calculations
export const keyStatsManager = {
  getStats() {
    try {
      const data = localStorage.getItem('codetyper_key_heatmap');
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  },

  recordKeystroke(char, isMatch) {
    if (!char) return;
    const cleanKey = char.toLowerCase();
    const stats = this.getStats();
    if (!stats[cleanKey]) {
      stats[cleanKey] = { total: 0, errors: 0 };
    }
    stats[cleanKey].total += 1;
    if (!isMatch) {
      stats[cleanKey].errors += 1;
    }
    try {
      localStorage.setItem('codetyper_key_heatmap', JSON.stringify(stats));
    } catch (e) {}
  },

  getKeyAccuracy(cleanKey) {
    const stats = this.getStats();
    const keyData = stats[cleanKey];
    if (!keyData || keyData.total === 0) return null;
    const correct = keyData.total - keyData.errors;
    return Math.max(0, Math.min(100, Math.round((correct / keyData.total) * 100)));
  }
};
