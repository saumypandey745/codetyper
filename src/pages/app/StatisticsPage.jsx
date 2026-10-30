import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Target,
  Clock,
  Award,
  Zap,
  Flame,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { api } from '../../utils/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { LineChart } from '../../components/charts/LineChart.jsx';
import { BarChart } from '../../components/charts/BarChart.jsx';
import { formatDuration, formatDate } from '../../utils/wpmCalculator.js';

export function StatisticsPage({ onNavigate, onStartPractice }) {
  const { userStats } = useAuth();
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('wpm'); // 'wpm' | 'accuracy'

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await api.sessions.getStats();
        setStatsData(res);
      } catch (err) {
        console.warn('Failed to load stats', err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const overall = statsData?.overall || userStats || {
    best_wpm: 0,
    avg_wpm: 0,
    avg_accuracy: 0,
    total_tests: 0,
    total_practice_seconds: 0,
    current_streak: 1
  };

  const timelineData = (statsData?.timeline || []).map((s) => ({
    label: formatDate(s.completed_at),
    value: s.net_wpm,
    accuracy: s.accuracy
  }));

  const accuracyTimelineData = (statsData?.timeline || []).map((s) => ({
    label: formatDate(s.completed_at),
    value: s.accuracy,
    wpm: s.net_wpm
  }));

  const languageData = statsData?.languageBreakdown || [];
  const modeData = statsData?.modeBreakdown || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1080px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <BarChart3 size={24} color="var(--color-primary-forest)" />
            <h1 style={{ fontSize: '2rem', margin: 0 }}>Performance Analytics</h1>
          </div>
          <p style={{ margin: 0, fontSize: '0.95rem' }}>
            Visualize your typing velocity, accuracy consistency, and language proficiency over time.
          </p>
        </div>

        <button className="btn btn-primary btn-sm" onClick={() => onNavigate('practice')}>
          <span>Practice Now</span>
          <ArrowRight size={15} />
        </button>
      </div>

      {/* 5 KPI Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Personal Best</span>
            <div className="stat-icon"><Award size={18} /></div>
          </div>
          <div className="stat-value" style={{ color: 'var(--color-primary-forest)' }}>
            {overall.best_wpm} <span style={{ fontSize: '1rem', fontWeight: 500 }}>WPM</span>
          </div>
          <span className="stat-subtext">Peak recorded speed</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Average Speed</span>
            <div className="stat-icon"><Zap size={18} /></div>
          </div>
          <div className="stat-value">
            {overall.avg_wpm} <span style={{ fontSize: '1rem', fontWeight: 500 }}>WPM</span>
          </div>
          <span className="stat-subtext">Overall lifetime average</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Precision Rate</span>
            <div className="stat-icon"><Target size={18} /></div>
          </div>
          <div className="stat-value">{overall.avg_accuracy}%</div>
          <span className="stat-subtext">Clean stroke accuracy</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Total Practice</span>
            <div className="stat-icon"><Clock size={18} /></div>
          </div>
          <div className="stat-value">{formatDuration(overall.total_practice_seconds)}</div>
          <span className="stat-subtext">{overall.total_tests} sessions completed</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Current Streak</span>
            <div className="stat-icon"><Flame size={18} color="var(--color-primary-forest)" /></div>
          </div>
          <div className="stat-value" style={{ color: 'var(--color-primary-forest)' }}>
            {overall.current_streak || 1} <span style={{ fontSize: '1rem', fontWeight: 500 }}>Days</span>
          </div>
          <span className="stat-subtext">Consecutive daily practice</span>
        </div>
      </div>

      {/* Main Progression Line Chart */}
      <div className="card" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ margin: 0, marginBottom: '0.25rem' }}>Progress Over Recent Sessions</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
              Tracking net words-per-minute and accuracy across your latest typing tests
            </span>
          </div>

          <div style={{ display: 'inline-flex', padding: '0.2rem', backgroundColor: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-md)' }}>
            <button
              className={`btn btn-sm ${activeTab === 'wpm' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActiveTab('wpm')}
            >
              Speed (WPM)
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'accuracy' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActiveTab('accuracy')}
            >
              Accuracy (%)
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="spinner" />
          </div>
        ) : timelineData.length === 0 ? (
          <div className="empty-state" style={{ height: 240, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <p>No session data to plot yet. Complete your first practice to generate progression graphs!</p>
            <button className="btn btn-outline btn-sm" onClick={() => onNavigate('practice')}>
              Start Practice Now
            </button>
          </div>
        ) : activeTab === 'wpm' ? (
          <LineChart
            data={timelineData}
            xKey="label"
            yKey="value"
            secondaryYKey="accuracy"
            height={240}
            unit="WPM"
          />
        ) : (
          <LineChart
            data={accuracyTimelineData}
            xKey="label"
            yKey="value"
            secondaryYKey="wpm"
            height={240}
            unit="%"
          />
        )}
      </div>

      {/* Two Column Grid: Language Breakdown & Practice Mode Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Language Proficiency */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <h3 style={{ marginBottom: '0.5rem' }}>Language Proficiency</h3>
          <p style={{ fontSize: '0.875rem', marginBottom: '1.5rem', color: 'var(--color-text-secondary)' }}>
            Average typing speed achieved across programming languages and English passages.
          </p>

          {languageData.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem 1rem' }}>
              <p>Practice in different languages to see relative speed comparisons.</p>
            </div>
          ) : (
            <BarChart
              data={languageData}
              labelKey="language"
              valueKey="avg_wpm"
              unit="WPM"
            />
          )}
        </div>

        {/* Practice Breakdown & Mastery Insights */}
        <div className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <h3 style={{ marginBottom: '0.5rem' }}>Practice Distribution</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
              Breakdown of sessions by mode and focus area.
            </p>
          </div>

          {modeData.length === 0 ? (
            <div className="empty-state" style={{ padding: '1.5rem 1rem' }}>
              <p>No mode breakdown data available yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {modeData.map((m, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', backgroundColor: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-primary-forest)' }} />
                    <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{m.practice_type}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.875rem' }}>
                    <span>{m.sessions} tests</span>
                    <strong style={{ color: 'var(--color-primary-forest)' }}>{m.avg_wpm} WPM</strong>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Ergonomic Tip Banner */}
          <div style={{ padding: '1rem', backgroundColor: 'var(--color-bg-soft)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)', marginTop: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <ShieldCheck size={20} color="var(--color-primary-forest)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>Rhythm Over Raw Speed</strong>
                <p style={{ fontSize: '0.825rem', margin: '0.25rem 0 0', lineHeight: 1.5 }}>
                  Typing at 95%+ accuracy with consistent rhythm builds subconscious muscle memory faster than typing frantically with frequent backspaces.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
