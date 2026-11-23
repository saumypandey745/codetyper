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
      auth: { user, pass },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000
    });
    console.log(`[Mailer] SMTP transport configured for ${host}:${port} (${user})`);
  }

  return transporter;
}

export async function sendPasswordResetEmail({ toEmail, resetToken, otpCode, origin }) {
  const appOrigin = origin || process.env.APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://codetyper-beta.vercel.app');
  const resetUrl = `${appOrigin}/#forgot-password?token=${resetToken}`;
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

    console.log(`[Mailer] Password reset email with OTP ${displayOtp} successfully dispatched to ${toEmail}`);
    return { delivered: true, simulated: false, otpCode: displayOtp };
  } catch (error) {
    console.error(`[Mailer] Error sending email to ${toEmail}:`, error);
    return { delivered: false, error: error.message };
  }
}

