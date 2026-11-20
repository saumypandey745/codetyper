import { Router } from 'express';
import { db } from '../db.js';
import { authenticate, optionalAuthenticate } from '../authMiddleware.js';

const router = Router();

router.post('/save', authenticate, (req, res) => {
  const userId = req.user.id;
  const {
    content_id,
    practice_type,
    language,
    difficulty,
    duration_seconds,
    gross_wpm,
    net_wpm,
    accuracy,
    total_characters,
    correct_characters,
    incorrect_characters,
    error_count,
    raw_timeline_json
  } = req.body;

  if (
    duration_seconds === undefined ||
    gross_wpm === undefined ||
    net_wpm === undefined ||
    accuracy === undefined
  ) {
    return res.status(400).json({ error: 'Incomplete session metrics provided.' });
  }

  // Check user settings if history saving is enabled
  const settings = db.prepare('SELECT save_history FROM user_settings WHERE user_id = ?').get(userId);
  if (settings && settings.save_history === 0) {
    return res.json({ message: 'Session completed. (History saving disabled in preferences)', id: null });
  }

  // Insert session
  const insertStmt = db.prepare(`
    INSERT INTO typing_sessions (
      user_id, content_id, practice_type, language, difficulty,
      duration_seconds, gross_wpm, net_wpm, accuracy,
      total_characters, correct_characters, incorrect_characters,
      error_count, raw_timeline_json, completed_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `);

  const result = insertStmt.run(
    userId,
    content_id || null,
    practice_type || 'practice',
    language || 'English',
    difficulty || 'intermediate',
    Number(duration_seconds),
    Number(gross_wpm),
    Number(net_wpm),
    Number(accuracy),
    Number(total_characters || 0),
    Number(correct_characters || 0),
    Number(incorrect_characters || 0),
    Number(error_count || 0),
    raw_timeline_json ? JSON.stringify(raw_timeline_json) : null
  );

  const sessionId = Number(result.lastInsertRowid);

  // Update user statistics with user-local timezone awareness
  const currentStats = db.prepare('SELECT * FROM user_statistics WHERE user_id = ?').get(userId);
  
  // Read client timezone offset (minutes) from payload or header
  const tzOffset = req.body.timezone_offset_minutes !== undefined
    ? Number(req.body.timezone_offset_minutes)
    : (req.headers['x-timezone-offset'] ? Number(req.headers['x-timezone-offset']) : null);

  let today = new Date().toISOString().split('T')[0];
  if (tzOffset !== null && !isNaN(tzOffset)) {
    const localTimeMs = Date.now() - (tzOffset * 60 * 1000);
    today = new Date(localTimeMs).toISOString().split('T')[0];
  }

  if (!currentStats) {
    db.prepare(`
      INSERT INTO user_statistics (user_id, total_tests, total_practice_seconds, best_wpm, avg_wpm, avg_accuracy, current_streak, last_practice_date)
      VALUES (?, 1, ?, ?, ?, ?, 1, ?)
    `).run(userId, Math.round(duration_seconds), net_wpm, net_wpm, accuracy, today);
  } else {
    const newTotal = currentStats.total_tests + 1;
    const newSeconds = currentStats.total_practice_seconds + Math.round(duration_seconds);
    const newBest = Math.max(currentStats.best_wpm, net_wpm);
    const newAvgWpm = ((currentStats.avg_wpm * currentStats.total_tests) + net_wpm) / newTotal;
    const newAvgAcc = ((currentStats.avg_accuracy * currentStats.total_tests) + accuracy) / newTotal;

    let newStreak = currentStats.current_streak || 1;
    if (currentStats.last_practice_date) {
      if (currentStats.last_practice_date === today) {
        // Practicing again on same calendar day keeps streak intact
        newStreak = currentStats.current_streak;
      } else {
        const lastMs = new Date(`${currentStats.last_practice_date}T00:00:00Z`).getTime();
        const currentMs = new Date(`${today}T00:00:00Z`).getTime();
        const diffDays = Math.round((currentMs - lastMs) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          newStreak = (currentStats.current_streak || 0) + 1;
        } else if (diffDays > 1) {
          newStreak = 1;
        }
      }
    } else {
      newStreak = 1;
    }

    db.prepare(`
      UPDATE user_statistics
      SET total_tests = ?,
          total_practice_seconds = ?,
          best_wpm = ?,
          avg_wpm = ?,
          avg_accuracy = ?,
          current_streak = ?,
          last_practice_date = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `).run(
      newTotal,
      newSeconds,
      Number(newBest.toFixed(1)),
      Number(newAvgWpm.toFixed(1)),
      Number(newAvgAcc.toFixed(1)),
      newStreak,
      today,
      userId
    );
  }

  const updatedStats = db.prepare('SELECT * FROM user_statistics WHERE user_id = ?').get(userId);

  return res.status(201).json({
    message: 'Session recorded successfully.',
    sessionId,
    statistics: updatedStats
  });
});

