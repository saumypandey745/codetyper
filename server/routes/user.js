import { Router } from 'express';
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { db } from '../db.js';
import { authenticate } from '../authMiddleware.js';
import { createRateLimiter } from '../rateLimiter.js';
import { sendPasswordResetEmail } from '../mailer.js';

const router = Router();

const changePasswordLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many password modification attempts. Please wait 15 minutes before retrying.'
});

// Update profile details
router.put('/profile', authenticate, (req, res) => {
  const { full_name, username, bio, avatar_url } = req.body;
  const userId = req.user.id;

  if (!full_name || !username) {
    return res.status(400).json({ error: 'Name and username are required.' });
  }

  const trimmedUsername = username.trim().toLowerCase();

  // Validate avatar URL if provided
  if (avatar_url && avatar_url.trim()) {
    const trimmedAvatar = avatar_url.trim();
    if (!trimmedAvatar.startsWith('https://') && !trimmedAvatar.startsWith('http://')) {
      return res.status(400).json({ error: 'Avatar must be a valid secure web URL (starting with https://).' });
    }
    if (trimmedAvatar.toLowerCase().includes('javascript:') || trimmedAvatar.toLowerCase().includes('data:')) {
      return res.status(400).json({ error: 'Unsafe avatar URL protocol specified.' });
    }
  }

  // Check username uniqueness if changing
  const existing = db.prepare('SELECT id FROM users WHERE username = ? AND id != ?').get(trimmedUsername, userId);
  if (existing) {
    return res.status(409).json({ error: 'Username is already taken by another account.' });
  }

  db.prepare(`
    UPDATE users
    SET full_name = ?, username = ?, bio = ?, avatar_url = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(full_name.trim(), trimmedUsername, bio || '', avatar_url ? avatar_url.trim() : '', userId);

  const updatedUser = db.prepare(`
    SELECT id, email, username, full_name, avatar_url, role, bio, created_at
    FROM users WHERE id = ?
  `).get(userId);

  return res.json({ message: 'Profile updated successfully.', user: updatedUser });
});

// Update settings
router.put('/settings', authenticate, (req, res) => {
  const userId = req.user.id;
  const s = req.body;

  db.prepare(`
    UPDATE user_settings
    SET theme = COALESCE(?, theme),
        font_family = COALESCE(?, font_family),
        font_size = COALESCE(?, font_size),
        cursor_style = COALESCE(?, cursor_style),
        sound_enabled = COALESCE(?, sound_enabled),
        sound_theme = COALESCE(?, sound_theme),
        volume = COALESCE(?, volume),
        show_wpm = COALESCE(?, show_wpm),
        show_accuracy = COALESCE(?, show_accuracy),
        show_errors = COALESCE(?, show_errors),
        highlight_mistakes = COALESCE(?, highlight_mistakes),
        smooth_scrolling = COALESCE(?, smooth_scrolling),
        default_duration = COALESCE(?, default_duration),
        default_difficulty = COALESCE(?, default_difficulty),
        auto_start = COALESCE(?, auto_start),
        countdown_enabled = COALESCE(?, countdown_enabled),
        public_profile = COALESCE(?, public_profile),
        save_history = COALESCE(?, save_history),
        reduced_motion = COALESCE(?, reduced_motion),
        high_contrast = COALESCE(?, high_contrast),
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = ?
  `).run(
    s.theme !== undefined ? s.theme : null,
    s.font_family !== undefined ? s.font_family : null,
    s.font_size !== undefined ? s.font_size : null,
    s.cursor_style !== undefined ? s.cursor_style : null,
    s.sound_enabled !== undefined ? (s.sound_enabled ? 1 : 0) : null,
    s.sound_theme !== undefined ? s.sound_theme : null,
    s.volume !== undefined ? Number(s.volume) : null,
    s.show_wpm !== undefined ? (s.show_wpm ? 1 : 0) : null,
    s.show_accuracy !== undefined ? (s.show_accuracy ? 1 : 0) : null,
    s.show_errors !== undefined ? (s.show_errors ? 1 : 0) : null,
    s.highlight_mistakes !== undefined ? (s.highlight_mistakes ? 1 : 0) : null,
    s.smooth_scrolling !== undefined ? (s.smooth_scrolling ? 1 : 0) : null,
    s.default_duration !== undefined ? Number(s.default_duration) : null,
    s.default_difficulty !== undefined ? s.default_difficulty : null,
    s.auto_start !== undefined ? (s.auto_start ? 1 : 0) : null,
    s.countdown_enabled !== undefined ? (s.countdown_enabled ? 1 : 0) : null,
    s.public_profile !== undefined ? (s.public_profile ? 1 : 0) : null,
    s.save_history !== undefined ? (s.save_history ? 1 : 0) : null,
    s.reduced_motion !== undefined ? (s.reduced_motion ? 1 : 0) : null,
    s.high_contrast !== undefined ? (s.high_contrast ? 1 : 0) : null,
    userId
  );

  const updatedSettings = db.prepare('SELECT * FROM user_settings WHERE user_id = ?').get(userId);
  return res.json({ message: 'Settings saved.', settings: updatedSettings });
});

// Request password reset OTP for logged-in user
router.post('/send-reset-otp', authenticate, async (req, res) => {
  const user = db.prepare('SELECT id, email FROM users WHERE id = ?').get(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User account not found.' });
  }

  // 60-second cooldown check to avoid flooding inbox
  if (process.env.NODE_ENV !== 'test') {
    const recentReset = db.prepare(`
      SELECT created_at FROM password_resets 
      WHERE user_id = ? 
      ORDER BY id DESC LIMIT 1
    `).get(user.id);

    if (recentReset && recentReset.created_at) {
      const createdTime = new Date(recentReset.created_at.replace(' ', 'T') + 'Z').getTime();
      const elapsedSeconds = (Date.now() - createdTime) / 1000;
      if (elapsedSeconds < 60) {
        const waitTime = Math.ceil(60 - elapsedSeconds);
        return res.status(429).json({
          error: `An OTP was already sent to your email. Please wait ${waitTime}s before requesting a new code.`,
          retryAfter: waitTime
        });
      }
    }
  }

  // Invalidate previous unused tokens for this user
  db.prepare('DELETE FROM password_resets WHERE user_id = ? AND used_at IS NULL').run(user.id);

  const otpCode = crypto.randomInt(100000, 1000000).toString();
  const otpHash = crypto.createHash('sha256').update(otpCode).digest('hex');
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

  const insertResetStmt = db.prepare(`
    INSERT INTO password_resets (user_id, token_hash, expires_at)
    VALUES (?, ?, ?)
  `);
  insertResetStmt.run(user.id, tokenHash, expiresAt);
  insertResetStmt.run(user.id, otpHash, expiresAt);

  const origin = req.get('origin') || (req.protocol + '://' + req.get('host'));
  await sendPasswordResetEmail({
    toEmail: user.email,
    resetToken: rawToken,
    otpCode,
    origin
  });

  const response = {
    message: `A 6-digit OTP has been sent to ${user.email}. It is valid for 15 minutes.`
  };
  if (process.env.NODE_ENV !== 'production') {
    response.devOtp = otpCode;
  }
  return res.json(response);
});

// Change password (supports current password OR verified 6-digit OTP)
router.post('/change-password', authenticate, changePasswordLimiter, (req, res) => {
  const current_password = req.body.current_password || req.body.currentPassword;
  const new_password = req.body.new_password || req.body.newPassword;
  const confirm_password = req.body.confirm_password || req.body.confirmPassword || new_password;
  const otp_code = req.body.otp_code || req.body.otpCode || req.body.token;
  const userId = req.user.id;

  if (!new_password) {
    return res.status(400).json({ error: 'New password is required.' });
  }

  if (new_password.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters long.' });
  }

  if (new_password !== confirm_password) {
    return res.status(400).json({ error: 'New passwords do not match.' });
  }

  // Method 1: Verify using 6-digit OTP (for logged-in user who forgot current password)
  if (otp_code) {
    const tokenHash = crypto.createHash('sha256').update(otp_code.trim()).digest('hex');
    const resetRecord = db.prepare(`
      SELECT id, user_id, expires_at, used_at
      FROM password_resets
      WHERE token_hash = ? AND user_id = ?
    `).get(tokenHash, userId);

    if (!resetRecord) {
      return res.status(400).json({ error: 'Invalid or incorrect OTP code.' });
    }
    if (resetRecord.used_at) {
      return res.status(400).json({ error: 'This OTP has already been used.' });
    }
    if (new Date(resetRecord.expires_at) < new Date()) {
      return res.status(400).json({ error: 'This OTP has expired. Please request a new one.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(new_password, salt);

    db.prepare('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(hash, userId);
    db.prepare('UPDATE password_resets SET used_at = CURRENT_TIMESTAMP WHERE user_id = ?').run(userId);
    db.prepare('DELETE FROM password_resets WHERE user_id = ? AND id != ?').run(userId, resetRecord.id);

    return res.json({ message: 'Password updated successfully via OTP.' });
  }

  // Method 2: Verify using existing current password
  if (!current_password) {
    return res.status(400).json({ error: 'Current password or OTP code is required.' });
  }

  const user = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(userId);
  if (!user || !bcrypt.compareSync(current_password, user.password_hash)) {
    return res.status(400).json({ error: 'Current password is incorrect.' });
  }

  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(new_password, salt);

  db.prepare('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(hash, userId);
  return res.json({ message: 'Password changed successfully.' });
});

// Delete account
router.delete('/account', authenticate, (req, res) => {
  const userId = req.user.id;
  db.prepare('DELETE FROM users WHERE id = ?').run(userId);
  res.clearCookie('token');
  return res.json({ message: 'Account deleted permanently.' });
});

export default router;
