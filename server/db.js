import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import { englishPassages, codingSnippets } from './seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isVercel = !!process.env.VERCEL;
const dbDir = isVercel ? path.join('/tmp', 'codetyper') : path.resolve(__dirname, '../data');

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'codetyper.db');
export const db = new DatabaseSync(dbPath);

// Enable WAL mode, foreign keys, & busy timeout for high performance & concurrency
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');
db.exec('PRAGMA busy_timeout = 5000;');

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      username TEXT UNIQUE NOT NULL,
      full_name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      avatar_url TEXT,
      role TEXT DEFAULT 'user',
      bio TEXT DEFAULT 'Cultivating calm and speed through disciplined daily typing.',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS user_settings (
      user_id INTEGER PRIMARY KEY,
      theme TEXT DEFAULT 'peaceful',
      font_family TEXT DEFAULT 'monospace',
      font_size TEXT DEFAULT 'medium',
      cursor_style TEXT DEFAULT 'line',
      sound_enabled INTEGER DEFAULT 1,
      sound_theme TEXT DEFAULT 'mechanical',
      volume REAL DEFAULT 0.5,
      show_wpm INTEGER DEFAULT 1,
      show_accuracy INTEGER DEFAULT 1,
      show_errors INTEGER DEFAULT 1,
      highlight_mistakes INTEGER DEFAULT 1,
      smooth_scrolling INTEGER DEFAULT 1,
      default_duration INTEGER DEFAULT 60,
      default_difficulty TEXT DEFAULT 'intermediate',
      auto_start INTEGER DEFAULT 1,
      countdown_enabled INTEGER DEFAULT 1,
      public_profile INTEGER DEFAULT 1,
      save_history INTEGER DEFAULT 1,
      reduced_motion INTEGER DEFAULT 0,
      high_contrast INTEGER DEFAULT 0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS user_statistics (
      user_id INTEGER PRIMARY KEY,
      total_tests INTEGER DEFAULT 0,
      total_practice_seconds INTEGER DEFAULT 0,
      best_wpm REAL DEFAULT 0,
      avg_wpm REAL DEFAULT 0,
      avg_accuracy REAL DEFAULT 0,
      current_streak INTEGER DEFAULT 1,
      last_practice_date TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS practice_content (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      subcategory TEXT,
      difficulty TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      word_count INTEGER NOT NULL,
      char_count INTEGER NOT NULL,
      is_code INTEGER DEFAULT 0,
      language TEXT,
      lesson_number INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS typing_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      content_id INTEGER,
      practice_type TEXT NOT NULL,
      language TEXT,
      difficulty TEXT NOT NULL,
      duration_seconds REAL NOT NULL,
      gross_wpm REAL NOT NULL,
      net_wpm REAL NOT NULL,
      accuracy REAL NOT NULL,
      total_characters INTEGER NOT NULL,
      correct_characters INTEGER NOT NULL,
      incorrect_characters INTEGER NOT NULL,
      error_count INTEGER NOT NULL,
      raw_timeline_json TEXT,
      completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS password_resets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token_hash TEXT NOT NULL,
      expires_at DATETIME NOT NULL,
      used_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS custom_snippets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      language TEXT DEFAULT 'JavaScript',
      is_code INTEGER DEFAULT 1,
      source TEXT DEFAULT 'custom',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_user ON typing_sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_completed ON typing_sessions(completed_at);
    CREATE INDEX IF NOT EXISTS idx_content_type_lang ON practice_content(is_code, language, difficulty);
    CREATE INDEX IF NOT EXISTS idx_password_resets_hash ON password_resets(token_hash);
    CREATE INDEX IF NOT EXISTS idx_password_resets_user ON password_resets(user_id);
    CREATE INDEX IF NOT EXISTS idx_custom_snippets_user ON custom_snippets(user_id);

    CREATE TABLE IF NOT EXISTS system_settings (
      key TEXT PRIMARY KEY,
      value TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS certificates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cert_id TEXT UNIQUE NOT NULL,
      user_id INTEGER,
      recipient_name TEXT NOT NULL,
      title_role TEXT DEFAULT 'Touch-Typing Specialist',
      discipline TEXT NOT NULL,
      net_wpm REAL NOT NULL,
      gross_wpm REAL NOT NULL,
      accuracy REAL NOT NULL,
      duration_seconds INTEGER NOT NULL,
      total_characters INTEGER NOT NULL,
      tier_title TEXT NOT NULL,
      tier_badge TEXT NOT NULL,
      tier_grade TEXT DEFAULT 'Grade A',
      signatory_name TEXT DEFAULT 'Saumy Pandey',
      signatory_title TEXT DEFAULT 'App Owner & Creator • Founder, CodeTyper',
      sha256_fingerprint TEXT,
      biometric_verified INTEGER DEFAULT 1,
      theme TEXT DEFAULT 'royal-obsidian',
      issued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );
    CREATE INDEX IF NOT EXISTS idx_certificates_cert_id ON certificates(cert_id);
    CREATE INDEX IF NOT EXISTS idx_certificates_user ON certificates(user_id);

    CREATE TABLE IF NOT EXISTS admin_audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      admin_id INTEGER,
      admin_username TEXT,
      action TEXT NOT NULL,
      target_type TEXT,
      target_id TEXT,
      details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON admin_audit_logs(action);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_time ON admin_audit_logs(created_at);
  `);

  // Safe migrations for newly added columns
  try { db.exec('ALTER TABLE users ADD COLUMN is_banned INTEGER DEFAULT 0;'); } catch (e) {}
  try { db.exec('ALTER TABLE users ADD COLUMN ban_reason TEXT;'); } catch (e) {}
  try { db.exec('ALTER TABLE users ADD COLUMN shadowbanned INTEGER DEFAULT 0;'); } catch (e) {}
  try { db.exec('ALTER TABLE typing_sessions ADD COLUMN is_flagged INTEGER DEFAULT 0;'); } catch (e) {}
  try { db.exec('ALTER TABLE typing_sessions ADD COLUMN is_disqualified INTEGER DEFAULT 0;'); } catch (e) {}
  try { db.exec('ALTER TABLE typing_sessions ADD COLUMN disqualified_reason TEXT;'); } catch (e) {}
  try { db.exec('ALTER TABLE practice_content ADD COLUMN is_published INTEGER DEFAULT 1;'); } catch (e) {}
  try { db.exec('ALTER TABLE practice_content ADD COLUMN lesson_number INTEGER DEFAULT 1;'); } catch (e) {}
  try { db.exec('CREATE INDEX IF NOT EXISTS idx_content_lang_lesson ON practice_content(is_code, language, lesson_number);'); } catch (e) {}

  // Initialize default system settings
  const initSetting = (key, val) => {
    db.prepare('INSERT OR IGNORE INTO system_settings (key, value) VALUES (?, ?)').run(key, val);
  };
  initSetting('announcement_text', '');
  initSetting('announcement_type', 'info');
  initSetting('announcement_enabled', '0');
  initSetting('maintenance_mode', '0');

  seedInitialData();
}

export function logAdminAudit(adminUser, action, targetType = null, targetId = null, details = null) {
  try {
    const adminId = adminUser?.id || null;
    const adminUsername = adminUser?.username || 'system';
    db.prepare(`
      INSERT INTO admin_audit_logs (admin_id, admin_username, action, target_type, target_id, details)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(adminId, adminUsername, action, targetType, targetId ? String(targetId) : null, typeof details === 'object' ? JSON.stringify(details) : details);
  } catch (err) {
    console.warn('[DB] Failed to log admin audit entry:', err.message);
  }
}

function seedInitialData() {
  const curriculumFile = path.resolve(__dirname, './curriculumData.json');
  let curriculumLessons = [];
  if (fs.existsSync(curriculumFile)) {
    try {
      curriculumLessons = JSON.parse(fs.readFileSync(curriculumFile, 'utf8'));
    } catch (e) {
      console.warn('[DB] Could not parse curriculumData.json', e);
    }
  }

  // Check if content already exists
  const countRow = db.prepare('SELECT COUNT(*) as count FROM practice_content').get();

  if (curriculumLessons.length > 0 && countRow.count < curriculumLessons.length) {
    console.log(`[DB] Seeding full curricula (${curriculumLessons.length} lessons across all languages)...`);
    try {
      db.exec('DELETE FROM practice_content;');
      const insertStmt = db.prepare(`
        INSERT INTO practice_content (category, subcategory, difficulty, title, content, word_count, char_count, is_code, language, lesson_number)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      db.exec('BEGIN TRANSACTION;');
      for (const item of curriculumLessons) {
        insertStmt.run(
          item.category,
          item.subcategory || item.language,
          item.difficulty,
          item.title,
          item.content,
          item.word_count,
          item.char_count,
          item.is_code,
          item.language,
          item.lesson_number || 1
        );
      }
      db.exec('COMMIT;');
      console.log(`[DB] Successfully seeded ${curriculumLessons.length} lessons in practice_content.`);
    } catch (err) {
      console.error('[DB] Failed during curriculum bulk insertion', err);
      try { db.exec('ROLLBACK;'); } catch { }
    }
  } else if (countRow.count === 0) {
    console.log('[DB] Seeding fallback English passages & Coding snippets...');
    const insertStmt = db.prepare(`
      INSERT INTO practice_content (category, subcategory, difficulty, title, content, word_count, char_count, is_code, language, lesson_number)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Insert English passages
    let engLesson = 1;
    for (const p of englishPassages) {
      const words = p.content.trim().split(/\s+/).length;
      insertStmt.run(
        p.category,
        'English',
        p.difficulty,
        p.title,
        p.content,
        words,
        p.content.length,
        0,
        'English',
        engLesson++
      );
    }

    // Insert Coding snippets
    let codeLesson = 1;
    for (const c of codingSnippets) {
      const words = c.content.trim().split(/\s+/).length;
      insertStmt.run(
        'Programming',
        c.language,
        c.difficulty,
        c.title,
        c.content,
        words,
        c.content.length,
        1,
        c.language,
        codeLesson++
      );
    }
    console.log('[DB] Fallback practice content seeded successfully.');
  }

  // Ensure any newly added curriculum lessons or developer knowledge passages are synced into practice_content
  try {
    const existingTitles = new Set(
      db.prepare('SELECT title FROM practice_content').all().map((r) => r.title)
    );

    const insertMissingStmt = db.prepare(`
      INSERT INTO practice_content (category, subcategory, difficulty, title, content, word_count, char_count, is_code, language, lesson_number)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    let newInserted = 0;
    // 1. Sync any missing items from curriculumLessons (e.g. Lessons 51-80)
    for (const item of curriculumLessons) {
      if (!existingTitles.has(item.title)) {
        insertMissingStmt.run(
          item.category,
          item.subcategory || item.language,
          item.difficulty,
          item.title,
          item.content,
          item.word_count,
          item.char_count,
          item.is_code,
          item.language,
          item.lesson_number || 1
        );
        existingTitles.add(item.title);
        newInserted++;
      }
    }

    // 2. Sync any missing passages from seedData.js
    for (const p of englishPassages) {
      if (!existingTitles.has(p.title)) {
        const words = p.content.trim().split(/\s+/).length;
        insertMissingStmt.run(
          p.category,
          p.category,
          p.difficulty,
          p.title,
          p.content,
          words,
          p.content.length,
          0,
          'English',
          1
        );
        existingTitles.add(p.title);
        newInserted++;
      }
    }

    // 3. Sync any missing coding snippets from seedData.js
    for (const c of codingSnippets) {
      if (!existingTitles.has(c.title)) {
        const words = c.content.trim().split(/\s+/).length;
        insertMissingStmt.run(
          'Programming',
          c.language,
          c.difficulty,
          c.title,
          c.content,
          words,
          c.content.length,
          1,
          c.language,
          1
        );
        existingTitles.add(c.title);
        newInserted++;
      }
    }

    if (newInserted > 0) {
      console.log(`[DB] Synced ${newInserted} new practice items into practice_content.`);
    }
  } catch (syncErr) {
    console.warn('[DB] Could not sync new practice passages', syncErr);
  }

  // Check demo user
  const demoUser = db.prepare("SELECT * FROM users WHERE email = 'demo@codetyper.dev'").get();
  if (!demoUser) {
    const salt = bcrypt.genSaltSync(10);
    const demoPassword = process.env.DEMO_USER_PASSWORD || 'Peaceful_Demo_2026';
    const adminPassword = process.env.ADMIN_USER_PASSWORD || 'Peaceful_Admin_2026';
    const demoHash = bcrypt.hashSync(demoPassword, salt);
    const adminHash = bcrypt.hashSync(adminPassword, salt);

    try {
      const userStmt = db.prepare(`
        INSERT INTO users (email, username, full_name, password_hash, avatar_url, role, bio)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      const demoResult = userStmt.run(
        'demo@codetyper.dev',
        'sarah_coder',
        'Sarah Jenkins',
        demoHash,
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
        'user',
        'Frontend architect cultivating focus and typing speed for code and technical writing.'
      );

      const adminResult = userStmt.run(
        'admin@codetyper.dev',
        'admin_alex',
        'Alex Vance',
        adminHash,
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
        'admin',
        'System administrator and maintainer of CodeTyper practice libraries.'
      );

      const demoId = Number(demoResult.lastInsertRowid);
      const adminId = Number(adminResult.lastInsertRowid);

      const settingsStmt = db.prepare('INSERT OR IGNORE INTO user_settings (user_id) VALUES (?)');
      settingsStmt.run(demoId);
      settingsStmt.run(adminId);

      const statsStmt = db.prepare(`
        INSERT OR IGNORE INTO user_statistics (user_id, total_tests, total_practice_seconds, best_wpm, avg_wpm, avg_accuracy, current_streak, last_practice_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      // Initialize clean statistics for demo & admin accounts
      statsStmt.run(demoId, 0, 0, 0, 0, 0, 0, null);
      statsStmt.run(adminId, 0, 0, 0, 0, 0, 0, null);
    } catch (seedErr) {
      // Ignore unique constraint error if another concurrent process seeded users first
      if (!seedErr.message.includes('UNIQUE constraint failed')) {
        throw seedErr;
      }
    }
  }

  // Seed Saumy Pandey Admin Account independently
  try {
    const existingSaumy = db.prepare("SELECT id FROM users WHERE LOWER(email) = 'saumypandey745@gmail.com'").get();
    if (!existingSaumy) {
      const salt = bcrypt.genSaltSync(10);
      const saumyPassword = process.env.SAUMY_USER_PASSWORD || 'text@123';
      const saumyHash = bcrypt.hashSync(saumyPassword, salt);

      const saumyRes = db.prepare(`
        INSERT INTO users (email, username, full_name, password_hash, avatar_url, role, bio)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        'saumypandey745@gmail.com',
        'saumypandey',
        'Saumy Pandey',
        saumyHash,
        'https://api.dicebear.com/7.x/identicon/svg?seed=saumypandey',
        'admin',
        'Lead developer and architect of CodeTyper.'
      );

      const saumyId = Number(saumyRes.lastInsertRowid);
      db.prepare('INSERT OR IGNORE INTO user_settings (user_id) VALUES (?)').run(saumyId);
      db.prepare(`
        INSERT OR IGNORE INTO user_statistics (user_id, total_tests, total_practice_seconds, best_wpm, avg_wpm, avg_accuracy, current_streak, last_practice_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(saumyId, 25, 3600, 92.4, 81.6, 98.8, 7, new Date().toISOString().split('T')[0]);
      console.log('[DB] Saumy Pandey admin account seeded successfully.');
    }
  } catch (e) {
    if (!e.message.includes('UNIQUE constraint failed')) {
      console.warn('Could not seed Saumy account', e);
    }
  }
}
