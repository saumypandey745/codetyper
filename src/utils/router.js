/**
 * Clean Path-based Router for CodeTyper
 * Provides zero-dependency HTML5 pushState navigation, URL synchronization,
 * backward-compatible hash migrations, and SEO metadata hooks.
 */

import { updateDocumentHead } from './seoConfig.js';

export const ROUTES = {
  HOME: '/',
  TYPING_TEST: '/typing-test',
  CODING_TEST: '/coding-typing-test',
  PRACTICE: '/practice',
  PYTHON: '/python-typing-practice',
  JAVASCRIPT: '/javascript-typing-practice',
  TYPESCRIPT: '/typescript-typing-practice',
  CPP: '/cpp-typing-practice',
  RUST: '/rust-typing-practice',
  GO: '/go-typing-practice',
  SQL: '/sql-typing-practice',
  CERTIFICATE: '/certificate',
  VERIFY: '/verify',
  LEADERBOARD: '/leaderboard',
  MULTIPLAYER: '/multiplayer',
  WPM_CALCULATOR: '/wpm-calculator',
  ABOUT: '/about',
  CONTACT: '/contact',
  PRIVACY: '/privacy',
  TERMS: '/terms',
  LOGIN: '/login',
  SIGNUP: '/signup',
  FORGOT_PASSWORD: '/forgot-password',
  DASHBOARD: '/dashboard',
  HISTORY: '/history',
  STATISTICS: '/statistics',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  ADMIN: '/admin',
  HEATMAP: '/heatmap'
};

