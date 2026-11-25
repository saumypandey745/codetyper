import { Router } from 'express';
import { db } from '../db.js';
import { optionalAuthenticate } from '../authMiddleware.js';
import { dispatchWebhookEvent } from '../webhookDispatcher.js';

const router = Router();

const AVATAR_PALETTES = [
  'linear-gradient(135deg, #10b981, #059669)',
  'linear-gradient(135deg, #0284c7, #38bdf8)',
  'linear-gradient(135deg, #7c3aed, #a855f7)',
  'linear-gradient(135deg, #f59e0b, #d97706)',
  'linear-gradient(135deg, #ec4899, #be185d)',
  'linear-gradient(135deg, #06b6d4, #0891b2)',
  'linear-gradient(135deg, #6366f1, #4f46e5)'
];

/**
 * Public Endpoint: Get Verified Featured Community Testimonials
 * GET /api/feedback/featured
 */
router.get('/featured', (req, res) => {
  try {
    const featured = db.prepare(`
      SELECT id, name, display_role, rating, message, avatar_color, created_at
      FROM feedback_reports
      WHERE is_featured = 1 AND status != 'archived'
      ORDER BY id DESC
      LIMIT 12
    `).all();

    const testimonials = featured.map((item) => {
      const parts = (item.name || 'Anonymous').trim().split(/\s+/);
      const initials = parts.length > 1
        ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
        : (item.name || 'CT').slice(0, 2).toUpperCase();

      return {
        id: item.id,
        name: item.name,
        display_role: item.display_role || 'Verified Typist',
        rating: Math.max(1, Math.min(5, Number(item.rating) || 5)),
        message: item.message,
        avatar_color: item.avatar_color || AVATAR_PALETTES[0],
        initials,
        created_at: item.created_at
      };
    });

    return res.json({
      success: true,
      testimonials
    });
  } catch (err) {
    console.error('[Feedback Featured Fetch Error]', err);
    return res.status(500).json({ error: 'Failed to retrieve featured testimonials.' });
  }
});

/**
 * Public User Feedback, Review & Bug Report Submission Endpoint
 * POST /api/feedback
 */
router.post('/', optionalAuthenticate, (req, res) => {
  const {
    name,
    email,
    category = 'feedback',
    subject,
    message,
    rating = 5,
    display_role = ''
  } = req.body;

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

  const sanitizedRating = Math.max(1, Math.min(5, Number(rating) || 5));
  const sanitizedRole = typeof display_role === 'string' ? display_role.trim().slice(0, 100) : '';

  const avatarColor = AVATAR_PALETTES[Math.floor(Math.random() * AVATAR_PALETTES.length)];

  const userId = req.user ? req.user.id : null;
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;

  try {
    const result = db.prepare(`
      INSERT INTO feedback_reports (
        user_id, name, email, category, subject, message, status, rating, display_role, is_featured, avatar_color, ip_address
      )
      VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?, 0, ?, ?)
    `).run(
      userId,
      name.trim(),
      email.trim().toLowerCase(),
      sanitizedCategory,
      subject.trim(),
      message.trim(),
      sanitizedRating,
      sanitizedRole,
      avatarColor,
      typeof ip === 'string' ? ip.split(',')[0].trim() : null
    );

    const feedbackId = Number(result.lastInsertRowid);

    // Trigger asynchronous webhook notifications to Discord/Slack
    dispatchWebhookEvent('FEEDBACK_SUBMITTED', {
      feedbackId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      category: sanitizedCategory,
      subject: subject.trim(),
      message: message.trim(),
      rating: sanitizedRating,
      display_role: sanitizedRole
    }).catch((err) => {
      console.warn('[Webhook] Failed to dispatch feedback event:', err.message);
    });

    return res.status(201).json({
      success: true,
      message: 'Thank you! Your feedback and review have been received and sent for administrative review.',
      id: feedbackId
    });
  } catch (err) {
    console.error('[Feedback Submission Error]', err);
    return res.status(500).json({ error: 'Failed to record feedback. Please try again later.' });
  }
});

export default router;
