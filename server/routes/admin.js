import { Router } from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import { db, logAdminAudit } from '../db.js';
import { authenticate, requireAdmin } from '../authMiddleware.js';
import { announcementBroadcaster } from '../announcements.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = Router();

// Protect all admin routes
router.use(authenticate, requireAdmin);

// ==========================================
// 1. Platform Statistics & Security Summary
// ==========================================
router.get('/stats', (req, res) => {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  const bannedCount = db.prepare('SELECT COUNT(*) as count FROM users WHERE is_banned = 1').get().count;
  const sessionCount = db.prepare('SELECT COUNT(*) as count FROM typing_sessions').get().count;
  const disqualifiedCount = db.prepare('SELECT COUNT(*) as count FROM typing_sessions WHERE is_disqualified = 1').get().count;
  const flaggedCount = db.prepare('SELECT COUNT(*) as count FROM typing_sessions WHERE is_flagged = 1').get().count;
  const contentCount = db.prepare('SELECT COUNT(*) as count FROM practice_content').get().count;
  const totalSeconds = db.prepare('SELECT SUM(duration_seconds) as total FROM typing_sessions WHERE COALESCE(is_disqualified, 0) = 0').get().total || 0;
  const auditCount = db.prepare('SELECT COUNT(*) as count FROM admin_audit_logs').get().count;

  return res.json({
    users: userCount,
    bannedUsers: bannedCount,
    sessions: sessionCount,
    disqualifiedSessions: disqualifiedCount,
    flaggedSessions: flaggedCount,
    contentItems: contentCount,
    totalPracticeHours: Number((totalSeconds / 3600).toFixed(1)),
    auditLogCount: auditCount
  });
});

router.get('/security-summary', (req, res) => {
  const bannedUsers = db.prepare('SELECT COUNT(*) as count FROM users WHERE is_banned = 1').get().count;
  const shadowbannedUsers = db.prepare('SELECT COUNT(*) as count FROM users WHERE shadowbanned = 1').get().count;
  const flaggedScores = db.prepare('SELECT COUNT(*) as count FROM typing_sessions WHERE is_flagged = 1').get().count;
  const disqualifiedScores = db.prepare('SELECT COUNT(*) as count FROM typing_sessions WHERE is_disqualified = 1').get().count;
  const recentAudits = db.prepare('SELECT * FROM admin_audit_logs ORDER BY created_at DESC LIMIT 10').all();

  return res.json({
    bannedUsers,
    shadowbannedUsers,
    flaggedScores,
    disqualifiedScores,
    recentAudits
  });
});

// ==========================================
// 2. Practice Content Management (CRUD, Bulk Import, Export)
// ==========================================
router.get('/content', (req, res) => {
  const { is_code, search, limit = 50, offset = 0 } = req.query;
  let sql = 'SELECT * FROM practice_content WHERE 1=1';
  const params = [];

  if (is_code !== undefined && is_code !== '') {
    sql += ' AND is_code = ?';
    params.push(Number(is_code));
  }

  if (search) {
    sql += ' AND (title LIKE ? OR category LIKE ? OR language LIKE ?)';
    const query = `%${search}%`;
    params.push(query, query, query);
  }

  sql += ' ORDER BY id DESC LIMIT ? OFFSET ?';
  params.push(Number(limit), Number(offset));

  const items = db.prepare(sql).all(...params);
  return res.json({ items });
});

