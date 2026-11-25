import { Router } from 'express';
import { db } from '../db.js';
import { sendNewsletterWelcomeEmail } from '../mailer.js';
import { dispatchWebhookEvent } from '../webhookDispatcher.js';

const router = Router();

/**
 * Public Newsletter Subscription Endpoint
 * POST /api/newsletter/subscribe
 */
router.post('/subscribe', async (req, res) => {
  const { email, source = 'footer' } = req.body;

  if (!email || typeof email !== 'string' || !email.includes('@') || !email.includes('.')) {
    return res.status(400).json({ error: 'Please enter a valid developer email address.' });
  }

  const cleanEmail = email.trim().toLowerCase();

  try {
    const existing = db.prepare('SELECT id, email, status FROM newsletter_subscribers WHERE email = ?').get(cleanEmail);

    if (existing) {
      if (existing.status === 'active') {
        return res.json({
          success: true,
          message: 'You are already subscribed to the CodeTyper Developer Digest!'
        });
      } else {
        db.prepare("UPDATE newsletter_subscribers SET status = 'active', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(existing.id);
      }
    } else {
      db.prepare(`
        INSERT INTO newsletter_subscribers (email, source, status)
        VALUES (?, ?, 'active')
      `).run(cleanEmail, source);
    }

    // Trigger asynchronous welcome email
    sendNewsletterWelcomeEmail({
      toEmail: cleanEmail,
      origin: req.headers.origin
    }).catch((err) => {
      console.warn('[Newsletter] Failed to dispatch welcome email:', err.message);
    });

    // Trigger asynchronous webhook notifications to Discord/Slack
    dispatchWebhookEvent('NEW_SUBSCRIBER', {
      email: cleanEmail,
      source
    }).catch((err) => {
      console.warn('[Webhook] Failed to dispatch subscriber event:', err.message);
    });

    return res.status(201).json({
      success: true,
      message: 'Subscribed! Check your inbox for the welcome issue and snippet pack.'
    });
  } catch (err) {
    console.error('[Newsletter Subscribe Error]', err);
    return res.status(500).json({ error: 'Failed to process subscription. Please try again later.' });
  }
});

/**
 * Public Newsletter Unsubscribe Endpoint
 * POST /api/newsletter/unsubscribe
 */
router.post('/unsubscribe', (req, res) => {
  const { email } = req.body;
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Valid email is required.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  try {
    db.prepare("UPDATE newsletter_subscribers SET status = 'unsubscribed', updated_at = CURRENT_TIMESTAMP WHERE email = ?").run(cleanEmail);
    return res.json({
      success: true,
      message: 'You have been unsubscribed from CodeTyper updates.'
    });
  } catch (err) {
    console.error('[Newsletter Unsubscribe Error]', err);
    return res.status(500).json({ error: 'Failed to process unsubscribe request.' });
  }
});

export default router;
