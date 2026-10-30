import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculateMetrics, formatDuration, formatTimer } from '../src/utils/wpmCalculator.js';

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
    // 300 correct characters in 60s = 60 gross words. 5 errors in 1 min = -5 WPM penalty = 55 Net WPM.
    const metrics = calculateMetrics({
      totalCharacters: 300,
      correctCharacters: 295,
      incorrectCharacters: 5,
      errorCount: 5,
      durationSeconds: 60
    });

    assert.equal(metrics.grossWpm, 60);
    assert.equal(metrics.netWpm, 54); // 295/5 - 5 = 59 - 5 = 54
    assert.equal(metrics.accuracy, 98.3);
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
