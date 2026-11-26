import { db } from './db.js';

/**
 * Fetch active webhook configuration and event routing flags
 */
export function getWebhookConfig() {
  try {
    const rows = db.prepare(`
      SELECT key, value FROM system_settings 
      WHERE key IN (
        'webhook_discord_url', 
        'webhook_slack_url', 
        'webhook_event_cert', 
        'webhook_event_feedback', 
        'webhook_event_subscriber', 
        'webhook_event_security'
      )
    `).all();

    const config = {
      discordUrl: '',
      slackUrl: '',
      events: {
        certIssued: true,
        feedbackSubmitted: true,
        subscriberJoined: true,
        securityAlert: true
      }
    };

    for (const r of rows) {
      if (r.key === 'webhook_discord_url') config.discordUrl = r.value || '';
      if (r.key === 'webhook_slack_url') config.slackUrl = r.value || '';
      if (r.key === 'webhook_event_cert') config.events.certIssued = r.value !== '0';
      if (r.key === 'webhook_event_feedback') config.events.feedbackSubmitted = r.value !== '0';
      if (r.key === 'webhook_event_subscriber') config.events.subscriberJoined = r.value !== '0';
      if (r.key === 'webhook_event_security') config.events.securityAlert = r.value !== '0';
    }

    return config;
  } catch (err) {
    console.warn('[Webhook] Failed to read webhook settings:', err.message);
    return {
      discordUrl: '',
      slackUrl: '',
      events: { certIssued: true, feedbackSubmitted: true, subscriberJoined: true, securityAlert: true }
    };
  }
}

/**
 * Record webhook delivery attempt in audit logs
 */
