import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { app } from '../server/index.js';
import { db } from '../server/db.js';
import { getJwtSecret } from '../server/authMiddleware.js';

let server;
let baseUrl;

describe('Security Hardening Suite (P0 & P1)', () => {
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

  // --- Password Reset Hardening Tests ---
  it('POST /api/auth/forgot-password does not leak whether an email exists', async () => {
    const res = await fetch(`${baseUrl}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nonexistent_random_user_999@codetyper.dev' })
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(
      data.message,
      'If an account exists with this email, a password reset link has been dispatched to your inbox.'
    );
    assert.equal(data.devResetToken, undefined, 'Must not return token for non-existent account');
  });

  it('POST /api/auth/forgot-password generates single-use token for existing user in non-production', async () => {
    const res = await fetch(`${baseUrl}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'demo@codetyper.dev' })
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.devResetToken, 'Development reset token should be returned in non-production mode');
    assert.equal(data.devResetToken.length, 64, 'Token must be 64 hex characters (32 random bytes)');
  });

  it('POST /api/auth/reset-password rejects invalid token', async () => {
    const res = await fetch(`${baseUrl}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: 'invalid_bogus_token_1234567890abcdef1234567890abcdef',
        new_password: 'NewSecurePassword123!',
        confirm_password: 'NewSecurePassword123!'
      })
    });
    assert.equal(res.status, 400);
    const data = await res.json();
    assert.equal(data.error, 'Invalid password reset token.');
  });

  it('POST /api/auth/reset-password rejects expired token', async () => {
    // Manually insert an expired token into database for test user
    const expiredToken = 'expired_test_token_abcdef1234567890abcdef1234567890';
    const crypto = await import('node:crypto');
    const tokenHash = crypto.createHash('sha256').update(expiredToken).digest('hex');
    const pastDate = new Date(Date.now() - 30 * 60 * 1000).toISOString();

    const user = db.prepare('SELECT id FROM users WHERE email = ?').get('demo@codetyper.dev');
    db.prepare(`
      INSERT INTO password_resets (user_id, token_hash, expires_at)
      VALUES (?, ?, ?)
    `).run(user.id, tokenHash, pastDate);

    const res = await fetch(`${baseUrl}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: expiredToken,
        new_password: 'NewSecurePassword123!',
        confirm_password: 'NewSecurePassword123!'
      })
    });
    assert.equal(res.status, 400);
    const data = await res.json();
    assert.equal(data.error, 'Password reset token has expired. Please request a new one.');
  });

  it('POST /api/auth/reset-password succeeds with valid token and prevents reuse', async () => {
    // Register an isolated user for reset verification
    const resetTestEmail = `reset_target_${Date.now()}@codetyper.test`;
    const regRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: 'Reset Target User',
        username: `target_${Date.now().toString().slice(-6)}`,
        email: resetTestEmail,
        password: 'InitialPassword123!',
        confirm_password: 'InitialPassword123!'
      })
    });
    assert.equal(regRes.status, 201);

    // 1. Request new token
    const reqRes = await fetch(`${baseUrl}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: resetTestEmail })
    });
    const { devResetToken } = await reqRes.json();
    assert.ok(devResetToken);

    // 2. Perform reset
    const resetRes = await fetch(`${baseUrl}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: devResetToken,
        new_password: 'BrandNewPassword123!',
        confirm_password: 'BrandNewPassword123!'
      })
    });
    assert.equal(resetRes.status, 200);
    const resetData = await resetRes.json();
    assert.equal(resetData.message, 'Password has been reset successfully. You can now log in.');

    // 3. Attempt to reuse the same token -> must fail with 400
    const reuseRes = await fetch(`${baseUrl}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: devResetToken,
        new_password: 'AnotherPassword123!',
        confirm_password: 'AnotherPassword123!'
      })
    });
    assert.equal(reuseRes.status, 400);

    // 4. Verify login with the new password works
    const loginNewRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        login: resetTestEmail,
        password: 'BrandNewPassword123!'
      })
    });
    assert.equal(loginNewRes.status, 200);

    // 5. Verify login with old password fails with 401
    const loginOldRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        login: resetTestEmail,
        password: 'InitialPassword123!'
      })
    });
    assert.equal(loginOldRes.status, 401);
  });

  // --- CORS Whitelist Tests ---
  it('CORS permits trusted origin with credentials', async () => {
    const res = await fetch(`${baseUrl}/api/health`, {
      headers: { Origin: 'http://localhost:5173' }
    });
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('access-control-allow-origin'), 'http://localhost:5173');
    assert.equal(res.headers.get('access-control-allow-credentials'), 'true');
  });

  it('CORS blocks untrusted origin with 403 Forbidden', async () => {
    const res = await fetch(`${baseUrl}/api/health`, {
      headers: { Origin: 'https://malicious-attacker-site.com' }
    });
    assert.equal(res.status, 403);
    const data = await res.json();
    assert.ok(data.error.includes('Cross-Origin Request Blocked'));
  });

  it('CORS permits requests with no Origin header (e.g. mobile/same-origin)', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.equal(res.status, 200);
  });

  // --- Production JWT Secret Strict Validation ---
  it('JWT secret validator throws in production if secret is missing or too short', () => {
    const originalEnv = process.env.NODE_ENV;
    const originalSecret = process.env.JWT_SECRET;
    try {
      process.env.NODE_ENV = 'production';
      delete process.env.JWT_SECRET;
      assert.throws(() => getJwtSecret(), /FATAL SECURITY ERROR/);

      process.env.JWT_SECRET = 'too_short';
      assert.throws(() => getJwtSecret(), /at least 32 characters/);
    } finally {
      process.env.NODE_ENV = originalEnv;
      if (originalSecret) process.env.JWT_SECRET = originalSecret;
    }
  });

  // --- Security Headers Verification ---
  it('Response headers include X-Content-Type-Options, X-Frame-Options, and CSP', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(res.headers.get('x-frame-options'), 'SAMEORIGIN');
    assert.equal(res.headers.get('referrer-policy'), 'strict-origin-when-cross-origin');
    assert.ok(res.headers.get('content-security-policy'));
  });

  // --- Avatar URL Security Validation ---
  it('PUT /api/user/profile rejects unsafe avatar URLs', async () => {
    // Login to get token
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login: 'demo@codetyper.dev', password: 'Peaceful_Demo_2026' })
    });
    const { token } = await loginRes.json();

    // 1. Attempt javascript: protocol
    const jsRes = await fetch(`${baseUrl}/api/user/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        full_name: 'Sarah Jenkins',
        username: 'sarah_coder',
        avatar_url: 'javascript:alert(1)'
      })
    });
    assert.equal(jsRes.status, 400);

    // 2. Attempt valid https:// protocol
    const validRes = await fetch(`${baseUrl}/api/user/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        full_name: 'Sarah Jenkins',
        username: 'sarah_coder',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb'
      })
    });
    assert.equal(validRes.status, 200);
  });

  // --- Live Rate Limiting Protection ---
  it('Authentication rate limiter triggers 429 when failed login attempts exceed limit', async () => {
    let lastStatus = 200;
    const testIp = '198.51.100.99';
    for (let i = 0; i < 11; i++) {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Forwarded-For': testIp
        },
        body: JSON.stringify({ login: 'attacker@evil.com', password: 'WrongPassword!' })
      });
      lastStatus = res.status;
    }
    assert.equal(lastStatus, 429, '11th attempt must be blocked with HTTP 429 Too Many Requests');
  });
});

