import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useAuth } from './context/AuthContext.jsx';
import { useToast } from './context/ToastContext.jsx';
import { PublicHeader } from './components/layout/PublicHeader.jsx';
import { PublicFooter } from './components/layout/PublicFooter.jsx';
import { Sidebar } from './components/layout/Sidebar.jsx';
import { Header } from './components/layout/Header.jsx';
import { QuickSearchModal } from './components/common/QuickSearchModal.jsx';
import { AnnouncementBanner } from './components/common/AnnouncementBanner.jsx';
import { GoogleLoginPopup } from './components/common/GoogleLoginPopup.jsx';

// Core Public Pages (Eagerly loaded for instant First Contentful Paint)
import { LandingPage } from './pages/public/LandingPage.jsx';
import { PracticePage } from './pages/app/PracticePage.jsx';
import { LanguagePracticeLanding } from './pages/public/LanguagePracticeLanding.jsx';
import { WpmCalculatorPage } from './pages/public/WpmCalculatorPage.jsx';
import { LoginPage } from './pages/public/LoginPage.jsx';
import { SignupPage } from './pages/public/SignupPage.jsx';
import { ForgotPasswordPage } from './pages/public/ForgotPasswordPage.jsx';
import { AboutPage, ContactPage, PrivacyPage, TermsPage } from './pages/public/StaticPages.jsx';
import { VerifyCertificatePage } from './pages/public/VerifyCertificatePage.jsx';

// Router & SEO helpers
import { parseCurrentRoute, navigateToPath, ROUTES, ROUTE_METADATA } from './utils/router.js';
import { updateDocumentHead } from './utils/seoConfig.js';
import { Analytics } from '@vercel/analytics/react';

// Heavy App Pages (Code-split with React.lazy to reduce initial JS payload)
const Dashboard = lazy(() => import('./pages/app/Dashboard.jsx').then(m => ({ default: m.Dashboard })));
const HistoryPage = lazy(() => import('./pages/app/HistoryPage.jsx').then(m => ({ default: m.HistoryPage })));
const StatisticsPage = lazy(() => import('./pages/app/StatisticsPage.jsx').then(m => ({ default: m.StatisticsPage })));
const ProfilePage = lazy(() => import('./pages/app/ProfilePage.jsx').then(m => ({ default: m.ProfilePage })));
const SettingsPage = lazy(() => import('./pages/app/SettingsPage.jsx').then(m => ({ default: m.SettingsPage })));
const AdminPage = lazy(() => import('./pages/app/AdminPage.jsx').then(m => ({ default: m.AdminPage })));
const MultiplayerArena = lazy(() => import('./pages/app/MultiplayerArena.jsx').then(m => ({ default: m.MultiplayerArena })));
const LeaderboardPage = lazy(() => import('./pages/app/LeaderboardPage.jsx').then(m => ({ default: m.LeaderboardPage })));
const CertificatePage = lazy(() => import('./pages/app/CertificatePage.jsx').then(m => ({ default: m.CertificatePage })));
const KeyHeatmap = lazy(() => import('./components/typing/KeyHeatmap.jsx').then(m => ({ default: m.KeyHeatmap })));

