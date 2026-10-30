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

  it('POST /api/auth/login logs in seeded demo user', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        login: 'demo@codetyper.dev',
        password: 'Peaceful_Demo_2026'
      })
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.token, 'Token must be returned');
    assert.equal(data.user.email, 'demo@codetyper.dev');
    assert.equal(data.user.username, 'sarah_coder');
    demoToken = data.token;
  });

  it('GET /api/auth/me returns authenticated user details', async () => {
    const res = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${demoToken}` }
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.user.email, 'demo@codetyper.dev');
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
        login: 'admin@codetyper.dev',
        password: 'Peaceful_Admin_2026'
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
  });
});
