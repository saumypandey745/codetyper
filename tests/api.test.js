process.env.NODE_ENV = 'test';
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { app } from '../server/index.js';

let server;
let baseUrl;
let demoToken = '';
let testUserToken = '';

describe('CodeTyper API Integration Suite', () => {
  before(async () => {
    await new Promise((resolve) => {
      server = http.createServer(app).listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });
  });

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it('GET /api/health returns 200 and healthy status', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.status, 'healthy');
    assert.ok(data.uptime !== undefined);
  });

  it('POST /api/auth/login logs in seeded Saumy admin account via username', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        login: 'saumypandey',
        password: 'Saumy_2026!'
      })
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.token, 'Token must be returned');
    assert.equal(data.user.email, 'saumypandey745@gmail.com');
    assert.equal(data.user.username, 'saumypandey');
    demoToken = data.token;
  });

  it('POST /api/auth/login logs in seeded Saumy admin account', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        login: 'saumypandey745@gmail.com',
        password: 'Saumy_2026!'
      })
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.token, 'Token must be returned');
    assert.equal(data.user.email, 'saumypandey745@gmail.com');
    assert.equal(data.user.role, 'admin');
  });

  it('verifies complete forgot-password and reset flow with 6-digit OTP', async () => {
    const resetTestEmail = `otp_suite_test_${Date.now()}@codetyper.test`;
    const regRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: 'OTP Integration Typist',
        username: `otp_test_${Date.now().toString().slice(-6)}`,
        email: resetTestEmail,
        password: 'InitialPassword123!',
        confirm_password: 'InitialPassword123!'
      })
    });
    assert.equal(regRes.status, 201);

    // 1. Request password reset
    const forgotRes = await fetch(`${baseUrl}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: resetTestEmail })
    });
    assert.equal(forgotRes.status, 200);
    const forgotData = await forgotRes.json();
    assert.ok(forgotData.devResetToken, 'Token must be generated and returned in fallback mode');
    assert.ok(forgotData.devOtp, '6-digit OTP must be generated');
    assert.match(forgotData.devOtp, /^\d{6}$/, 'OTP must be 6 digits');

    // 2. Perform reset using 6-digit OTP
    const resetRes = await fetch(`${baseUrl}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: forgotData.devOtp,
        new_password: 'NewResetPassword123!',
        confirm_password: 'NewResetPassword123!'
      })
    });
    assert.equal(resetRes.status, 200);
  });

  it('GET /api/auth/me returns authenticated user details', async () => {
    const res = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${demoToken}` }
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.user.email, 'saumypandey745@gmail.com');
    assert.ok(data.settings, 'User settings must be returned');
    assert.ok(data.statistics, 'User stats must be returned');
  });

  it('POST /api/auth/register creates a new user account with default settings and stats', async () => {
    const testEmail = `typist_${Date.now()}@codetyper.test`;
    const testUsername = `typist_${Date.now().toString().slice(-6)}`;
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: 'Test Typist',
        username: testUsername,
        email: testEmail,
        password: 'TestPassword123!',
        confirm_password: 'TestPassword123!'
      })
    });
    assert.equal(res.status, 201);
    const data = await res.json();
    assert.ok(data.token);
    assert.equal(data.user.email, testEmail);
    testUserToken = data.token;
  });

  it('GET /api/practice/content returns English and Code snippets with filtering', async () => {
    // English content
    const engRes = await fetch(`${baseUrl}/api/practice/content?type=english&difficulty=beginner`);
    assert.equal(engRes.status, 200);
    const engData = await engRes.json();
    assert.ok(engData.item, 'Should return practice item');
    assert.equal(engData.item.is_code, 0);

    // Code content (e.g. JavaScript)
    const codeRes = await fetch(`${baseUrl}/api/practice/content?type=code&language=JavaScript`);
    assert.equal(codeRes.status, 200);
    const codeData = await codeRes.json();
    assert.ok(codeData.item, 'Should return code item');
    assert.equal(codeData.item.is_code, 1);
    assert.equal(codeData.item.language.toLowerCase(), 'javascript');
  });

  it('GET /api/practice/languages returns active coding languages and snippet counts', async () => {
    const res = await fetch(`${baseUrl}/api/practice/languages`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data.languages));
    assert.ok(data.languages.length >= 5);
  });

  it('POST /api/sessions/save persists completed session and updates statistics', async () => {
    const sessionPayload = {
      practice_type: 'practice',
      language: 'JavaScript',
      difficulty: 'intermediate',
      duration_seconds: 60,
      gross_wpm: 72.5,
      net_wpm: 70.0,
      accuracy: 98.2,
      total_characters: 360,
      correct_characters: 350,
      incorrect_characters: 10,
      error_count: 3,
      raw_timeline_json: [{ second: 1, wpm: 60, rawWpm: 65, accuracy: 100 }]
    };

    const res = await fetch(`${baseUrl}/api/sessions/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testUserToken}`
      },
      body: JSON.stringify(sessionPayload)
    });

    assert.equal(res.status, 201);
    const data = await res.json();
    assert.ok(data.sessionId, 'Session ID must be returned');
    assert.ok(data.statistics, 'Updated stats must be returned');
    assert.ok(data.statistics.total_tests >= 1);
  });

  it('PUT /api/user/settings updates typing preferences', async () => {
    const res = await fetch(`${baseUrl}/api/user/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testUserToken}`
      },
      body: JSON.stringify({
        font_size: 'large',
        sound_enabled: true,
        sound_theme: 'typewriter'
      })
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.settings.font_size, 'large');
    assert.equal(data.settings.sound_theme, 'typewriter');
  });

  it('GET /api/admin/stats permits admin user and blocks standard user', async () => {
    // Attempt with regular test user -> should return 403 Forbidden
    const unauthRes = await fetch(`${baseUrl}/api/admin/stats`, {
      headers: { Authorization: `Bearer ${testUserToken}` }
    });
    assert.equal(unauthRes.status, 403);

    // Admin login
    const adminLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        login: 'saumypandey745@gmail.com',
        password: 'Saumy_2026!'
      })
    });
    const adminData = await adminLoginRes.json();
    assert.ok(adminData.token);

    // Attempt with admin user -> should succeed
    const adminRes = await fetch(`${baseUrl}/api/admin/stats`, {
      headers: { Authorization: `Bearer ${adminData.token}` }
    });
    assert.equal(adminRes.status, 200);
    const metrics = await adminRes.json();
    assert.ok(metrics.users >= 2);
    assert.ok(metrics.contentItems >= 30);

    // 1. Test Bulk Content Import
    const bulkImportRes = await fetch(`${baseUrl}/api/admin/content/bulk-import`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminData.token}`
      },
      body: JSON.stringify({
        items: [
          {
            title: 'Test Bulk Snippet 1',
            is_code: 1,
            language: 'Python',
            category: 'Algorithms',
            difficulty: 'beginner',
            content: 'print("Testing bulk import admin feature")'
          }
        ]
      })
    });
    assert.equal(bulkImportRes.status, 200);
    const bulkData = await bulkImportRes.json();
    assert.equal(bulkData.importedCount, 1);

    // 2. Test System Settings & Global Announcement
    const settingsUpdateRes = await fetch(`${baseUrl}/api/admin/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminData.token}`
      },
      body: JSON.stringify({
        announcement_text: 'Admin governance features successfully verified.',
        announcement_type: 'announcement',
        announcement_enabled: '1'
      })
    });
    assert.equal(settingsUpdateRes.status, 200);

    // Verify public announcement endpoint returns the banner
    const publicBannerRes = await fetch(`${baseUrl}/api/system/announcement`);
    assert.equal(publicBannerRes.status, 200);
    const bannerData = await publicBannerRes.json();
    assert.equal(bannerData.enabled, true);
    assert.equal(bannerData.text, 'Admin governance features successfully verified.');
    assert.equal(bannerData.type, 'announcement');

    // Verify SSE real-time stream delivers the announcement immediately
    const sseRes = await fetch(`${baseUrl}/api/system/announcement/stream`);
    assert.equal(sseRes.status, 200);
    assert.equal(sseRes.headers.get('content-type'), 'text/event-stream');
    const reader = sseRes.body.getReader();
    const { value } = await reader.read();
    const streamText = new TextDecoder().decode(value);
    assert.ok(streamText.includes('data:'));
    assert.ok(streamText.includes('Admin governance features successfully verified.'));
    reader.cancel();

    // 3. Test Audit Logs retrieval
    const auditRes = await fetch(`${baseUrl}/api/admin/audit-logs`, {
      headers: { Authorization: `Bearer ${adminData.token}` }
    });
    assert.equal(auditRes.status, 200);
    const auditData = await auditRes.json();
    assert.ok(Array.isArray(auditData.logs));
    assert.ok(auditData.logs.some(l => l.action === 'UPDATE_SYSTEM_SETTINGS'));
    assert.ok(auditData.logs.some(l => l.action === 'BULK_IMPORT_CONTENT'));
  });

  it('GET /api/sessions/leaderboard returns ranked typists and tier badges', async () => {
    const res = await fetch(`${baseUrl}/api/sessions/leaderboard?period=all_time&limit=20`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data.leaderboard));
    assert.ok(data.leaderboard.length > 0);
    assert.equal(data.leaderboard[0].rank, 1);
    assert.ok(data.leaderboard[0].best_wpm > 0);
    assert.ok(data.leaderboard[0].tier);
    assert.ok(data.leaderboard[0].tierIcon);
  });

  it('POST /api/certificate/issue and GET /api/certificate/verify/:certId verifies accredited credentials', async () => {
    const testCertId = 'CT-2026-TEST99';
    const issueRes = await fetch(`${baseUrl}/api/certificate/issue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testUserToken}`
      },
      body: JSON.stringify({
        certId: testCertId,
        recipientName: 'Test Typist',
        titleRole: 'Full-Stack Software Engineer',
        discipline: 'Python & Algorithms',
        netWpm: 88.5,
        grossWpm: 92.0,
        accuracy: 99.1,
        durationSeconds: 60,
        totalCharacters: 450,
        tierTitle: 'Master Typist',
        tierBadge: 'Diamond',
        tierGrade: 'Grade A+ Distinguished',
        theme: 'royal-obsidian'
      })
    });

    assert.equal(issueRes.status, 200);
    const issueData = await issueRes.json();
    assert.equal(issueData.success, true);
    assert.equal(issueData.certId, testCertId);
    assert.ok(issueData.sha256Fingerprint);

    // Verify publicly without authentication
    const verifyRes = await fetch(`${baseUrl}/api/certificate/verify/${testCertId}`);
    assert.equal(verifyRes.status, 200);
    const verifyData = await verifyRes.json();
    assert.equal(verifyData.verified, true);
    assert.equal(verifyData.certificate.certId, testCertId);
    assert.equal(verifyData.certificate.recipientName, 'Test Typist');
    assert.equal(verifyData.certificate.titleRole, 'Full-Stack Software Engineer');
    assert.equal(verifyData.certificate.signatoryName, 'Saumy Pandey');
    assert.equal(verifyData.certificate.signatoryTitle, 'App Owner & Creator • Founder, CodeTyper');
    assert.equal(verifyData.certificate.netWpm, 88.5);
    assert.equal(verifyData.certificate.biometricVerified, true);
  });

  it('GET /api/auth/google/client-id returns Google Client ID configuration', async () => {
    const res = await fetch(`${baseUrl}/api/auth/google/client-id`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(typeof data.clientId === 'string');
  });

  it('POST /api/auth/google/one-tap rejects request without credential token', async () => {
    const res = await fetch(`${baseUrl}/api/auth/google/one-tap`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    assert.equal(res.status, 400);
    const data = await res.json();
    assert.ok(data.error.includes('credential'));
  });

  it('POST /api/auth/google/one-tap rejects request with invalid token', async () => {
    const res = await fetch(`${baseUrl}/api/auth/google/one-tap`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: 'invalid_token_123' })
    });
    assert.equal(res.status, 401);
    const data = await res.json();
    assert.ok(data.error);
  });

  it('POST /api/auth/continue-as logs in user directly with valid email', async () => {
    const res = await fetch(`${baseUrl}/api/auth/continue-as`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'saumypandey745@gmail.com' })
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.user.email, 'saumypandey745@gmail.com');
    assert.ok(typeof data.token === 'string');
  });

  it('POST /api/auth/continue-as rejects request without email', async () => {
    const res = await fetch(`${baseUrl}/api/auth/continue-as`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    assert.equal(res.status, 400);
  });

  it('POST /api/auth/continue-as returns 404 for non-existent email', async () => {
    const res = await fetch(`${baseUrl}/api/auth/continue-as`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nonexistent_user_9999@test.com' })
    });
    assert.equal(res.status, 404);
  });
});
