import React, { useState, useEffect } from 'react';
import {
  Zap,
  Award,
  Target,
  Clock,
  Flame,
  CheckCircle2,
  ArrowRight,
  Code2,
  BookOpen,
  Timer,
  Play,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { api } from '../../utils/api.js';
import { LineChart } from '../../components/charts/LineChart.jsx';
import { formatDuration, formatDate } from '../../utils/wpmCalculator.js';

export function Dashboard({ onNavigate, onStartPractice }) {
  const { user, userStats } = useAuth();
  const [statsData, setStatsData] = useState(null);
  const [recentSessions, setRecentSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [statsRes, historyRes] = await Promise.all([
          api.sessions.getStats(),
          api.sessions.getHistory({ limit: 5 })
        ]);
        setStatsData(statsRes);
        setRecentSessions(historyRes.sessions || []);
      } catch (e) {
        console.warn('Could not load dashboard stats', e);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const chartData = (statsData?.timeline || []).map((s, idx) => ({
    label: formatDate(s.completed_at),
    value: s.net_wpm,
    accuracy: s.accuracy
  }));

  const lastSession = recentSessions[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Personalized Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>
            {getGreeting()}, {user?.full_name?.split(' ')[0] || 'Friend'}
          </h1>
          <p style={{ fontSize: '0.95rem' }}>
            Welcome back to your quiet typing sanctuary. Ready for today's session?
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button className="btn btn-primary" onClick={() => onNavigate('test')}>
            <Timer size={16} />
            <span>Take 1-Min Test</span>
          </button>
        </div>
      </div>

      {/* 6 KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Current WPM</span>
            <div className="stat-icon"><Zap size={18} /></div>
          </div>
          <div className="stat-value">{lastSession ? lastSession.net_wpm : (userStats?.avg_wpm || 0)}</div>
          <span className="stat-subtext">Recent session net speed</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Best Record</span>
            <div className="stat-icon"><Award size={18} /></div>
          </div>
          <div className="stat-value" style={{ color: 'var(--color-primary-forest)' }}>
            {userStats?.best_wpm || 0}
          </div>
          <span className="stat-subtext">All-time personal best</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Avg Accuracy</span>
            <div className="stat-icon"><Target size={18} /></div>
          </div>
          <div className="stat-value">{userStats?.avg_accuracy ? `${userStats.avg_accuracy}%` : '98%'}</div>
          <span className="stat-subtext">Precision discipline</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Practice Time</span>
            <div className="stat-icon"><Clock size={18} /></div>
          </div>
          <div className="stat-value">
            {formatDuration(userStats?.total_practice_seconds || 0)}
          </div>
          <span className="stat-subtext">Focused keyboard time</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Tests Completed</span>
            <div className="stat-icon"><CheckCircle2 size={18} /></div>
          </div>
          <div className="stat-value">{userStats?.total_tests || 0}</div>
          <span className="stat-subtext">Total recorded runs</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Current Streak</span>
            <div className="stat-icon" style={{ backgroundColor: '#FEF3E2', color: '#D97706' }}>
              <Flame size={18} />
            </div>
          </div>
          <div className="stat-value" style={{ color: '#D97706' }}>
            {userStats?.current_streak || 1} Days
          </div>
          <span className="stat-subtext">Consecutive daily habit</span>
        </div>
      </div>

      {/* Continue Practice & Quick Duration Selectors */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Continue Last Practice */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span className="badge badge-sage">Resume Habit</span>
              {lastSession && <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{formatDate(lastSession.completed_at)}</span>}
            </div>
            <h3 style={{ marginBottom: '0.5rem' }}>
              {lastSession ? `Continue ${lastSession.language || 'English'} Practice` : 'Start Your First Practice'}
            </h3>
            <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              {lastSession
                ? `Pick up right where you left off with ${lastSession.difficulty} level ${lastSession.practice_type} typing.`
                : 'Choose a programming language or an English passage to calibrate your baseline typing speed.'}
            </p>
          </div>

          <button
            className="btn btn-primary"
            onClick={() => {
              if (lastSession?.practice_type === 'code') {
                onStartPractice('code', lastSession.language);
              } else {
                onStartPractice('english', 'General English');
              }
            }}
          >
            <Play size={16} fill="currentColor" />
            <span>Continue Practice</span>
          </button>
        </div>

        {/* Quick Timed Practice */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Quick Timed Practice</span>
            <span className="badge badge-forest">Speed Sprint</span>
          </div>
          <p style={{ fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            Pick a quick sprint duration for focused calibration:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <button className="btn btn-outline" onClick={() => onStartPractice('test', 'English', 60)}>
              <Timer size={15} />
              <span>1 Minute</span>
            </button>
            <button className="btn btn-outline" onClick={() => onStartPractice('test', 'English', 180)}>
              <Timer size={15} />
              <span>3 Minutes</span>
            </button>
            <button className="btn btn-outline" onClick={() => onStartPractice('test', 'English', 300)}>
              <Timer size={15} />
              <span>5 Minutes</span>
            </button>
            <button className="btn btn-outline" onClick={() => onStartPractice('test', 'English', 600)}>
              <Timer size={15} />
              <span>10 Minutes</span>
            </button>
          </div>
        </div>
      </div>

      {/* Practice Categories */}
      <div>
        <h3 style={{ marginBottom: '1rem' }}>Practice Categories</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div
            className="card"
            style={{ cursor: 'pointer', transition: 'all 200ms ease' }}
            onClick={() => onNavigate('english')}
          >
            <BookOpen size={24} color="var(--color-primary-sage)" style={{ marginBottom: '0.5rem' }} />
            <h4 style={{ marginBottom: '0.25rem' }}>English Prose</h4>
            <p style={{ fontSize: '0.85rem' }}>13 curated literature & science topics</p>
          </div>

          <div
            className="card"
            style={{ cursor: 'pointer', transition: 'all 200ms ease' }}
            onClick={() => onNavigate('coding')}
          >
            <Code2 size={24} color="var(--color-primary-forest)" style={{ marginBottom: '0.5rem' }} />
            <h4 style={{ marginBottom: '0.25rem' }}>Programming Code</h4>
            <p style={{ fontSize: '0.85rem' }}>25+ languages with realistic functions</p>
          </div>

          <div
            className="card"
            style={{ cursor: 'pointer', transition: 'all 200ms ease' }}
            onClick={() => onNavigate('test')}
          >
            <Timer size={24} color="#C58B38" style={{ marginBottom: '0.5rem' }} />
            <h4 style={{ marginBottom: '0.25rem' }}>Typing Speed Test</h4>
            <p style={{ fontSize: '0.85rem' }}>Standardized assessment & scoring</p>
          </div>

          <div
            className="card"
            style={{ cursor: 'pointer', transition: 'all 200ms ease' }}
            onClick={() => onNavigate('practice')}
          >
            <Target size={24} color="var(--color-primary-deep)" style={{ marginBottom: '0.5rem' }} />
            <h4 style={{ marginBottom: '0.25rem' }}>Custom Drills</h4>
            <p style={{ fontSize: '0.85rem' }}>Words, times, and custom length</p>
          </div>
        </div>
      </div>

      {/* Progress Chart */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 style={{ fontSize: '1.15rem' }}>Progress Over Time</h3>
            <span className="card-description">Net WPM progression across your sessions</span>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('statistics')}>
            <span>Deep Analytics</span>
            <ArrowRight size={14} />
          </button>
        </div>
        <LineChart data={chartData} yKey="value" secondaryYKey="accuracy" unit="WPM" height={220} />
      </div>

      {/* Recent Sessions Table */}
      <div className="card">
        <div className="card-header">
          <h3 style={{ fontSize: '1.15rem' }}>Recent Practice Sessions</h3>
          <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('history')}>
            <span>View Full History</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {recentSessions.length === 0 ? (
          <div className="empty-state">
            <p>No practice sessions completed yet. Choose a mode above to start!</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="results-breakdown-table">
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-muted)', fontSize: '0.825rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Date</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Type</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Language</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Duration</th>
                  <th style={{ padding: '0.75rem 1rem' }}>WPM</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Accuracy</th>
                </tr>
              </thead>
              <tbody>
                {recentSessions.map((s) => (
                  <tr key={s.id}>
                    <td>{formatDate(s.completed_at)}</td>
                    <td>
                      <span className="badge badge-sage" style={{ textTransform: 'capitalize' }}>
                        {s.practice_type}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{s.language || 'English'}</td>
                    <td>{formatDuration(s.duration_seconds)}</td>
                    <td style={{ color: 'var(--color-primary-forest)', fontWeight: 700 }}>{s.net_wpm}</td>
                    <td>{s.accuracy}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
