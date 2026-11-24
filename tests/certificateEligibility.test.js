import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { checkCertificateEligibility, CERTIFICATE_REQUIREMENTS } from '../src/utils/certificateEligibility.js';

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
});
