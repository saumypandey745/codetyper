import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext.jsx';
import { useToast } from './context/ToastContext.jsx';
import { PublicHeader } from './components/layout/PublicHeader.jsx';
import { PublicFooter } from './components/layout/PublicFooter.jsx';
import { Sidebar } from './components/layout/Sidebar.jsx';
import { Header } from './components/layout/Header.jsx';
import { QuickSearchModal } from './components/common/QuickSearchModal.jsx';
import { AnnouncementBanner } from './components/common/AnnouncementBanner.jsx';

// Public pages
import { LandingPage } from './pages/public/LandingPage.jsx';
import { LoginPage } from './pages/public/LoginPage.jsx';
import { SignupPage } from './pages/public/SignupPage.jsx';
import { ForgotPasswordPage } from './pages/public/ForgotPasswordPage.jsx';
import { AboutPage, ContactPage, PrivacyPage, TermsPage } from './pages/public/StaticPages.jsx';

// App pages
import { Dashboard } from './pages/app/Dashboard.jsx';
import { PracticePage } from './pages/app/PracticePage.jsx';
import { HistoryPage } from './pages/app/HistoryPage.jsx';
import { StatisticsPage } from './pages/app/StatisticsPage.jsx';
import { ProfilePage } from './pages/app/ProfilePage.jsx';
import { SettingsPage } from './pages/app/SettingsPage.jsx';
import { AdminPage } from './pages/app/AdminPage.jsx';
import { MultiplayerArena } from './pages/app/MultiplayerArena.jsx';
import { LeaderboardPage } from './pages/app/LeaderboardPage.jsx';
import { KeyHeatmap } from './components/typing/KeyHeatmap.jsx';
import { CertificatePage } from './pages/app/CertificatePage.jsx';
import { VerifyCertificatePage } from './pages/public/VerifyCertificatePage.jsx';

