import React, { createContext, useContext, useState, useEffect } from 'react';
import { soundEngine } from '../utils/soundEngine.js';
import { api } from '../utils/api.js';

const SettingsContext = createContext(null);

const DEFAULT_SETTINGS = {
  theme: 'peaceful',
  font_family: 'monospace',
  font_size: 'medium',
  cursor_style: 'line',
  sound_enabled: true,
  sound_theme: 'mechanical',
  volume: 0.5,
  show_wpm: true,
  show_accuracy: true,
  show_errors: true,
  highlight_mistakes: true,
  smooth_scrolling: true,
  default_duration: 60,
  default_difficulty: 'intermediate',
  auto_start: true,
  countdown_enabled: true,
  public_profile: true,
  save_history: true,
  reduced_motion: false,
  high_contrast: false
};

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const cached = localStorage.getItem('codetyper_settings');
      return cached ? { ...DEFAULT_SETTINGS, ...JSON.parse(cached) } : DEFAULT_SETTINGS;
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  });

  // Apply settings to DOM & audio engine whenever changed
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
    document.documentElement.setAttribute('data-high-contrast', settings.high_contrast ? 'true' : 'false');
    document.body.setAttribute('data-reduced-motion', settings.reduced_motion ? 'true' : 'false');

    soundEngine.setPreferences(settings.sound_enabled, settings.sound_theme, settings.volume);

    try {
      localStorage.setItem('codetyper_settings', JSON.stringify(settings));
    } catch (e) {}
  }, [settings]);

  const updateSetting = async (key, value) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      return next;
    });

    // If authenticated, persist to database
    try {
      if (localStorage.getItem('codetyper_token')) {
        await api.user.updateSettings({ [key]: value });
      }
    } catch (e) {
      // Offline fallback already updated local state
    }
  };

  const updateAllSettings = async (newSettings) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    try {
      if (localStorage.getItem('codetyper_token')) {
        await api.user.updateSettings(newSettings);
      }
    } catch (e) {}
  };

  const toggleTheme = () => {
    const nextTheme = settings.theme === 'dark' ? 'peaceful' : 'dark';
    updateSetting('theme', nextTheme);
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSetting,
        updateAllSettings,
        toggleTheme
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
}
