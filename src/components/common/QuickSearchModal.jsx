import React, { useState, useEffect, useRef } from 'react';
import { Search, Code2, BookOpen, Terminal, ArrowRight, X } from 'lucide-react';
import { programmingLanguages } from '../../../server/seedData.js';

export function QuickSearchModal({ isOpen, onClose, onSelectPractice, onNavigate }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const englishCategories = [
    'General English', 'Daily Life', 'Technology', 'Education', 'Business',
    'Travel', 'Science', 'Nature', 'Productivity', 'Motivation', 'Communication', 'Programming Concepts'
  ];

  const filteredLangs = programmingLanguages.filter((l) =>
    l.toLowerCase().includes(query.toLowerCase())
  );

  const filteredCats = englishCategories.filter((c) =>
    c.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '520px', padding: '1.25rem' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
          <Search size={18} color="var(--color-primary-sage)" />
          <input
            ref={inputRef}
            type="text"
            className="form-input"
            style={{ border: 'none', boxShadow: 'none', padding: '0.2rem', fontSize: '1rem' }}
            placeholder="Type language or topic (e.g. Python, Nature, Test)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button onClick={onClose} style={{ color: 'var(--color-text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ maxHeight: '340px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Quick Actions */}
          <div>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 600 }}>
              Quick Navigation
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.4rem' }}>
              <button
                className="nav-link"
                onClick={() => { onNavigate('dashboard'); onClose(); }}
              >
                <span>Dashboard Overview</span>
              </button>
              <button
                className="nav-link"
                onClick={() => { onNavigate('test'); onClose(); }}
              >
                <span>Take a 60-second Timed Speed Test</span>
              </button>
              <button
                className="nav-link"
                onClick={() => { onNavigate('statistics'); onClose(); }}
              >
                <span>View Typing Statistics</span>
              </button>
            </div>
          </div>

          {/* Programming Languages */}
          {filteredLangs.length > 0 && (
            <div>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                Code Typing ({filteredLangs.length})
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem', marginTop: '0.4rem' }}>
                {filteredLangs.slice(0, 8).map((lang) => (
                  <button
                    key={lang}
                    className="btn btn-outline btn-sm"
                    style={{ justifyContent: 'flex-start', padding: '0.4rem 0.65rem' }}
                    onClick={() => {
                      onSelectPractice('code', lang);
                      onClose();
                    }}
                  >
                    <Code2 size={14} color="var(--color-primary-forest)" />
                    <span>{lang}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* English Topics */}
          {filteredCats.length > 0 && (
            <div>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                English Passages ({filteredCats.length})
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem', marginTop: '0.4rem' }}>
                {filteredCats.slice(0, 8).map((cat) => (
                  <button
                    key={cat}
                    className="btn btn-outline btn-sm"
                    style={{ justifyContent: 'flex-start', padding: '0.4rem 0.65rem' }}
                    onClick={() => {
                      onSelectPractice('english', cat);
                      onClose();
                    }}
                  >
                    <BookOpen size={14} color="var(--color-primary-sage)" />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
