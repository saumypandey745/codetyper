import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculateConsistency, calculateHandBalance } from '../src/utils/wpmCalculator.js';
import { keyStatsManager } from '../src/utils/gamificationEngine.js';
import { programmingLanguages } from '../server/seedData.js';

describe('Pro Engine Features: Biometrics, Telemetry & Weakness Drills', () => {
  it('correctly calculates Monkeytype-style consistency score based on WPM variance', () => {
    // Perfectly stable typing pace (e.g. 70, 70, 70, 70) => near 100% consistency
    const steadyTimeline = [
      { second: 1, wpm: 70 },
      { second: 2, wpm: 70 },
      { second: 3, wpm: 70 },
      { second: 4, wpm: 70 }
    ];
    const highConsistency = calculateConsistency(steadyTimeline, 70);
    assert.equal(highConsistency, 100);

    // Erratic pacing with high variance => lower consistency score
    const erraticTimeline = [
      { second: 1, wpm: 20 },
      { second: 2, wpm: 120 },
      { second: 3, wpm: 30 },
      { second: 4, wpm: 110 }
    ];
    const lowConsistency = calculateConsistency(erraticTimeline, 70);
    assert.ok(lowConsistency < 80, `Expected consistency < 80 for erratic run, got ${lowConsistency}`);
  });

  it('correctly measures ergonomic hand balance (Left Hand vs Right Hand load)', () => {
    // "wasd" are all left-hand keys
    const leftOnly = calculateHandBalance('wasd');
    assert.equal(leftOnly.leftPercent, 100);
    assert.equal(leftOnly.rightPercent, 0);

    // "jkl;" are all right-hand keys
    const rightOnly = calculateHandBalance('jkl;');
    assert.equal(rightOnly.leftPercent, 0);
    assert.equal(rightOnly.rightPercent, 100);

    // Balanced text
    const balanced = calculateHandBalance('the quick brown fox');
    assert.ok(balanced.leftPercent >= 30 && balanced.leftPercent <= 70, 'Left percent should be balanced');
    assert.equal(balanced.leftPercent + balanced.rightPercent, 100);
  });

  it('generates targeted weakness drills for tricky coding symbols and weak keys', () => {
    const weakKeys = keyStatsManager.getWeakestKeys(5);
    assert.ok(Array.isArray(weakKeys));
    assert.equal(weakKeys.length, 5);

    const codeDrill = keyStatsManager.generateWeaknessSnippet(weakKeys, true);
    assert.ok(codeDrill.isWeaknessDrill);
    assert.equal(codeDrill.language, 'JavaScript');
    assert.ok(codeDrill.content.includes(weakKeys[0]));

    const englishDrill = keyStatsManager.generateWeaknessSnippet(weakKeys, false);
    assert.ok(englishDrill.isWeaknessDrill);
    assert.equal(englishDrill.language, 'English');
  });

  it('contains Algorithms (DSA) and Vim Navigation in curated curriculum options', () => {
    assert.ok(programmingLanguages.includes('Algorithms (DSA)'));
    assert.ok(programmingLanguages.includes('Vim Navigation'));
  });
});
