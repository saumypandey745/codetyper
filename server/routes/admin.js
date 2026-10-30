import { Router } from 'express';
import { db } from '../db.js';
import { authenticate, requireAdmin } from '../authMiddleware.js';

const router = Router();

// Protect all admin routes
router.use(authenticate, requireAdmin);

router.get('/stats', (req, res) => {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  const sessionCount = db.prepare('SELECT COUNT(*) as count FROM typing_sessions').get().count;
  const contentCount = db.prepare('SELECT COUNT(*) as count FROM practice_content').get().count;
  const totalSeconds = db.prepare('SELECT SUM(duration_seconds) as total FROM typing_sessions').get().total || 0;

  return res.json({
    users: userCount,
    sessions: sessionCount,
    contentItems: contentCount,
    totalPracticeHours: Number((totalSeconds / 3600).toFixed(1))
  });
});

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
  const { category, subcategory, difficulty, title, content, is_code, language } = req.body;

  if (!category || !difficulty || !title || !content) {
    return res.status(400).json({ error: 'Title, category, difficulty, and content are required.' });
  }

  const words = content.trim().split(/\s+/).length;
  const chars = content.length;

  const result = db.prepare(`
    INSERT INTO practice_content (category, subcategory, difficulty, title, content, word_count, char_count, is_code, language)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    category,
    subcategory || (is_code ? language : 'General'),
    difficulty,
    title,
    content,
    words,
    chars,
    is_code ? 1 : 0,
    language || (is_code ? 'JavaScript' : 'English')
  );

  return res.status(201).json({
    message: 'Content created successfully.',
    id: Number(result.lastInsertRowid)
  });
});

router.put('/content/:id', (req, res) => {
  const id = req.params.id;
  const { category, subcategory, difficulty, title, content, is_code, language } = req.body;

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
        language = COALESCE(?, language)
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
    id
  );

  return res.json({ message: 'Content updated successfully.' });
});

router.delete('/content/:id', (req, res) => {
  const id = req.params.id;
  const result = db.prepare('DELETE FROM practice_content WHERE id = ?').run(id);
  if (result.changes === 0) {
    return res.status(404).json({ error: 'Content item not found.' });
  }
  return res.json({ message: 'Content deleted successfully.' });
});

router.get('/users', (req, res) => {
  const users = db.prepare(`
    SELECT u.id, u.email, u.username, u.full_name, u.role, u.created_at,
           s.total_tests, s.best_wpm, s.avg_wpm, s.current_streak
    FROM users u
    LEFT JOIN user_statistics s ON u.id = s.user_id
    ORDER BY u.created_at DESC
    LIMIT 100
  `).all();

  return res.json({ users });
});

export default router;
