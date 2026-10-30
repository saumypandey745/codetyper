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