// Route metadata for SEO & Social Sharing
export const ROUTE_METADATA = {
  [ROUTES.HOME]: {
    title: 'CodeTyper — Free Code Typing Test & Developer Typing Practice',
    description: 'CodeTyper is the premier typing test and practice platform for software developers. Master typing in Python, JavaScript, C++, and 25+ stacks with mechanical keyboard sounds and verified certificates.',
    path: '/'
  },
  [ROUTES.TYPING_TEST]: {
    title: 'Free Online Typing Speed Test | CodeTyper',
    description: 'Test your typing speed and accuracy online with real-time Gross WPM, Net WPM, and accuracy telemetry. Practice 60-second and 3-minute timed tests.',
    path: '/typing-test'
  },
  [ROUTES.CODING_TEST]: {
    title: 'Coding Typing Test for Developers | CodeTyper',
    description: 'Benchmark your developer typing velocity on real programming syntax, brackets, and code indentation across modern tech stacks.',
    path: '/coding-typing-test'
  },
  [ROUTES.PRACTICE]: {
    title: 'Code Typing Practice — Interactive Developer Drills | CodeTyper',
    description: 'Interactive code typing exercises for software engineers. Practice full syntax with zero latency, mechanical switch acoustics, and live accuracy feedback.',
    path: '/practice'
  },
  [ROUTES.PYTHON]: {
    title: 'Python Typing Practice & Speed Test | CodeTyper',
    description: 'Practice Python code typing: master indentation, colons, dunder methods, list comprehensions, and decorators with real-time syntax highlighting.',
    path: '/python-typing-practice'
  },
  [ROUTES.JAVASCRIPT]: {
    title: 'JavaScript Typing Practice & WPM Test | CodeTyper',
    description: 'Master JavaScript typing speed: practice arrow functions, template literals, async/await, and object destructuring without stutter.',
    path: '/javascript-typing-practice'
  },
  [ROUTES.TYPESCRIPT]: {
    title: 'TypeScript Typing Practice for Developers | CodeTyper',
    description: 'Improve typing muscle memory for TypeScript generics, type annotations, interfaces, and union types with instant keystroke validation.',
    path: '/typescript-typing-practice'
  },
  [ROUTES.CPP]: {
    title: 'C++ Code Typing Practice & Speed Drills | CodeTyper',
    description: 'Train muscle memory for C++ syntax: pointers, memory references, scope resolution operators, templates, and header files.',
    path: '/cpp-typing-practice'
  },
  [ROUTES.RUST]: {
    title: 'Rust Code Typing Practice & Syntax Training | CodeTyper',
    description: 'Practice typing Rust code with confidence: master borrow checking syntax, pattern matching, lifetimes, macros, and Result error handling.',
    path: '/rust-typing-practice'
  },
  [ROUTES.GO]: {
    title: 'Go (Golang) Typing Practice & Concurrency Drills | CodeTyper',
    description: 'Boost your Go typing rhythm: practice goroutines, channel operations, short variable declarations, and idiomatic error handling blocks.',
    path: '/go-typing-practice'
  },
  [ROUTES.SQL]: {
    title: 'SQL Query Typing Practice & Database Drills | CodeTyper',
    description: 'Practice SQL query typing: build rapid muscle memory for SELECT statements, complex JOINs, aggregate functions, and window clauses.',
    path: '/sql-typing-practice'
  },
  [ROUTES.CERTIFICATE]: {
    title: 'Official Developer Typing Certificates & Diplomas | CodeTyper',
    description: 'Earn accredited typing speed certificates. Complete standardized proctored evaluations and unlock verifiable diplomas with unique QR codes for LinkedIn and resumes.',
    path: '/certificate'
  },
  [ROUTES.VERIFY]: {
    title: 'Verify Official Typing Certificate | CodeTyper Global Registry',
    description: 'Verify the authenticity, WPM score, accuracy, and issuance date of any CodeTyper official diploma via our cryptographic verification registry.',
    path: '/verify'
  },
  [ROUTES.LEADERBOARD]: {
    title: 'Global Developer Typing Leaderboard | CodeTyper',
    description: 'See the fastest typists and developers worldwide. Real-time WPM rankings, accuracy tiers, and competitive badges.',
    path: '/leaderboard'
  },
  [ROUTES.MULTIPLAYER]: {
    title: 'Multiplayer Code Typing Arena — Real-Time Duels | CodeTyper',
    description: 'Challenge developers to live 1v1 code typing races. Sub-millisecond WebSocket telemetry and real-time race telemetry.',
    path: '/multiplayer'
  },
  [ROUTES.WPM_CALCULATOR]: {
    title: 'WPM Calculator & Typing Speed Methodology | CodeTyper',
    description: 'Understand how Gross WPM, Net WPM, and accuracy are calculated. Transparent mathematical formulas, 5-character word standard, and error penalty explanations.',
    path: '/wpm-calculator'
  },
  [ROUTES.ABOUT]: {
    title: 'About CodeTyper — Peaceful Ergonomics for Developers & Writers',
    description: 'Learn about CodeTyper’s botanical design philosophy, zero-distraction environment, and mission to cultivate calm developer focus.',
    path: '/about'
  },
  [ROUTES.CONTACT]: {
    title: 'Contact Support & Feedback | CodeTyper',
    description: 'Get in touch with the CodeTyper engineering team for feature requests, bug reports, and community feedback.',
    path: '/contact'
  },
  [ROUTES.PRIVACY]: {
    title: 'Privacy Policy | CodeTyper',
    description: 'CodeTyper privacy policy. Transparent data handling, zero telemetry tracking during practice, and secure local storage models.',
    path: '/privacy'
  },
  [ROUTES.TERMS]: {
    title: 'Terms of Service | CodeTyper',
    description: 'CodeTyper platform terms of service and certificate integrity standards.',
    path: '/terms'
  },
  [ROUTES.LOGIN]: {
    title: 'Sign In — CodeTyper',
    description: 'Sign in to CodeTyper to access your typing history, custom snippets, and unlocked certificate diplomas.',
    path: '/login'
  },
  [ROUTES.SIGNUP]: {
    title: 'Create Free Account — CodeTyper',
    description: 'Join CodeTyper for free. Save your typing progress, track finger heatmaps, and claim verified credentials.',
    path: '/signup'
  },
  [ROUTES.FORGOT_PASSWORD]: {
    title: 'Reset Password — CodeTyper',
    description: 'Reset your CodeTyper account password securely with email verification.',
    path: '/forgot-password'
  },
  [ROUTES.DASHBOARD]: {
    title: 'Developer Dashboard | CodeTyper',
    description: 'Your personal typing speed metrics, activity streaks, and milestone progression.',
    path: '/dashboard'
  },
  [ROUTES.HISTORY]: {
    title: 'Typing History & Session Logs | CodeTyper',
    description: 'Detailed logs of every completed typing session with WPM and accuracy breakdown.',
    path: '/history'
  },
  [ROUTES.STATISTICS]: {
    title: 'Speed Analytics & Keystroke Trends | CodeTyper',
    description: 'Longitudinal typing velocity charts, consistency variance, and accuracy progression.',
    path: '/statistics'
  },
  [ROUTES.PROFILE]: {
    title: 'User Profile & Badges | CodeTyper',
    description: 'Manage your CodeTyper developer profile, display role, and unlocked achievements.',
    path: '/profile'
  },
  [ROUTES.SETTINGS]: {
    title: 'Engine Preferences & Sound Synthesis | CodeTyper',
    description: 'Customize mechanical keyboard switch acoustics, visual theme, caret animations, and countdowns.',
    path: '/settings'
  },
  [ROUTES.ADMIN]: {
    title: 'Admin Console | CodeTyper',
    description: 'System telemetry, user management, and certificate issuance registry.',
    path: '/admin'
  },
  [ROUTES.HEATMAP]: {
    title: 'Keystroke Heatmap & Finger Diagnostics | CodeTyper',
    description: 'Analyze weak keys, finger workload balance, and keystroke latency hotspots.',
    path: '/heatmap'
  }
};

