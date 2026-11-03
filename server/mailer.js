import nodemailer from 'nodemailer';

// CodeTyper Automated Mailer Service
// Sends transactional emails (Password Resets, Account Verification) via SMTP.

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
      auth: { user, pass }
    });
    console.log(`[Mailer] SMTP transport configured for ${host}:${port} (${user})`);
  }

  return transporter;
}

export async function sendPasswordResetEmail({ toEmail, resetToken, origin }) {
  const appOrigin = origin || process.env.APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://codetyper-beta.vercel.app');
  const resetUrl = `${appOrigin}/#forgot-password?token=${resetToken}`;

  const transport = getTransporter();

  if (!transport) {
    console.log(`\n==================================================`);
    console.log(`[Mailer] (Simulated - No SMTP Configured)`);
    console.log(`To: ${toEmail}`);
    console.log(`Subject: Reset Your CodeTyper Password`);
    console.log(`Direct Reset Link: ${resetUrl}`);
    console.log(`==================================================\n`);

    return {
      delivered: false,
      simulated: true,
      resetUrl,
      resetToken
    };
  }

  const fromAddress = process.env.SMTP_FROM || `"CodeTyper Sanctuary" <${process.env.SMTP_USER}>`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FAF8F1; color: #2C3531; margin: 0; padding: 2rem; }
        .container { max-width: 520px; margin: 0 auto; background: #FFFFFF; border-radius: 12px; border: 1px solid #DDEBDD; padding: 2.5rem; }
        .logo { font-size: 1.5rem; font-weight: 700; color: #2F6B52; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem; }
        .button { display: inline-block; background-color: #2F6B52; color: #FAF8F1 !important; text-decoration: none; padding: 0.85rem 1.75rem; border-radius: 8px; font-weight: 600; font-size: 1rem; margin: 1.5rem 0; }
        .footer { font-size: 0.8rem; color: #738276; margin-top: 2rem; border-top: 1px solid #EAE7DC; padding-top: 1rem; }
        .code-block { background: #F3F4F1; padding: 0.75rem; border-radius: 6px; font-family: monospace; font-size: 0.85rem; word-break: break-all; margin: 1rem 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">🌿 CodeTyper</div>
        <h2 style="margin-top: 0; color: #111827;">Reset Your Password</h2>
        <p style="font-size: 0.95rem; line-height: 1.6; color: #4B5563;">
          Hello,
        </p>
        <p style="font-size: 0.95rem; line-height: 1.6; color: #4B5563;">
          We received a request to reset the password for your CodeTyper account associated with <strong>${toEmail}</strong>.
        </p>
        <div style="text-align: center;">
          <a href="${resetUrl}" class="button" target="_blank">Reset My Password</a>
        </div>
        <p style="font-size: 0.85rem; color: #6B7280; line-height: 1.5;">
          If the button above does not work, copy and paste this secure recovery link into your browser:
        </p>
        <div class="code-block">${resetUrl}</div>
        <p style="font-size: 0.85rem; color: #6B7280; line-height: 1.5;">
          This link will expire in 15 minutes. If you did not make this request, you can safely ignore this email; your account remains secure.
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
      subject: 'Reset Your CodeTyper Password',
      text: `Hello,\n\nWe received a request to reset your CodeTyper password.\n\nPlease visit this link to set a new password:\n${resetUrl}\n\nThis link expires in 15 minutes.\n\nIf you did not request this, please ignore this message.`,
      html
    });

    console.log(`[Mailer] Password reset email successfully dispatched to ${toEmail}`);
    return { delivered: true, simulated: false };
  } catch (error) {
    console.error(`[Mailer] Error sending email to ${toEmail}:`, error);
    return { delivered: false, error: error.message };
  }
}

