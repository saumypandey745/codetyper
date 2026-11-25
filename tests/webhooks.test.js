import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { db, initDatabase } from '../server/db.js';
import {
  getWebhookConfig,
  logWebhookRecord,
  getRecentWebhookLogs,
  testWebhookConnection,
  dispatchWebhookEvent
} from '../server/webhookDispatcher.js';

describe('Discord & Slack Webhooks Integration Suite', () => {
  it('ensures webhook_logs table is created and operational', () => {
    initDatabase();
    const table = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='webhook_logs'").get();
    assert.ok(table, 'webhook_logs table must exist in sqlite_master');

    const testId = Date.now();
    logWebhookRecord({
      service: 'discord',
      eventType: 'TEST_PING',
      status: 'success',
      statusCode: 204,
      payloadSummary: `Diagnostic log #${testId}`
    });

    const inserted = db.prepare('SELECT * FROM webhook_logs WHERE payload_summary LIKE ?').get(`%${testId}%`);
    assert.ok(inserted, 'Inserted webhook log record must be queryable');
    assert.equal(inserted.service, 'discord');
    assert.equal(inserted.event_type, 'TEST_PING');
    assert.equal(inserted.status, 'success');
    assert.equal(inserted.status_code, 204);
  });

  it('reads default webhook configuration safely from system_settings', () => {
    const config = getWebhookConfig();
    assert.ok(typeof config === 'object', 'Webhook config must be an object');
    assert.ok('discordUrl' in config, 'discordUrl property must exist');
    assert.ok('slackUrl' in config, 'slackUrl property must exist');
    assert.ok(typeof config.events === 'object', 'events property must be an object');
    assert.equal(typeof config.events.certIssued, 'boolean');
    assert.equal(typeof config.events.feedbackSubmitted, 'boolean');
    assert.equal(typeof config.events.subscriberJoined, 'boolean');
    assert.equal(typeof config.events.securityAlert, 'boolean');
  });

  it('rejects invalid or non-HTTP webhook URLs during test diagnostics', async () => {
    const res1 = await testWebhookConnection('discord', 'not-a-valid-url');
    assert.equal(res1.success, false);
    assert.ok(res1.message.includes('valid HTTP'));

    const res2 = await testWebhookConnection('unsupported-channel', 'https://example.com/webhook');
    assert.equal(res2.success, false);
    assert.ok(res2.message.includes('Unsupported service'));
  });

  it('safely handles dispatchWebhookEvent when no webhooks are configured without throwing', async () => {
    // When both URLs are empty, dispatchWebhookEvent should return cleanly
    await assert.doesNotReject(async () => {
      await dispatchWebhookEvent('CERT_ISSUED', {
        certId: 'CT-TEST-001',
        recipientName: 'Test Typist',
        netWpm: 125,
        accuracy: 99.2
      });
    });

    await assert.doesNotReject(async () => {
      await dispatchWebhookEvent('FEEDBACK_SUBMITTED', {
        feedbackId: 999,
        name: 'Reporter',
        email: 'user@test.dev',
        category: 'bug_report',
        subject: 'Test Bug',
        message: 'Sample report message'
      });
    });

    await assert.doesNotReject(async () => {
      await dispatchWebhookEvent('NEW_SUBSCRIBER', {
        email: 'sub@codetyper.test',
        source: 'footer'
      });
    });
  });

  it('retrieves recent webhook logs ordered by creation timestamp', () => {
    const logs = getRecentWebhookLogs(10);
    assert.ok(Array.isArray(logs), 'Recent webhook logs must return an array');
    assert.ok(logs.length > 0, 'Should contain at least the test record logged earlier');
    assert.ok(logs[0].id !== undefined, 'Log item must contain id');
    assert.ok(logs[0].service !== undefined, 'Log item must contain service');
  });
});