router.post('/content', (req, res) => {
  const { category, subcategory, difficulty, title, content, is_code, language, is_published = 1 } = req.body;

  if (!category || !difficulty || !title || !content) {
    return res.status(400).json({ error: 'Title, category, difficulty, and content are required.' });
  }

  const words = content.trim().split(/\s+/).length;
  const chars = content.length;

  const result = db.prepare(`
    INSERT INTO practice_content (category, subcategory, difficulty, title, content, word_count, char_count, is_code, language, is_published)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    category,
    subcategory || (is_code ? language : 'General'),
    difficulty,
    title,
    content,
    words,
    chars,
    is_code ? 1 : 0,
    language || (is_code ? 'JavaScript' : 'English'),
    is_published ? 1 : 0
  );

  const newId = Number(result.lastInsertRowid);
  logAdminAudit(req.user, 'CREATE_CONTENT', 'practice_content', newId, { title, is_code, category });

  return res.status(201).json({
    message: 'Content created successfully.',
    id: newId
  });
});

router.put('/content/:id', (req, res) => {
  const id = req.params.id;
  const { category, subcategory, difficulty, title, content, is_code, language, is_published } = req.body;

  const existing = db.prepare('SELECT * FROM practice_content WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: 'Content not found.' });
  }

  const words = content ? content.trim().split(/\s+/).length : existing.word_count;
  const chars = content ? content.length : existing.char_count;

  db.prepare(`
    UPDATE practice_content
    SET category = COALESCE(?, category),
        subcategory = COALESCE(?, subcategory),
        difficulty = COALESCE(?, difficulty),
        title = COALESCE(?, title),
        content = COALESCE(?, content),
        word_count = ?,
        char_count = ?,
        is_code = COALESCE(?, is_code),
        language = COALESCE(?, language),
        is_published = COALESCE(?, is_published)
    WHERE id = ?
  `).run(
    category || null,
    subcategory || null,
    difficulty || null,
    title || null,
    content || null,
    words,
    chars,
    is_code !== undefined ? (is_code ? 1 : 0) : null,
    language || null,
    is_published !== undefined ? (is_published ? 1 : 0) : null,
    id
  );

  logAdminAudit(req.user, 'UPDATE_CONTENT', 'practice_content', id, { title: title || existing.title });
  return res.json({ message: 'Content updated successfully.' });
});

router.put('/content/:id/toggle-publish', (req, res) => {
  const id = req.params.id;
  const existing = db.prepare('SELECT id, title, is_published FROM practice_content WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: 'Content item not found.' });
  }

  const newStatus = existing.is_published ? 0 : 1;
  db.prepare('UPDATE practice_content SET is_published = ? WHERE id = ?').run(newStatus, id);

  logAdminAudit(req.user, 'TOGGLE_CONTENT_PUBLISH', 'practice_content', id, {
    title: existing.title,
    is_published: newStatus
  });

  return res.json({
    message: newStatus ? 'Content published to practice library.' : 'Content shifted to draft mode.',
    is_published: newStatus
  });
});

router.delete('/content/:id', (req, res) => {
  const id = req.params.id;
  const existing = db.prepare('SELECT title FROM practice_content WHERE id = ?').get(id);
  const result = db.prepare('DELETE FROM practice_content WHERE id = ?').run(id);
  if (result.changes === 0) {
    return res.status(404).json({ error: 'Content item not found.' });
  }

  logAdminAudit(req.user, 'DELETE_CONTENT', 'practice_content', id, { title: existing?.title });
  return res.json({ message: 'Content deleted successfully.' });
});

router.post('/content/bulk-import', (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Array of items required for bulk import.' });
  }

  const insertStmt = db.prepare(`
    INSERT INTO practice_content (category, subcategory, difficulty, title, content, word_count, char_count, is_code, language, is_published)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
  `);

  let importedCount = 0;
  db.exec('BEGIN TRANSACTION;');
  try {
    for (const item of items) {
      if (!item.title || !item.content) continue;
      const isCode = item.is_code ? 1 : 0;
      const content = item.content.trim();
      const words = content.split(/\s+/).length;
      const chars = content.length;

      insertStmt.run(
        item.category || (isCode ? 'Programming' : 'General English'),
        item.subcategory || (isCode ? (item.language || 'Code') : 'General'),
        item.difficulty || 'intermediate',
        item.title.trim(),
        content,
        words,
        chars,
        isCode,
        item.language || (isCode ? 'JavaScript' : 'English')
      );
      importedCount++;
    }
    db.exec('COMMIT;');
  } catch (err) {
    db.exec('ROLLBACK;');
    return res.status(500).json({ error: `Bulk import failed: ${err.message}` });
  }

  logAdminAudit(req.user, 'BULK_IMPORT_CONTENT', 'practice_content', null, { importedCount });
  return res.json({ message: `Successfully imported ${importedCount} practice items.`, importedCount });
});

router.get('/content/export', (req, res) => {
  const items = db.prepare('SELECT id, category, subcategory, difficulty, title, content, word_count, char_count, is_code, language, is_published FROM practice_content ORDER BY id ASC').all();
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="codetyper-library-export.json"');
  return res.send(JSON.stringify(items, null, 2));
});

// ==========================================
// 3. User Management & Moderation
// ==========================================
router.get('/users', (req, res) => {
  const users = db.prepare(`
    SELECT u.id, u.email, u.username, u.full_name, u.role, u.is_banned, u.ban_reason, u.shadowbanned, u.avatar_url, u.created_at,
           s.total_tests, s.best_wpm, s.avg_wpm, s.current_streak
    FROM users u
    LEFT JOIN user_statistics s ON u.id = s.user_id
    ORDER BY u.created_at DESC
    LIMIT 200
  `).all();

  return res.json({ users });
});

router.put('/users/:id/role', (req, res) => {
  const id = Number(req.params.id);
  const { role } = req.body;
  const validRoles = ['user', 'moderator', 'editor', 'admin'];

  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: `Invalid role. Allowed roles: ${validRoles.join(', ')}` });
  }

  const target = db.prepare('SELECT id, username, role FROM users WHERE id = ?').get(id);
  if (!target) {
    return res.status(404).json({ error: 'User not found.' });
  }

  // Prevent self-demoting the last active administrator
  if (target.id === req.user.id && role !== 'admin') {
    const adminCount = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'admin'").get().count;
    if (adminCount <= 1) {
      return res.status(400).json({ error: 'Cannot demote the only remaining administrator account.' });
    }
  }

  db.prepare('UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(role, id);
  logAdminAudit(req.user, 'UPDATE_USER_ROLE', 'users', id, { username: target.username, oldRole: target.role, newRole: role });

  return res.json({ message: `Role for @${target.username} updated to ${role}.`, role });
});

router.put('/users/:id/ban', (req, res) => {
  const id = Number(req.params.id);
  const { is_banned, reason } = req.body;

  if (id === req.user.id) {
    return res.status(400).json({ error: 'You cannot ban your own administrative account.' });
  }

  const target = db.prepare('SELECT id, username, role FROM users WHERE id = ?').get(id);
  if (!target) {
    return res.status(404).json({ error: 'User not found.' });
  }

  if (target.role === 'admin' && req.user.email !== 'saumypandey745@gmail.com') {
    return res.status(403).json({ error: 'Only the super administrator can ban an administrator account.' });
  }

  const banVal = is_banned ? 1 : 0;
  const banReason = banVal ? (reason?.trim() || 'Violated platform guidelines') : null;

  db.prepare('UPDATE users SET is_banned = ?, ban_reason = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(banVal, banReason, id);
  logAdminAudit(req.user, banVal ? 'BAN_USER' : 'UNBAN_USER', 'users', id, { username: target.username, reason: banReason });

  return res.json({
    message: banVal ? `User @${target.username} has been suspended.` : `User @${target.username} suspension lifted.`,
    is_banned: banVal
  });
});

router.put('/users/:id/shadowban', (req, res) => {
  const id = Number(req.params.id);
  const { shadowbanned } = req.body;

  if (id === req.user.id) {
    return res.status(400).json({ error: 'Cannot shadowban yourself.' });
  }

  const target = db.prepare('SELECT id, username FROM users WHERE id = ?').get(id);
  if (!target) {
    return res.status(404).json({ error: 'User not found.' });
  }

  const shadowVal = shadowbanned ? 1 : 0;
  db.prepare('UPDATE users SET shadowbanned = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(shadowVal, id);
  logAdminAudit(req.user, shadowVal ? 'SHADOWBAN_USER' : 'UNSHADOWBAN_USER', 'users', id, { username: target.username });

  return res.json({
    message: shadowVal ? `User @${target.username} is now shadowbanned from leaderboards.` : `Shadowban removed for @${target.username}.`,
    shadowbanned: shadowVal
  });
});

router.post('/users/:id/reset-password', (req, res) => {
  const id = Number(req.params.id);
  const { new_password } = req.body;

  if (!new_password || new_password.trim().length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters.' });
  }

  const target = db.prepare('SELECT id, username FROM users WHERE id = ?').get(id);
  if (!target) {
    return res.status(404).json({ error: 'User not found.' });
  }

  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(new_password.trim(), salt);

  db.prepare('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(hash, id);
  logAdminAudit(req.user, 'ADMIN_RESET_PASSWORD', 'users', id, { username: target.username });

  return res.json({ message: `Password for @${target.username} has been reset successfully.` });
});

router.delete('/users/:id', (req, res) => {
  const id = Number(req.params.id);

  if (id === req.user.id) {
    return res.status(400).json({ error: 'Cannot delete your own active administrator account.' });
  }

  const target = db.prepare('SELECT id, username, email FROM users WHERE id = ?').get(id);
  if (!target) {
    return res.status(404).json({ error: 'User not found.' });
  }

  db.prepare('DELETE FROM users WHERE id = ?').run(id);
  logAdminAudit(req.user, 'DELETE_USER', 'users', id, { username: target.username, email: target.email });

  return res.json({ message: `User account @${target.username} and all associated data permanently deleted.` });
});

// ==========================================
// 4. Leaderboard & Anti-Cheat Moderation
// ==========================================
function recalculateUserStats(userId) {
  const sessions = db.prepare(`
    SELECT net_wpm, accuracy, duration_seconds, completed_at
    FROM typing_sessions
    WHERE user_id = ? AND COALESCE(is_disqualified, 0) = 0
    ORDER BY completed_at ASC
  `).all(userId);

  if (sessions.length === 0) {
    db.prepare(`
      UPDATE user_statistics
      SET total_tests = 0, total_practice_seconds = 0, best_wpm = 0, avg_wpm = 0, avg_accuracy = 0, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `).run(userId);
    return;
  }

  const totalTests = sessions.length;
  let totalSeconds = 0;
  let bestWpm = 0;
  let sumWpm = 0;
  let sumAcc = 0;

  for (const s of sessions) {
    totalSeconds += Math.round(s.duration_seconds || 0);
    if (s.net_wpm > bestWpm) bestWpm = s.net_wpm;
    sumWpm += s.net_wpm;
    sumAcc += s.accuracy;
  }

  const avgWpm = Number((sumWpm / totalTests).toFixed(1));
  const avgAcc = Number((sumAcc / totalTests).toFixed(1));

  db.prepare(`
    UPDATE user_statistics
    SET total_tests = ?, total_practice_seconds = ?, best_wpm = ?, avg_wpm = ?, avg_accuracy = ?, updated_at = CURRENT_TIMESTAMP
    WHERE user_id = ?
  `).run(totalTests, totalSeconds, Number(bestWpm.toFixed(1)), avgWpm, avgAcc, userId);
}

router.get('/scores', (req, res) => {
  const { suspicious, search, limit = 50, offset = 0 } = req.query;
  let sql = `
    SELECT s.id, s.user_id, s.net_wpm, s.gross_wpm, s.accuracy, s.duration_seconds,
           s.practice_type, s.language, s.is_flagged, s.is_disqualified, s.disqualified_reason, s.completed_at,
           u.username, u.full_name, u.avatar_url
    FROM typing_sessions s
    JOIN users u ON u.id = s.user_id
    WHERE 1=1
  `;
  const params = [];

  if (suspicious === 'true' || suspicious === '1') {
    sql += ' AND (s.is_flagged = 1 OR s.net_wpm >= 160 OR s.is_disqualified = 1)';
  }

  if (search) {
    sql += ' AND (u.username LIKE ? OR u.full_name LIKE ?)';
    const query = `%${search}%`;
    params.push(query, query);
  }

  sql += ' ORDER BY s.id DESC LIMIT ? OFFSET ?';
  params.push(Number(limit), Number(offset));

  const scores = db.prepare(sql).all(...params);
  return res.json({ scores });
});

router.put('/scores/:id/disqualify', (req, res) => {
  const id = Number(req.params.id);
  const { reason = 'Suspicious or automated keystroke activity' } = req.body;

  const session = db.prepare('SELECT s.id, s.user_id, s.net_wpm, u.username FROM typing_sessions s JOIN users u ON u.id = s.user_id WHERE s.id = ?').get(id);
  if (!session) {
    return res.status(404).json({ error: 'Session not found.' });
  }

  db.prepare('UPDATE typing_sessions SET is_disqualified = 1, disqualified_reason = ? WHERE id = ?').run(reason, id);
  recalculateUserStats(session.user_id);

  logAdminAudit(req.user, 'DISQUALIFY_SCORE', 'typing_sessions', id, {
    username: session.username,
    wpm: session.net_wpm,
    reason
  });

  return res.json({ message: `Session #${id} disqualified from leaderboards and user statistics recalculated.` });
});

router.delete('/scores/:id', (req, res) => {
  const id = Number(req.params.id);
  const session = db.prepare('SELECT s.id, s.user_id, u.username FROM typing_sessions s JOIN users u ON u.id = s.user_id WHERE s.id = ?').get(id);
  if (!session) {
    return res.status(404).json({ error: 'Session not found.' });
  }

  db.prepare('DELETE FROM typing_sessions WHERE id = ?').run(id);
  recalculateUserStats(session.user_id);

  logAdminAudit(req.user, 'DELETE_SCORE', 'typing_sessions', id, { username: session.username });
  return res.json({ message: `Session #${id} deleted and user statistics recalculated.` });
});

// ==========================================
// 5. System Settings, Announcement Banner & Maintenance Mode
// ==========================================
router.get('/settings', (req, res) => {
  const rows = db.prepare('SELECT key, value FROM system_settings').all();
  const settings = {};
  for (const row of rows) {
    settings[row.key] = row.value;
  }
  return res.json({ settings });
});

router.put('/settings', (req, res) => {
  const { announcement_text, announcement_type, announcement_enabled, maintenance_mode } = req.body;

  const updateSetting = (key, val) => {
    if (val !== undefined) {
      db.prepare(`
        INSERT INTO system_settings (key, value, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
      `).run(key, String(val));
    }
  };

  updateSetting('announcement_text', announcement_text);
  updateSetting('announcement_type', announcement_type);
  updateSetting('announcement_enabled', announcement_enabled !== undefined ? (announcement_enabled ? '1' : '0') : undefined);
  updateSetting('maintenance_mode', maintenance_mode !== undefined ? (maintenance_mode ? '1' : '0') : undefined);

  logAdminAudit(req.user, 'UPDATE_SYSTEM_SETTINGS', 'system_settings', null, req.body);
  const announcement = announcementBroadcaster.broadcast();
  return res.json({
    message: 'System settings saved and live announcement broadcasted successfully.',
    announcement
  });
});

router.get('/backup', (req, res) => {
  const isVercel = !!process.env.VERCEL;
  const dbDir = isVercel ? path.join('/tmp', 'codetyper') : path.resolve(__dirname, '../../data');
  const dbPath = path.join(dbDir, 'codetyper.db');

  if (!fs.existsSync(dbPath)) {
    return res.status(404).json({ error: 'Database file not found on disk.' });
  }

  const today = new Date().toISOString().split('T')[0];
  res.setHeader('Content-Type', 'application/vnd.sqlite3');
  res.setHeader('Content-Disposition', `attachment; filename="codetyper-backup-${today}.db"`);

  logAdminAudit(req.user, 'DOWNLOAD_DB_BACKUP', 'system', null, { date: today });
  const fileStream = fs.createReadStream(dbPath);
  return fileStream.pipe(res);
});

// ==========================================
// 6. Admin Audit Logs
// ==========================================
router.get('/audit-logs', (req, res) => {
  const logs = db.prepare(`
    SELECT * FROM admin_audit_logs
    ORDER BY created_at DESC
    LIMIT 100
  `).all();

  return res.json({ logs });
});

export default router;