router.get('/history', authenticate, (req, res) => {
  const userId = req.user.id;
  const { practice_type, language, difficulty, limit = 20, offset = 0 } = req.query;

  let sql = 'SELECT * FROM typing_sessions WHERE user_id = ?';
  const params = [userId];

  if (practice_type && practice_type !== 'all') {
    sql += ' AND practice_type = ?';
    params.push(practice_type);
  }

  if (language && language !== 'all') {
    sql += ' AND LOWER(language) = LOWER(?)';
    params.push(language);
  }

  if (difficulty && difficulty !== 'all') {
    sql += ' AND LOWER(difficulty) = LOWER(?)';
    params.push(difficulty);
  }

  // Count total for pagination
  const countSql = sql.replace('SELECT *', 'SELECT COUNT(*) as count');
  const countRow = db.prepare(countSql).get(...params);

  sql += ' ORDER BY completed_at DESC LIMIT ? OFFSET ?';
  params.push(Number(limit), Number(offset));

  const sessions = db.prepare(sql).all(...params);

  return res.json({
    sessions,
    total: countRow ? countRow.count : 0,
    limit: Number(limit),
    offset: Number(offset)
  });
});

router.delete('/:id', authenticate, (req, res) => {
  const userId = req.user.id;
  const sessionId = req.params.id;

  const result = db.prepare('DELETE FROM typing_sessions WHERE id = ? AND user_id = ?').run(sessionId, userId);
  if (result.changes === 0) {
    return res.status(404).json({ error: 'Session not found or unauthorized.' });
  }

  return res.json({ message: 'Session deleted successfully.' });
});

router.get('/stats', authenticate, (req, res) => {
  const userId = req.user.id;

  const overall = db.prepare('SELECT * FROM user_statistics WHERE user_id = ?').get(userId) || {
    total_tests: 0,
    total_practice_seconds: 0,
    best_wpm: 0,
    avg_wpm: 0,
    avg_accuracy: 0,
    current_streak: 0
  };

  // Recent timeline (last 20 sessions)
  const timeline = db.prepare(`
    SELECT id, completed_at, practice_type, language, net_wpm, gross_wpm, accuracy, duration_seconds
    FROM typing_sessions
    WHERE user_id = ?
    ORDER BY completed_at ASC
    LIMIT 30
  `).all(userId);

  // Language breakdown
  const languageBreakdown = db.prepare(`
    SELECT language, COUNT(*) as sessions, ROUND(AVG(net_wpm), 1) as avg_wpm, ROUND(AVG(accuracy), 1) as avg_accuracy
    FROM typing_sessions
    WHERE user_id = ?
    GROUP BY language
    ORDER BY avg_wpm DESC
  `).all(userId);

  // Mode breakdown
  const modeBreakdown = db.prepare(`
    SELECT practice_type, COUNT(*) as sessions, ROUND(AVG(net_wpm), 1) as avg_wpm
    FROM typing_sessions
    WHERE user_id = ?
    GROUP BY practice_type
  `).all(userId);

  return res.json({
    overall,
    timeline,
    languageBreakdown,
    modeBreakdown
  });
});

