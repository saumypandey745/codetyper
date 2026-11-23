import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculateMetrics, formatDuration, formatTimer, formatTwoDecimals } from '../src/utils/wpmCalculator.js';

describe('WPM & Accuracy Calculator Suite', () => {
  it('correctly calculates 60 WPM for 300 correct characters in 60 seconds with 100% accuracy', () => {
    const metrics = calculateMetrics({
      totalCharacters: 300,
      correctCharacters: 300,
      incorrectCharacters: 0,
      errorCount: 0,
      durationSeconds: 60
    });

    assert.equal(metrics.grossWpm, 60);
    assert.equal(metrics.netWpm, 60);
    assert.equal(metrics.accuracy, 100);
    assert.equal(metrics.durationSeconds, 60);
  });

  it('correctly calculates Net WPM with error penalty', () => {
    // 300 total characters in 60s = 60 gross words. 5 errors in 1 min = -5 WPM penalty = 55 Net WPM.
    const metrics = calculateMetrics({
      totalCharacters: 300,
      correctCharacters: 295,
      incorrectCharacters: 5,
      errorCount: 5,
      durationSeconds: 60
    });

    assert.equal(metrics.grossWpm, 60);
    assert.equal(metrics.netWpm, 55); // 60 gross - 5 errors = 55 Net WPM
    assert.equal(metrics.accuracy, 98.33);
  });

  it('handles edge case of 0 seconds duration safely without throwing or NaN', () => {
    const metrics = calculateMetrics({
      totalCharacters: 0,
      correctCharacters: 0,
      incorrectCharacters: 0,
      errorCount: 0,
      durationSeconds: 0
    });

    assert.equal(metrics.grossWpm, 0);
    assert.equal(metrics.netWpm, 0);
    assert.equal(metrics.accuracy, 100);
  });

  it('ensures Net WPM never becomes negative even when errors exceed gross words', () => {
    // 50 characters in 60s = 10 Gross WPM. 15 errors in 1 min = -15 WPM penalty. Net WPM must be 0, not -5.
    const metrics = calculateMetrics({
      totalCharacters: 50,
      correctCharacters: 35,
      incorrectCharacters: 15,
      errorCount: 15,
      durationSeconds: 60
    });

    assert.equal(metrics.grossWpm, 10);
    assert.equal(metrics.netWpm, 0); // Math.max(0, 10 - 15) = 0
    assert.equal(metrics.accuracy, 70); // 35 / 50 * 100 = 70%
  });

  it('excludes corrected mistakes from error count in Typing Master style', () => {
    // User made mistakes during typing, but backspaced and fixed all of them.
    // Final text has 250 characters, 250 correct, 0 uncorrected errors.
    const metrics = calculateMetrics({
      totalCharacters: 250,
      correctCharacters: 250,
      incorrectCharacters: 0,
      errorCount: 0, // corrected mistakes excluded
      durationSeconds: 60
    });

    assert.equal(metrics.grossWpm, 50);
    assert.equal(metrics.netWpm, 50); // No error penalty
    assert.equal(metrics.accuracy, 100);
  });

  it('correctly calculates metrics for sub-minute durations (e.g. 30 seconds)', () => {
    // 150 characters in 30 seconds = 30 words in 0.5 minutes = 60 Gross WPM.
    // 2 errors in 0.5 minutes = 4 WPM penalty = 56 Net WPM.
    const metrics = calculateMetrics({
      totalCharacters: 150,
      correctCharacters: 148,
      incorrectCharacters: 2,
      errorCount: 2,
      durationSeconds: 30
    });

    assert.equal(metrics.grossWpm, 60);
    assert.equal(metrics.netWpm, 56);
    assert.equal(metrics.accuracy, 98.67);
  });

  it('formats decimal values up to 2 decimal places using formatTwoDecimals', () => {
    assert.equal(formatTwoDecimals(60), '60.00');
    assert.equal(formatTwoDecimals(54.2), '54.20');
    assert.equal(formatTwoDecimals(98.6666), '98.67');
    assert.equal(formatTwoDecimals(0), '0.00');
    assert.equal(formatTwoDecimals(null), '0.00');
    assert.equal(formatTwoDecimals(undefined), '0.00');
  });

  it('formats duration strings accurately', () => {
    assert.equal(formatDuration(45), '45s');
    assert.equal(formatDuration(60), '1m');
    assert.equal(formatDuration(125), '2m 5s');
  });

  it('formats timer clock string mm:ss properly', () => {
    assert.equal(formatTimer(5), '00:05');
    assert.equal(formatTimer(65), '01:05');
    assert.equal(formatTimer(300), '05:00');
  });
});
