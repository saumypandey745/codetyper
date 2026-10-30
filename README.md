# CodeTyper ⌨️🌿

> **Peaceful, professional, high-performance typing platform designed for programmers and writers.**

CodeTyper provides a calm, focused environment for mastering keystrokes across real-world programming languages (JavaScript, TypeScript, Python, Go, Rust, HTML/CSS) and English literature. Built with soothing aesthetics, detailed telemetry, and comprehensive developer tooling.

---

## ✨ Features

- 🌿 **Peaceful Design Philosophy**: Sage-green, forest-green, and warm cream palettes designed to reduce visual fatigue during long typing sessions.
- ⚡ **Real-Time Typing Engine**:
  - Live WPM, Net WPM (with error penalties), Raw Accuracy, and character-by-character mistake tracking.
  - Optional 3-second breathing countdown to focus before sessions.
  - Realistic mechanical sound synthesis (Soft Click, Cherry MX, Bubble Pop, Mute).
- 💻 **Multi-Language Coding Practice**:
  - JavaScript, TypeScript, Python, Go, Rust, HTML/CSS, plus curated English prose.
  - Syntax token parsing, indentation handling, and line jumping.
- 📊 **Deep Analytics & Streaks**:
  - Historical session logs, average WPM, accuracy trends, and daily calendar activity streaks.
  - One-click CSV export with RFC 4180 compliance and UTF-8 BOM.
- 🔐 **Dual Authentication System**:
  - Direct email/password registration with bcrypt password hashing and rate-limited brute-force protection.
  - One-click **Continue with Google** (OAuth 2.0) with automatic profile creation and JWT issuance.
  - Secure password reset workflow with single-use hashed tokens.
- 🌓 **Adaptive Theming**: Peaceful Cream light mode and Slate Dark mode with persistent preferences.
- 🛡️ **Hardened Backend**:
  - Express 5 REST API with Helmet security headers (CSP, X-Content-Type-Options, X-Frame-Options).
  - SQLite with Write-Ahead Logging (WAL) and 5000ms busy timeout for rock-solid concurrency.
  - Strict CORS validation for authorized domains.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite 8, Vanilla CSS Design System, Lucide Icons, Canvas Confetti
- **Backend**: Node.js, Express 5, SQLite (`better-sqlite3`), JWT, Cookie-Parser, BcryptJS, Dotenv
- **Auth**: Google OAuth 2.0 + Custom JWT & Session Management
- **Testing**: Node.js Native Test Runner (`node:test`) — 36 automated tests

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/saumypandey745/codetyper.git
cd codetyper
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Copy the example file to `.env`:
```bash
cp .env.example .env
```
Fill in your configuration:
```env
NODE_ENV=development
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_at_least_32_chars_long_2026
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5000

# Google OAuth 2.0 (From Google Cloud Console)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

### 4. Start development server
```bash
npm run dev
```
- Client runs on: `http://localhost:5173`
- Backend API runs on: `http://localhost:5000`

---

## 🧪 Automated Testing

CodeTyper includes an end-to-end test suite verifying API integrity, security hardening, database schemas, and typing calculations:

```bash
npm test
```
```
ℹ tests 36
ℹ suites 5
ℹ pass 36
ℹ fail 0
```

---

## 📦 Production Deployment

### Build Frontend
```bash
npm run build
```

### Run Production Server
```bash
npm start
```
The Express server automatically serves the compiled static bundle in `dist/` and falls back to `index.html` for single-page client routing.

---

## 📄 License
MIT License. Built with care for writers and developers everywhere.
