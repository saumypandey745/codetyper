/**
 * Typing Master Style Typing Metrics Calculator
 *
 * Requirements:
 * 1. Gross WPM: 1 word = 5 characters (including spaces).
 *    Formula: Gross WPM = Total Typed Characters / 5 / Time in Minutes.
 * 2. Net WPM: Gross WPM - (Total Errors / Time in Minutes). Net WPM >= 0.
 * 3. Accuracy: (Correct Characters / Total Typed Characters) * 100.
 * 4. Errors: Uncorrected incorrect characters (corrected mistakes with Backspace are not included in final error count).
 * 5. Timer in seconds converted to minutes; division by zero handled cleanly.
 * 6. Decimal values rounded to 2 decimal places.
 */
export function calculateMetrics({
  totalCharacters = 0,
  correctCharacters = 0,
  incorrectCharacters = 0,
  errorCount = undefined,
  totalErrors = undefined,
  durationSeconds = 0
} = {}) {
  const durationSec = Math.max(0, Number(durationSeconds) || 0);
  const totalChars = Math.max(0, Number(totalCharacters) || 0);
  const correctChars = Math.max(0, Number(correctCharacters) || 0);
  const incorrectChars = Math.max(0, Number(incorrectCharacters) || 0);

  // In Typing Master:
  // Incorrect characters count as errors.
  // Backspace and corrected mistakes are handled properly:
  // Corrected mistakes are NOT included in the error count.
  const errors = errorCount !== undefined
    ? Math.max(0, Number(errorCount) || 0)
    : (totalErrors !== undefined ? Math.max(0, Number(totalErrors) || 0) : incorrectChars);

  // Convert timer seconds to minutes
  const timeInMinutes = durationSec / 60;

  let rawGrossWpm = 0;
  let rawNetWpm = 0;

  // Handle division by zero safely
  if (timeInMinutes > 0 && totalChars > 0) {
    // 1 word = 5 characters (including spaces)
    // Formula: Gross WPM = Total Typed Characters / 5 / Time in Minutes
    rawGrossWpm = (totalChars / 5) / timeInMinutes;

    // Formula: Net WPM = Gross WPM - (Total Errors / Time in Minutes)
    const errorPenalty = errors / timeInMinutes;
    rawNetWpm = rawGrossWpm - errorPenalty;
  }

  // Net WPM negative nahi hona chahiye
  const finalNetWpm = Math.max(0, rawNetWpm);

  // Formula: Accuracy = (Correct Characters / Total Typed Characters) * 100
  let rawAccuracy = 100;
  if (totalChars > 0) {
    rawAccuracy = Math.max(0, Math.min(100, (correctChars / totalChars) * 100));
  }

  // Decimal values rounded to 2 decimal places
  const grossWpm = Math.round((rawGrossWpm + Number.EPSILON) * 100) / 100;
  const netWpm = Math.round((finalNetWpm + Number.EPSILON) * 100) / 100;
  const accuracy = Math.round((rawAccuracy + Number.EPSILON) * 100) / 100;

  return {
    grossWpm: isNaN(grossWpm) ? 0 : grossWpm,
    netWpm: isNaN(netWpm) ? 0 : netWpm,
    accuracy: isNaN(accuracy) ? 100 : accuracy,
    totalCharacters: totalChars,
    correctCharacters: correctChars,
    incorrectCharacters: incorrectChars,
    errorCount: errors,
    totalErrors: errors,
    totalChars,
    correctChars,
    incorrectChars,
    durationSeconds: Math.round((durationSec + Number.EPSILON) * 100) / 100,
    timeInMinutes: Math.round((timeInMinutes + Number.EPSILON) * 100) / 100
  };
}

/**
 * Helper to display decimal values up to 2 decimal places.
 * e.g., 45.2 -> "45.20", 60 -> "60.00"
 */
export function formatTwoDecimals(val) {
  if (val === undefined || val === null || isNaN(val)) return '0.00';
  return Number(val).toFixed(2);
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
