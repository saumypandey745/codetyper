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
});
