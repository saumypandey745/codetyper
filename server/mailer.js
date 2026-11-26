import nodemailer from 'nodemailer';
import { db } from './db.js';

// CodeTyper Automated Mailer Service
// Sends transactional emails (Password Resets, Issue Resolution, Digest, Broadcasts) via SMTP.

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  if (host && user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000
    });
    console.log(`[Mailer] SMTP transport configured for ${host}:${port} (${user})`);
  }

  return transporter;
}

export function logEmailRecord({ recipientEmail, subject, emailType, status = 'sent', previewText = '' }) {
  try {
    db.prepare(`
      INSERT INTO email_logs (recipient_email, subject, email_type, status, preview_text)
      VALUES (?, ?, ?, ?, ?)
    `).run(recipientEmail, subject, emailType, status, (previewText || '').slice(0, 500));
  } catch (err) {
    console.warn('[Mailer Log Error]', err.message);
  }
}

export async function sendPasswordResetEmail({ toEmail, resetToken, otpCode, origin }) {
  const appOrigin = origin || process.env.APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://codetyper-beta.vercel.app');
  const resetUrl = `${appOrigin}/forgot-password?token=${resetToken}`;
  const displayOtp = otpCode || resetToken.slice(0, 6).toUpperCase();

  const transport = getTransporter();

  const isTestEnv = process.env.NODE_ENV === 'test' || process.env.SIMULATE_EMAIL === 'true';
  const lowerEmail = (toEmail || '').toLowerCase();
  const isMockDomain = lowerEmail.endsWith('@codetyper.dev') ||
                       lowerEmail.endsWith('@codetyper.test') ||
                       lowerEmail.endsWith('@example.com') ||
                       lowerEmail.includes('mock_') ||
                       lowerEmail.includes('test_') ||
                       lowerEmail.includes('nonexistent_');

  if (!transport || isTestEnv || isMockDomain) {
    console.log(`\n==================================================`);
    console.log(`[Mailer] (${!transport ? 'Simulated - No SMTP Configured' : 'Simulated - Test/Mock Mode'})`);
    console.log(`To: ${toEmail}`);
    console.log(`OTP Code: ${displayOtp}`);
    console.log(`Subject: Reset Your CodeTyper Password [OTP: ${displayOtp}]`);
    console.log(`Direct Reset Link: ${resetUrl}`);
    console.log(`==================================================\n`);

    logEmailRecord({
      recipientEmail: toEmail,
      subject: `Reset Your CodeTyper Password [OTP: ${displayOtp}]`,
      emailType: 'password_reset',
      status: 'simulated',
      previewText: `Password reset OTP: ${displayOtp}`
    });

    return {
      delivered: false,
      simulated: true,
      resetUrl,
      resetToken,
      otpCode: displayOtp
    };
  }

  const fromAddress = process.env.SMTP_FROM || `"CodeTyper Sanctuary" <${process.env.SMTP_USER}>`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FAF8F1; color: #2C3531; margin: 0; padding: 2rem 1rem; }
        .container { max-width: 520px; margin: 0 auto; background: #FFFFFF; border-radius: 14px; border: 1px solid #DDEBDD; padding: 2.25rem; box-shadow: 0 4px 20px rgba(0,0,0,0.04); }
        .logo { font-size: 1.5rem; font-weight: 700; color: #2F6B52; margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.5rem; }
        .otp-box { background: #F3F8F5; border: 2px dashed #2F6B52; border-radius: 12px; padding: 1.25rem 1rem; text-align: center; margin: 1.5rem 0; }
        .otp-label { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1.5px; color: #52796F; font-weight: 700; margin-bottom: 0.4rem; }
        .otp-digits { font-size: 2.4rem; font-weight: 800; letter-spacing: 8px; color: #1B4332; font-family: 'SF Mono', Monaco, Consolas, 'Courier New', monospace; }
        .otp-sub { font-size: 0.78rem; color: #738276; margin-top: 0.4rem; }
        .divider { display: flex; align-items: center; text-align: center; margin: 1.75rem 0 1.25rem; color: #9CA3AF; font-size: 0.8rem; }
        .divider::before, .divider::after { content: ''; flex: 1; border-bottom: 1px solid #E5E7EB; }
        .divider::before { margin-right: 0.75em; }
        .divider::after { margin-left: 0.75em; }
        .button { display: inline-block; background-color: #2F6B52; color: #FAF8F1 !important; text-decoration: none; padding: 0.85rem 1.75rem; border-radius: 8px; font-weight: 600; font-size: 0.95rem; margin: 0.5rem 0; }
        .footer { font-size: 0.78rem; color: #738276; margin-top: 2rem; border-top: 1px solid #EAE7DC; padding-top: 1rem; }
        .code-block { background: #F3F4F1; padding: 0.65rem 0.75rem; border-radius: 6px; font-family: monospace; font-size: 0.8rem; word-break: break-all; margin: 0.75rem 0; color: #374151; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">🌿 CodeTyper</div>
        <h2 style="margin-top: 0; color: #111827; font-size: 1.35rem;">Password Reset OTP</h2>
        <p style="font-size: 0.95rem; line-height: 1.6; color: #4B5563; margin-bottom: 1rem;">
          Hello, we received a request to reset the password for your CodeTyper account (<strong>${toEmail}</strong>).
        </p>

        <div class="otp-box">
          <div class="otp-label">Your One-Time Password (OTP)</div>
          <div class="otp-digits">${displayOtp}</div>
          <div class="otp-sub">Valid for 15 minutes • Do not share this code with anyone</div>
        </div>

        <div class="divider">OR 1-CLICK INSTANT RESET</div>

        <div style="text-align: center;">
          <a href="${resetUrl}" class="button" target="_blank">Reset Password Directly</a>
        </div>

        <p style="font-size: 0.8rem; color: #6B7280; line-height: 1.5; margin-top: 1.25rem;">
          If the button above doesn't work, copy and paste this link into your browser:
        </p>
        <div class="code-block">${resetUrl}</div>

        <p style="font-size: 0.8rem; color: #6B7280; line-height: 1.5;">
          If you did not request this password reset, please ignore this email. Your account remains completely secure.
        </p>
        <div class="footer">
          Peaceful, focused typing for developers • CodeTyper
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transport.sendMail({
      from: fromAddress,
      to: toEmail,
      subject: `Your CodeTyper Password Reset OTP: ${displayOtp}`,
      text: `Hello,\n\nWe received a request to reset the password for your CodeTyper account (${toEmail}).\n\nYour One-Time Password (OTP) is:\n${displayOtp}\n\nThis OTP expires in 15 minutes.\n\nAlternatively, you can reset your password directly by visiting this link:\n${resetUrl}\n\nIf you did not request this, please ignore this message.`,
      html
    });

    logEmailRecord({
      recipientEmail: toEmail,
      subject: `Your CodeTyper Password Reset OTP: ${displayOtp}`,
      emailType: 'password_reset',
      status: 'sent',
      previewText: `Password reset OTP delivered: ${displayOtp}`
    });

    console.log(`[Mailer] Password reset email with OTP ${displayOtp} successfully dispatched to ${toEmail}`);
    return { delivered: true, simulated: false, otpCode: displayOtp };
  } catch (error) {
    console.error(`[Mailer] Error sending email to ${toEmail}:`, error);
    logEmailRecord({
      recipientEmail: toEmail,
      subject: `Your CodeTyper Password Reset OTP: ${displayOtp}`,
      emailType: 'password_reset',
      status: 'failed',
      previewText: error.message
    });
    return { delivered: false, error: error.message };
  }
}

/**
 * Automated Email Dispatch when Admin resolves user feedback/bug report
 */
export async function sendFeedbackResolutionEmail({ toEmail, recipientName, subject, category, originalMessage, adminNotes, origin }) {
  const appOrigin = origin || process.env.APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://codetyper-beta.vercel.app');
  const transport = getTransporter();
  const name = recipientName || 'Developer';
  const issueSubject = subject || 'Reported Issue';
  const note = adminNotes || 'Our engineering team has resolved this inquiry in the latest system build. All systems are operating normally.';

  const isTestEnv = process.env.NODE_ENV === 'test' || process.env.SIMULATE_EMAIL === 'true';
  const lowerEmail = (toEmail || '').toLowerCase();
  const isMockDomain = lowerEmail.endsWith('@codetyper.dev') ||
                       lowerEmail.endsWith('@codetyper.test') ||
                       lowerEmail.endsWith('@example.com') ||
                       lowerEmail.includes('mock_') ||
                       lowerEmail.includes('test_');

  const emailSubject = `[Resolved] CodeTyper Note: "${issueSubject}"`;
  const preview = `Your report regarding "${issueSubject}" has been marked resolved. Engineer note: ${note}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FAF8F1; color: #2C3531; margin: 0; padding: 2rem 1rem; }
        .container { max-width: 540px; margin: 0 auto; background: #FFFFFF; border-radius: 14px; border: 1px solid #DDEBDD; padding: 2.25rem; box-shadow: 0 4px 20px rgba(0,0,0,0.04); }
        .logo { font-size: 1.45rem; font-weight: 700; color: #2F6B52; margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.5rem; }
        .badge { display: inline-block; background-color: #E8F5E9; color: #1B5E20; padding: 0.35rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 1rem; }
        .quote-box { background: #F8F9FA; border-left: 3px solid #CFD8DC; border-radius: 4px; padding: 0.85rem 1rem; margin: 1rem 0; font-size: 0.88rem; color: #546E7A; font-style: italic; }
        .resolution-box { background: #F1F8F4; border: 1px solid #C8E6C9; border-radius: 10px; padding: 1.25rem; margin: 1.25rem 0; }
        .resolution-title { font-size: 0.85rem; font-weight: 700; color: #2E7D32; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.4rem; }
        .button { display: inline-block; background-color: #2F6B52; color: #FAF8F1 !important; text-decoration: none; padding: 0.85rem 1.75rem; border-radius: 8px; font-weight: 600; font-size: 0.95rem; margin: 1rem 0; text-align: center; }
        .footer { font-size: 0.78rem; color: #738276; margin-top: 2rem; border-top: 1px solid #EAE7DC; padding-top: 1rem; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">🌿 CodeTyper Resolution Center</div>
        <div class="badge">✓ Issue Resolved & Closed</div>
        <h2 style="margin-top: 0; color: #111827; font-size: 1.3rem;">Good news, ${name}!</h2>
        <p style="font-size: 0.95rem; line-height: 1.6; color: #374151; margin-bottom: 0.75rem;">
          Thank you for helping us polish the CodeTyper platform. Your inquiry regarding <strong>"${issueSubject}"</strong> has been investigated and addressed by our engineering team.
        </p>

        <div class="quote-box">
          "${originalMessage || issueSubject}"
        </div>

        <div class="resolution-box">
          <div class="resolution-title">🛠️ Engineering Team Response:</div>
          <p style="margin: 0; font-size: 0.92rem; line-height: 1.6; color: #1B4332;">
            ${note}
          </p>
        </div>

        <div style="text-align: center;">
          <a href="${appOrigin}/" class="button" target="_blank">Open CodeTyper & Verify Fix</a>
        </div>

        <p style="font-size: 0.8rem; color: #6B7280; line-height: 1.5; margin-top: 1.5rem;">
          If you continue to experience unexpected behavior or have any questions, feel free to submit another report directly in CodeTyper.
        </p>
        <div class="footer">
          CodeTyper • Peaceful, sub-millisecond typing sanctuary for developers.
        </div>
      </div>
    </body>
    </html>
  `;

  if (!transport || isTestEnv || isMockDomain) {
    console.log(`\n==================================================`);
    console.log(`[Mailer: RESOLUTION] Simulated Auto-Email to ${toEmail}`);
    console.log(`Subject: ${emailSubject}`);
    console.log(`Notes: ${note}`);
    console.log(`==================================================\n`);

    logEmailRecord({
      recipientEmail: toEmail,
      subject: emailSubject,
      emailType: 'feedback_resolved',
      status: 'simulated',
      previewText: preview
    });

    return { delivered: true, simulated: true };
  }

  const fromAddress = process.env.SMTP_FROM || `"CodeTyper Engineering" <${process.env.SMTP_USER}>`;

  try {
    await transport.sendMail({
      from: fromAddress,
      to: toEmail,
      subject: emailSubject,
      text: `Hello ${name},\n\nYour issue "${issueSubject}" has been resolved by our engineering team.\n\nNote: ${note}\n\nVisit: ${appOrigin}`,
      html
    });

    logEmailRecord({
      recipientEmail: toEmail,
      subject: emailSubject,
      emailType: 'feedback_resolved',
      status: 'sent',
      previewText: preview
    });

    console.log(`[Mailer] Resolution email successfully dispatched to ${toEmail}`);
    return { delivered: true, simulated: false };
  } catch (err) {
    console.error(`[Mailer] Error sending resolution email to ${toEmail}:`, err);
    logEmailRecord({
      recipientEmail: toEmail,
      subject: emailSubject,
      emailType: 'feedback_resolved',
      status: 'failed',
      previewText: err.message
    });
    return { delivered: false, error: err.message };
  }
}

/**
 * Automated Welcome Email when user subscribes to Developer Digest
 */
export async function sendNewsletterWelcomeEmail({ toEmail, origin }) {
  const appOrigin = origin || process.env.APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://codetyper-beta.vercel.app');
  const transport = getTransporter();

  const isTestEnv = process.env.NODE_ENV === 'test' || process.env.SIMULATE_EMAIL === 'true';
  const lowerEmail = (toEmail || '').toLowerCase();
  const isMockDomain = lowerEmail.endsWith('@codetyper.dev') ||
                       lowerEmail.endsWith('@codetyper.test') ||
                       lowerEmail.endsWith('@example.com');

  const emailSubject = `Welcome to CodeTyper Developer Digest ⚡`;
  const preview = `You are subscribed to Developer Digest. Curated snippets, ergonomics guides, and major engine changelogs.`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FAF8F1; color: #2C3531; margin: 0; padding: 2rem 1rem; }
        .container { max-width: 540px; margin: 0 auto; background: #FFFFFF; border-radius: 14px; border: 1px solid #DDEBDD; padding: 2.25rem; box-shadow: 0 4px 20px rgba(0,0,0,0.04); }
        .logo { font-size: 1.45rem; font-weight: 700; color: #2F6B52; margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.5rem; }
        .feature-card { background: #F8FAF8; border: 1px solid #E2EFE5; border-radius: 8px; padding: 0.85rem 1rem; margin: 0.65rem 0; font-size: 0.88rem; color: #2D3748; }
        .button { display: inline-block; background-color: #2F6B52; color: #FAF8F1 !important; text-decoration: none; padding: 0.85rem 1.75rem; border-radius: 8px; font-weight: 600; font-size: 0.95rem; margin: 1.25rem 0; text-align: center; }
        .footer { font-size: 0.78rem; color: #738276; margin-top: 2rem; border-top: 1px solid #EAE7DC; padding-top: 1rem; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">🌿 CodeTyper • Developer Digest</div>
        <h2 style="margin-top: 0; color: #111827; font-size: 1.35rem;">You're in the flow.</h2>
        <p style="font-size: 0.95rem; line-height: 1.6; color: #374151;">
          Thank you for subscribing to <strong>CodeTyper Developer Digest</strong>. Here is what you will receive:
        </p>

        <div class="feature-card">
          <strong>⚡ Curated Code Snippets:</strong> Real-world algorithms, patterns, and syntax practice in 25+ programming languages.
        </div>
        <div class="feature-card">
          <strong>🧘 Ergonomics & Speed Guides:</strong> Mechanical switch profiles, posture optimization, and shortcut mastery.
        </div>
        <div class="feature-card">
          <strong>🚀 Engine Changelogs:</strong> Early previews of sub-millisecond updates, multiplayer tournaments, and custom themes.
        </div>

        <div style="text-align: center;">
          <a href="${appOrigin}/practice" class="button" target="_blank">Start Practice Session</a>
        </div>

        <p style="font-size: 0.8rem; color: #6B7280; line-height: 1.5;">
          <strong>Zero spam guarantee:</strong> 100% client-side privacy. Your keystrokes and data are never sold or tracked.
        </p>
        <div class="footer">
          CodeTyper Sanctuary • Built for developers who care about craftsmanship.
        </div>
      </div>
    </body>
    </html>
  `;

  if (!transport || isTestEnv || isMockDomain) {
    console.log(`\n==================================================`);
    console.log(`[Mailer: WELCOME] Simulated Newsletter Welcome to ${toEmail}`);
    console.log(`Subject: ${emailSubject}`);
    console.log(`==================================================\n`);

    logEmailRecord({
      recipientEmail: toEmail,
      subject: emailSubject,
      emailType: 'newsletter_welcome',
      status: 'simulated',
      previewText: preview
    });

    return { delivered: true, simulated: true };
  }

  const fromAddress = process.env.SMTP_FROM || `"CodeTyper Digest" <${process.env.SMTP_USER}>`;

  try {
    await transport.sendMail({
      from: fromAddress,
      to: toEmail,
      subject: emailSubject,
      text: `Welcome to CodeTyper Developer Digest!\n\nYou will receive curated code snippets, typing ergonomics, and engine changelogs.\n\nPractice now: ${appOrigin}`,
      html
    });

    logEmailRecord({
      recipientEmail: toEmail,
      subject: emailSubject,
      emailType: 'newsletter_welcome',
      status: 'sent',
      previewText: preview
    });

    return { delivered: true, simulated: false };
  } catch (err) {
    console.error(`[Mailer] Error sending welcome email to ${toEmail}:`, err);
    logEmailRecord({
      recipientEmail: toEmail,
      subject: emailSubject,
      emailType: 'newsletter_welcome',
      status: 'failed',
      previewText: err.message
    });
    return { delivered: false, error: err.message };
  }
}

/**
 * Broadcast New Platform Update to all active newsletter subscribers
 */
export async function sendBroadcastUpdateEmail({ toEmails, updateTitle, changelogNotes, versionTag, origin }) {
  const appOrigin = origin || process.env.APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://codetyper-beta.vercel.app');
  const transport = getTransporter();
  const title = updateTitle || 'CodeTyper Engine Update';
  const tag = versionTag || 'v2.5 Release';
  const notes = changelogNotes || 'New features, performance enhancements, and bug fixes are now live.';

  const isTestEnv = process.env.NODE_ENV === 'test' || process.env.SIMULATE_EMAIL === 'true';
  const emailSubject = `[CodeTyper Dispatch] ${title} (${tag})`;
  const preview = `New Update: ${title} - ${notes.slice(0, 150)}...`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FAF8F1; color: #2C3531; margin: 0; padding: 2rem 1rem; }
        .container { max-width: 540px; margin: 0 auto; background: #FFFFFF; border-radius: 14px; border: 1px solid #DDEBDD; padding: 2.25rem; box-shadow: 0 4px 20px rgba(0,0,0,0.04); }
        .logo { font-size: 1.45rem; font-weight: 700; color: #2F6B52; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem; }
        .badge { display: inline-block; background-color: #E0F2FE; color: #0369A1; padding: 0.35rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 1rem; }
        .changelog-box { background: #F3F4F6; border-left: 4px solid #2F6B52; border-radius: 6px; padding: 1.25rem; margin: 1.25rem 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 0.9rem; line-height: 1.6; color: #1F2937; white-space: pre-wrap; }
        .button { display: inline-block; background-color: #2F6B52; color: #FAF8F1 !important; text-decoration: none; padding: 0.85rem 1.75rem; border-radius: 8px; font-weight: 600; font-size: 0.95rem; margin: 1rem 0; text-align: center; }
        .footer { font-size: 0.78rem; color: #738276; margin-top: 2rem; border-top: 1px solid #EAE7DC; padding-top: 1rem; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">🌿 CodeTyper Release Dispatch</div>
        <div class="badge">${tag}</div>
        <h2 style="margin-top: 0; color: #111827; font-size: 1.35rem;">${title}</h2>
        <p style="font-size: 0.95rem; line-height: 1.6; color: #374151;">
          A new platform release and developer digest update has just landed on CodeTyper!
        </p>

        <div class="changelog-box">${notes}</div>

        <div style="text-align: center;">
          <a href="${appOrigin}/" class="button" target="_blank">Explore What's New</a>
        </div>

        <div class="footer">
          You are receiving this because you subscribed to Developer Digest at CodeTyper. Zero spam, ever.
        </div>
      </div>
    </body>
    </html>
  `;

  const recipients = Array.isArray(toEmails) ? toEmails : [toEmails];
  let dispatchedCount = 0;

  for (const email of recipients) {
    const lowerEmail = (email || '').toLowerCase();
    const isMockDomain = lowerEmail.endsWith('@codetyper.dev') ||
                         lowerEmail.endsWith('@codetyper.test') ||
                         lowerEmail.endsWith('@example.com');

    if (!transport || isTestEnv || isMockDomain) {
      logEmailRecord({
        recipientEmail: email,
        subject: emailSubject,
        emailType: 'broadcast',
        status: 'simulated',
        previewText: preview
      });
      dispatchedCount++;
    } else {
      try {
        const fromAddress = process.env.SMTP_FROM || `"CodeTyper Updates" <${process.env.SMTP_USER}>`;
        await transport.sendMail({
          from: fromAddress,
          to: email,
          subject: emailSubject,
          text: `${title} (${tag})\n\n${notes}\n\nVisit: ${appOrigin}`,
          html
        });
        logEmailRecord({
          recipientEmail: email,
          subject: emailSubject,
          emailType: 'broadcast',
          status: 'sent',
          previewText: preview
        });
        dispatchedCount++;
      } catch (err) {
        console.error(`[Mailer] Error broadcasting to ${email}:`, err);
        logEmailRecord({
          recipientEmail: email,
          subject: emailSubject,
          emailType: 'broadcast',
          status: 'failed',
          previewText: err.message
        });
      }
    }
  }

  console.log(`[Mailer] Broadcast "${title}" dispatched to ${dispatchedCount} subscriber(s).`);
  return { delivered: true, count: dispatchedCount };
}


