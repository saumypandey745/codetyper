import React, { useState } from 'react';
import {
  Settings,
  Sliders,
  Volume2,
  VolumeX,
  Type,
  Eye,
  Shield,
  Key,
  Trash2,
  Download,
  RotateCcw,
  CheckCircle2,
  Sun,
  Moon,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { soundEngine } from '../../utils/soundEngine.js';
import { api } from '../../utils/api.js';

export function SettingsPage({ onNavigate }) {
  const { settings, updateSetting, updateAllSettings, toggleTheme } = useSettings();
  const { user, logout } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('appearance');
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Sound test button
  const handleTestSound = () => {
    soundEngine.playKeypress();
    toast.info('Played mechanical keypress sound.');
  };

  const handleTestErrorSound = () => {
    soundEngine.playError();
    toast.info('Played error click sound.');
  };

  // Change password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long.');
      return;
    }

    setChangingPassword(true);
    try {
      await api.user.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      toast.success('Password updated successfully.');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.message || 'Failed to update password.');
    } finally {
      setChangingPassword(false);
    }
  };

  // Export JSON
  const handleExportData = () => {
    try {
      const exportObject = {
        exportedAt: new Date().toISOString(),
        user: user ? { id: user.id, username: user.username, email: user.email } : null,
        settings: settings
      };
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportObject, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `codetyper_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      toast.success('Application settings and profile data exported.');
    } catch (err) {
      toast.error('Could not export data.');
    }
  };

  // Reset to Defaults
  const handleResetDefaults = () => {
    if (window.confirm('Reset all typing engine and appearance preferences to default?')) {
      updateAllSettings({
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
        countdown_enabled: true,
        reduced_motion: false,
        high_contrast: false
      });
      toast.success('Settings restored to tranquil default.');
    }
  };

  const tabs = [
    { id: 'appearance', label: 'Appearance', icon: Sun },
    { id: 'typing', label: 'Typing Engine', icon: Type },
    { id: 'sound', label: 'Sound & Audio', icon: Volume2 },
    { id: 'privacy', label: 'Privacy & Data', icon: Shield },
    { id: 'account', label: 'Account & Security', icon: Key }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '980px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Settings size={24} color="var(--color-primary-forest)" />
            <h1 style={{ fontSize: '2rem', margin: 0 }}>Preferences & Settings</h1>
          </div>
          <p style={{ margin: 0, fontSize: '0.95rem' }}>
            Tailor your sensory experience, typography, audio clicks, and typing engine behavior.
          </p>
        </div>

        <button className="btn btn-outline btn-sm" onClick={handleResetDefaults}>
          <RotateCcw size={15} />
          <span>Reset Defaults</span>
        </button>
      </div>

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-ghost'}`}
              style={{ borderRadius: 'var(--radius-full)', whiteSpace: 'nowrap' }}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Appearance */}
      {activeTab === 'appearance' && (
        <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <h3 style={{ marginBottom: '0.5rem' }}>Theme & Color Scheme</h3>
            <p style={{ fontSize: '0.875rem', marginBottom: '1.25rem', color: 'var(--color-text-secondary)' }}>
              Choose between the signature warm botanical cream palette or a subdued slate-green dark mode.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div
                style={{
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-lg)',
                  border: settings.theme === 'peaceful' ? '2px solid var(--color-primary-forest)' : '1px solid var(--color-border)',
                  backgroundColor: '#FAF8F1',
                  color: '#1E2D24',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}
                onClick={() => updateSetting('theme', 'peaceful')}
              >
                <Sun size={24} color="#2F6B52" />
                <div>
                  <div style={{ fontWeight: 600 }}>Peaceful Cream</div>
                  <div style={{ fontSize: '0.78rem', color: '#52665A' }}>Botanical sage & warm ivory</div>
                </div>
              </div>

              <div
                style={{
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-lg)',
                  border: settings.theme === 'dark' ? '2px solid var(--color-primary-forest)' : '1px solid var(--color-border)',
                  backgroundColor: '#131B16',
                  color: '#E8ECE9',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}
                onClick={() => updateSetting('theme', 'dark')}
              >
                <Moon size={24} color="#8FAF9A" />
                <div>
                  <div style={{ fontWeight: 600 }}>Slate Green Dark</div>
                  <div style={{ fontSize: '0.78rem', color: '#9BAFA3' }}>Deep forest nocturnal mode</div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>Typography & Font Family</h3>
            <p style={{ fontSize: '0.875rem', marginBottom: '1.25rem', color: 'var(--color-text-secondary)' }}>
              Select the monospace or sans font that provides the highest legibility for your eyes.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              {[
                { id: 'monospace', name: 'JetBrains Mono', family: "'JetBrains Mono', monospace" },
                { id: 'fira', name: 'Fira Code', family: "'Fira Code', monospace" },
                { id: 'sans', name: 'Inter Sans', family: "'Inter', sans-serif" }
              ].map((font) => (
                <div
                  key={font.id}
                  style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: settings.font_family === font.id ? '2px solid var(--color-primary-forest)' : '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-bg-subtle)',
                    cursor: 'pointer',
                    fontFamily: font.family
                  }}
                  onClick={() => updateSetting('font_family', font.id)}
                >
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{font.name}</div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '0.25rem' }}>
                    const flow = true;
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>Font Size</h3>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {[
                { id: 'small', label: 'Compact (16px)' },
                { id: 'medium', label: 'Balanced (19px)' },
                { id: 'large', label: 'Comfortable (22px)' }
              ].map((sz) => (
                <button
                  key={sz.id}
                  className={`btn ${settings.font_size === sz.id ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => updateSetting('font_size', sz.id)}
                >
                  {sz.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>Cursor / Caret Style</h3>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {[
                { id: 'line', label: 'Smooth Vertical Line (|)' },
                { id: 'block', label: 'Terminal Block (█)' },
                { id: 'underline', label: 'Underline (_)' }
              ].map((c) => (
                <button
                  key={c.id}
                  className={`btn ${settings.cursor_style === c.id ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => updateSetting('cursor_style', c.id)}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Typing Engine */}
      {activeTab === 'typing' && (
        <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h3 style={{ marginBottom: '0.5rem' }}>Typing Feedback & Visuals</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1.25rem' }}>
              Fine-tune the live telemetry displayed while practicing.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', backgroundColor: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Live WPM Meter</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Show current speed counter while typing</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.show_wpm}
                  onChange={(e) => updateSetting('show_wpm', e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary-forest)' }}
                />
              </label>

              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', backgroundColor: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Live Accuracy Percentage</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Display precision percentage during session</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.show_accuracy}
                  onChange={(e) => updateSetting('show_accuracy', e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary-forest)' }}
                />
              </label>

              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', backgroundColor: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Highlight Mistakes Immediately</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Tint mistyped characters in soft red</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.highlight_mistakes}
                  onChange={(e) => updateSetting('highlight_mistakes', e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary-forest)' }}
                />
              </label>

              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', backgroundColor: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Smooth Autoscrolling</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Naturally scrolls multi-line paragraphs as you advance</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.smooth_scrolling}
                  onChange={(e) => updateSetting('smooth_scrolling', e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary-forest)' }}
                />
              </label>

              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', backgroundColor: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Countdown Timer (3-2-1)</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Short peaceful breath countdown before timed tests begin</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.countdown_enabled}
                  onChange={(e) => updateSetting('countdown_enabled', e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary-forest)' }}
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Sound & Audio */}
      {activeTab === 'sound' && (
        <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ margin: 0 }}>Typing Audio Feedback</h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                  Satisfying auditory confirmation on every keystroke generated via Web Audio API.
                </span>
              </div>
              <button
                className={`btn ${settings.sound_enabled ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => updateSetting('sound_enabled', !settings.sound_enabled)}
              >
                {settings.sound_enabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                <span>{settings.sound_enabled ? 'Audio Active' : 'Muted'}</span>
              </button>
            </div>

            {/* Volume Slider */}
            <div style={{ marginBottom: '1.5rem', opacity: settings.sound_enabled ? 1 : 0.5 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 600 }}>Volume</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{Math.round(settings.volume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.volume}
                disabled={!settings.sound_enabled}
                onChange={(e) => updateSetting('volume', parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--color-primary-forest)' }}
              />
            </div>

            {/* Key Sound Styles */}
            <h4 style={{ marginBottom: '0.75rem', fontSize: '0.95rem' }}>Key Sound Switch Profile</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', opacity: settings.sound_enabled ? 1 : 0.5 }}>
              {[
                { id: 'mechanical', name: 'Tactile Mechanical', desc: 'Crisp mechanical switch click' },
                { id: 'soft', name: 'Soft Thud', desc: 'Gentle subdued keystroke' },
                { id: 'typewriter', name: 'Classic Typewriter', desc: 'Vintage mechanical cadence' },
                { id: 'beep', name: 'Minimalist Ping', desc: 'Subtle pure sine blip' }
              ].map((snd) => (
                <div
                  key={snd.id}
                  style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: settings.sound_theme === snd.id ? '2px solid var(--color-primary-forest)' : '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-bg-subtle)',
                    cursor: settings.sound_enabled ? 'pointer' : 'default'
                  }}
                  onClick={() => {
                    if (settings.sound_enabled) {
                      updateSetting('sound_theme', snd.id);
                      soundEngine.setPreferences(true, snd.id, settings.volume);
                      soundEngine.playKeypress();
                    }
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{snd.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                    {snd.desc}
                  </div>
                </div>
              ))}
            </div>

            {/* Sound Test Actions */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button className="btn btn-outline btn-sm" onClick={handleTestSound} disabled={!settings.sound_enabled}>
                <Volume2 size={15} />
                <span>Test Normal Keystroke</span>
              </button>
              <button className="btn btn-outline btn-sm" onClick={handleTestErrorSound} disabled={!settings.sound_enabled}>
                <span>Test Error Feedback</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Privacy & Data */}
      {activeTab === 'privacy' && (
        <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          <div>
            <h3 style={{ marginBottom: '0.5rem' }}>Data Storage & Privacy</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1.25rem' }}>
              You have complete ownership over your practice logs, telemetry, and metrics.
            </p>

            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', backgroundColor: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-md)', cursor: 'pointer', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Save Practice History to Server</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                  When enabled, your practice tests are saved to your account for tracking progress.
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.save_history}
                onChange={(e) => updateSetting('save_history', e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary-forest)' }}
              />
            </label>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', backgroundColor: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-md)' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Export All Data</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                  Download your full profile, settings, and offline session cache as a JSON file.
                </div>
              </div>
              <button className="btn btn-outline btn-sm" onClick={handleExportData}>
                <Download size={15} />
                <span>Export JSON</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Account & Security */}
      {activeTab === 'account' && (
        <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Change Password Form */}
          <div>
            <h3 style={{ marginBottom: '0.5rem' }}>Change Security Password</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1.25rem' }}>
              Ensure your account is protected with a secure password of at least 8 characters.
            </p>

            <form onSubmit={handleChangePassword} style={{ maxWidth: '420px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="input-label">Current Password</label>
                <input
                  type="password"
                  className="input"
                  required
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                />
              </div>

              <div>
                <label className="input-label">New Password</label>
                <input
                  type="password"
                  className="input"
                  required
                  minLength={8}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                />
              </div>

              <div>
                <label className="input-label">Confirm New Password</label>
                <input
                  type="password"
                  className="input"
                  required
                  minLength={8}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }} disabled={changingPassword}>
                <Key size={16} />
                <span>{changingPassword ? 'Updating...' : 'Update Password'}</span>
              </button>
            </form>
          </div>

          {/* Danger Zone */}
          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.75rem' }}>
            <h3 style={{ marginBottom: '0.5rem', color: 'var(--color-error)' }}>Danger Zone</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1.25rem' }}>
              Permanently delete your user account, practice sessions, and performance analytics.
            </p>

            <button className="btn btn-outline btn-sm" style={{ borderColor: 'var(--color-error)', color: 'var(--color-error)' }} onClick={() => setShowDeleteModal(true)}>
              <Trash2 size={15} />
              <span>Delete My Account</span>
            </button>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="modal-backdrop" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <h3 style={{ color: 'var(--color-error)', marginBottom: '0.5rem' }}>Confirm Account Deletion</h3>
            <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              This action is permanent and cannot be undone. All your session history, personal best records, and account settings will be erased from the database.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button className="btn btn-ghost" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                style={{ backgroundColor: 'var(--color-error)', borderColor: 'var(--color-error)' }}
                onClick={async () => {
                  try {
                    await api.user.deleteAccount();
                    await logout();
                    toast.success('Account deleted.');
                    onNavigate('landing');
                  } catch (err) {
                    toast.error('Could not delete account.');
                  }
                }}
              >
                Yes, Delete My Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
