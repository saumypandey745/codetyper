export function calculateMetrics({
  totalCharacters = 0,
  correctCharacters = 0,
  incorrectCharacters = 0,
  errorCount = 0,
  durationSeconds = 0
}) {
  const minutes = Math.max(0.001, durationSeconds / 60);

  // Standard typing calculation: 1 word = 5 keystrokes
  const grossWpm = Math.round(((totalCharacters / 5) / minutes) * 10) / 10;
  
  // Net WPM penalizes uncorrected errors
  const netWpm = Math.max(0, Math.round((((correctCharacters / 5) / minutes) - (errorCount / minutes)) * 10) / 10);

  const totalAttempted = correctCharacters + incorrectCharacters;
  const accuracy = totalAttempted > 0
    ? Math.max(0, Math.min(100, Math.round((correctCharacters / totalAttempted) * 1000) / 10))
    : 100;

  return {
    grossWpm: isNaN(grossWpm) ? 0 : grossWpm,
    netWpm: isNaN(netWpm) ? 0 : netWpm,
    accuracy: isNaN(accuracy) ? 100 : accuracy,
    durationSeconds: Math.round(durationSeconds)
  };
}

/**
 * Calculates typing consistency score (0-100%) like Monkeytype.
 * Uses standard deviation of instantaneous WPM across 1-second interval snapshots.
 */
export function calculateConsistency(timeline = [], avgWpm = 0) {
  if (!timeline || timeline.length < 2 || avgWpm <= 0) return 100;

  const wpms = timeline.map((entry) => (typeof entry.wpm === 'number' ? entry.wpm : 0));
  const mean = wpms.reduce((sum, v) => sum + v, 0) / wpms.length;

  if (mean <= 0) return 100;

  const variance = wpms.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / wpms.length;
  const stdDev = Math.sqrt(variance);

  // Coefficient of Variation: stdDev / mean. Lower variation = higher consistency.
  const score = Math.max(0, Math.min(100, Math.round(100 * (1 - (stdDev / (mean * 1.5))))));
  return isNaN(score) ? 100 : score;
}

// Left hand keyboard characters (standard QWERTY)
const LEFT_HAND_KEYS = new Set([
  '~', '`', '!', '1', '@', '2', '#', '3', '$', '4', '%', '5',
  'q', 'w', 'e', 'r', 't',
  'a', 's', 'd', 'f', 'g',
  'z', 'x', 'c', 'v', 'b',
  'Q', 'W', 'E', 'R', 'T',
  'A', 'S', 'D', 'F', 'G',
  'Z', 'X', 'C', 'V', 'B'
]);

/**
 * Calculates ergonomic hand load distribution (Left vs Right Hand percentage).
 */
export function calculateHandBalance(text = '') {
  if (!text || text.length === 0) {
    return { leftCount: 0, rightCount: 0, leftPercent: 50, rightPercent: 50 };
  }

  let leftCount = 0;
  let rightCount = 0;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === ' ' || ch === '\n') {
      // Spacebar shared equally
      leftCount += 0.5;
      rightCount += 0.5;
    } else if (LEFT_HAND_KEYS.has(ch)) {
      leftCount++;
    } else {
      rightCount++;
    }
  }

  const total = leftCount + rightCount;
  if (total === 0) return { leftCount: 0, rightCount: 0, leftPercent: 50, rightPercent: 50 };

  const leftPercent = Math.round((leftCount / total) * 100);
  const rightPercent = 100 - leftPercent;

  return {
    leftCount: Math.round(leftCount),
    rightCount: Math.round(rightCount),
    leftPercent,
    rightPercent
  };
}

export function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  if (mins === 0) return `${secs}s`;
  if (secs === 0) return `${mins}m`;
  return `${mins}m ${secs}s`;
}

export function formatTimer(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatDate(dateString) {
  if (!dateString) return 'Just now';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}
