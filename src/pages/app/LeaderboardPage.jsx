import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Trophy,
  Medal,
  Crown,
  Flame,
  Zap,
  Target,
  Clock,
  Search,
  RefreshCw,
  Radio,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Activity
} from 'lucide-react';
import { api } from '../../utils/api.js';
import { useAuth } from '../../context/AuthContext.jsx';

// Dynamic, reliable avatar generator for real users
function getUserAvatar(item) {
  if (item?.avatar_url && item.avatar_url.trim() && !item.avatar_url.includes('unsplash.com/photo-1517841905240-472988babdf9') && !item.avatar_url.includes('unsplash.com/photo-1534528741775-53994a69daeb')) {
    return item.avatar_url;
  }
  const seed = encodeURIComponent(item?.username || item?.id || 'typer');
  return `https://api.dicebear.com/7.x/identicon/svg?seed=${seed}&backgroundColor=0f172a,1e293b,334155`;
}

export function LeaderboardPage() {
  const { user } = useAuth();
  const [period, setPeriod] = useState('all_time'); // 'all_time' | 'weekly' | 'daily'
  const [leaderboard, setLeaderboard] = useState([]);
  const [serverCurrentUser, setServerCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [liveEventBanner, setLiveEventBanner] = useState(null);
  const [livePulse, setLivePulse] = useState(false);

  const bannerTimerRef = useRef(null);
  const eventSourceRef = useRef(null);

  // Fetch leaderboard data
  const fetchLeaderboard = useCallback(async (showLoadingSpinner = true) => {
    if (showLoadingSpinner) setLoading(true);
    else setRefreshing(true);
    setError(null);

    try {
      const data = await api.sessions.getLeaderboard({ period, limit: 50 });
      setLeaderboard(data.leaderboard || []);
      if (data.currentUser) {
        setServerCurrentUser(data.currentUser);
      }
    } catch (err) {
      if (showLoadingSpinner) {
        setError(err.message || 'Failed to load live leaderboard telemetry.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [period]);

  // Initial fetch on period change
  useEffect(() => {
    fetchLeaderboard(true);
  }, [fetchLeaderboard]);

  // Real-Time Server-Sent Events (SSE) Stream
  useEffect(() => {
    let es = null;
    let reconnectTimeout = null;

    function connectSSE() {
      try {
        es = new EventSource('/api/sessions/leaderboard/live');
        eventSourceRef.current = es;

        es.onopen = () => {
          setIsLiveConnected(true);
        };

        es.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'session_completed') {
              // Trigger smooth live background refresh
              fetchLeaderboard(false);

              // Flash live indicator pulse
              setLivePulse(true);
              setTimeout(() => setLivePulse(false), 1800);

              // Show live notification toast
              if (data.username || data.display_name) {
                const name = data.display_name || data.username;
                const wpm = Math.round(data.net_wpm);
                setLiveEventBanner({
                  name,
                  wpm,
                  time: 'Just now'
                });

                if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
                bannerTimerRef.current = setTimeout(() => {
                  setLiveEventBanner(null);
                }, 4500);
              }
            } else if (data.type === 'update') {
              fetchLeaderboard(false);
            }
          } catch (e) {
            // Heartbeat comment or non-JSON ping
          }
        };

        es.onerror = () => {
          setIsLiveConnected(false);
          if (es) es.close();
          // Attempt automatic reconnection after 5s
          reconnectTimeout = setTimeout(connectSSE, 5000);
        };
      } catch (err) {
        console.warn('Real-time SSE connection error:', err);
        setIsLiveConnected(false);
      }
    }

    connectSSE();

    // Fallback sync: Refresh data if user switches tabs back
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchLeaderboard(false);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Periodic safety heartbeat polling every 30 seconds
    const interval = setInterval(() => {
      fetchLeaderboard(false);
    }, 30000);

    return () => {
      if (es) es.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
    };
  }, [fetchLeaderboard]);

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

  const currentUserEntry = leaderboard.find((item) => item.isCurrentUser) || serverCurrentUser;

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Real-time Toast Banner */}
      {liveEventBanner && (
        <div
          style={{
            position: 'fixed',
            top: '1.25rem',
            right: '1.25rem',
            zIndex: 9999,
            backgroundColor: 'var(--color-bg-card, #1e293b)',
            border: '1px solid var(--color-accent-emerald, #10b981)',
            boxShadow: '0 8px 24px rgba(16, 185, 129, 0.25)',
            padding: '0.75rem 1.25rem',
            borderRadius: '9999px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            animation: 'fadeInSlide 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            backdropFilter: 'blur(8px)'
          }}
        >
          <span
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              boxShadow: '0 0 10px #10b981',
              animation: 'pulse 1.5s infinite'
            }}
          />
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
            ⚡ <strong>{liveEventBanner.name}</strong> just completed a test at <span style={{ color: '#10b981' }}>{liveEventBanner.wpm} WPM</span>!
          </span>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
            <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
              <Trophy size={13} />
              <span>Hall of Fame</span>
            </span>
            <span className="badge badge-sage">Live Standings</span>

            {/* Real-Time Live Status Pill */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '0.2rem 0.65rem',
                borderRadius: '9999px',
                backgroundColor: isLiveConnected ? 'rgba(34, 197, 94, 0.12)' : 'rgba(234, 179, 8, 0.12)',
                color: isLiveConnected ? '#22c55e' : '#eab308',
                border: `1px solid ${isLiveConnected ? 'rgba(34, 197, 94, 0.3)' : 'rgba(234, 179, 8, 0.3)'}`,
                transition: 'all 0.25s ease'
              }}
              title={isLiveConnected ? 'Connected to live leaderboard SSE telemetry' : 'Attempting to reconnect live telemetry'}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: isLiveConnected ? '#22c55e' : '#eab308',
                  boxShadow: isLiveConnected || livePulse ? '0 0 8px #22c55e' : 'none',
                  display: 'inline-block'
                }}
              />
              <span>{isLiveConnected ? 'Live Real-Time' : 'Reconnecting...'}</span>
            </div>
          </div>

          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
            Community Leaderboard
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', margin: '0.4rem 0 0 0' }}>
            Live rankings powered in real time by real typists and developers.
          </p>
        </div>

        {/* Controls: Period Selector & Live Refresh */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '0.35rem', backgroundColor: 'var(--color-bg-subtle)', padding: '0.3rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
            <button
              className={`btn btn-sm ${period === 'all_time' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setPeriod('all_time')}
            >
              <Crown size={14} />
              <span>All-Time</span>
            </button>
            <button
              className={`btn btn-sm ${period === 'weekly' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setPeriod('weekly')}
            >
              <Zap size={14} />
              <span>Weekly</span>
            </button>
            <button
              className={`btn btn-sm ${period === 'daily' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setPeriod('daily')}
            >
              <Clock size={14} />
              <span>Daily</span>
            </button>
          </div>

          {/* Manual Refresh Button */}
          <button
            className="btn btn-sm btn-ghost"
            onClick={() => fetchLeaderboard(false)}
            disabled={refreshing}
            title="Refresh leaderboard live"
            style={{
              padding: '0.45rem 0.65rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              border: '1px solid var(--color-border)'
            }}
          >
            <RefreshCw size={14} className={refreshing ? 'spin-animation' : ''} />
            <span style={{ fontSize: '0.8rem' }}>Sync</span>
          </button>
        </div>
      </div>

      {/* User Status Banner */}
      {currentUserEntry && (
        <div
          className="card"
          style={{
            padding: '1.15rem 1.5rem',
            marginBottom: '2rem',
            background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.12) 0%, rgba(52, 211, 153, 0.12) 100%)',
            border: '1px solid rgba(56, 189, 248, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            boxShadow: '0 4px 16px rgba(56, 189, 248, 0.08)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary-sage, #38bdf8)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.1rem',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
              }}
            >
              {currentUserEntry.rank ? `#${currentUserEntry.rank}` : '—'}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>
                Your Live Ranking:{' '}
                <span style={{ color: 'var(--color-primary-sage, #38bdf8)' }}>
                  {currentUserEntry.rank ? `#${currentUserEntry.rank} of ${Math.max(leaderboard.length, currentUserEntry.rank)}` : 'Unranked'}
                </span>
              </div>
              <div style={{ fontSize: '0.825rem', color: 'var(--color-text-secondary)' }}>
                {currentUserEntry.tierIcon} {currentUserEntry.tier} Tier • Streak: {currentUserEntry.current_streak || 1} days • {currentUserEntry.total_tests || 0} tests recorded
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-tertiary)', display: 'block' }}>Best Speed</span>
              <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-accent-emerald, #10b981)' }}>
                {currentUserEntry.best_wpm} <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>WPM</span>
              </span>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-tertiary)', display: 'block' }}>Accuracy</span>
              <span style={{ fontSize: '1.35rem', fontWeight: 800 }}>{currentUserEntry.avg_accuracy}%</span>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <div className="spinner" style={{ width: '32px', height: '32px', margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--color-text-secondary)' }}>Connecting live leaderboard telemetry...</p>
        </div>
      ) : error ? (
        <div className="card" style={{ padding: '2rem', textAlign: 'center', color: '#EF4444' }}>
          <p>{error}</p>
          <button className="btn btn-sm btn-primary" onClick={() => fetchLeaderboard(true)} style={{ marginTop: '0.5rem' }}>
            Retry Telemetry
          </button>
        </div>
      ) : filtered.length === 0 ? (
        /* Empty State */
        <div className="card" style={{ padding: '3.5rem 2rem', textAlign: 'center', background: 'var(--color-bg-card)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏆</div>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 700, margin: '0 0 0.5rem' }}>
            {searchQuery ? 'No typists found matching your search' : `No ${period === 'daily' ? 'Daily' : period === 'weekly' ? 'Weekly' : 'Active'} Scores Yet`}
          </h3>
          <p style={{ color: 'var(--color-text-secondary)', maxWidth: '480px', margin: '0 auto 1.5rem', fontSize: '0.95rem' }}>
            {searchQuery
              ? `We couldn't find any ranked user matching "${searchQuery}". Try searching by another username or rank tier.`
              : `Be the very first developer to complete a typing session in this timeframe and claim the #1 spot on the podium!`}
          </p>
          <a href="#practice" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>Start Practice Session</span>
            <ArrowRight size={16} />
          </a>
        </div>
      ) : (
        <>
          {/* Top Podium (Flexible for 1, 2, or 3+ typists) */}
          {topThree.length > 0 && !searchQuery && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: topThree.length === 1 ? '1fr' : topThree.length === 2 ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.25rem',
                marginBottom: '2.5rem',
                maxWidth: topThree.length === 1 ? '380px' : topThree.length === 2 ? '700px' : '100%',
                margin: topThree.length < 3 ? '0 auto 2.5rem' : '0 0 2.5rem'
              }}
            >
              {/* Rank 2 (Silver) - Shown if >= 2 players */}
              {topThree.length >= 2 && (
                <div
                  className="card"
                  style={{
                    padding: '1.75rem',
                    textAlign: 'center',
                    background: 'linear-gradient(180deg, var(--color-bg-card) 0%, rgba(148, 163, 184, 0.1) 100%)',
                    border: '1px solid rgba(148, 163, 184, 0.45)',
                    position: 'relative'
                  }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🥈</div>
                  <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    2nd Place
                  </div>
                  <div style={{ margin: '0.75rem 0' }}>
                    <img
                      src={getUserAvatar(topThree[1])}
                      alt={topThree[1].display_name || topThree[1].username}
                      style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #94A3B8', backgroundColor: 'var(--color-bg-subtle)' }}
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
              )}

              {/* Rank 1 (Gold) - Always first or center */}
              {topThree.length >= 1 && (
                <div
                  className="card"
                  style={{
                    padding: '1.75rem',
                    textAlign: 'center',
                    background: 'linear-gradient(180deg, var(--color-bg-card) 0%, rgba(234, 179, 8, 0.14) 100%)',
                    border: '2px solid rgba(234, 179, 8, 0.65)',
                    transform: topThree.length >= 3 ? 'translateY(-6px)' : 'none',
                    boxShadow: '0 12px 32px rgba(234, 179, 8, 0.16)'
                  }}
                >
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.25rem' }}>👑</div>
                  <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#EAB308', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Champion 🥇
                  </div>
                  <div style={{ margin: '0.75rem 0' }}>
                    <img
                      src={getUserAvatar(topThree[0])}
                      alt={topThree[0].display_name || topThree[0].username}
                      style={{ width: '76px', height: '76px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #EAB308', backgroundColor: 'var(--color-bg-subtle)' }}
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
              )}

              {/* Rank 3 (Bronze) - Shown if >= 3 players */}
              {topThree.length >= 3 && (
                <div
                  className="card"
                  style={{
                    padding: '1.75rem',
                    textAlign: 'center',
                    background: 'linear-gradient(180deg, var(--color-bg-card) 0%, rgba(217, 119, 6, 0.1) 100%)',
                    border: '1px solid rgba(217, 119, 6, 0.45)'
                  }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🥉</div>
                  <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#D97706', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    3rd Place
                  </div>
                  <div style={{ margin: '0.75rem 0' }}>
                    <img
                      src={getUserAvatar(topThree[2])}
                      alt={topThree[2].display_name || topThree[2].username}
                      style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #D97706', backgroundColor: 'var(--color-bg-subtle)' }}
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
              )}
            </div>
          )}

          {/* Search Bar & Table Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>Live Standings</span>
              <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>({filtered.length} typists)</span>
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
                            src={getUserAvatar(item)}
                            alt={item.display_name || item.username}
                            style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover', backgroundColor: 'var(--color-bg-subtle)' }}
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
                      <td style={{ padding: '0.85rem 1.25rem', fontWeight: 700, color: item.best_wpm >= 100 ? 'var(--color-accent-emerald, #10b981)' : 'var(--color-primary-sage, #38bdf8)' }}>
                        {item.best_wpm} <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--color-text-secondary)' }}>WPM</span>
                      </td>
                      <td style={{ padding: '0.85rem 1.25rem', fontWeight: 600 }}>
                        {item.avg_accuracy}%
                      </td>
                      <td style={{ padding: '0.85rem 1.25rem', color: 'var(--color-text-secondary)' }}>
                        {(item.total_tests || 0).toLocaleString()}
                      </td>
                      <td style={{ padding: '0.85rem 1.25rem' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#F59E0B', fontWeight: 600 }}>
                          <Flame size={14} />
                          <span>{item.current_streak || 1}d</span>
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