// Minimal Loading Fallback
function SuspenseLoader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 1rem', minHeight: '300px' }}>
      <div className="loading-spinner" style={{ width: '36px', height: '36px', border: '3px solid var(--color-border)', borderTopColor: 'var(--color-primary-forest)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );
}

export function App() {
  const { user, loading } = useAuth();
  const toast = useToast();

  const [routeState, setRouteState] = useState(() => parseCurrentRoute());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Synchronize routeState on popstate (browser back/forward) and hashchange
  useEffect(() => {
    const handleLocationChange = () => {
      const parsed = parseCurrentRoute();
      setRouteState(parsed);
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  // Synchronize dynamic document title, description, and canonical on route change
  useEffect(() => {
    const meta = ROUTE_METADATA[routeState.path] || {
      title: 'CodeTyper — Free Code Typing Test & Developer Typing Practice with Certificate',
      description: 'CodeTyper is the premier typing test and practice platform for software developers across 25+ language stacks.',
      path: routeState.path
    };

    updateDocumentHead({
      title: meta.title,
      description: meta.description,
      path: meta.path
    });
  }, [routeState.path]);

  // If user is authenticated, redirect away from guest-only auth pages
  useEffect(() => {
    if (user && (routeState.view === 'login' || routeState.view === 'signup' || routeState.view === 'forgot-password')) {
      navigateToPath(ROUTES.DASHBOARD);
    }
  }, [user, routeState.view]);

  // Global keyboard shortcuts (Ctrl+K)
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

  const navigateTo = (target, options = {}) => {
    const guestRestrictedViews = ['dashboard', 'history', 'statistics', 'profile', 'admin', 'settings'];
    const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('codetyper_token');

    let cleanTarget = typeof target === 'string' ? target : '/';
    let checkView = cleanTarget.replace(/^\//, '').split('/')[0].split('?')[0];

    if (guestRestrictedViews.includes(checkView) && !user && !hasToken && !loading) {
      toast.info('Please sign in or create an account to access this page.');
      navigateToPath(ROUTES.LOGIN);
      return;
    }

    setSidebarOpen(false);
    navigateToPath(target, options);
  };

  const handleStartPractice = (options = {}, maybeLang = null, maybeDuration = null) => {
    let targetLang = null;
    let targetDuration = null;

    if (typeof options === 'string') {
      targetLang = maybeLang;
      targetDuration = maybeDuration;
    } else {
      targetLang = options.language || null;
      targetDuration = options.duration || null;
    }

    const langRouteMap = {
      Python: ROUTES.PYTHON,
      JavaScript: ROUTES.JAVASCRIPT,
      TypeScript: ROUTES.TYPESCRIPT,
      'C++': ROUTES.CPP,
      Rust: ROUTES.RUST,
      Go: ROUTES.GO,
      SQL: ROUTES.SQL
    };

    if (targetLang && langRouteMap[targetLang]) {
      navigateTo(langRouteMap[targetLang]);
      return;
    }

    if (targetDuration === 60) {
      navigateTo(ROUTES.TYPING_TEST);
      return;
    }

    navigateTo(ROUTES.PRACTICE, { practiceOptions: { type: 'practice', language: targetLang, duration: targetDuration } });
  };

  const isPublicView = [
    'landing',
    'language-landing',
    'wpm-calculator',
    'login',
    'signup',
    'forgot-password',
    'about',
    'contact',
    'privacy',
    'terms',
    'verify',
    'test',
    'coding',
    'practice',
    ...(!user && (routeState.view === 'certificate' || routeState.view === 'leaderboard' || routeState.view === 'arena') ? [routeState.view] : [])
  ].includes(routeState.view);

  // Render Page Content
  const renderCurrentView = () => {
    switch (routeState.view) {
      // SEO-optimized public educational & practice pages
      case 'language-landing':
        return (
          <LanguagePracticeLanding
            key={routeState.language || 'Python'}
            language={routeState.language || 'Python'}
            onNavigate={navigateTo}
          />
        );
      case 'wpm-calculator':
        return <WpmCalculatorPage onNavigate={navigateTo} />;

      // Public informational views
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
        return <VerifyCertificatePage certId={routeState.certId} onNavigate={navigateTo} />;

      // Core Practice & Test Views
      case 'practice':
        return (
          <PracticePage
            key="practice"
            initialType="practice"
            initialDuration={routeState.practiceOptions?.duration || null}
            initialLanguage={routeState.practiceOptions?.language || null}
            onNavigate={navigateTo}
          />
        );
      case 'coding':
        return (
          <PracticePage
            key={`coding-${routeState.practiceOptions?.language || 'all'}`}
            initialType="coding"
            initialLanguage={routeState.practiceOptions?.language || null}
            initialDuration={routeState.practiceOptions?.duration || null}
            onNavigate={navigateTo}
          />
        );
      case 'english':
        return (
          <PracticePage
            key="english"
            initialType="english"
            initialDuration={routeState.practiceOptions?.duration || null}
            onNavigate={navigateTo}
          />
        );
      case 'test':
        return (
          <PracticePage
            key="test"
            initialType="test"
            initialDuration={routeState.practiceOptions?.duration || 60}
            onNavigate={navigateTo}
          />
        );

      // Lazy-Loaded App & Feature Views
      case 'multiplayer':
      case 'arena':
        return (
          <Suspense fallback={<SuspenseLoader />}>
            <MultiplayerArena onNavigate={navigateTo} />
          </Suspense>
        );
      case 'certificate':
        return (
          <Suspense fallback={<SuspenseLoader />}>
            <CertificatePage onNavigate={navigateTo} onStartPractice={handleStartPractice} />
          </Suspense>
        );
      case 'leaderboard':
        return (
          <Suspense fallback={<SuspenseLoader />}>
            <LeaderboardPage />
          </Suspense>
        );
      case 'dashboard':
        return (
          <Suspense fallback={<SuspenseLoader />}>
            <Dashboard onNavigate={navigateTo} onStartPractice={handleStartPractice} />
          </Suspense>
        );
      case 'history':
        return (
          <Suspense fallback={<SuspenseLoader />}>
            <HistoryPage onNavigate={navigateTo} onStartPractice={handleStartPractice} />
          </Suspense>
        );
      case 'statistics':
        return (
          <Suspense fallback={<SuspenseLoader />}>
            <StatisticsPage onNavigate={navigateTo} onStartPractice={handleStartPractice} />
          </Suspense>
        );
      case 'profile':
        return (
          <Suspense fallback={<SuspenseLoader />}>
            <ProfilePage onNavigate={navigateTo} />
          </Suspense>
        );
      case 'settings':
        return (
          <Suspense fallback={<SuspenseLoader />}>
            <SettingsPage onNavigate={navigateTo} />
          </Suspense>
        );
      case 'admin':
        return (
          <Suspense fallback={<SuspenseLoader />}>
            <AdminPage onNavigate={navigateTo} />
          </Suspense>
        );
      case 'heatmap':
        return (
          <Suspense fallback={<SuspenseLoader />}>
            <div style={{ maxWidth: '1080px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h1 style={{ fontSize: '1.85rem', margin: '0 0 0.25rem' }}>Keystroke Precision Heatmap</h1>
                  <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>
                    Per-key accuracy diagnostics captured across all your live typing and coding drills.
                  </p>
                </div>
                <button className="btn btn-primary" onClick={() => navigateTo('/practice')}>
                  Start Practice Drill
                </button>
              </div>
              <KeyHeatmap />
            </div>
          </Suspense>
        );

      default:
        return <LandingPage onNavigate={navigateTo} onStartPractice={handleStartPractice} />;
    }
  };

  // Show a full-page loader while auth is initializing to prevent blank white flash on refresh
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-bg, #0d1117)'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{
            width: '44px',
            height: '44px',
            border: '3px solid rgba(255,255,255,0.1)',
            borderTopColor: 'var(--color-primary-forest, #22c55e)',
            borderRadius: '50%',
            animation: 'spin 0.75s linear infinite'
          }} />
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', letterSpacing: '0.05em' }}>Initializing...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {!['practice', 'coding', 'english', 'test', 'language-landing'].includes(routeState.view) && <AnnouncementBanner />}
      {isPublicView ? (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <PublicHeader onNavigate={navigateTo} currentView={routeState.view} currentPath={routeState.path} />
          <main style={{ flex: 1, padding: routeState.view === 'landing' ? '0.5rem 1.5rem 2rem' : '2rem 1.5rem', maxWidth: '1280px', width: '100%', margin: '0 auto' }}>
            {renderCurrentView()}
          </main>
          <PublicFooter onNavigate={navigateTo} />
        </div>
      ) : (
        <div className="app-container">
          <Sidebar
            currentView={routeState.view}
            onNavigate={navigateTo}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />

          <div className="app-main">
            <Header
              currentView={routeState.view}
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
      {/* Google Login Popup — sirf landing page pe logged-out users ke liye */}
      {!user && routeState.view === 'landing' && (
        <GoogleLoginPopup onNavigate={navigateTo} />
      )}
      <Analytics />
    </>
  );
}