export function App() {
  const { user, loading } = useAuth();
  const toast = useToast();

  const [currentView, setCurrentView] = useState(() => {
    // Check initial route or saved view
    const raw = window.location.hash.replace('#', '');
    if (raw.startsWith('verify')) return 'verify';
    const view = raw.split('?')[0];
    const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('codetyper_token');
    const guestRestrictedViews = [
      'dashboard',
      'history',
      'statistics',
      'profile',
      'settings',
      'admin'
    ];
    if (guestRestrictedViews.includes(view) && !hasToken) {
      return 'landing';
    }
    return view || 'landing';
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const parsePracticeParams = (raw) => {
    if (!raw || !raw.includes('?')) return null;
    const params = new URLSearchParams(raw.split('?')[1]);
    const langRaw = (params.get('lang') || params.get('language') || '').toLowerCase();
    const durationRaw = parseInt(params.get('duration') || params.get('time') || '', 10);
    const langMap = {
      python: 'Python',
      py: 'Python',
      javascript: 'JavaScript',
      js: 'JavaScript',
      typescript: 'TypeScript',
      ts: 'TypeScript',
      react: 'React/JSX',
      jsx: 'React/JSX',
      cpp: 'C++',
      'c++': 'C++',
      java: 'Java',
      html: 'HTML',
      css: 'CSS',
      go: 'Go',
      golang: 'Go',
      rust: 'Rust',
      sql: 'SQL'
    };
    return {
      language: langMap[langRaw] || null,
      duration: !isNaN(durationRaw) && durationRaw > 0 ? durationRaw : null
    };
  };

  const [practiceConfig, setPracticeConfig] = useState(() => {
    const raw = typeof window !== 'undefined' ? window.location.hash.replace('#', '') : '';
    const parsed = parsePracticeParams(raw);
    return {
      type: 'practice',
      language: parsed?.language || null,
      duration: parsed?.duration || null
    };
  });

  const getVerifyCertId = () => {
    const raw = window.location.hash.replace('#', '');
    if (!raw.startsWith('verify')) return '';
    if (raw.includes('/')) return raw.split('/')[1]?.split('?')[0] || '';
    if (raw.includes('?')) {
      const params = new URLSearchParams(raw.split('?')[1]);
      return params.get('id') || params.get('certId') || '';
    }
    return '';
  };

  // Keep URL hash in sync for back/forward navigation and bookmarks
  useEffect(() => {
    const raw = window.location.hash.replace('#', '');
    if (currentView === 'verify') {
      const certId = getVerifyCertId();
      const targetHash = certId ? `verify/${certId}` : 'verify';
      if (raw !== targetHash && !raw.startsWith('verify')) {
        window.location.hash = targetHash;
      }
      return;
    }
    const currentHashView = raw.split('?')[0];
    const query = currentHashView === currentView && raw.includes('?') ? '?' + raw.split('?')[1] : '';
    const targetHash = currentView + query;
    if (window.location.hash.replace('#', '') !== targetHash) {
      window.location.hash = targetHash;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView]);

  // Update document title dynamically for each route (SEO & UX)
  useEffect(() => {
    if (currentView === 'practice' || currentView === 'coding') {
      if (practiceConfig?.language) {
        document.title = `${practiceConfig.language} Code Typing Practice & Speed Test | CodeTyper`;
        return;
      }
      if (practiceConfig?.duration === 60) {
        document.title = '1 Minute Typing Speed Test (WPM) | CodeTyper';
        return;
      }
      if (practiceConfig?.duration === 180) {
        document.title = '3 Minute Typing Endurance Test | CodeTyper';
        return;
      }
      if (practiceConfig?.duration === 300) {
        document.title = '5 Minute Typing Speed Assessment | CodeTyper';
        return;
      }
    }

    const titles = {
      landing: 'CodeTyper — Free Code Typing Test & Developer Typing Practice with Certificate',
      practice: 'Code Typing Practice — Interactive Speed Test & Syntactic Training | CodeTyper',
      certificate: 'Accredited Typing Certificates — Official Developer Credentials | CodeTyper',
      verify: 'Verify Official Typing Certificate | CodeTyper Global Registry',
      leaderboard: 'Global Developer Typing Leaderboard — Top WPM Rankings | CodeTyper',
      arena: 'Multiplayer Code Typing Arena — Real-Time Velocity Battles | CodeTyper',
      heatmap: 'Typing Accuracy Heatmap & Keystroke Diagnostics | CodeTyper',
      dashboard: 'Developer Dashboard | CodeTyper',
      history: 'Typing Session History & Analytics | CodeTyper',
      statistics: 'Speed Analytics & Accuracy Trends | CodeTyper',
      profile: 'User Profile & Achievements | CodeTyper',
      settings: 'Platform Preferences & Sound Customization | CodeTyper',
      admin: 'Admin Console | CodeTyper',
      login: 'Sign In — CodeTyper',
      signup: 'Create Free Account — CodeTyper',
      'forgot-password': 'Reset Password — CodeTyper',
      about: 'About CodeTyper — Peaceful Typing for Developers & Writers',
      contact: 'Contact Support — CodeTyper',
      privacy: 'Privacy Policy — CodeTyper',
      terms: 'Terms of Service — CodeTyper'
    };
    if (titles[currentView]) {
      document.title = titles[currentView];
    }
  }, [currentView, practiceConfig]);

  useEffect(() => {
    const handleHashChange = () => {
      const raw = window.location.hash.replace('#', '');
      let view = raw.split('?')[0];
      if (raw.startsWith('verify')) view = 'verify';
      const parsed = parsePracticeParams(raw);
      if (parsed && (parsed.language || parsed.duration)) {
        setPracticeConfig((prev) => ({
          ...prev,
          language: parsed.language || prev.language,
          duration: parsed.duration || prev.duration
        }));
      }
      if (view && view !== currentView) {
        navigateTo(view);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentView, user, loading]);

  // If user is authenticated, automatically transition away from login/signup/forgot-password pages
  useEffect(() => {
    if (user && (currentView === 'login' || currentView === 'signup' || currentView === 'forgot-password')) {
      setCurrentView('dashboard');
    }
  }, [user, currentView]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navigateTo = (view, options = {}) => {
    // Protected views requiring authentication
    const authRequiredViews = [
      'dashboard',
      'history',
      'statistics',
      'profile',
      'admin',
      'settings'
    ];
    const hasToken = !!localStorage.getItem('codetyper_token');

    // Check both user and token to avoid race condition right after login/register
    if (authRequiredViews.includes(view) && !user && !hasToken && !loading) {
      toast.info('Please sign in or create an account to access this page.');
      window.location.hash = 'login';
      setCurrentView('login');
      return;
    }

    if (options.practiceOptions) {
      setPracticeConfig(options.practiceOptions);
    }

    setCurrentView(view);
    setSidebarOpen(false);
  };

  const handleStartPractice = (options = {}, maybeLang = null, maybeDuration = null) => {
    let targetType = 'practice';
    let targetLang = null;
    let targetDuration = null;

    if (typeof options === 'string') {
      targetType = options;
      targetLang = maybeLang;
      targetDuration = maybeDuration;
    } else {
      targetType = options.type || 'practice';
      targetLang = options.language || null;
      targetDuration = options.duration || null;
    }

    setPracticeConfig({
      type: targetType,
      language: targetLang,
      duration: targetDuration
    });
    setCurrentView(targetType);
  };

  const isPublicView = [
    'landing',
    'login',
    'signup',
    'forgot-password',
    'about',
    'contact',
    'privacy',
    'terms',
    'verify',
    ...(!user && currentView === 'certificate' ? ['certificate'] : [])
  ].includes(currentView);

  // Render Page Content
  const renderCurrentView = () => {
    switch (currentView) {
      // Public Views
      case 'landing':
        return <LandingPage onNavigate={navigateTo} onStartPractice={handleStartPractice} />;
      case 'login':
        return <LoginPage onNavigate={navigateTo} />;
      case 'signup':
        return <SignupPage onNavigate={navigateTo} />;
      case 'forgot-password':
        return <ForgotPasswordPage onNavigate={navigateTo} />;
      case 'about':
        return <AboutPage onNavigate={navigateTo} />;
      case 'contact':
        return <ContactPage />;
      case 'privacy':
        return <PrivacyPage />;
      case 'terms':
        return <TermsPage />;
      case 'verify':
        return <VerifyCertificatePage certId={getVerifyCertId()} onNavigate={navigateTo} />;

      // App Views
      case 'dashboard':
        return <Dashboard onNavigate={navigateTo} onStartPractice={handleStartPractice} />;
      case 'practice':
        return (
          <PracticePage
            key="practice"
            initialType="practice"
            initialDuration={practiceConfig.duration}
            onNavigate={navigateTo}
          />
        );
      case 'coding':
        return (
          <PracticePage
            key={`coding-${practiceConfig.language || 'all'}`}
            initialType="coding"
            initialLanguage={practiceConfig.language}
            initialDuration={practiceConfig.duration}
            onNavigate={navigateTo}
          />
        );
      case 'english':
        return (
          <PracticePage
            key="english"
            initialType="english"
            initialDuration={practiceConfig.duration}
            onNavigate={navigateTo}
          />
        );
      case 'test':
        return (
          <PracticePage
            key="test"
            initialType="test"
            initialDuration={practiceConfig.duration}
            onNavigate={navigateTo}
          />
        );
      case 'multiplayer':
        return <MultiplayerArena onNavigate={navigateTo} />;
      case 'certificate':
        return <CertificatePage onNavigate={navigateTo} onStartPractice={handleStartPractice} />;
      case 'heatmap':
        return (
          <div style={{ maxWidth: '1080px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h1 style={{ fontSize: '1.85rem', margin: '0 0 0.25rem' }}>Keystroke Precision Heatmap</h1>
                <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>
                  Per-key accuracy diagnostics captured across all your live typing and coding drills.
                </p>
              </div>
              <button className="btn btn-primary" onClick={() => navigateTo('practice')}>
                Start Practice Drill
              </button>
            </div>
            <KeyHeatmap />
          </div>
        );
      case 'history':
        return <HistoryPage onNavigate={navigateTo} onStartPractice={handleStartPractice} />;
      case 'statistics':
        return <StatisticsPage onNavigate={navigateTo} onStartPractice={handleStartPractice} />;
      case 'leaderboard':
        return <LeaderboardPage />;
      case 'profile':
        return <ProfilePage onNavigate={navigateTo} />;
      case 'settings':
        return <SettingsPage onNavigate={navigateTo} />;
      case 'admin':
        return <AdminPage onNavigate={navigateTo} />;

      default:
        return <LandingPage onNavigate={navigateTo} onStartPractice={handleStartPractice} />;
    }
  };

  return (
    <>
      {!['practice', 'coding', 'english', 'test'].includes(currentView) && <AnnouncementBanner />}
      {isPublicView ? (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <PublicHeader onNavigate={navigateTo} currentView={currentView} />
          <main style={{ flex: 1, padding: currentView === 'landing' ? '0.5rem 1.5rem 2rem' : '2rem 1.5rem', maxWidth: '1280px', width: '100%', margin: '0 auto' }}>
            {renderCurrentView()}
          </main>
          <PublicFooter onNavigate={navigateTo} />
        </div>
      ) : (
        <div className="app-container">
          <Sidebar
            currentView={currentView}
            onNavigate={navigateTo}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />

          <div className="app-main">
            <Header
              currentView={currentView}
              onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
              onNavigate={navigateTo}
              onOpenSearch={() => setIsSearchOpen(true)}
            />

            <main className="app-content">
              {renderCurrentView()}
            </main>
          </div>
        </div>
      )}

      {/* Global Quick Search Modal (Ctrl + K) */}
      <QuickSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectPractice={(item) => {
          setIsSearchOpen(false);
          handleStartPractice(item);
        }}
        onNavigate={(view) => {
          setIsSearchOpen(false);
          navigateTo(view);
        }}
      />
    </>
  );
}
