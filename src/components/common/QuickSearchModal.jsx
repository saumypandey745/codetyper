import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  Code2,
  BookOpen,
  Terminal,
  ArrowRight,
  X,
  Palette,
  Volume2,
  Trophy,
  Swords,
  Activity,
  Timer,
  LayoutDashboard,
  Sparkles,
  Target,
  Settings,
  History
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { programmingLanguages, englishCategories } from '../../../server/seedData.js';

export function QuickSearchModal({ isOpen, onClose, onSelectPractice, onNavigate }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const { settings, updateSetting } = useSettings();
  const toast = useToast();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Command items builder
  const commandItems = useMemo(() => {
    const q = query.toLowerCase().trim();
    const items = [];

    // Core Navigation
    const navActions = [
      { id: 'nav-dash', section: 'Navigation', title: 'Dashboard Overview', icon: LayoutDashboard, action: () => onNavigate('dashboard') },
      { id: 'nav-board', section: 'Navigation', title: 'Global Leaderboard & Hall of Fame', icon: Trophy, badge: 'Popular', action: () => onNavigate('leaderboard') },
      { id: 'nav-duel', section: 'Navigation', title: '1v1 Live Duel Arena (Multiplayer)', icon: Swords, badge: 'Live', action: () => onNavigate('multiplayer') },
      { id: 'nav-test', section: 'Navigation', title: 'Start 60-second Timed Speed Test', icon: Timer, action: () => onNavigate('test') },
      { id: 'nav-heat', section: 'Navigation', title: 'Keystroke Accuracy Heatmap & Biometrics', icon: Activity, action: () => onNavigate('heatmap') },
      { id: 'nav-hist', section: 'Navigation', title: 'Typing History & Export Sessions', icon: History, action: () => onNavigate('history') },
      { id: 'nav-sett', section: 'Navigation', title: 'Preferences & Audio Configuration', icon: Settings, action: () => onNavigate('settings') }
    ];

    navActions.forEach((item) => {
      if (!q || item.title.toLowerCase().includes(q) || item.section.toLowerCase().includes(q)) {
        items.push(item);
      }
    });

    // Curated Drills
    const drillActions = [
      { id: 'drill-algo', section: 'Curated Drills', title: 'Algorithms (DSA) — Blind 75 LeetCode Drills', icon: Target, badge: 'DSA', action: () => onSelectPractice('code', 'Algorithms (DSA)') },
      { id: 'drill-vim', section: 'Curated Drills', title: 'Vim Navigation — Motions, Operator Combos', icon: Terminal, badge: 'Vim', action: () => onSelectPractice('code', 'Vim Navigation') },
      { id: 'drill-ai', section: 'Curated Drills', title: 'AI Drill Generator & Synthesizer', icon: Sparkles, badge: 'AI', action: () => onNavigate('practice') }
    ];

    drillActions.forEach((item) => {
      if (!q || item.title.toLowerCase().includes(q) || item.badge.toLowerCase().includes(q)) {
        items.push(item);
      }
    });

    // Theme Switchers
    const themes = [
      { id: 'catppuccin', name: 'Catppuccin Mocha' },
      { id: 'dracula', name: 'Dracula Dark' },
      { id: 'tokyo-night', name: 'Tokyo Night' },
      { id: 'nord', name: 'Nord Frost' },
      { id: 'matrix-neon', name: 'Matrix Cyberpunk' },
      { id: 'dark', name: 'Dark Slate' },
      { id: 'sage', name: 'Calm Sage' }
    ];

    themes.forEach((t) => {
      if (!q || t.name.toLowerCase().includes(q) || 'theme'.includes(q)) {
        items.push({
          id: `theme-${t.id}`,
          section: 'Theme Switcher',
          title: `Switch Theme to ${t.name}`,
          icon: Palette,
          badge: settings.theme === t.id ? 'Active' : null,
          action: () => {
            updateSetting('theme', t.id);
            toast.success(`Theme switched to ${t.name}`);
          }
        });
      }
    });

    // Mechanical Switch Audio Switcher
    const sounds = [
      { id: 'thock', name: 'Gateron Oil King (Deep Thock)' },
      { id: 'holypanda', name: 'Holy Panda (Tactile Bump)' },
      { id: 'buckling', name: 'IBM Model M (Buckling Spring)' },
      { id: 'typewriter', name: 'Royal Typewriter' },
      { id: 'mechanical', name: 'Clicky Mechanical (Blue)' },
      { id: 'mute', name: 'Silent / Mute' }
    ];

    sounds.forEach((s) => {
      if (!q || s.name.toLowerCase().includes(q) || 'sound audio switch'.includes(q)) {
        items.push({
          id: `sound-${s.id}`,
          section: 'Switch Audio',
          title: `Switch Key Sound: ${s.name}`,
          icon: Volume2,
          badge: settings.key_sound === s.id ? 'Active' : null,
          action: () => {
            updateSetting('key_sound', s.id);
            toast.success(`Key sound set to ${s.name}`);
          }
        });
      }
    });

    // Coding Languages
    programmingLanguages.forEach((lang) => {
      if (!q || lang.toLowerCase().includes(q) || 'code language'.includes(q)) {
        items.push({
          id: `lang-${lang}`,
          section: 'Coding Languages',
          title: `Practice ${lang} Coding Syntax`,
          icon: Code2,
          badge: 'Code',
          action: () => onSelectPractice('code', lang)
        });
      }
    });

    // English Passages
    englishCategories.forEach((cat) => {
      if (!q || cat.toLowerCase().includes(q) || 'english passage'.includes(q)) {
        items.push({
          id: `cat-${cat}`,
          section: 'English Passages',
          title: `Practice English: ${cat}`,
          icon: BookOpen,
          badge: 'English',
          action: () => onSelectPractice('english', cat)
        });
      }
    });

    return items;
  }, [query, settings.theme, settings.key_sound, onNavigate, onSelectPractice, updateSetting, toast]);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e) {
      if (!isOpen) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1 < commandItems.length ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : commandItems.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (commandItems[selectedIndex]) {
          commandItems[selectedIndex].action();
          onClose();
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, commandItems, selectedIndex]);

  // Keep selected index in bounds and scroll active item into view
  useEffect(() => {
    if (selectedIndex >= commandItems.length) {
      setSelectedIndex(0);
    }
    const activeEl = listRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [selectedIndex, commandItems.length]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0, 0, 0, 0.65)' }}>
      <div
        className="modal-content"
        style={{
          maxWidth: '580px',
          width: '94%',
          padding: 0,
          overflow: 'hidden',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px var(--color-border)',
          background: 'var(--color-bg-card)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Raycast Search Input */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
            padding: '1rem 1.25rem',
            borderBottom: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-bg-subtle)'
          }}
        >
          <Search size={20} color="var(--color-primary-sage)" />
          <input
            ref={inputRef}
            type="text"
            className="form-input"
            style={{
              border: 'none',
              boxShadow: 'none',
              padding: '0.2rem',
              fontSize: '1.05rem',
              backgroundColor: 'transparent',
              outline: 'none',
              width: '100%'
            }}
            placeholder="Type a command, theme, sound, or language..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
          />
          <kbd
            style={{
              padding: '0.2rem 0.45rem',
              fontSize: '0.75rem',
              backgroundColor: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--color-text-tertiary)'
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Command Items List */}
        <div
          ref={listRef}
          style={{
            maxHeight: '380px',
            overflowY: 'auto',
            padding: '0.5rem'
          }}
        >
          {commandItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--color-text-secondary)' }}>
              <p style={{ margin: 0, fontSize: '0.95rem' }}>No matching commands found for &ldquo;{query}&rdquo;</p>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)' }}>
                Try searching for &quot;theme&quot;, &quot;sound&quot;, &quot;duel&quot;, &quot;leaderboard&quot;, or &quot;python&quot;.
              </span>
            </div>
          ) : (
            commandItems.map((item, idx) => {
              const Icon = item.icon || Terminal;
              const isSelected = idx === selectedIndex;
              const isFirstOfSection = idx === 0 || commandItems[idx - 1].section !== item.section;

              return (
                <React.Fragment key={item.id}>
                  {isFirstOfSection && (
                    <div
                      style={{
                        padding: '0.6rem 0.75rem 0.3rem',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: 'var(--color-text-tertiary)'
                      }}
                    >
                      {item.section}
                    </div>
                  )}
                  <div
                    data-index={idx}
                    onClick={() => {
                      item.action();
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: isSelected ? 'var(--color-primary-sage)' : 'transparent',
                      color: isSelected ? '#ffffff' : 'var(--color-text-primary)',
                      cursor: 'pointer',
                      transition: 'background-color 0.1s ease',
                      marginBottom: '0.15rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
                      <Icon
                        size={17}
                        style={{
                          flexShrink: 0,
                          color: isSelected ? '#ffffff' : 'var(--color-primary-sage)'
                        }}
                      />
                      <span
                        style={{
                          fontSize: '0.9rem',
                          fontWeight: isSelected ? 600 : 500,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {item.title}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                      {item.badge && (
                        <span
                          className={`badge ${isSelected ? 'badge-subtle' : 'badge-sage'}`}
                          style={{
                            fontSize: '0.7rem',
                            backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.25)' : undefined,
                            color: isSelected ? '#ffffff' : undefined
                          }}
                        >
                          {item.badge}
                        </span>
                      )}
                      {isSelected && (
                        <span style={{ fontSize: '0.75rem', opacity: 0.85, fontWeight: 500 }}>
                          ↵ Enter
                        </span>
                      )}
                    </div>
                  </div>
                </React.Fragment>
              );
            })
          )}
        </div>

        {/* Raycast Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.6rem 1.25rem',
            borderTop: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-bg-subtle)',
            fontSize: '0.75rem',
            color: 'var(--color-text-tertiary)'
          }}
        >
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span><kbd>↑</kbd> <kbd>↓</kbd> Navigate</span>
            <span><kbd>↵</kbd> Select</span>
            <span><kbd>ESC</kbd> Close</span>
          </div>
          <span><strong>{commandItems.length}</strong> actions available</span>
        </div>
      </div>
    </div>
  );
}
