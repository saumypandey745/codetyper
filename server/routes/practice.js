import { Router } from 'express';
import { db } from '../db.js';
import { optionalAuthenticate, authenticate } from '../authMiddleware.js';

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

// --- Custom Snippets ---
router.get('/custom', optionalAuthenticate, (req, res) => {
  const userId = req.user?.id || null;
  if (!userId) {
    return res.json({ snippets: [] });
  }
  const snippets = db.prepare('SELECT * FROM custom_snippets WHERE user_id = ? ORDER BY id DESC').all(userId);
  return res.json({ snippets });
});

router.post('/custom', optionalAuthenticate, (req, res) => {
  const { title, content, language } = req.body;
  if (!content || typeof content !== 'string' || content.trim().length < 5) {
    return res.status(400).json({ error: 'Snippet content must be at least 5 characters long.' });
  }
  if (content.length > 15000) {
    return res.status(400).json({ error: 'Snippet content cannot exceed 15,000 characters.' });
  }

  const cleanTitle = (title || 'Custom Practice Snippet').trim().slice(0, 100);
  const cleanLang = (language || 'JavaScript').trim().slice(0, 50);
  const cleanContent = content.replace(/\r\n/g, '\n').trim();
  const userId = req.user?.id || null;

  const result = db.prepare(`
    INSERT INTO custom_snippets (user_id, title, content, language, is_code, source)
    VALUES (?, ?, ?, ?, 1, 'custom')
  `).run(userId, cleanTitle, cleanContent, cleanLang);

  const snippetId = Number(result.lastInsertRowid);
  const snippet = db.prepare('SELECT * FROM custom_snippets WHERE id = ?').get(snippetId);

  return res.status(201).json({ snippet });
});

router.delete('/custom/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const result = db.prepare('DELETE FROM custom_snippets WHERE id = ? AND user_id = ?').run(id, req.user.id);
  if (result.changes === 0) {
    return res.status(404).json({ error: 'Snippet not found or unauthorized.' });
  }
  return res.json({ message: 'Snippet deleted successfully.' });
});

// --- GitHub Raw File Importer ---
router.post('/github-fetch', async (req, res) => {
  const { url } = req.body;
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'A valid GitHub file URL is required.' });
  }

  let rawUrl = url.trim();
  if (rawUrl.includes('github.com') && rawUrl.includes('/blob/')) {
    rawUrl = rawUrl.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
  } else if (!rawUrl.startsWith('https://raw.githubusercontent.com') && !rawUrl.startsWith('https://gist.githubusercontent.com')) {
    return res.status(400).json({
      error: 'Please provide a valid GitHub file link (e.g., https://github.com/owner/repo/blob/main/file.js).'
    });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const ghRes = await fetch(rawUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'CodeTyper-Importer/1.0',
        'Accept': 'text/plain'
      }
    });
    clearTimeout(timeout);

    if (!ghRes.ok) {
      return res.status(400).json({ error: `Could not fetch GitHub file (HTTP ${ghRes.status}). Verify the file is public.` });
    }

    const text = await ghRes.text();
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'The requested GitHub file is empty.' });
    }

    const filename = rawUrl.split('/').pop().split('?')[0];
    const ext = filename.includes('.') ? filename.split('.').pop().toLowerCase() : '';
    const extLangMap = {
      js: 'JavaScript',
      jsx: 'JavaScript',
      ts: 'TypeScript',
      tsx: 'TypeScript',
      py: 'Python',
      go: 'Go',
      rs: 'Rust',
      html: 'HTML',
      css: 'CSS',
      json: 'JSON',
      c: 'C',
      cpp: 'C++',
      java: 'Java'
    };
    const language = extLangMap[ext] || 'Code';

    let cleaned = text.replace(/\r\n/g, '\n').trim();
    if (cleaned.length > 2500) {
      const sliceIdx = cleaned.indexOf('\n', 2200);
      cleaned = sliceIdx !== -1 ? cleaned.slice(0, sliceIdx) : cleaned.slice(0, 2500);
    }

    return res.json({
      title: `GitHub: ${filename}`,
      content: cleaned,
      language,
      sourceUrl: url
    });
  } catch (err) {
    return res.status(500).json({ error: err.name === 'AbortError' ? 'GitHub request timed out.' : (err.message || 'Failed to fetch GitHub file.') });
  }
});

export default router;
