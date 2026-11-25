import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  checkCertificateEligibility,
  CERTIFICATE_REQUIREMENTS,
  evaluateThemeTiers,
  CERTIFICATE_THEME_TIERS
} from '../src/utils/certificateEligibility.js';

describe('Certificate Eligibility & Accreditation Standards Suite', () => {
  it('rejects single-word / trivial typing sessions (< 150 characters or < 55 seconds)', () => {
    // User types 1 word (e.g. 10 chars) in 5 seconds
    const trivialSession = {
      durationSeconds: 5,
      totalCharacters: 10,
      netWpm: 24,
      accuracy: 100
    };

    const res = checkCertificateEligibility(trivialSession);
    assert.equal(res.isEligible, false);
    assert.equal(res.passedCount, 1); // Only accuracy passed
    assert.equal(res.checks.find(c => c.id === 'duration').passed, false);
    assert.equal(res.checks.find(c => c.id === 'characters').passed, false);
    assert.equal(res.checks.find(c => c.id === 'speed').passed, false);
  });

  it('rejects idle 60s sessions with low characters or low speed', () => {
    // User waited 60s but only typed 25 characters
    const idleSession = {
      durationSeconds: 60,
      totalCharacters: 25,
      netWpm: 5,
      accuracy: 95
    };

    const res = checkCertificateEligibility(idleSession);
    assert.equal(res.isEligible, false);
    assert.equal(res.checks.find(c => c.id === 'characters').passed, false);
    assert.equal(res.checks.find(c => c.id === 'speed').passed, false);
  });

  it('rejects high speed sessions with poor accuracy (< 90%)', () => {
    // Fast but sloppy
    const inaccurateSession = {
      durationSeconds: 60,
      totalCharacters: 300,
      netWpm: 50,
      accuracy: 84.5
    };

    const res = checkCertificateEligibility(inaccurateSession);
    assert.equal(res.isEligible, false);
    assert.equal(res.checks.find(c => c.id === 'accuracy').passed, false);
  });

  it('approves legitimate standardized typing examination meeting all 4 criteria', () => {
    const validExam = {
      durationSeconds: 60,
      totalCharacters: 280,
      netWpm: 52.40,
      grossWpm: 54.00,
      accuracy: 97.50
    };

    const res = checkCertificateEligibility(validExam);
    assert.equal(res.isEligible, true);
    assert.equal(res.passedCount, 4);
    assert.equal(res.progressPercent, 100);
    assert.equal(res.tierBadge, 'Gold');
  });

  it('assigns prestigious Grandmaster tier for speeds >= 120 WPM', () => {
    const grandmasterExam = {
      durationSeconds: 60,
      totalCharacters: 680,
      netWpm: 132.50,
      accuracy: 99.20
    };

    const res = checkCertificateEligibility(grandmasterExam);
    assert.equal(res.isEligible, true);
    assert.equal(res.tierTitle, 'Grandmaster Typist');
    assert.equal(res.tierBadge, 'Grandmaster');
  });

  it('contains curated role presets and generates valid LinkedIn & social share URLs', async () => {
    const { CERTIFICATE_ROLES, getLinkedInCertificationUrl, getSocialShareUrls } = await import('../src/utils/certificateEligibility.js');

    assert.ok(Array.isArray(CERTIFICATE_ROLES));
    assert.ok(CERTIFICATE_ROLES.includes('Full-Stack Software Engineer'));
    assert.ok(CERTIFICATE_ROLES.includes('Touch-Typing Specialist'));

    const linkedInUrl = getLinkedInCertificationUrl({
      certId: 'CT-2026-LINKED1',
      recipientName: 'Saumy Pandey',
      wpm: 95.0,
      tierTitle: 'Master Typist',
      issueDate: '2026-11-24'
    });
    assert.ok(linkedInUrl.startsWith('https://www.linkedin.com/profile/add'));
    assert.ok(linkedInUrl.includes('CodeTyper'));
    assert.ok(linkedInUrl.includes('CT-2026-LINKED1'));

    const shares = getSocialShareUrls({
      certId: 'CT-2026-LINKED1',
      recipientName: 'Saumy Pandey',
      wpm: 95.0,
      accuracy: 99.0,
      tierTitle: 'Master Typist'
    });
    assert.ok(shares.twitter.includes('twitter.com'));
    assert.ok(shares.whatsapp.includes('whatsapp.com'));
    assert.ok(shares.telegram.includes('t.me'));
    assert.ok(shares.verifyUrl.includes('CT-2026-LINKED1'));
  });

  it('correctly locks all themes for a brand new user with 0 practice stats', () => {
    const res = evaluateThemeTiers({ wpm: 0, accuracy: 0, totalTests: 0, streak: 0 });
    assert.equal(res.unlockedThemeIds.length, 0);
    assert.equal(res.tiers['imperial-ivory'].isUnlocked, false);
    assert.equal(res.tiers['royal-obsidian'].isUnlocked, false);
    assert.equal(res.tiers['emerald-sovereign'].isUnlocked, false);
    assert.equal(res.tiers['midnight-platinum'].isUnlocked, false);
    assert.equal(res.tiers['imperial-ivory'].passedCount, 0);
  });

  it('progressively unlocks themes as user meets milestone tasks', () => {
    // 1. User passes Tier 1 (Imperial Ivory)
    const tier1User = {
      wpm: 42,
      accuracy: 94,
      totalTests: 6,
      duration: 60
    };
    const res1 = evaluateThemeTiers(tier1User);
    assert.ok(res1.tiers['imperial-ivory'].isUnlocked);
    assert.equal(res1.tiers['royal-obsidian'].isUnlocked, false); // needs 60 WPM & 3-day streak

    // 2. User passes Tier 2 (Royal Obsidian & 24K Gold)
    const tier2User = {
      wpm: 65,
      accuracy: 96,
      totalTests: 18,
      streak: 4
    };
    const res2 = evaluateThemeTiers(tier2User);
    assert.ok(res2.tiers['imperial-ivory'].isUnlocked);
    assert.ok(res2.tiers['royal-obsidian'].isUnlocked);
    assert.equal(res2.tiers['emerald-sovereign'].isUnlocked, false); // needs 75 WPM & 3 languages

    // 3. User passes Tier 3 (Emerald Sovereign)
    const tier3User = {
      wpm: 78,
      accuracy: 98,
      totalTests: 22,
      streak: 5,
      languagesCount: 4,
      totalChars: 2500
    };
    const res3 = evaluateThemeTiers(tier3User);
    assert.ok(res3.tiers['imperial-ivory'].isUnlocked);
    assert.ok(res3.tiers['royal-obsidian'].isUnlocked);
    assert.ok(res3.tiers['emerald-sovereign'].isUnlocked);
    assert.equal(res3.tiers['midnight-platinum'].isUnlocked, false); // needs 90 WPM & arena wins/high volume

    // 4. Apex User passes Tier 4 (Midnight Platinum)
    const apexUser = {
      wpm: 95,
      accuracy: 99,
      totalTests: 40,
      streak: 8,
      arenaWins: 5,
      languagesCount: 5,
      totalChars: 8000
    };
    const res4 = evaluateThemeTiers(apexUser);
    assert.ok(res4.tiers['imperial-ivory'].isUnlocked);
    assert.ok(res4.tiers['royal-obsidian'].isUnlocked);
    assert.ok(res4.tiers['emerald-sovereign'].isUnlocked);
    assert.ok(res4.tiers['midnight-platinum'].isUnlocked);
    assert.equal(res4.highestUnlockedThemeId, 'midnight-platinum');
  });

  it('strictly enforces the 20-level unlock progression and scaled exam durations across tiers', () => {
    // Assert tier configurations
    assert.equal(CERTIFICATE_THEME_TIERS['imperial-ivory'].unlockLevel, 20);
    assert.equal(CERTIFICATE_THEME_TIERS['imperial-ivory'].examDurationSeconds, 60);

    assert.equal(CERTIFICATE_THEME_TIERS['royal-obsidian'].unlockLevel, 40);
    assert.equal(CERTIFICATE_THEME_TIERS['royal-obsidian'].examDurationSeconds, 120);

    assert.equal(CERTIFICATE_THEME_TIERS['emerald-sovereign'].unlockLevel, 60);
    assert.equal(CERTIFICATE_THEME_TIERS['emerald-sovereign'].examDurationSeconds, 180);

    assert.equal(CERTIFICATE_THEME_TIERS['midnight-platinum'].unlockLevel, 80);
    assert.equal(CERTIFICATE_THEME_TIERS['midnight-platinum'].examDurationSeconds, 300);

    // If user has high WPM but level < 20, Tier 1 is NOT unlocked
    const underLevelUser = {
      level: 15,
      wpm: 100,
      accuracy: 99,
      totalTests: 10,
      duration: 60
    };
    const resUnder = evaluateThemeTiers(underLevelUser);
    assert.equal(resUnder.tiers['imperial-ivory'].isUnlocked, false);
    const levelTask = resUnder.tiers['imperial-ivory'].tasks.find(t => t.id === 'level_20');
    assert.equal(levelTask.passed, false);

    // At level 20, Tier 1 unlocks
    const lv20User = { ...underLevelUser, level: 20 };
    const res20 = evaluateThemeTiers(lv20User);
    assert.equal(res20.tiers['imperial-ivory'].isUnlocked, true);
    assert.equal(res20.tiers['royal-obsidian'].isUnlocked, false); // Requires Lv 40

    // At level 40 with 120s exam stats, Tier 2 unlocks
    const lv40User = {
      level: 40,
      wpm: 65,
      accuracy: 96,
      totalTests: 18,
      streak: 3,
      duration: 120
    };
    const res40 = evaluateThemeTiers(lv40User);
    assert.equal(res40.tiers['royal-obsidian'].isUnlocked, true);
    assert.equal(res40.tiers['emerald-sovereign'].isUnlocked, false); // Requires Lv 60

    // At level 60 with 180s syntax stats, Tier 3 unlocks
    const lv60User = {
      level: 60,
      wpm: 80,
      accuracy: 98,
      totalTests: 25,
      streak: 5,
      languagesCount: 3,
      duration: 180,
      totalChars: 3000
    };
    const res60 = evaluateThemeTiers(lv60User);
    assert.equal(res60.tiers['emerald-sovereign'].isUnlocked, true);
    assert.equal(res60.tiers['midnight-platinum'].isUnlocked, false); // Requires Lv 80

    // At level 80 with 300s marathon stats, Tier 4 unlocks
    const lv80User = {
      level: 80,
      wpm: 95,
      accuracy: 99,
      totalTests: 45,
      streak: 7,
      arenaWins: 3,
      languagesCount: 4,
      duration: 300,
      totalChars: 8000
    };
    const res80 = evaluateThemeTiers(lv80User);
    assert.equal(res80.tiers['midnight-platinum'].isUnlocked, true);
    assert.equal(res80.highestUnlockedThemeId, 'midnight-platinum');
  });
});
