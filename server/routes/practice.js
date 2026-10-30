import { Router } from 'express';
import { db } from '../db.js';
import { optionalAuthenticate } from '../authMiddleware.js';

const router = Router();

router.get('/content', optionalAuthenticate, (req, res) => {
  const { type, language, category, difficulty, id } = req.query;

  if (id) {
    const item = db.prepare('SELECT * FROM practice_content WHERE id = ?').get(id);
    if (!item) return res.status(404).json({ error: 'Content item not found.' });
    return res.json({ item });
  }

  let sql = 'SELECT * FROM practice_content WHERE 1=1';
  const params = [];

  if (type === 'code') {
    sql += ' AND is_code = 1';
  } else if (type === 'english') {
    sql += ' AND is_code = 0';
  }

  if (language && language !== 'all' && language !== 'All') {
    sql += ' AND LOWER(language) = LOWER(?)';
    params.push(language);
  }

  if (category && category !== 'all' && category !== 'All') {
    sql += ' AND LOWER(category) = LOWER(?)';
    params.push(category);
  }

  if (difficulty && difficulty !== 'all' && difficulty !== 'All') {
    sql += ' AND LOWER(difficulty) = LOWER(?)';
    params.push(difficulty);
  }

  // Order lessons strictly in sequence: Lesson 1 to Lesson 50
  sql += ` ORDER BY CASE 
    WHEN lesson_number IS NOT NULL AND lesson_number > 0 THEN lesson_number
    ELSE 9999
  END ASC, id ASC`;

  // Get matching items
  const items = db.prepare(sql).all(...params);

  // Get completed lessons for authenticated user
  let completedLessonIds = [];
  if (req.user?.id) {
    try {
      const rows = db.prepare(`
        SELECT DISTINCT content_id
        FROM typing_sessions
        WHERE user_id = ? AND content_id IS NOT NULL
      `).all(req.user.id);
      completedLessonIds = rows.map((r) => r.content_id);
    } catch (e) {
      console.warn('Could not query completed lessons for user', e);
    }
  }

  if (items.length === 0) {
    // Fallback: return any matching type or random item so user never gets stuck
    const fallback = db.prepare('SELECT * FROM practice_content ORDER BY RANDOM() LIMIT 1').get();
    return res.json({
      item: fallback,
      items: fallback ? [fallback] : [],
      completedLessonIds,
      totalMatches: fallback ? 1 : 0,
      fallback: true
    });
  }

  // Select the first uncompleted lesson in the curriculum, or first lesson if all completed
  const firstIncomplete = items.find((it) => !completedLessonIds.includes(it.id));
  const selected = firstIncomplete || items[0];

  return res.json({
    item: selected,
    items,
    completedLessonIds,
    totalMatches: items.length
  });
});

router.get('/languages', (req, res) => {
  const rows = db.prepare(`
    SELECT language, COUNT(*) as snippet_count
    FROM practice_content
    WHERE is_code = 1
    GROUP BY language
    ORDER BY snippet_count DESC, language ASC
  `).all();

  return res.json({ languages: rows });
});

router.get('/categories', (req, res) => {
  const rows = db.prepare(`
    SELECT category, COUNT(*) as passage_count
    FROM practice_content
    WHERE is_code = 0
    GROUP BY category
    ORDER BY passage_count DESC, category ASC
  `).all();

  return res.json({ categories: rows });
});

export default router;