const COMMUNITY_CHALLENGERS = [
  { id: 901, username: 'neovim_deity', display_name: 'Alex "Vim" Mercer', best_wpm: 154, avg_accuracy: 99.4, total_tests: 1420, current_streak: 42, avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
  { id: 902, username: 'rust_concurrency', display_name: 'Elena Rostova', best_wpm: 141, avg_accuracy: 98.8, total_tests: 980, current_streak: 28, avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150' },
  { id: 903, username: 'syntax_god', display_name: 'Devin Chen', best_wpm: 133, avg_accuracy: 98.2, total_tests: 812, current_streak: 19, avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
  { id: 904, username: 'zen_keystrokes', display_name: 'Maya Tanaka', best_wpm: 126, avg_accuracy: 99.1, total_tests: 650, current_streak: 35, avatar_url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150' },
  { id: 905, username: 'haskell_monad', display_name: 'Lucas Silva', best_wpm: 118, avg_accuracy: 97.9, total_tests: 520, current_streak: 14, avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' },
  { id: 906, username: 'react_hooks_fan', display_name: 'Sophia Patel', best_wpm: 112, avg_accuracy: 97.5, total_tests: 430, current_streak: 12, avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
  { id: 907, username: 'go_channel_king', display_name: 'Klaus Fischer', best_wpm: 104, avg_accuracy: 98.0, total_tests: 390, current_streak: 9, avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150' },
  { id: 908, username: 'mechanical_click', display_name: 'Aiden Brooks', best_wpm: 96, avg_accuracy: 96.8, total_tests: 280, current_streak: 7, avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150' }
];

router.get('/leaderboard', optionalAuthenticate, (req, res) => {
  const currentUserId = req.user ? req.user.id : null;
  const { period = 'all_time', limit = 50 } = req.query;

  // Query real users from database
  let dbRows = [];
  try {
    if (period === 'weekly') {
      dbRows = db.prepare(`
        SELECT u.id, u.username, u.full_name as display_name, u.avatar_url,
               MAX(s.net_wpm) as best_wpm,
               ROUND(AVG(s.accuracy), 1) as avg_accuracy,
               COUNT(s.id) as total_tests,
               COALESCE(st.current_streak, 1) as current_streak
        FROM typing_sessions s
        JOIN users u ON u.id = s.user_id
        LEFT JOIN user_statistics st ON st.user_id = u.id
        WHERE s.completed_at >= datetime('now', '-7 days')
        GROUP BY u.id
        ORDER BY best_wpm DESC
        LIMIT ?
      `).all(Number(limit));
    } else if (period === 'daily') {
      dbRows = db.prepare(`
        SELECT u.id, u.username, u.full_name as display_name, u.avatar_url,
               MAX(s.net_wpm) as best_wpm,
               ROUND(AVG(s.accuracy), 1) as avg_accuracy,
               COUNT(s.id) as total_tests,
               COALESCE(st.current_streak, 1) as current_streak
        FROM typing_sessions s
        JOIN users u ON u.id = s.user_id
        LEFT JOIN user_statistics st ON st.user_id = u.id
        WHERE s.completed_at >= datetime('now', '-1 day')
        GROUP BY u.id
        ORDER BY best_wpm DESC
        LIMIT ?
      `).all(Number(limit));
    } else {
      // All-time
      dbRows = db.prepare(`
        SELECT u.id, u.username, u.full_name as display_name, u.avatar_url,
               COALESCE(st.best_wpm, 0) as best_wpm,
               COALESCE(st.avg_accuracy, 0) as avg_accuracy,
               COALESCE(st.total_tests, 0) as total_tests,
               COALESCE(st.current_streak, 0) as current_streak
        FROM users u
        JOIN user_statistics st ON st.user_id = u.id
        WHERE st.total_tests > 0
        ORDER BY st.best_wpm DESC, st.avg_accuracy DESC
        LIMIT ?
      `).all(Number(limit));
    }
  } catch (err) {
    console.error('Leaderboard query error:', err.message);
  }

  // Combine real users with community challengers if pool is small
  const combinedMap = new Map();
  dbRows.forEach((r) => {
    combinedMap.set(r.id, {
      ...r,
      isCurrentUser: currentUserId === r.id
    });
  });

  COMMUNITY_CHALLENGERS.forEach((c) => {
    if (!combinedMap.has(c.id)) {
      combinedMap.set(c.id, {
        ...c,
        isCurrentUser: false
      });
    }
  });

  const sortedList = Array.from(combinedMap.values())
    .sort((a, b) => b.best_wpm - a.best_wpm)
    .slice(0, Number(limit))
    .map((item, index) => {
      let tier = 'Challenger';
      let tierIcon = '🎯';
      if (item.best_wpm >= 140) {
        tier = 'Grandmaster';
        tierIcon = '👑';
      } else if (item.best_wpm >= 115) {
        tier = 'Master';
        tierIcon = '💎';
      } else if (item.best_wpm >= 90) {
        tier = 'Diamond';
        tierIcon = '⚡';
      } else if (item.best_wpm >= 70) {
        tier = 'Platinum';
        tierIcon = '🛡️';
      } else if (item.best_wpm >= 50) {
        tier = 'Gold';
        tierIcon = '⭐';
      }

      return {
        rank: index + 1,
        ...item,
        tier,
        tierIcon
      };
    });

  return res.json({
    period,
    leaderboard: sortedList,
    total: sortedList.length
  });
});

export default router;
