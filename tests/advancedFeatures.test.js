import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { app } from '../server/index.js';
import { db } from '../server/db.js';
import {
  calculateLevelFromXp,
  computeSessionXp,
  getDailyQuests,
  getXpForLevel,
  getLevelTitle,
  BADGES
} from '../src/utils/gamificationEngine.js';
import { multiplayerManager } from '../server/multiplayer.js';

let server;
let baseUrl;
let demoToken = '';

describe('Advanced Features: Gamification & Progression Engine', () => {
  it('correctly calculates levels, titles, and XP thresholds up to Level 100', () => {
    // Level 1 at 0 XP
    const lvl1 = calculateLevelFromXp(0);
    assert.equal(lvl1.level, 1);
    assert.equal(lvl1.title, 'Keystroke Novice');
    assert.equal(lvl1.progressPercent, 0);

    // Level progression
    const xpForLvl5 = getXpForLevel(5);
    const lvl5 = calculateLevelFromXp(xpForLvl5 + 10);
    assert.ok(lvl5.level >= 5);
    assert.equal(lvl5.title, 'Keystroke Apprentice');

    const lvl50 = calculateLevelFromXp(getXpForLevel(50));
    assert.equal(lvl50.level, 50);
    assert.equal(lvl50.title, 'Syntax Artisan');

    const lvl100 = calculateLevelFromXp(9999999);
    assert.equal(lvl100.level, 100);
    assert.equal(lvl100.title, 'Legend of CodeTyper');
    assert.equal(lvl100.progressPercent, 100);
  });

  it('correctly weights session XP with accuracy, speed, and Zen mode bonus', () => {
    // Standard session
    const xpNormal = computeSessionXp({
      correctCharacters: 200,
      netWpm: 70,
      accuracy: 98,
      isZen: false
    });
    assert.ok(xpNormal > 300, `Expected XP > 300, got ${xpNormal}`);

    // Zen mode 20% bonus
    const xpZen = computeSessionXp({
      correctCharacters: 200,
      netWpm: 70,
      accuracy: 98,
      isZen: true
    });
    assert.ok(xpZen > xpNormal, 'Zen mode must grant bonus XP');
    assert.equal(xpZen, Math.round(xpNormal * 1.2));

    // Zero characters yields 0
    assert.equal(computeSessionXp({ correctCharacters: 0 }), 0);
  });

  it('generates consistent rotating daily quests per calendar date', () => {
    const questsDay1 = getDailyQuests('2026-11-03');
    assert.equal(questsDay1.length, 3);
    assert.ok(questsDay1[0].id);
    assert.ok(questsDay1[0].title);
    assert.ok(questsDay1[0].xpReward > 0);

    // Deterministic for the same day
    const questsAgain = getDailyQuests('2026-11-03');
    assert.deepEqual(questsDay1, questsAgain);

    // Has 12 badges configured
    assert.equal(BADGES.length, 12);
  });
});

describe('Advanced Features: Real-Time 1v1 Multiplayer Duels', () => {
  it('creates a duel room, joins players, tracks race telemetry, and determines winner', () => {
    // 1. Host creates room
    const hostUser = { id: 101, username: 'speedy_host' };
    const room = multiplayerManager.createRoom({ hostUser, language: 'JavaScript' });
    assert.ok(room.id.startsWith('CT-'));
    assert.equal(room.status, 'waiting');
    assert.ok(room.players['101']);
    assert.equal(room.players['101'].username, 'speedy_host');
    assert.ok(room.targetText.length > 0);

    // 2. Challenger joins room
    const guestUser = { id: 202, username: 'challenger_ace' };
    const joined = multiplayerManager.joinRoom({ roomId: room.id, user: guestUser });
    assert.equal(joined.status, 'countdown');
    assert.ok(joined.players['202']);

    // 3. Update telemetry for host
    const prog1 = multiplayerManager.updateProgress({
      roomId: room.id,
      playerId: '101',
      progressPercent: 50,
      wpm: 82,
      accuracy: 98
    });
    assert.equal(prog1.players['101'].progressPercent, 50);
    assert.equal(prog1.players['101'].wpm, 82);

    // 4. Challenger reaches 100% and becomes first to finish (winner)
    const prog2 = multiplayerManager.updateProgress({
      roomId: room.id,
      playerId: '202',
      progressPercent: 100,
      wpm: 95,
      accuracy: 99
    });
    assert.equal(prog2.players['202'].isFinished, true);
    assert.equal(prog2.winner.username, 'challenger_ace');

    // 5. Host finishes, completing the duel
    const prog3 = multiplayerManager.updateProgress({
      roomId: room.id,
      playerId: '101',
      progressPercent: 100,
      wpm: 82,
      accuracy: 98
    });
    assert.equal(prog3.players['101'].isFinished, true);
    assert.equal(prog3.status, 'finished');
    assert.equal(prog3.winner.username, 'challenger_ace');
  });
});

describe('Advanced Features: Custom Snippets API Suite', () => {
  before(async () => {
    await new Promise((resolve) => {
      server = http.createServer(app).listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });

    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login: 'demo@codetyper.dev', password: 'Peaceful_Demo_2026' })
    });
    const loginData = await loginRes.json();
    demoToken = loginData.token;
  });

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  let createdSnippetId;

  it('POST /api/practice/custom creates a custom snippet for authenticated user', async () => {
    const res = await fetch(`${baseUrl}/api/practice/custom`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${demoToken}`
      },
      body: JSON.stringify({
        title: 'Custom Redux Reducer Drill',
        language: 'TypeScript',
        content: 'const reducer = (state = initialState, action: Action) => state;'
      })
    });

    assert.equal(res.status, 201);
    const data = await res.json();
    assert.ok(data.snippet);
    assert.equal(data.snippet.title, 'Custom Redux Reducer Drill');
    assert.equal(data.snippet.language, 'TypeScript');
    createdSnippetId = data.snippet.id;
  });

  it('GET /api/practice/custom returns the saved custom snippets', async () => {
    const res = await fetch(`${baseUrl}/api/practice/custom`, {
      headers: { 'Authorization': `Bearer ${demoToken}` }
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data.snippets));
    const found = data.snippets.find((s) => s.id === createdSnippetId);
    assert.ok(found, 'Created snippet must be in the list');
  });

  it('DELETE /api/practice/custom/:id deletes the user snippet', async () => {
    const res = await fetch(`${baseUrl}/api/practice/custom/${createdSnippetId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${demoToken}` }
    });
    assert.equal(res.status, 200);
  });
});
