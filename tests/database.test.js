import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { db, initDatabase } from '../server/db.js';

describe('Database & Seed Data Integrity Suite', () => {
  it('initializes tables and schemas without error', () => {
    initDatabase();
    const userTable = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").get();
    assert.ok(userTable, 'users table must exist');

    const contentTable = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='practice_content'").get();
    assert.ok(contentTable, 'practice_content table must exist');

    const sessionsTable = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='typing_sessions'").get();
    assert.ok(sessionsTable, 'typing_sessions table must exist');
  });

  it('contains seeded practice content for coding and English', () => {
    const totalCount = db.prepare('SELECT COUNT(*) as count FROM practice_content').get().count;
    assert.ok(totalCount > 30, `Expected at least 30 snippets, found ${totalCount}`);

    const codeCount = db.prepare('SELECT COUNT(*) as count FROM practice_content WHERE is_code = 1').get().count;
    assert.ok(codeCount >= 25, `Expected at least 25 code snippets across languages, found ${codeCount}`);

    const englishCount = db.prepare('SELECT COUNT(*) as count FROM practice_content WHERE is_code = 0').get().count;
    assert.ok(englishCount >= 10, `Expected at least 10 English passages, found ${englishCount}`);
  });

  it('contains seeded Saumy admin account and cleans up legacy dummy accounts', () => {
    const saumyUser = db.prepare("SELECT * FROM users WHERE LOWER(email) = 'saumypandey745@gmail.com'").get();
    assert.ok(saumyUser, 'Saumy admin account must be seeded');
    assert.equal(saumyUser.username, 'saumypandey');
    assert.equal(saumyUser.role, 'admin');

    const legacyDemo = db.prepare("SELECT * FROM users WHERE email = 'demo@codetyper.dev'").get();
    assert.equal(legacyDemo, undefined, 'Legacy demo dummy account must be cleaned up');

    const legacyAdmin = db.prepare("SELECT * FROM users WHERE email = 'admin@codetyper.dev'").get();
    assert.equal(legacyAdmin, undefined, 'Legacy admin dummy account must be cleaned up');
  });
});
