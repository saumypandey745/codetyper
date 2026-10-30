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

    CREATE INDEX IF NOT EXISTS idx_sessions_user ON typing_sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_completed ON typing_sessions(completed_at);
    CREATE INDEX IF NOT EXISTS idx_content_type_lang ON practice_content(is_code, language, difficulty);
    CREATE INDEX IF NOT EXISTS idx_password_resets_hash ON password_resets(token_hash);
    CREATE INDEX IF NOT EXISTS idx_password_resets_user ON password_resets(user_id);
  `);

  try {
    db.exec('ALTER TABLE practice_content ADD COLUMN lesson_number INTEGER DEFAULT 1;');
  } catch (e) {
    // Column already exists
  }

  try {
    db.exec('CREATE INDEX IF NOT EXISTS idx_content_lang_lesson ON practice_content(is_code, language, lesson_number);');
  } catch (e) {}

  seedInitialData();
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

  if (curriculumLessons.length > 0 && countRow.count < 1400) {
    console.log(`[DB] Seeding full 50-lesson curricula (${curriculumLessons.length} lessons across all languages)...`);
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
      try { db.exec('ROLLBACK;'); } catch {}
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
      
      // Seed demo stats & sessions
      statsStmt.run(demoId, 12, 1440, 78.4, 68.2, 97.4, 4, new Date().toISOString().split('T')[0]);
      statsStmt.run(adminId, 5, 600, 84.1, 74.5, 98.6, 2, new Date().toISOString().split('T')[0]);
    } catch (seedErr) {
      // Ignore unique constraint error if another concurrent process seeded users first
      if (!seedErr.message.includes('UNIQUE constraint failed')) {
        throw seedErr;
      }
    }

    // Seed realistic sample sessions for demo user
    const sampleSessions = [
      { practice_type: 'english', lang: 'English', diff: 'intermediate', dur: 60, gross: 66, net: 64, acc: 96.5, err: 2, daysAgo: 4 },
      { practice_type: 'code', lang: 'JavaScript', diff: 'intermediate', dur: 120, gross: 62, net: 60, acc: 95.8, err: 3, daysAgo: 3 },
      { practice_type: 'code', lang: 'TypeScript', diff: 'beginner', dur: 90, gross: 68, net: 67, acc: 98.1, err: 1, daysAgo: 3 },
      { practice_type: 'test', lang: 'English', diff: 'advanced', dur: 60, gross: 72, net: 71, acc: 97.8, err: 2, daysAgo: 2 },
      { practice_type: 'code', lang: 'Python', diff: 'intermediate', dur: 120, gross: 70, net: 69, acc: 98.5, err: 1, daysAgo: 1 },
      { practice_type: 'english', lang: 'English', diff: 'beginner', dur: 60, gross: 80, net: 78.4, acc: 99.1, err: 1, daysAgo: 0 }
    ];

    const sessionStmt = db.prepare(`
      INSERT INTO typing_sessions (
        user_id, content_id, practice_type, language, difficulty,
        duration_seconds, gross_wpm, net_wpm, accuracy,
        total_characters, correct_characters, incorrect_characters, error_count, completed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', ? || ' days'))
    `);

    for (const s of sampleSessions) {
      const totalChars = Math.round((s.gross * 5 * s.dur) / 60);
      const incorrect = Math.round(totalChars * (1 - s.acc / 100));
      const correct = totalChars - incorrect;
      sessionStmt.run(
        demoId,
        1,
        s.practice_type,
        s.lang,
        s.diff,
        s.dur,
        s.gross,
        s.net,
        s.acc,
        totalChars,
        correct,
        incorrect,
        s.err,
        `-${s.daysAgo}`
      );
    }
    console.log('[DB] Demo user and history seeded successfully.');
  }
}
