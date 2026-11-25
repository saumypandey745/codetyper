import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { SettingsProvider } from './context/SettingsContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';

// Core Design Tokens & Styles
import './styles/tokens.css';
import './styles/globals.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/typing.css';
import './styles/landing.css';
import './styles/certificate.css';
import './styles/admin.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ToastProvider>
      <SettingsProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </SettingsProvider>
    </ToastProvider>
  </React.StrictMode>
);

// Register PWA Service Worker in production/supporting environments
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('SW registration skipped or failed:', err);
    });
  });
}

