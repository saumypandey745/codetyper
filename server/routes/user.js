import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db.js';
import { authenticate } from '../authMiddleware.js';
import { createRateLimiter } from '../rateLimiter.js';

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

// Change password
router.post('/change-password', authenticate, changePasswordLimiter, (req, res) => {
  const { current_password, new_password, confirm_password } = req.body;
  const userId = req.user.id;

  if (!current_password || !new_password || !confirm_password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  if (new_password.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters long.' });
  }

  if (new_password !== confirm_password) {
    return res.status(400).json({ error: 'New passwords do not match.' });
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
