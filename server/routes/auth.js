import { Router } from 'express';
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db.js';
import { authenticate, JWT_SECRET } from '../authMiddleware.js';
import { createRateLimiter } from '../rateLimiter.js';

const router = Router();

// Authentication rate limiters
const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many authentication attempts. Please take a pause and try again in 15 minutes.',
  skipSuccessful: true
});

const resetLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many password reset requests. Please wait a few minutes before trying again.'
});

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_REGEX = /^[a-zA-Z0-9_-]{3,24}$/;

router.post('/register', authLimiter, (req, res) => {
  const { full_name, username, email, password, confirm_password } = req.body;

  if (!full_name || !username || !email || !password || !confirm_password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  const trimmedEmail = email.trim().toLowerCase();
  const trimmedUsername = username.trim().toLowerCase();
  const trimmedName = full_name.trim();

  if (!EMAIL_REGEX.test(trimmedEmail)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  if (!USERNAME_REGEX.test(trimmedUsername)) {
    return res.status(400).json({ error: 'Username must be 3-24 characters (alphanumeric, underscores, hyphens).' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
  }

  if (password !== confirm_password) {
    return res.status(400).json({ error: 'Passwords do not match.' });
  }

  // Check existing user
  const existingEmail = db.prepare('SELECT id FROM users WHERE email = ?').get(trimmedEmail);
  if (existingEmail) {
    return res.status(409).json({ error: 'An account with this email already exists.' });
  }

  const existingUsername = db.prepare('SELECT id FROM users WHERE username = ?').get(trimmedUsername);
  if (existingUsername) {
    return res.status(409).json({ error: 'This username is already taken. Please choose another.' });
  }

  const salt = bcrypt.genSaltSync(10);
  const password_hash = bcrypt.hashSync(password, salt);

  const insertUser = db.prepare(`
    INSERT INTO users (email, username, full_name, password_hash, avatar_url, role)
    VALUES (?, ?, ?, ?, ?, 'user')
  `);

  const result = insertUser.run(
    trimmedEmail,
    trimmedUsername,
    trimmedName,
    password_hash,
    `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(trimmedUsername)}`
  );

  const userId = Number(result.lastInsertRowid);

  // Initialize settings & stats
  db.prepare('INSERT INTO user_settings (user_id) VALUES (?)').run(userId);
  db.prepare('INSERT INTO user_statistics (user_id, last_practice_date) VALUES (?, ?)').run(
    userId,
    new Date().toISOString().split('T')[0]
  );

  const user = {
    id: userId,
    email: trimmedEmail,
    username: trimmedUsername,
    full_name: trimmedName,
    avatar_url: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(trimmedUsername)}`,
    role: 'user'
  };

  const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  return res.status(201).json({
    message: 'Account created successfully.',
    user,
    token
  });
});

router.post('/login', authLimiter, (req, res) => {
  const { login, password, remember_me } = req.body;

  if (!login || !password) {
    return res.status(400).json({ error: 'Username/email and password are required.' });
  }

  const query = login.trim().toLowerCase();
  const user = db.prepare(`
    SELECT id, email, username, full_name, password_hash, avatar_url, role, bio, created_at
    FROM users
    WHERE LOWER(email) = ? OR LOWER(username) = ?
  `).get(query, query);

  if (!user) {
    return res.status(401).json({ error: 'Invalid username/email or password.' });
  }

  const isMatch = bcrypt.compareSync(password, user.password_hash);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid username/email or password.' });
  }

  const payload = {
    id: user.id,
    email: user.email,
    username: user.username,
    full_name: user.full_name,
    avatar_url: user.avatar_url,
    role: user.role
  };

  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn: remember_me ? '30d' : '7d'
  });

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: (remember_me ? 30 : 7) * 24 * 60 * 60 * 1000
  });

  const { password_hash, ...safeUser } = user;

  return res.json({
    message: 'Welcome back!',
    user: safeUser,
    token
  });
});

router.get('/me', authenticate, (req, res) => {
  const user = db.prepare(`
    SELECT id, email, username, full_name, avatar_url, role, bio, created_at
    FROM users WHERE id = ?
  `).get(req.user.id);

  if (!user) {
    return res.status(404).json({ error: 'User account not found.' });
  }

  const settings = db.prepare('SELECT * FROM user_settings WHERE user_id = ?').get(user.id);
  const statistics = db.prepare('SELECT * FROM user_statistics WHERE user_id = ?').get(user.id);

  return res.json({
    user,
    settings: settings || {},
    statistics: statistics || {}
  });
});

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  return res.json({ message: 'Logged out successfully.' });
});

router.post('/forgot-password', resetLimiter, (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  const trimmedEmail = email.trim().toLowerCase();
  const user = db.prepare('SELECT id, email FROM users WHERE LOWER(email) = ?').get(trimmedEmail);

  let devResetToken = null;

  if (user) {
    // Invalidate existing unused tokens for this user
    db.prepare('DELETE FROM password_resets WHERE user_id = ? AND used_at IS NULL').run(user.id);

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    db.prepare(`
      INSERT INTO password_resets (user_id, token_hash, expires_at)
      VALUES (?, ?, ?)
    `).run(user.id, tokenHash, expiresAt);

    if (process.env.NODE_ENV !== 'production') {
      devResetToken = rawToken;
    }
  }

  const response = {
    message: 'If an account exists with this email, a password reset link has been dispatched to your inbox.'
  };

  if (devResetToken) {
    response.devResetToken = devResetToken;
  }

  return res.json(response);
});

router.post('/reset-password', resetLimiter, (req, res) => {
  const { token, new_password, confirm_password } = req.body;

  if (!token || !new_password || !confirm_password) {
    return res.status(400).json({ error: 'Reset token and passwords are required.' });
  }

  if (new_password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
  }

  if (new_password !== confirm_password) {
    return res.status(400).json({ error: 'Passwords do not match.' });
  }

  const tokenHash = crypto.createHash('sha256').update(token.trim()).digest('hex');
  const resetRecord = db.prepare(`
    SELECT id, user_id, expires_at, used_at
    FROM password_resets
    WHERE token_hash = ?
  `).get(tokenHash);

  if (!resetRecord) {
    return res.status(400).json({ error: 'Invalid password reset token.' });
  }

  if (resetRecord.used_at) {
    return res.status(400).json({ error: 'This password reset token has already been used.' });
  }

  const now = new Date();
  if (new Date(resetRecord.expires_at) < now) {
    return res.status(400).json({ error: 'Password reset token has expired. Please request a new one.' });
  }

  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(new_password, salt);

  db.prepare('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(hash, resetRecord.user_id);
  db.prepare('UPDATE password_resets SET used_at = CURRENT_TIMESTAMP WHERE id = ?').run(resetRecord.id);
  db.prepare('DELETE FROM password_resets WHERE user_id = ? AND id != ?').run(resetRecord.user_id, resetRecord.id);

  return res.json({ message: 'Password has been reset successfully. You can now log in.' });
});

// --- Google OAuth 2.0 Flow ---
router.get('/google', (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId || clientId.trim() === '' || clientId.includes('your_google_client_id_here')) {
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.status(503).json({
        error: 'Google OAuth is not configured on the server yet. Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your .env file.'
      });
    }
    return res.redirect('/#login?error=google_not_configured');
  }

  const callbackUrl = process.env.GOOGLE_CALLBACK_URL || `${req.protocol}://${req.get('host')}/api/auth/google/callback`;
  const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  const options = new URLSearchParams({
    redirect_uri: callbackUrl,
    client_id: clientId,
    access_type: 'offline',
    response_type: 'code',
    prompt: 'consent',
    scope: 'openid email profile'
  });

  return res.redirect(`${rootUrl}?${options.toString()}`);
});

router.get('/google/callback', async (req, res) => {
  const { code, error } = req.query;

  if (error || !code) {
    return res.redirect('/#login?error=google_cancelled');
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const callbackUrl = process.env.GOOGLE_CALLBACK_URL || `${req.protocol}://${req.get('host')}/api/auth/google/callback`;

  if (!clientId || !clientSecret) {
    return res.status(500).json({ error: 'Google OAuth configuration missing on server.' });
  }

  try {
    // 1. Exchange authorization code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: callbackUrl,
        grant_type: 'authorization_code'
      })
    });

    const tokenData = await tokenResponse.json();
    if (!tokenData.access_token) {
      throw new Error(tokenData.error_description || 'Failed to exchange authorization code with Google.');
    }

    // 2. Fetch user profile from Google
    const userinfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });

    const googleUser = await userinfoResponse.json();
    if (!googleUser.email) {
      throw new Error('Google account email could not be retrieved.');
    }

    const email = googleUser.email.toLowerCase().trim();
    const fullName = googleUser.name || email.split('@')[0];
    const avatarUrl = googleUser.picture || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(email)}`;

    // 3. Find or create user in SQLite database
    let user = db.prepare('SELECT id, email, username, full_name, avatar_url, role FROM users WHERE LOWER(email) = ?').get(email);

    if (!user) {
      const baseUsername = email.split('@')[0].replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 16);
      let username = baseUsername.length >= 3 ? baseUsername : `user_${Date.now().toString().slice(-4)}`;
      const existingUser = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
      if (existingUser) {
        username = `${username}_${Date.now().toString().slice(-4)}`;
      }

      const randomPassword = crypto.randomBytes(24).toString('hex');
      const passwordHash = bcrypt.hashSync(randomPassword, 10);

      const insertResult = db.prepare(`
        INSERT INTO users (email, username, full_name, password_hash, avatar_url, role)
        VALUES (?, ?, ?, ?, ?, 'user')
      `).run(email, username, fullName, passwordHash, avatarUrl);

      const userId = Number(insertResult.lastInsertRowid);
      db.prepare('INSERT INTO user_settings (user_id) VALUES (?)').run(userId);
      db.prepare('INSERT INTO user_statistics (user_id, last_practice_date) VALUES (?, ?)').run(
        userId,
        new Date().toISOString().split('T')[0]
      );

      user = { id: userId, email, username, full_name: fullName, avatar_url: avatarUrl, role: 'user' };
    }

    // 4. Issue CodeTyper JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username, full_name: user.full_name, avatar_url: user.avatar_url, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    // 5. Secure HTML bridge to set localStorage and redirect to dashboard
    return res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authenticating...</title>
          <meta charset="utf-8" />
        </head>
        <body style="background:#FBFDF9;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;color:#2F6B52;">
          <div style="text-align:center;">
            <h3>Authentication successful! Entering your typing sanctuary...</h3>
            <script>
              localStorage.setItem('codetyper_token', '${token}');
              window.location.href = '/#dashboard';
            </script>
          </div>
        </body>
      </html>
    `);
  } catch (err) {
    console.error('[Google OAuth Error]', err);
    return res.redirect('/#login?error=' + encodeURIComponent(err.message || 'Google authentication failed.'));
  }
});

export default router;

