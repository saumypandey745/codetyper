import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Medal,
  Crown,
  Flame,
  Zap,
  Target,
  Sparkles,
  Calendar,
  Clock,
  Shield,
  Search,
  Users
} from 'lucide-react';
import { api } from '../../utils/api.js';
import { useAuth } from '../../context/AuthContext.jsx';

export function LeaderboardPage() {
  const { user } = useAuth();
  const [period, setPeriod] = useState('all_time'); // 'all_time' | 'weekly' | 'daily'
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let isMounted = true;
    async function fetchLeaderboard() {
      setLoading(true);
      setError(null);
      try {
        const data = await api.sessions.getLeaderboard({ period, limit: 50 });
        if (isMounted) {
          setLeaderboard(data.leaderboard || []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load leaderboard data.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchLeaderboard();
    return () => { isMounted = false; };
  }, [period]);

  const filtered = leaderboard.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (item.display_name && item.display_name.toLowerCase().includes(q)) ||
      (item.username && item.username.toLowerCase().includes(q)) ||
      (item.tier && item.tier.toLowerCase().includes(q))
    );
  });

  const topThree = filtered.slice(0, 3);
  const remaining = filtered.slice(3);

  const currentUserEntry = leaderboard.find((item) => item.isCurrentUser);

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
            <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
              <Trophy size={13} />
              <span>Hall of Fame</span>
            </span>
            <span className="badge badge-sage">Global Standings</span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
            Community Leaderboard
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', margin: '0.4rem 0 0 0' }}>
            Compete with top engineers, developers, and speed typists worldwide.
          </p>
        </div>

        {/* Period Selector Tabs */}
        <div style={{ display: 'flex', gap: '0.4rem', backgroundColor: 'var(--color-bg-subtle)', padding: '0.3rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
          <button
            className={`btn btn-sm ${period === 'all_time' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setPeriod('all_time')}
          >
            <Crown size={14} />
            <span>All-Time Titans</span>
          </button>
          <button
            className={`btn btn-sm ${period === 'weekly' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setPeriod('weekly')}
          >
            <Zap size={14} />
            <span>Weekly Sprint</span>
          </button>
          <button
            className={`btn btn-sm ${period === 'daily' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setPeriod('daily')}
          >
            <Clock size={14} />
            <span>Daily Grind</span>
          </button>
        </div>
      </div>

      {/* User Status Banner */}
      {currentUserEntry && (
        <div
          className="card"
          style={{
            padding: '1rem 1.5rem',
            marginBottom: '2rem',
            background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.1) 0%, rgba(52, 211, 153, 0.1) 100%)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary-sage)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '1.1rem'
              }}
            >
              #{currentUserEntry.rank}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem' }}>
                Your Current Ranking: <span style={{ color: 'var(--color-primary-sage)' }}>#{currentUserEntry.rank} of {leaderboard.length}</span>
              </div>
              <div style={{ fontSize: '0.825rem', color: 'var(--color-text-secondary)' }}>
                {currentUserEntry.tierIcon} {currentUserEntry.tier} Tier • Streak: {currentUserEntry.current_streak} days
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-tertiary)', display: 'block' }}>Best Speed</span>
              <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-accent-emerald)' }}>{currentUserEntry.best_wpm} <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>WPM</span></span>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-tertiary)', display: 'block' }}>Accuracy</span>
              <span style={{ fontSize: '1.3rem', fontWeight: 800 }}>{currentUserEntry.avg_accuracy}%</span>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <div className="spinner" style={{ width: '32px', height: '32px', margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--color-text-secondary)' }}>Gathering leaderboard telemetry...</p>
        </div>
      ) : error ? (
        <div className="card" style={{ padding: '2rem', textAlign: 'center', color: '#EF4444' }}>
          {error}
        </div>
      ) : (
        <>
          {/* Top 3 Podium */}
          {topThree.length >= 3 && !searchQuery && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.25rem',
                marginBottom: '2.5rem'
              }}
            >
              {/* Rank 2 (Silver) */}
              <div
                className="card"
                style={{
                  padding: '1.75rem',
                  textAlign: 'center',
                  background: 'linear-gradient(180deg, var(--color-bg-card) 0%, rgba(148, 163, 184, 0.08) 100%)',
                  border: '1px solid rgba(148, 163, 184, 0.4)',
                  position: 'relative'
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🥈</div>
                <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  2nd Place
                </div>
                <div style={{ margin: '0.75rem 0' }}>
                  <img
                    src={topThree[1].avatar_url || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150'}
                    alt={topThree[1].display_name}
                    style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #94A3B8' }}
                  />
                </div>
                <h3 style={{ margin: '0 0 0.2rem', fontSize: '1.1rem', fontWeight: 700 }}>
                  {topThree[1].display_name || topThree[1].username}
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                  @{topThree[1].username}
                </span>
                <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>WPM</span>
                    <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#38BDF8' }}>{topThree[1].best_wpm}</span>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>Accuracy</span>
                    <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>{topThree[1].avg_accuracy}%</span>
                  </div>
                </div>
                <div style={{ marginTop: '0.75rem' }}>
                  <span className="badge badge-sage">{topThree[1].tierIcon} {topThree[1].tier}</span>
                </div>
              </div>

              {/* Rank 1 (Gold) */}
              <div
                className="card"
                style={{
                  padding: '1.75rem',
                  textAlign: 'center',
                  background: 'linear-gradient(180deg, var(--color-bg-card) 0%, rgba(234, 179, 8, 0.12) 100%)',
                  border: '2px solid rgba(234, 179, 8, 0.6)',
                  transform: 'translateY(-6px)',
                  boxShadow: '0 12px 32px rgba(234, 179, 8, 0.15)'
                }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '0.25rem' }}>👑</div>
                <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#EAB308', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Champion 🥇
                </div>
                <div style={{ margin: '0.75rem 0' }}>
                  <img
                    src={topThree[0].avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                    alt={topThree[0].display_name}
                    style={{ width: '76px', height: '76px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #EAB308' }}
                  />
                </div>
                <h3 style={{ margin: '0 0 0.2rem', fontSize: '1.25rem', fontWeight: 800 }}>
                  {topThree[0].display_name || topThree[0].username}
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                  @{topThree[0].username}
                </span>
                <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>WPM</span>
                    <span style={{ fontSize: '1.8rem', fontWeight: 900, color: '#34D399' }}>{topThree[0].best_wpm}</span>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>Accuracy</span>
                    <span style={{ fontSize: '1.8rem', fontWeight: 900 }}>{topThree[0].avg_accuracy}%</span>
                  </div>
                </div>
                <div style={{ marginTop: '0.75rem' }}>
                  <span className="badge badge-warning">{topThree[0].tierIcon} {topThree[0].tier}</span>
                </div>
              </div>

              {/* Rank 3 (Bronze) */}
              <div
                className="card"
                style={{
                  padding: '1.75rem',
                  textAlign: 'center',
                  background: 'linear-gradient(180deg, var(--color-bg-card) 0%, rgba(217, 119, 6, 0.08) 100%)',
                  border: '1px solid rgba(217, 119, 6, 0.4)'
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🥉</div>
                <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#D97706', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  3rd Place
                </div>
                <div style={{ margin: '0.75rem 0' }}>
                  <img
                    src={topThree[2].avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'}
                    alt={topThree[2].display_name}
                    style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #D97706' }}
                  />
                </div>
                <h3 style={{ margin: '0 0 0.2rem', fontSize: '1.1rem', fontWeight: 700 }}>
                  {topThree[2].display_name || topThree[2].username}
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                  @{topThree[2].username}
                </span>
                <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>WPM</span>
                    <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#F59E0B' }}>{topThree[2].best_wpm}</span>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>Accuracy</span>
                    <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>{topThree[2].avg_accuracy}%</span>
                  </div>
                </div>
                <div style={{ marginTop: '0.75rem' }}>
                  <span className="badge badge-sage">{topThree[2].tierIcon} {topThree[2].tier}</span>
                </div>
              </div>
            </div>
          )}

          {/* Search Bar & Table Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
              Full Leaderboard ({filtered.length})
            </h2>
            <div style={{ position: 'relative', width: '260px' }}>
              <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)' }} />
              <input
                type="text"
                className="input"
                placeholder="Search typists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '2.2rem', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          {/* Ranking Table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-subtle)' }}>
                    <th style={{ padding: '0.85rem 1.25rem', fontWeight: 600, color: 'var(--color-text-secondary)', width: '70px' }}>Rank</th>
                    <th style={{ padding: '0.85rem 1.25rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Typist</th>
                    <th style={{ padding: '0.85rem 1.25rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Tier</th>
                    <th style={{ padding: '0.85rem 1.25rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Speed</th>
                    <th style={{ padding: '0.85rem 1.25rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Accuracy</th>
                    <th style={{ padding: '0.85rem 1.25rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Tests</th>
                    <th style={{ padding: '0.85rem 1.25rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Streak</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => (
                    <tr
                      key={item.id}
                      style={{
                        borderBottom: '1px solid var(--color-border)',
                        backgroundColor: item.isCurrentUser ? 'rgba(56, 189, 248, 0.08)' : 'transparent',
                        transition: 'background-color 0.15s ease'
                      }}
                    >
                      <td style={{ padding: '0.85rem 1.25rem', fontWeight: 700 }}>
                        {item.rank === 1 ? '🥇 1' : item.rank === 2 ? '🥈 2' : item.rank === 3 ? '🥉 3' : `#${item.rank}`}
                      </td>
                      <td style={{ padding: '0.85rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <img
                            src={item.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                            alt={item.display_name}
                            style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover' }}
                          />
                          <div>
                            <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <span>{item.display_name || item.username}</span>
                              {item.isCurrentUser && (
                                <span className="badge badge-sage" style={{ fontSize: '0.65rem' }}>You</span>
                              )}
                            </div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
                              @{item.username}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem 1.25rem' }}>
                        <span className="badge badge-subtle" style={{ fontSize: '0.75rem' }}>
                          {item.tierIcon} {item.tier}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1.25rem', fontWeight: 700, color: item.best_wpm >= 100 ? 'var(--color-accent-emerald)' : 'var(--color-primary-sage)' }}>
                        {item.best_wpm} <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--color-text-secondary)' }}>WPM</span>
                      </td>
                      <td style={{ padding: '0.85rem 1.25rem', fontWeight: 600 }}>
                        {item.avg_accuracy}%
                      </td>
                      <td style={{ padding: '0.85rem 1.25rem', color: 'var(--color-text-secondary)' }}>
                        {item.total_tests.toLocaleString()}
                      </td>
                      <td style={{ padding: '0.85rem 1.25rem' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#F59E0B', fontWeight: 600 }}>
                          <Flame size={14} />
                          <span>{item.current_streak}d</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