export function logWebhookRecord({ service, eventType, status = 'success', statusCode = null, payloadSummary = '', errorMessage = null }) {
  try {
    db.prepare(`
      INSERT INTO webhook_logs (service, event_type, status, status_code, payload_summary, error_message)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(service, eventType, status, statusCode, payloadSummary.slice(0, 500), errorMessage ? String(errorMessage).slice(0, 500) : null);
  } catch (err) {
    console.warn('[Webhook] Failed to record webhook log entry:', err.message);
  }
}

/**
 * Fetch recent webhook logs for Admin stream
 */
export function getRecentWebhookLogs(limit = 40) {
  try {
    return db.prepare(`
      SELECT id, service, event_type, status, status_code, payload_summary, error_message, created_at
      FROM webhook_logs
      ORDER BY id DESC
      LIMIT ?
    `).all(Math.min(limit, 100));
  } catch (err) {
    console.warn('[Webhook] Failed to fetch webhook logs:', err.message);
    return [];
  }
}

/**
 * Low-level HTTP dispatcher for Discord Webhook
 */
async function sendDiscordWebhook(url, discordPayload) {
  if (!url || !url.trim().startsWith('http')) {
    return { success: false, error: 'Invalid or missing Discord Webhook URL' };
  }

  const response = await fetch(url.trim(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(discordPayload),
    signal: AbortSignal.timeout(6000)
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`Discord returned HTTP ${response.status}: ${errorText.slice(0, 200)}`);
  }

  return { success: true, statusCode: response.status };
}

/**
 * Low-level HTTP dispatcher for Slack Webhook
 */
async function sendSlackWebhook(url, slackPayload) {
  if (!url || !url.trim().startsWith('http')) {
    return { success: false, error: 'Invalid or missing Slack Webhook URL' };
  }

  const response = await fetch(url.trim(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(slackPayload),
    signal: AbortSignal.timeout(6000)
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`Slack returned HTTP ${response.status}: ${errorText.slice(0, 200)}`);
  }

  return { success: true, statusCode: response.status };
}

/**
 * Test connectivity for Discord or Slack Webhooks from Admin Control Center
 */
export async function testWebhookConnection(service, targetUrl) {
  const url = (targetUrl || '').trim();
  if (!url.startsWith('http')) {
    return { success: false, message: 'Please provide a valid HTTP/HTTPS webhook URL.' };
  }

  const now = new Date().toUTCString();

  if (service === 'discord') {
    const payload = {
      username: 'CodeTyper Mission Control',
      avatar_url: 'https://raw.githubusercontent.com/saumypandey745/codetyper/main/public/favicon.ico',
      embeds: [
        {
          title: '🟢 CodeTyper Mission Control • Discord Webhook Connected',
          description: 'Live telemetry test successful! Your Discord channel is now connected to real-time events on **CodeTyper**.',
          color: 0x10B981, // Emerald green
          fields: [
            { name: '🛰️ Status', value: 'Operational', inline: true },
            { name: '⚡ Environment', value: 'Production / Local Core', inline: true },
            { name: '⏱️ Timestamp (UTC)', value: now, inline: false }
          ],
          footer: { text: 'CodeTyper Webhook Dispatcher • Antigravity Engine' },
          timestamp: new Date().toISOString()
        }
      ]
    };

    try {
      const res = await sendDiscordWebhook(url, payload);
      logWebhookRecord({
        service: 'discord',
        eventType: 'TEST_PING',
        status: 'success',
        statusCode: res.statusCode || 204,
        payloadSummary: 'Manual Admin Discord Webhook Diagnostic Ping'
      });
      return { success: true, statusCode: res.statusCode || 204, message: 'Discord webhook test alert dispatched successfully!' };
    } catch (err) {
      logWebhookRecord({
        service: 'discord',
        eventType: 'TEST_PING',
        status: 'failed',
        errorMessage: err.message,
        payloadSummary: 'Manual Admin Discord Webhook Diagnostic Ping'
      });
      return { success: false, message: err.message };
    }
  }

  if (service === 'slack') {
    const payload = {
      text: '🟢 CodeTyper Mission Control • Slack Webhook Connected',
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '🟢 CodeTyper Mission Control • Slack Connected',
            emoji: true
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: 'Live telemetry check passed! Real-time alerts (Grandmaster certs, bug tickets, digest subscribers) will now be posted to this Slack channel.\n*Timestamp (UTC):* `' + now + '`'
          }
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: 'CodeTyper Automated Webhook Dispatcher'
            }
          ]
        }
      ]
    };

    try {
      const res = await sendSlackWebhook(url, payload);
      logWebhookRecord({
        service: 'slack',
        eventType: 'TEST_PING',
        status: 'success',
        statusCode: res.statusCode || 200,
        payloadSummary: 'Manual Admin Slack Webhook Diagnostic Ping'
      });
      return { success: true, statusCode: res.statusCode || 200, message: 'Slack webhook test alert dispatched successfully!' };
    } catch (err) {
      logWebhookRecord({
        service: 'slack',
        eventType: 'TEST_PING',
        status: 'failed',
        errorMessage: err.message,
        payloadSummary: 'Manual Admin Slack Webhook Diagnostic Ping'
      });
      return { success: false, message: err.message };
    }
  }

  return { success: false, message: `Unsupported service '${service}'. Use 'discord' or 'slack'.` };
}

/**
 * Universal Event Dispatcher
 * Dispatches formatted payloads to Discord and/or Slack based on system configuration.
 * Non-blocking, fails gracefully.
 */
export async function dispatchWebhookEvent(eventType, data = {}) {
  const config = getWebhookConfig();
  const { discordUrl, slackUrl, events } = config;

  // Verify if event is enabled in settings
  if (eventType === 'CERT_ISSUED' && !events.certIssued) return;
  if (eventType === 'FEEDBACK_SUBMITTED' && !events.feedbackSubmitted) return;
  if (eventType === 'NEW_SUBSCRIBER' && !events.subscriberJoined) return;
  if (eventType === 'SECURITY_ALERT' && !events.securityAlert) return;

  if (!discordUrl && !slackUrl) {
    return; // No webhooks configured
  }

  let discordPayload = null;
  let slackPayload = null;
  let summary = '';

  const origin = data.origin || 'http://localhost:5000';

  // Format payloads based on event type
  if (eventType === 'CERT_ISSUED') {
    const isGrandmaster = (data.tierBadge || '').toLowerCase().includes('grandmaster') || Number(data.netWpm) >= 120;
    const title = isGrandmaster
      ? '🏆 Grandmaster Accredited Certificate Earned!'
      : '📜 Accredited Typing Certificate Issued!';
    const color = isGrandmaster ? 0xF59E0B : 0x3B82F6; // Gold or Blue
    summary = `Cert #${data.certId} for ${data.recipientName} (${data.netWpm} WPM, ${data.accuracy}%)`;

    discordPayload = {
      username: 'CodeTyper Accreditation Registry',
      avatar_url: 'https://raw.githubusercontent.com/saumypandey745/codetyper/main/public/favicon.ico',
      embeds: [
        {
          title,
          description: `**${data.recipientName}** has completed the official typing accreditation examination.`,
          color,
          fields: [
            { name: '⚡ Net Speed', value: `${data.netWpm} WPM`, inline: true },
            { name: '🎯 Accuracy', value: `${data.accuracy}%`, inline: true },
            { name: '🎖️ Tier', value: `${data.tierTitle || 'Certified Typist'} (${data.tierBadge || 'Gold'})`, inline: true },
            { name: '⏱️ Duration', value: `${data.durationSeconds || 60}s`, inline: true },
            { name: '📜 Credential ID', value: `\`${data.certId}\``, inline: true },
            { name: '🔗 Public Verification', value: `[Verify Certificate](${origin}/verify/${data.certId})`, inline: true }
          ],
          footer: { text: 'CodeTyper Tamper-Proof Cryptographic Accreditation' },
          timestamp: new Date().toISOString()
        }
      ]
    };

    slackPayload = {
      text: `${title} - ${data.recipientName} (${data.netWpm} WPM, ${data.accuracy}%)`,
      blocks: [
        {
          type: 'header',
          text: { type: 'plain_text', text: title, emoji: true }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*${data.recipientName}* achieved *${data.tierTitle || 'Certified Typist'}* accreditation!\n*Speed:* ${data.netWpm} Net WPM • *Accuracy:* ${data.accuracy}% • *Credential:* \`${data.certId}\`\n<${origin}/verify/${data.certId}|Verify Credential Online>`
          }
        }
      ]
    };
  } else if (eventType === 'FEEDBACK_SUBMITTED') {
    const isBug = (data.category || '').toLowerCase() === 'bug_report';
    const title = isBug ? '🚨 New Bug Report Received' : '💬 New User Feedback / Support Note';
    const color = isBug ? 0xEF4444 : 0x06B6D4;
    summary = `Feedback #${data.feedbackId} from ${data.name} [${data.category}]: ${data.subject}`;

    discordPayload = {
      username: 'CodeTyper Issue Tracker',
      avatar_url: 'https://raw.githubusercontent.com/saumypandey745/codetyper/main/public/favicon.ico',
      embeds: [
        {
          title,
          description: `**Subject:** ${data.subject}`,
          color,
          fields: [
            { name: '👤 Sender', value: `${data.name} (<${data.email}>)`, inline: true },
            { name: '🏷️ Category', value: String(data.category).toUpperCase(), inline: true },
            { name: '🎫 Ticket ID', value: `#${data.feedbackId}`, inline: true },
            { name: '📝 Message Details', value: (data.message || '').slice(0, 500), inline: false }
          ],
          footer: { text: 'CodeTyper Support Triage Engine' },
          timestamp: new Date().toISOString()
        }
      ]
    };

    slackPayload = {
      text: `${title} #${data.feedbackId}: ${data.subject}`,
      blocks: [
        {
          type: 'header',
          text: { type: 'plain_text', text: `${title} #${data.feedbackId}`, emoji: true }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*From:* ${data.name} (<mailto:${data.email}|${data.email}>) • *Category:* \`${String(data.category).toUpperCase()}\`\n*Subject:* *${data.subject}*\n>${(data.message || '').replace(/\n/g, '\n>')}`
          }
        }
      ]
    };
  } else if (eventType === 'NEW_SUBSCRIBER') {
    summary = `New subscriber: ${data.email} (${data.source || 'footer'})`;
    discordPayload = {
      username: 'CodeTyper Community Growth',
      avatar_url: 'https://raw.githubusercontent.com/saumypandey745/codetyper/main/public/favicon.ico',
      embeds: [
        {
          title: '📬 New Developer Digest Subscriber',
          description: `A developer has subscribed to the weekly curated code digest and typing ergonomics tips.`,
          color: 0x10B981,
          fields: [
            { name: '📧 Subscriber Email', value: data.email, inline: true },
            { name: '📍 Source', value: String(data.source || 'footer'), inline: true }
          ],
          footer: { text: 'CodeTyper Growth Pulse' },
          timestamp: new Date().toISOString()
        }
      ]
    };

    slackPayload = {
      text: `📬 New Developer Digest Subscriber: ${data.email}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*📬 New Developer Digest Subscriber:*\n*Email:* \`${data.email}\` • *Source:* \`${data.source || 'footer'}\``
          }
        }
      ]
    };
  } else if (eventType === 'SECURITY_ALERT') {
    summary = `Security alert: ${data.action} on ${data.targetId || 'session'}`;
    discordPayload = {
      username: 'CodeTyper Anti-Cheat Sentinel',
      avatar_url: 'https://raw.githubusercontent.com/saumypandey745/codetyper/main/public/favicon.ico',
      embeds: [
        {
          title: '🛡️ Sentinel Governance Alert',
          description: `Administrative or automated governance action executed.`,
          color: 0xF43F5E,
          fields: [
            { name: 'Action', value: data.action, inline: true },
            { name: 'Admin', value: data.adminUsername || 'system', inline: true },
            { name: 'Target ID', value: String(data.targetId || 'N/A'), inline: true },
            { name: 'Reason', value: data.reason || 'Integrity violation', inline: false }
          ],
          footer: { text: 'CodeTyper Security Sentinel' },
          timestamp: new Date().toISOString()
        }
      ]
    };

    slackPayload = {
      text: `🛡️ Security Alert: ${data.action} by ${data.adminUsername || 'system'}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*🛡️ Security Alert:*\n*Action:* \`${data.action}\`\n*Admin:* ${data.adminUsername || 'system'}\n*Target:* \`${data.targetId || 'N/A'}\`\n*Reason:* ${data.reason || 'Integrity violation'}`
          }
        }
      ]
    };
  }

  // Dispatch to Discord if configured
  if (discordUrl && discordPayload) {
    sendDiscordWebhook(discordUrl, discordPayload)
      .then((res) => {
        logWebhookRecord({
          service: 'discord',
          eventType,
          status: 'success',
          statusCode: res.statusCode || 204,
          payloadSummary: summary
        });
      })
      .catch((err) => {
        logWebhookRecord({
          service: 'discord',
          eventType,
          status: 'failed',
          errorMessage: err.message,
          payloadSummary: summary
        });
      });
  }

  // Dispatch to Slack if configured
  if (slackUrl && slackPayload) {
    sendSlackWebhook(slackUrl, slackPayload)
      .then((res) => {
        logWebhookRecord({
          service: 'slack',
          eventType,
          status: 'success',
          statusCode: res.statusCode || 200,
          payloadSummary: summary
        });
      })
      .catch((err) => {
        logWebhookRecord({
          service: 'slack',
          eventType,
          status: 'failed',
          errorMessage: err.message,
          payloadSummary: summary
        });
      });
  }
}