/**
 * Parses current window location and returns normalized route state
 */
export const parseCurrentRoute = () => {
  if (typeof window === 'undefined') {
    return { view: 'landing', path: '/', params: {}, certId: '' };
  }

  let pathname = window.location.pathname || '/';
  const hash = window.location.hash || '';

  // Backward compatibility: If URL has hash route, migrate it to clean pathname
  if (hash.startsWith('#')) {
    const rawHash = hash.replace(/^#\/?/, '');
    const hashClean = rawHash.split('?')[0];
    
    // Hash-to-clean route mappings
    const hashRouteMap = {
      practice: ROUTES.PRACTICE,
      coding: ROUTES.CODING_TEST,
      test: ROUTES.TYPING_TEST,
      english: ROUTES.PRACTICE,
      certificate: ROUTES.CERTIFICATE,
      verify: ROUTES.VERIFY,
      leaderboard: ROUTES.LEADERBOARD,
      arena: ROUTES.MULTIPLAYER,
      multiplayer: ROUTES.MULTIPLAYER,
      about: ROUTES.ABOUT,
      contact: ROUTES.CONTACT,
      privacy: ROUTES.PRIVACY,
      terms: ROUTES.TERMS,
      login: ROUTES.LOGIN,
      signup: ROUTES.SIGNUP,
      'forgot-password': ROUTES.FORGOT_PASSWORD,
      dashboard: ROUTES.DASHBOARD,
      history: ROUTES.HISTORY,
      statistics: ROUTES.STATISTICS,
      profile: ROUTES.PROFILE,
      settings: ROUTES.SETTINGS,
      admin: ROUTES.ADMIN,
      heatmap: ROUTES.HEATMAP,
      'wpm-calculator': ROUTES.WPM_CALCULATOR,
      'python-typing-practice': ROUTES.PYTHON,
      'javascript-typing-practice': ROUTES.JAVASCRIPT,
      'typescript-typing-practice': ROUTES.TYPESCRIPT,
      'cpp-typing-practice': ROUTES.CPP,
      'rust-typing-practice': ROUTES.RUST,
      'go-typing-practice': ROUTES.GO,
      'sql-typing-practice': ROUTES.SQL
    };

    let targetPath = null;
    if (hashClean.startsWith('verify/')) {
      const id = hashClean.split('/')[1];
      targetPath = `/verify/${encodeURIComponent(id)}`;
    } else if (hashRouteMap[hashClean]) {
      targetPath = hashRouteMap[hashClean];
    }

    if (targetPath) {
      pathname = targetPath;
      const search = window.location.search || (rawHash.includes('?') ? '?' + rawHash.split('?')[1] : '');
      window.history.replaceState(null, '', `${targetPath}${search}`);
    }
  }

  // Parse path
  const normalizedPath = pathname === '' ? '/' : pathname;
  const searchParams = new URLSearchParams(window.location.search);

  // Check specific path routes
  if (normalizedPath === '/' || normalizedPath === '') {
    return { view: 'landing', path: ROUTES.HOME, params: {} };
  }
  if (normalizedPath === ROUTES.TYPING_TEST) {
    return { view: 'test', path: ROUTES.TYPING_TEST, practiceOptions: { type: 'test', duration: 60 }, params: {} };
  }
  if (normalizedPath === ROUTES.CODING_TEST) {
    return { view: 'coding', path: ROUTES.CODING_TEST, practiceOptions: { type: 'coding' }, params: {} };
  }
  if (normalizedPath === ROUTES.PRACTICE) {
    const lang = searchParams.get('lang') || null;
    const duration = parseInt(searchParams.get('duration') || '', 10) || null;
    return { view: 'practice', path: ROUTES.PRACTICE, practiceOptions: { type: 'practice', language: lang, duration }, params: {} };
  }
  if (normalizedPath === ROUTES.PYTHON) {
    return { view: 'language-landing', path: ROUTES.PYTHON, language: 'Python', practiceOptions: { type: 'coding', language: 'Python' }, params: {} };
  }
  if (normalizedPath === ROUTES.JAVASCRIPT) {
    return { view: 'language-landing', path: ROUTES.JAVASCRIPT, language: 'JavaScript', practiceOptions: { type: 'coding', language: 'JavaScript' }, params: {} };
  }
  if (normalizedPath === ROUTES.TYPESCRIPT) {
    return { view: 'language-landing', path: ROUTES.TYPESCRIPT, language: 'TypeScript', practiceOptions: { type: 'coding', language: 'TypeScript' }, params: {} };
  }
  if (normalizedPath === ROUTES.CPP) {
    return { view: 'language-landing', path: ROUTES.CPP, language: 'C++', practiceOptions: { type: 'coding', language: 'C++' }, params: {} };
  }
  if (normalizedPath === ROUTES.RUST) {
    return { view: 'language-landing', path: ROUTES.RUST, language: 'Rust', practiceOptions: { type: 'coding', language: 'Rust' }, params: {} };
  }
  if (normalizedPath === ROUTES.GO) {
    return { view: 'language-landing', path: ROUTES.GO, language: 'Go', practiceOptions: { type: 'coding', language: 'Go' }, params: {} };
  }
  if (normalizedPath === ROUTES.SQL) {
    return { view: 'language-landing', path: ROUTES.SQL, language: 'SQL', practiceOptions: { type: 'coding', language: 'SQL' }, params: {} };
  }
  if (normalizedPath === ROUTES.CERTIFICATE) {
    return { view: 'certificate', path: ROUTES.CERTIFICATE, params: {} };
  }
  if (normalizedPath.startsWith('/verify')) {
    const parts = normalizedPath.split('/').filter(Boolean);
    const certId = parts[1] || searchParams.get('id') || searchParams.get('certId') || '';
    return { view: 'verify', path: ROUTES.VERIFY, certId, params: { certId } };
  }
  if (normalizedPath === ROUTES.LEADERBOARD) {
    return { view: 'leaderboard', path: ROUTES.LEADERBOARD, params: {} };
  }
  if (normalizedPath === ROUTES.MULTIPLAYER) {
    return { view: 'arena', path: ROUTES.MULTIPLAYER, params: {} };
  }
  if (normalizedPath === ROUTES.WPM_CALCULATOR) {
    return { view: 'wpm-calculator', path: ROUTES.WPM_CALCULATOR, params: {} };
  }
  if (normalizedPath === ROUTES.ABOUT) {
    return { view: 'about', path: ROUTES.ABOUT, params: {} };
  }
  if (normalizedPath === ROUTES.CONTACT) {
    return { view: 'contact', path: ROUTES.CONTACT, params: {} };
  }
  if (normalizedPath === ROUTES.PRIVACY) {
    return { view: 'privacy', path: ROUTES.PRIVACY, params: {} };
  }
  if (normalizedPath === ROUTES.TERMS) {
    return { view: 'terms', path: ROUTES.TERMS, params: {} };
  }
  if (normalizedPath === ROUTES.LOGIN) {
    return { view: 'login', path: ROUTES.LOGIN, params: {} };
  }
  if (normalizedPath === ROUTES.SIGNUP) {
    return { view: 'signup', path: ROUTES.SIGNUP, params: {} };
  }
  if (normalizedPath === ROUTES.FORGOT_PASSWORD) {
    return { view: 'forgot-password', path: ROUTES.FORGOT_PASSWORD, params: {} };
  }
  if (normalizedPath === ROUTES.DASHBOARD) {
    return { view: 'dashboard', path: ROUTES.DASHBOARD, params: {} };
  }
  if (normalizedPath === ROUTES.HISTORY) {
    return { view: 'history', path: ROUTES.HISTORY, params: {} };
  }
  if (normalizedPath === ROUTES.STATISTICS) {
    return { view: 'statistics', path: ROUTES.STATISTICS, params: {} };
  }
  if (normalizedPath === ROUTES.PROFILE) {
    return { view: 'profile', path: ROUTES.PROFILE, params: {} };
  }
  if (normalizedPath === ROUTES.SETTINGS) {
    return { view: 'settings', path: ROUTES.SETTINGS, params: {} };
  }
  if (normalizedPath === ROUTES.ADMIN) {
    return { view: 'admin', path: ROUTES.ADMIN, params: {} };
  }
  if (normalizedPath === ROUTES.HEATMAP) {
    return { view: 'heatmap', path: ROUTES.HEATMAP, params: {} };
  }

  // Fallback to landing if unknown route
  return { view: 'landing', path: ROUTES.HOME, params: {} };
};

/**
 * Clean pushState navigation helper with progressive enhancement support
 */
export const navigateToPath = (target, options = {}) => {
  if (typeof window === 'undefined') return;

  let path = target;

  // Map legacy view strings to clean paths
  const viewMap = {
    landing: ROUTES.HOME,
    practice: ROUTES.PRACTICE,
    coding: ROUTES.CODING_TEST,
    test: ROUTES.TYPING_TEST,
    english: ROUTES.PRACTICE,
    certificate: ROUTES.CERTIFICATE,
    verify: ROUTES.VERIFY,
    leaderboard: ROUTES.LEADERBOARD,
    arena: ROUTES.MULTIPLAYER,
    multiplayer: ROUTES.MULTIPLAYER,
    about: ROUTES.ABOUT,
    contact: ROUTES.CONTACT,
    privacy: ROUTES.PRIVACY,
    terms: ROUTES.TERMS,
    login: ROUTES.LOGIN,
    signup: ROUTES.SIGNUP,
    'forgot-password': ROUTES.FORGOT_PASSWORD,
    dashboard: ROUTES.DASHBOARD,
    history: ROUTES.HISTORY,
    statistics: ROUTES.STATISTICS,
    profile: ROUTES.PROFILE,
    settings: ROUTES.SETTINGS,
    admin: ROUTES.ADMIN,
    heatmap: ROUTES.HEATMAP,
    'wpm-calculator': ROUTES.WPM_CALCULATOR,
    'python-typing-practice': ROUTES.PYTHON,
    'javascript-typing-practice': ROUTES.JAVASCRIPT,
    'typescript-typing-practice': ROUTES.TYPESCRIPT,
    'cpp-typing-practice': ROUTES.CPP,
    'rust-typing-practice': ROUTES.RUST,
    'go-typing-practice': ROUTES.GO,
    'sql-typing-practice': ROUTES.SQL
  };

  if (!path.startsWith('/')) {
    path = viewMap[path] || '/' + path;
  }

  if (options.certId) {
    path = `/verify/${encodeURIComponent(options.certId)}`;
  } else if (options.practiceOptions?.language) {
    const langRouteMap = {
      Python: ROUTES.PYTHON,
      JavaScript: ROUTES.JAVASCRIPT,
      TypeScript: ROUTES.TYPESCRIPT,
      'C++': ROUTES.CPP,
      Rust: ROUTES.RUST,
      Go: ROUTES.GO,
      SQL: ROUTES.SQL
    };
    if (langRouteMap[options.practiceOptions.language]) {
      path = langRouteMap[options.practiceOptions.language];
    }
  }

  if (window.location.pathname !== path) {
    window.history.pushState(null, '', path);
  }

  // Dispatch custom popstate event so App component re-evaluates
  window.dispatchEvent(new PopStateEvent('popstate'));
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
