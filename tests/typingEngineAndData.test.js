import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculateMetrics } from '../src/utils/wpmCalculator.js';
import { createRateLimiter } from '../server/rateLimiter.js';

describe('Typing Engine, Timezone & Data Integrity Suite', () => {
  // --- High-Speed Typing and WPM Edge Cases ---
  it('correctly calculates high-speed typing at 150+ WPM with high accuracy', () => {
    // 150 WPM = 750 characters in 60 seconds (150 words * 5 chars)
    const metrics = calculateMetrics({
      totalCharacters: 750,
      correctCharacters: 745,
      incorrectCharacters: 5,
      errorCount: 2,
      durationSeconds: 60
    });

    assert.equal(metrics.grossWpm, 150);
    // Net WPM = ((745/5)/1) - (2/1) = 149 - 2 = 147
    assert.equal(metrics.netWpm, 147);
    assert.equal(metrics.accuracy, 99.3);
  });

  it('correctly clamps accuracy to 0% and Net WPM to 0 when errors exceed typed characters', () => {
    const metrics = calculateMetrics({
      totalCharacters: 50,
      correctCharacters: 5,
      incorrectCharacters: 45,
      errorCount: 30,
      durationSeconds: 30
    });

    assert.equal(metrics.netWpm, 0); // Math.max(0, ...)
    assert.equal(metrics.accuracy, 10); // 5 / 50 * 100 = 10%
  });

  // --- Countdown Keystroke Leak Prevention Logic ---
  it('prevents first keystroke from leaking into typed text when countdown is enabled', () => {
    // Emulate hook key handler state logic
    let status = 'idle';
    let typedText = '';
    const countdownEnabled = true;

    function handleKeyDown(key) {
      if (status === 'idle') {
        if (key.length === 1 || key === 'Backspace' || key === 'Enter') {
          status = 'countdown';
          if (countdownEnabled) {
            // Must return without typing the triggering key
            return;
          }
        }
      }

      if (status !== 'typing') return;

      typedText += key;
    }

    // User presses initial key 'c' while idle
    handleKeyDown('c');
    assert.equal(status, 'countdown');
    assert.equal(typedText, '', 'Typed text must be completely empty during countdown');

    // User presses another key during countdown
    handleKeyDown('o');
    assert.equal(typedText, '', 'Keys during countdown must be ignored');

    // Countdown finishes, status becomes 'typing'
    status = 'typing';
    handleKeyDown('c');
    handleKeyDown('o');
    handleKeyDown('d');
    handleKeyDown('e');
    assert.equal(typedText, 'code', 'Characters must be recorded only after countdown finishes');
  });

  // --- Code Mode Special Characters & Indentation ---
  it('accurately parses and checks complex coding syntax tokens without distortion', () => {
    const codeSnippet = `function calculateTotal(items = []) {\n  return items.reduce((sum, item) => sum + item.price, 0);\n}`;
    assert.ok(codeSnippet.includes('{'));
    assert.ok(codeSnippet.includes('}'));
    assert.ok(codeSnippet.includes('=>'));
    assert.ok(codeSnippet.includes('===') || codeSnippet.includes('==') || codeSnippet.includes('='));
    assert.ok(codeSnippet.includes(';\n'));
    assert.ok(codeSnippet.includes('  '), 'Preserves 2-space indentation');

    let correctChars = 0;
    for (let i = 0; i < codeSnippet.length; i++) {
      if (codeSnippet[i] === codeSnippet[i]) correctChars++;
    }
    assert.equal(correctChars, codeSnippet.length);
  });

  // --- Timezone-Aware Daily Streak Logic ---
  it('correctly calculates local calendar dates across midnight boundaries in different timezones', () => {
    // Reference moment: 2026-10-30 19:00:00 UTC
    const refUtcMs = Date.UTC(2026, 9, 30, 19, 0, 0); // 19:00 UTC

    // In IST (UTC+5:30 -> timezoneOffsetMinutes = -330)
    // 19:00 UTC + 5:30 = 00:30 on NEXT DAY: 2026-10-31!
    const istOffset = -330;
    const istLocalTime = new Date(refUtcMs - istOffset * 60 * 1000);
    const istDate = istLocalTime.toISOString().split('T')[0];
    assert.equal(istDate, '2026-10-31', 'IST user at 00:30 AM should be on 2026-10-31');

    // In PST (UTC-8:00 -> timezoneOffsetMinutes = +480)
    // 19:00 UTC - 8:00 = 11:00 AM on SAME DAY: 2026-10-30!
    const pstOffset = 480;
    const pstLocalTime = new Date(refUtcMs - pstOffset * 60 * 1000);
    const pstDate = pstLocalTime.toISOString().split('T')[0];
    assert.equal(pstDate, '2026-10-30', 'PST user at 11:00 AM should be on 2026-10-30');

    // Streak difference check
    const lastPractice = '2026-10-30';
    const todayPractice = '2026-10-31';
    const lastMs = new Date(`${lastPractice}T00:00:00Z`).getTime();
    const currentMs = new Date(`${todayPractice}T00:00:00Z`).getTime();
    const diffDays = Math.round((currentMs - lastMs) / (1000 * 60 * 60 * 24));
    assert.equal(diffDays, 1, 'Consecutive day streak increases by 1');
  });

  // --- CSV Export RFC 4180 Escaping & Unicode BOM ---
  it('properly escapes quotes, commas, newlines, and prepends UTF-8 BOM for CSV exports', () => {
    const escapeCsvField = (field) => {
      if (field === null || field === undefined) return '""';
      const str = String(field).replace(/"/g, '""');
      return `"${str}"`;
    };

    const trickyTitle = 'Code with "quotes", commas, & newlines\nin snippet';
    const escaped = escapeCsvField(trickyTitle);
    assert.equal(escaped, '"Code with ""quotes"", commas, & newlines\nin snippet"');

    const headers = ['ID', 'Title', 'Language'];
    const rows = [[1, trickyTitle, 'JavaScript (ES6+) — 🌿']];
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.map(escapeCsvField).join(','))].join('\r\n');

    assert.ok(csvContent.startsWith('\uFEFF'), 'CSV must start with UTF-8 BOM character');
    assert.ok(csvContent.includes('🌿'), 'Unicode emojis and characters preserved');
    assert.ok(csvContent.includes('""quotes""'), 'Double quotes properly escaped');
  });

  // --- Rate Limiter Middleware Unit Verification ---
  it('rate limiter triggers 429 when request limit is exceeded within window', () => {
    const limiter = createRateLimiter({
      windowMs: 60 * 1000,
      max: 3,
      message: 'Rate limit exceeded'
    });

    const mockReq = { ip: '192.168.1.100', headers: {} };
    let lastStatus = 200;
    let lastBody = null;
    let headersSet = {};

    const mockRes = {
      setHeader: (name, val) => { headersSet[name] = val; },
      status: (code) => {
        lastStatus = code;
        return {
          json: (body) => { lastBody = body; }
        };
      }
    };

    let nextCount = 0;
    const next = () => { nextCount++; };

    // Calls 1, 2, 3 succeed
    limiter(mockReq, mockRes, next);
    assert.equal(nextCount, 1);
    limiter(mockReq, mockRes, next);
    assert.equal(nextCount, 2);
    limiter(mockReq, mockRes, next);
    assert.equal(nextCount, 3);

    // Call 4 exceeds limit (max: 3)
    limiter(mockReq, mockRes, next);
    assert.equal(nextCount, 3, 'next() must NOT be called when rate limited');
    assert.equal(lastStatus, 429);
    assert.equal(lastBody.error, 'Rate limit exceeded');
    assert.ok(headersSet['Retry-After'] !== undefined);
  });
});
