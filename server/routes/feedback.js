import { Router } from 'express';
import { db } from '../db.js';
import { optionalAuthenticate } from '../authMiddleware.js';

const router = Router();

/**
 * Public User Feedback & Bug Report Submission Endpoint
 * POST /api/feedback
 */
router.post('/', optionalAuthenticate, (req, res) => {
  const { name, email, category = 'feedback', subject, message } = req.body;

  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'Please provide your name.' });
  }

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ error: 'Please provide a valid contact email address.' });
  }

  if (!subject || typeof subject !== 'string' || !subject.trim()) {
    return res.status(400).json({ error: 'Please provide a brief subject.' });
  }

  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'Please provide your message or feedback details.' });
  }

  const validCategories = ['feedback', 'bug_report', 'snippet_suggestion', 'typo', 'account', 'other'];
  const sanitizedCategory = validCategories.includes(category.toLowerCase())
    ? category.toLowerCase()
    : 'feedback';

  const userId = req.user ? req.user.id : null;
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;

  try {
    const result = db.prepare(`
      INSERT INTO feedback_reports (user_id, name, email, category, subject, message, status, ip_address)
      VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)
    `).run(
      userId,
      name.trim(),
      email.trim().toLowerCase(),
      sanitizedCategory,
      subject.trim(),
      message.trim(),
      typeof ip === 'string' ? ip.split(',')[0].trim() : null
    );

    const feedbackId = Number(result.lastInsertRowid);

    return res.status(201).json({
      success: true,
      message: 'Thank you! Your note has been received by the CodeTyper maintenance team.',
      id: feedbackId
    });
  } catch (err) {
    console.error('[Feedback Submission Error]', err);
    return res.status(500).json({ error: 'Failed to record feedback. Please try again later.' });
  }
});

export default router;
