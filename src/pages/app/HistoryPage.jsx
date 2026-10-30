import React, { useState, useEffect, useMemo } from 'react';
import {
  History,
  Filter,
  Search,
  Trash2,
  Eye,
  Download,
  Calendar,
  Zap,
  Target,
  Clock,
  ArrowRight,
  CheckCircle2,
  X
} from 'lucide-react';
import { api } from '../../utils/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { formatDuration, formatDate } from '../../utils/wpmCalculator.js';
import { programmingLanguages } from '../../../server/seedData.js';

export function HistoryPage({ onNavigate, onStartPractice }) {
  const toast = useToast();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [selectedSession, setSelectedSession] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Load history from API
  const loadHistory = async () => {
    setLoading(true);
    try {
      const res = await api.sessions.getHistory({ limit: 100 });
      setSessions(res.sessions || []);
    } catch (err) {
      console.warn('Failed to load session history', err);
      toast.error('Could not retrieve practice history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  // Filtered sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      if (typeFilter !== 'all' && s.practice_type !== typeFilter) return false;
      if (languageFilter !== 'all' && s.language?.toLowerCase() !== languageFilter.toLowerCase()) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesLang = s.language?.toLowerCase().includes(query);
        const matchesType = s.practice_type?.toLowerCase().includes(query);
        const matchesDate = formatDate(s.completed_at).toLowerCase().includes(query);
        if (!matchesLang && !matchesType && !matchesDate) return false;
      }
      return true;
    });
  }, [sessions, typeFilter, languageFilter, searchQuery]);

  // Aggregate stats from loaded sessions
  const aggregateStats = useMemo(() => {
    if (sessions.length === 0) return { total: 0, avgWpm: 0, avgAcc: 0, totalTime: 0 };
    const total = sessions.length;
    const avgWpm = Math.round(sessions.reduce((acc, s) => acc + (s.net_wpm || 0), 0) / total);
    const avgAcc = Math.round(sessions.reduce((acc, s) => acc + (s.accuracy || 0), 0) / total);
    const totalTime = sessions.reduce((acc, s) => acc + (s.duration_seconds || 0), 0);
    return { total, avgWpm, avgAcc, totalTime };
  }, [sessions]);

  // Delete session
  const handleDeleteSession = async (id) => {
    if (!window.confirm('Are you sure you want to delete this session record?')) return;
    setDeletingId(id);
    try {
      await api.sessions.delete(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
      if (selectedSession?.id === id) setSelectedSession(null);
      toast.success('Session removed from history.');
    } catch (err) {
      toast.error('Could not delete session.');
    } finally {
      setDeletingId(null);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (sessions.length === 0) {
      toast.info('No session records to export.');
      return;
    }
    const headers = ['ID', 'Date', 'Type', 'Language', 'Difficulty', 'Duration(s)', 'Gross WPM', 'Net WPM', 'Accuracy(%)', 'Errors'];
    
    const escapeCsvField = (field) => {
      if (field === null || field === undefined) return '""';
      const str = String(field).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = sessions.map((s) => [
      s.id,
      escapeCsvField(s.completed_at),
      escapeCsvField(s.practice_type),
      escapeCsvField(s.language || 'English'),
      escapeCsvField(s.difficulty || 'intermediate'),
      s.duration_seconds,
      s.gross_wpm,
      s.net_wpm,
      s.accuracy,
      s.error_count
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `codetyper_history_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('History exported successfully as CSV.');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <History size={24} color="var(--color-primary-forest)" />
            <h1 style={{ fontSize: '2rem', margin: 0 }}>Practice History</h1>
          </div>
          <p style={{ margin: 0, fontSize: '0.95rem' }}>
            Review every typing session, track your consistency, and analyze detailed character metrics.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button className="btn btn-outline btn-sm" onClick={handleExportCSV} title="Download CSV report">
            <Download size={15} />
            <span>Export CSV</span>
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => onNavigate('practice')}>
            <span>Start Practice</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>

      {/* Aggregate KPI Summary Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Total Sessions</span>
            <div className="stat-icon"><History size={16} /></div>
          </div>
          <div className="stat-value">{aggregateStats.total}</div>
          <span className="stat-subtext">Completed practice tests</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Average Speed</span>
            <div className="stat-icon"><Zap size={16} /></div>
          </div>
          <div className="stat-value" style={{ color: 'var(--color-primary-forest)' }}>
            {aggregateStats.avgWpm} <span style={{ fontSize: '1rem', fontWeight: 500 }}>WPM</span>
          </div>
          <span className="stat-subtext">Across all languages</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Average Accuracy</span>
            <div className="stat-icon"><Target size={16} /></div>
          </div>
          <div className="stat-value">{aggregateStats.avgAcc}%</div>
          <span className="stat-subtext">Clean precision rate</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Total Practice Time</span>
            <div className="stat-icon"><Clock size={16} /></div>
          </div>
          <div className="stat-value">{formatDuration(aggregateStats.totalTime)}</div>
          <span className="stat-subtext">Deliberate focus spent</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '260px' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '340px' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              placeholder="Search by language, mode, or date..."
              className="input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '2.25rem', fontSize: '0.875rem' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Practice Type Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Type:</span>
            <select
              className="input"
              style={{ padding: '0.35rem 0.65rem', width: 'auto', fontSize: '0.85rem' }}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">All Modes</option>
              <option value="practice">Quick Practice</option>
              <option value="coding">Coding</option>
              <option value="english">English</option>
              <option value="test">Speed Test</option>
            </select>
          </div>

          {/* Language Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Language:</span>
            <select
              className="input"
              style={{ padding: '0.35rem 0.65rem', width: 'auto', fontSize: '0.85rem' }}
              value={languageFilter}
              onChange={(e) => setLanguageFilter(e.target.value)}
            >
              <option value="all">All Languages</option>
              <option value="English">English</option>
              {programmingLanguages.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto 1rem' }} />
            <p style={{ color: 'var(--color-text-secondary)' }}>Loading your session history...</p>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="empty-state" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
            <History size={40} color="var(--color-primary-sage)" style={{ marginBottom: '1rem', opacity: 0.7 }} />
            <h3 style={{ marginBottom: '0.5rem' }}>No practice sessions found</h3>
            <p style={{ maxWidth: '420px', margin: '0 auto 1.5rem' }}>
              {sessions.length === 0
                ? "You haven't completed any typing sessions yet. Pick a practice mode to begin your journey."
                : 'No sessions matched your filter criteria.'}
            </p>
            <button className="btn btn-primary" onClick={() => onNavigate('practice')}>
              Start First Practice
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="results-breakdown-table">
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-muted)', fontSize: '0.825rem', textTransform: 'uppercase', backgroundColor: 'var(--color-bg-subtle)' }}>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Date & Time</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Type</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Language</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Speed</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Accuracy</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Duration</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Errors</th>
                  <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSessions.map((s) => (
                  <tr key={s.id} style={{ borderBottom: '1px solid var(--color-border-subtle)', transition: 'background-color var(--transition-fast)' }}>
                    <td style={{ padding: '0.85rem 1.25rem', fontSize: '0.875rem' }}>
                      {formatDate(s.completed_at)}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span className="badge badge-sage" style={{ textTransform: 'capitalize' }}>
                        {s.practice_type}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 600, fontSize: '0.875rem' }}>
                      {s.language || 'English'}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span style={{ fontWeight: 700, color: 'var(--color-primary-forest)', fontSize: '0.95rem' }}>
                        {s.net_wpm}
                      </span>{' '}
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>WPM</span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span style={{ fontWeight: 600, color: s.accuracy >= 95 ? 'var(--color-primary-forest)' : 'var(--color-text-primary)' }}>
                        {s.accuracy}%
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                      {formatDuration(s.duration_seconds)}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.875rem' }}>
                      {s.error_count > 0 ? (
                        <span style={{ color: 'var(--color-error)' }}>{s.error_count}</span>
                      ) : (
                        <span style={{ color: 'var(--color-primary-forest)' }}>0</span>
                      )}
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ padding: '0.3rem 0.5rem' }}
                          onClick={() => setSelectedSession(s)}
                          title="View detailed session metrics"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ padding: '0.3rem 0.5rem', color: 'var(--color-error)' }}
                          onClick={() => handleDeleteSession(s.id)}
                          disabled={deletingId === s.id}
                          title="Delete session"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Session Detail Modal */}
      {selectedSession && (
        <div className="modal-backdrop" onClick={() => setSelectedSession(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px', width: '92%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ margin: 0 }}>Session Performance Breakdown</h3>
                <span style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)' }}>
                  Recorded on {formatDate(selectedSession.completed_at)}
                </span>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setSelectedSession(null)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="card" style={{ padding: '1rem', backgroundColor: 'var(--color-bg-subtle)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Net Speed</span>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-primary-forest)', marginTop: '0.25rem' }}>
                  {selectedSession.net_wpm} <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>WPM</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>
                  Gross: {selectedSession.gross_wpm} WPM
                </div>
              </div>

              <div className="card" style={{ padding: '1rem', backgroundColor: 'var(--color-bg-subtle)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Accuracy</span>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-primary-forest)', marginTop: '0.25rem' }}>
                  {selectedSession.accuracy}%
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>
                  Errors: {selectedSession.error_count}
                </div>
              </div>

              <div className="card" style={{ padding: '1rem', backgroundColor: 'var(--color-bg-subtle)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Character Breakdown</span>
                <div style={{ fontSize: '0.9rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <div>Total: <strong>{selectedSession.total_characters}</strong></div>
                  <div>Correct: <strong style={{ color: 'var(--color-primary-forest)' }}>{selectedSession.correct_characters}</strong></div>
                  <div>Incorrect: <strong style={{ color: 'var(--color-error)' }}>{selectedSession.incorrect_characters}</strong></div>
                </div>
              </div>

              <div className="card" style={{ padding: '1rem', backgroundColor: 'var(--color-bg-subtle)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Details</span>
                <div style={{ fontSize: '0.9rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <div>Language: <strong>{selectedSession.language || 'English'}</strong></div>
                  <div>Difficulty: <strong style={{ textTransform: 'capitalize' }}>{selectedSession.difficulty}</strong></div>
                  <div>Duration: <strong>{formatDuration(selectedSession.duration_seconds)}</strong></div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button className="btn btn-outline" onClick={() => setSelectedSession(null)}>
                Close
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setSelectedSession(null);
                  onStartPractice?.({
                    type: selectedSession.practice_type,
                    language: selectedSession.language
                  });
                }}
              >
                Practice Again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
