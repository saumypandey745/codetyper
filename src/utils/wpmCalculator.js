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
