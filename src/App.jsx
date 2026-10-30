import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext.jsx';
import { useToast } from './context/ToastContext.jsx';
import { PublicHeader } from './components/layout/PublicHeader.jsx';
import { PublicFooter } from './components/layout/PublicFooter.jsx';
import { Sidebar } from './components/layout/Sidebar.jsx';
import { Header } from './components/layout/Header.jsx';
import { QuickSearchModal } from './components/common/QuickSearchModal.jsx';

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

export function App() {
  const { user, loading } = useAuth();
  const toast = useToast();

  const [currentView, setCurrentView] = useState(() => {
    // Check initial route or saved view
    const raw = window.location.hash.replace('#', '');
    const view = raw.split('?')[0];
    return view || 'landing';
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [practiceConfig, setPracticeConfig] = useState({
    type: 'practice',
    language: null
  });

  // Keep URL hash in sync for back/forward navigation and bookmarks
  useEffect(() => {
    const raw = window.location.hash.replace('#', '');
    const query = raw.includes('?') ? '?' + raw.split('?')[1] : '';
    window.location.hash = currentView + query;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView]);

  useEffect(() => {
    const handleHashChange = () => {
      const raw = window.location.hash.replace('#', '');
      const view = raw.split('?')[0];
      if (view && view !== currentView) {
        setCurrentView(view);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentView]);

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
    const authRequiredViews = ['dashboard', 'history', 'statistics', 'profile', 'admin'];

    if (authRequiredViews.includes(view) && !user && !loading) {
      toast.info('Please sign in or create an account to access this page.');
      setCurrentView('login');
      return;
    }

    if (options.practiceOptions) {
      setPracticeConfig(options.practiceOptions);
    }

    setCurrentView(view);
    setSidebarOpen(false);
  };

  const handleStartPractice = (options = {}) => {
    const targetType = options.type || 'practice';
    setPracticeConfig({
      type: targetType,
      language: options.language || null
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
    'terms'
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

      // App Views
      case 'dashboard':
        return <Dashboard onNavigate={navigateTo} onStartPractice={handleStartPractice} />;
      case 'practice':
        return (
          <PracticePage
            initialType="practice"
            onNavigate={navigateTo}
          />
        );
      case 'coding':
        return (
          <PracticePage
            initialType="coding"
            initialLanguage={practiceConfig.language}
            onNavigate={navigateTo}
          />
        );
      case 'english':
        return (
          <PracticePage
            initialType="english"
            onNavigate={navigateTo}
          />
        );
      case 'test':
        return (
          <PracticePage
            initialType="test"
            onNavigate={navigateTo}
          />
        );
      case 'history':
        return <HistoryPage onNavigate={navigateTo} onStartPractice={handleStartPractice} />;
      case 'statistics':
        return <StatisticsPage onNavigate={navigateTo} onStartPractice={handleStartPractice} />;
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
      {isPublicView ? (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <PublicHeader onNavigate={navigateTo} />
          <main style={{ flex: 1, padding: '2rem 1.5rem', maxWidth: '1280px', width: '100%', margin: '0 auto' }}>
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
