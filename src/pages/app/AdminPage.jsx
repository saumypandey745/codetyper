import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Shield,
  Users,
  UserX,
  UserCheck,
  Layers,
  Clock,
  Plus,
  Trash2,
  Edit,
  Search,
  CheckCircle2,
  X,
  FileCode,
  BookOpen,
  Download,
  Upload,
  Flag,
  AlertTriangle,
  Key,
  Megaphone,
  Settings,
  Activity,
  Check,
  RotateCcw,
  Eye,
  EyeOff,
  Database,
  Bell,
  RefreshCw
} from 'lucide-react';
import { api } from '../../utils/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { programmingLanguages, englishCategories } from '../../../server/seedData.js';

export function AdminPage({ onNavigate }) {
  const { user } = useAuth();
  const toast = useToast();

  const [stats, setStats] = useState(null);
  const [securityStats, setSecurityStats] = useState(null);
  const [activeTab, setActiveTab] = useState('content'); // 'content' | 'users' | 'moderation' | 'settings' | 'audit'
  const [loading, setLoading] = useState(true);

  // Content Tab State
  const [contentItems, setContentItems] = useState([]);
  const [contentFilter, setContentFilter] = useState('all'); // 'all' | 'code' | 'english'
  const [contentSearch, setContentSearch] = useState('');
  const [showContentModal, setShowContentModal] = useState(false);
  const [editingContent, setEditingContent] = useState(null);
  const [contentFormData, setContentFormData] = useState({
    title: '',
    category: 'Technology',
    subcategory: '',
    language: 'JavaScript',
    difficulty: 'intermediate',
    is_code: 1,
    content: '',
    is_published: 1
  });

  // Bulk Import State
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkJsonText, setBulkJsonText] = useState('');
  const [bulkImporting, setBulkImporting] = useState(false);

  // Users Tab State
  const [userList, setUserList] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [banModalUser, setBanModalUser] = useState(null);
  const [banReason, setBanReason] = useState('');
  const [passwordModalUser, setPasswordModalUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  // Moderation / Anti-Cheat Tab State
  const [scoresList, setScoresList] = useState([]);
  const [scoresFilter, setScoresFilter] = useState('suspicious'); // 'suspicious' | 'all'
  const [scoresSearch, setScoresSearch] = useState('');
  const [disqualifyModalSession, setDisqualifyModalSession] = useState(null);
  const [disqualifyReason, setDisqualifyReason] = useState('');

  // Platform Settings Tab State
  const [systemSettings, setSystemSettings] = useState({
    announcement_text: '',
    announcement_type: 'info',
    announcement_enabled: '0',
    maintenance_mode: '0'
  });
  const [savingSettings, setSavingSettings] = useState(false);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState([]);

  // Load All Admin Data
  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, contentRes, usersRes, secRes, settingsRes, auditRes, scoresRes] = await Promise.all([
        api.admin.getStats().catch(() => null),
        api.admin.getContent({ limit: 200 }).catch(() => ({ items: [] })),
        api.admin.getUsers().catch(() => ({ users: [] })),
        api.admin.getSecuritySummary().catch(() => null),
        api.admin.getSettings().catch(() => ({ settings: {} })),
        api.admin.getAuditLogs().catch(() => ({ logs: [] })),
        api.admin.getScores({ suspicious: true, limit: 100 }).catch(() => ({ scores: [] }))
      ]);

      if (statsRes) setStats(statsRes);
      if (contentRes?.items) setContentItems(contentRes.items);
      if (usersRes?.users) setUserList(usersRes.users);
      if (secRes) setSecurityStats(secRes);
      if (settingsRes?.settings) {
        setSystemSettings({
          announcement_text: settingsRes.settings.announcement_text || '',
          announcement_type: settingsRes.settings.announcement_type || 'info',
          announcement_enabled: settingsRes.settings.announcement_enabled || '0',
          maintenance_mode: settingsRes.settings.maintenance_mode || '0'
        });
      }
      if (auditRes?.logs) setAuditLogs(auditRes.logs);
      if (scoresRes?.scores) setScoresList(scoresRes.scores);
    } catch (err) {
      console.warn('[Admin] Load failed:', err);
      toast.error('Could not load administrative console data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      loadAdminData();
    }
  }, [user]);

  // Load Scores when tab or filter changes
  const loadScores = async (suspiciousOnly = scoresFilter === 'suspicious') => {
    try {
      const res = await api.admin.getScores({
        suspicious: suspiciousOnly,
        search: scoresSearch,
        limit: 100
      });
      setScoresList(res.scores || []);
    } catch (err) {
      toast.error('Could not load typing sessions for moderation.');
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="card" style={{ padding: '3.5rem 2rem', textAlign: 'center', maxWidth: '580px', margin: '4rem auto' }}>
        <ShieldAlert size={52} color="var(--color-error)" style={{ margin: '0 auto 1.25rem' }} />
        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>Access Restricted</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.75rem', lineHeight: 1.6 }}>
          The CodeTyper Platform Administration Console requires elevated root privileges.
        </p>
        <button className="btn btn-primary" onClick={() => onNavigate('dashboard')}>
          Return to Dashboard
        </button>
      </div>
    );
  }

  // ==========================================
  // Content Handlers
  // ==========================================
  const handleOpenAddContent = () => {
    setEditingContent(null);
    setContentFormData({
      title: '',
      category: 'General English',
      subcategory: '',
      language: 'English',
      difficulty: 'intermediate',
      is_code: 0,
      content: '',
      is_published: 1
    });
    setShowContentModal(true);
  };

  const handleOpenEditContent = (item) => {
    setEditingContent(item);
    setContentFormData({
      title: item.title,
      category: item.category,
      subcategory: item.subcategory || '',
      language: item.language || 'English',
      difficulty: item.difficulty || 'intermediate',
      is_code: item.is_code ? 1 : 0,
      content: item.content,
      is_published: item.is_published !== undefined ? item.is_published : 1
    });
    setShowContentModal(true);
  };

  const handleSaveContent = async (e) => {
    e.preventDefault();
    if (!contentFormData.title.trim() || !contentFormData.content.trim()) {
      toast.error('Title and content are required.');
      return;
    }

    try {
      if (editingContent) {
        await api.admin.updateContent(editingContent.id, contentFormData);
        toast.success('Practice passage updated.');
      } else {
        await api.admin.createContent(contentFormData);
        toast.success('New practice passage created.');
      }
      setShowContentModal(false);
      loadAdminData();
    } catch (err) {
      toast.error(err.message || 'Failed to save practice passage.');
    }
  };

  const handleTogglePublish = async (item) => {
    try {
      const res = await api.admin.togglePublish(item.id);
      setContentItems((prev) =>
        prev.map((c) => (c.id === item.id ? { ...c, is_published: res.is_published } : c))
      );
      toast.success(res.message);
    } catch (err) {
      toast.error('Could not update publication state.');
    }
  };

  const handleDeleteContent = async (id) => {
    if (!window.confirm('Permanently delete this practice passage from the library?')) return;
    try {
      await api.admin.deleteContent(id);
      setContentItems((prev) => prev.filter((i) => i.id !== id));
      toast.success('Practice passage permanently removed.');
    } catch (err) {
      toast.error('Could not delete content.');
    }
  };

  const handleBulkImport = async () => {
    if (!bulkJsonText.trim()) {
      toast.error('Please paste JSON content array.');
      return;
    }
    setBulkImporting(true);
    try {
      const parsed = JSON.parse(bulkJsonText);
      const items = Array.isArray(parsed) ? parsed : (parsed.items || []);
      if (!Array.isArray(items) || items.length === 0) {
        throw new Error('JSON must contain an array of snippet objects.');
      }
      const res = await api.admin.bulkImport(items);
      toast.success(res.message);
      setShowBulkModal(false);
      setBulkJsonText('');
      loadAdminData();
    } catch (err) {
      toast.error(`Import failed: ${err.message}`);
    } finally {
      setBulkImporting(false);
    }
  };

  const handleExportLibrary = () => {
    window.open('/api/admin/content/export', '_blank');
    toast.info('Downloading practice library JSON export...');
  };

  // ==========================================
  // User Management Handlers
  // ==========================================
  const handleRoleChange = async (targetUser, newRole) => {
    try {
      const res = await api.admin.updateUserRole(targetUser.id, newRole);
      setUserList((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, role: newRole } : u))
      );
      toast.success(res.message);
    } catch (err) {
      toast.error(err.message || 'Failed to update user role.');
    }
  };

  const handleBanToggle = async (e) => {
    e.preventDefault();
    if (!banModalUser) return;
    const isBanning = !banModalUser.is_banned;
    try {
      const res = await api.admin.banUser(banModalUser.id, {
        is_banned: isBanning,
        reason: isBanning ? banReason : null
      });
      setUserList((prev) =>
        prev.map((u) =>
          u.id === banModalUser.id
            ? { ...u, is_banned: res.is_banned, ban_reason: isBanning ? banReason : null }
            : u
        )
      );
      toast.success(res.message);
      setBanModalUser(null);
      setBanReason('');
    } catch (err) {
      toast.error(err.message || 'Could not update ban status.');
    }
  };

  const handleShadowbanToggle = async (targetUser) => {
    const newStatus = targetUser.shadowbanned ? 0 : 1;
    try {
      const res = await api.admin.shadowbanUser(targetUser.id, newStatus);
      setUserList((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, shadowbanned: res.shadowbanned } : u))
      );
      toast.success(res.message);
    } catch (err) {
      toast.error(err.message || 'Could not update shadowban status.');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!passwordModalUser || !newPassword.trim()) return;
    try {
      const res = await api.admin.resetUserPassword(passwordModalUser.id, newPassword.trim());
      toast.success(res.message);
      setPasswordModalUser(null);
      setNewPassword('');
    } catch (err) {
      toast.error(err.message || 'Password reset failed.');
    }
  };

  const handleDeleteUser = async (targetUser) => {
    if (!window.confirm(`Permanently purge account @${targetUser.username} and all their session history?`)) return;
    try {
      const res = await api.admin.deleteUser(targetUser.id);
      setUserList((prev) => prev.filter((u) => u.id !== targetUser.id));
      toast.success(res.message);
    } catch (err) {
      toast.error(err.message || 'Failed to delete user.');
    }
  };

  // ==========================================
  // Anti-Cheat / Moderation Handlers
  // ==========================================
  const handleDisqualifyScore = async (e) => {
    e.preventDefault();
    if (!disqualifyModalSession) return;
    try {
      const res = await api.admin.disqualifyScore(disqualifyModalSession.id, disqualifyReason);
      toast.success(res.message);
      setDisqualifyModalSession(null);
      setDisqualifyReason('');
      loadScores();
    } catch (err) {
      toast.error(err.message || 'Failed to disqualify score.');
    }
  };

  const handleDeleteScore = async (sessionId) => {
    if (!window.confirm('Delete this typing session permanently?')) return;
    try {
      const res = await api.admin.deleteScore(sessionId);
      setScoresList((prev) => prev.filter((s) => s.id !== sessionId));
      toast.success(res.message);
    } catch (err) {
      toast.error('Could not delete session.');
    }
  };

  // ==========================================
  // Platform Settings Handlers
  // ==========================================
  const handleSaveSystemSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await api.admin.updateSettings(systemSettings);
      toast.success(res.message || 'System settings saved.');
      loadAdminData();

      // Instantly update current page announcement banner without any delay (0ms)
      const announcementData = {
        enabled: systemSettings.announcement_enabled === '1',
        text: systemSettings.announcement_text?.trim() || '',
        type: systemSettings.announcement_type || 'info',
        timestamp: Date.now()
      };

      window.dispatchEvent(new CustomEvent('codetyper:announcement_update', { detail: announcementData }));

      // Instantly update other open tabs in the same browser
      if (typeof BroadcastChannel !== 'undefined') {
        try {
          const bc = new BroadcastChannel('codetyper_announcements');
          bc.postMessage(announcementData);
          bc.close();
        } catch {}
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save system settings.');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleDownloadBackup = () => {
    window.open('/api/admin/backup', '_blank');
    toast.info('Downloading live database SQLite snapshot...');
  };

  // Filtered Content
  const filteredItems = contentItems.filter((i) => {
    if (contentFilter === 'code' && !i.is_code) return false;
    if (contentFilter === 'english' && i.is_code) return false;
    if (contentSearch.trim()) {
      const q = contentSearch.toLowerCase();
      const matchTitle = i.title?.toLowerCase().includes(q);
      const matchLang = i.language?.toLowerCase().includes(q);
      const matchCat = i.category?.toLowerCase().includes(q);
      if (!matchTitle && !matchLang && !matchCat) return false;
    }
    return true;
  });

  // Filtered Users
  const filteredUsers = userList.filter((u) => {
    if (userRoleFilter !== 'all' && u.role !== userRoleFilter) return false;
    if (userSearch.trim()) {
      const q = userSearch.toLowerCase();
      const matchName = u.full_name?.toLowerCase().includes(q);
      const matchUser = u.username?.toLowerCase().includes(q);
      const matchEmail = u.email?.toLowerCase().includes(q);
      if (!matchName && !matchUser && !matchEmail) return false;
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1160px', margin: '0 auto' }}>
      {/* Platform Admin Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.25rem' }}>
            <div style={{ padding: '0.35rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(35, 107, 77, 0.12)' }}>
              <ShieldCheck size={26} color="var(--color-primary-forest)" />
            </div>
            <h1 style={{ fontSize: '2rem', margin: 0, fontWeight: 700 }}>Platform Governance Console</h1>
          </div>
          <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--color-text-secondary)' }}>
            Super-administrative authority over typists, curriculum, anti-cheat leaderboards, and system settings.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button className="btn btn-outline btn-sm" onClick={() => loadAdminData()} title="Refresh Console Data">
            <RefreshCw size={15} />
            <span>Refresh</span>
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleOpenAddContent}>
            <Plus size={16} />
            <span>Add Snippet</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Active Typists</span>
            <div className="stat-icon"><Users size={16} /></div>
          </div>
          <div className="stat-value">{stats?.users || 0}</div>
          <span className="stat-subtext">{stats?.bannedUsers || 0} suspended</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Practice Library</span>
            <div className="stat-icon"><Layers size={16} /></div>
          </div>
          <div className="stat-value" style={{ color: 'var(--color-primary-forest)' }}>
            {stats?.contentItems || 0}
          </div>
          <span className="stat-subtext">Passages & source code</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Completed Drills</span>
            <div className="stat-icon"><CheckCircle2 size={16} /></div>
          </div>
          <div className="stat-value">{stats?.sessions || 0}</div>
          <span className="stat-subtext">{stats?.totalPracticeHours || 0} hrs total</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Anti-Cheat Flags</span>
            <div className="stat-icon"><Flag size={16} /></div>
          </div>
          <div className="stat-value" style={{ color: stats?.flaggedSessions ? '#D97706' : 'inherit' }}>
            {stats?.flaggedSessions || 0}
          </div>
          <span className="stat-subtext">{stats?.disqualifiedSessions || 0} disqualified</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Audit Log Actions</span>
            <div className="stat-icon"><Activity size={16} /></div>
          </div>
          <div className="stat-value">{stats?.auditLogCount || 0}</div>
          <span className="stat-subtext">Security trail entries</span>
        </div>
      </div>

      {/* Modern Accessible Tabs Navigation */}
      <nav aria-label="Administrative Console Navigation" style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', overflowX: 'auto' }}>
        <button
          className={`btn btn-sm ${activeTab === 'content' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('content')}
        >
          <Layers size={16} />
          <span>Practice Content ({contentItems.length})</span>
        </button>

        <button
          className={`btn btn-sm ${activeTab === 'users' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('users')}
        >
          <Users size={16} />
          <span>Typist Governance ({userList.length})</span>
        </button>

        <button
          className={`btn btn-sm ${activeTab === 'moderation' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => {
            setActiveTab('moderation');
            loadScores();
          }}
        >
          <Flag size={16} />
          <span>Leaderboard & Anti-Cheat</span>
        </button>

        <button
          className={`btn btn-sm ${activeTab === 'settings' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('settings')}
        >
          <Settings size={16} />
          <span>Platform Settings & Notice</span>
        </button>

        <button
          className={`btn btn-sm ${activeTab === 'audit' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('audit')}
        >
          <Activity size={16} />
          <span>Security & Audit Trail</span>
        </button>
      </nav>

      {/* ========================================================================= */}
      {/* TAB 1: PRACTICE CONTENT & CURRICULUM */}
      {/* ========================================================================= */}
      {activeTab === 'content' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Controls Bar */}
          <div className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '340px' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input
                type="text"
                placeholder="Search snippets by title, language or category..."
                className="input"
                value={contentSearch}
                onChange={(e) => setContentSearch(e.target.value)}
                style={{ paddingLeft: '2.25rem', fontSize: '0.875rem' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                className={`btn btn-sm ${contentFilter === 'all' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setContentFilter('all')}
              >
                All Passages
              </button>
              <button
                className={`btn btn-sm ${contentFilter === 'english' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setContentFilter('english')}
              >
                <BookOpen size={14} />
                <span>English</span>
              </button>
              <button
                className={`btn btn-sm ${contentFilter === 'code' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setContentFilter('code')}
              >
                <FileCode size={14} />
                <span>Source Code</span>
              </button>

              <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--color-border)', margin: '0 0.25rem' }} />

              <button className="btn btn-outline btn-sm" onClick={() => setShowBulkModal(true)} title="Bulk Import JSON">
                <Upload size={14} />
                <span>Bulk Import</span>
              </button>
              <button className="btn btn-outline btn-sm" onClick={handleExportLibrary} title="Export entire library as JSON">
                <Download size={14} />
                <span>Export Library</span>
              </button>
            </div>
          </div>

          {/* Content Table */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', backgroundColor: 'var(--color-bg-subtle)' }}>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Title & Language</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Category</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Difficulty</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Length</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                    <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                        No practice content matches your current query.
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item) => (
                      <tr key={item.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                        <td style={{ padding: '0.85rem 1.25rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            {item.is_code ? (
                              <div style={{ padding: '0.35rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(35, 107, 77, 0.1)' }}>
                                <FileCode size={16} color="var(--color-primary-forest)" />
                              </div>
                            ) : (
                              <div style={{ padding: '0.35rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(217, 119, 6, 0.1)' }}>
                                <BookOpen size={16} color="#D97706" />
                              </div>
                            )}
                            <div>
                              <div style={{ fontWeight: 600 }}>{item.title}</div>
                              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                                {item.is_code ? item.language : 'English'} &bull; {item.subcategory || 'Standard'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span style={{ fontSize: '0.85rem' }}>{item.category}</span>
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span className={`badge ${item.difficulty === 'beginner' ? 'badge-sage' : item.difficulty === 'advanced' ? 'badge-danger' : 'badge-forest'}`} style={{ textTransform: 'capitalize' }}>
                            {item.difficulty}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                          {item.word_count} words &bull; {item.char_count} chars
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <button
                            onClick={() => handleTogglePublish(item)}
                            title={item.is_published ? 'Click to unpublish (draft)' : 'Click to publish to typists'}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              padding: 0
                            }}
                          >
                            <span className={`badge ${item.is_published ? 'badge-forest' : 'badge-warning'}`}>
                              {item.is_published ? 'Live' : 'Draft'}
                            </span>
                          </button>
                        </td>
                        <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => handleOpenEditContent(item)}
                              title="Edit snippet"
                            >
                              <Edit size={15} />
                            </button>
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => handleDeleteContent(item.id)}
                              style={{ color: 'var(--color-error)' }}
                              title="Delete snippet"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: TYPIST GOVERNANCE & MODERATION */}
      {/* ========================================================================= */}
      {activeTab === 'users' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Controls Bar */}
          <div className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '340px' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input
                type="text"
                placeholder="Search typists by username, full name, or email..."
                className="input"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                style={{ paddingLeft: '2.25rem', fontSize: '0.875rem' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Role Filter:</span>
              <select
                className="input"
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
              >
                <option value="all">All Roles</option>
                <option value="user">User</option>
                <option value="moderator">Moderator</option>
                <option value="editor">Editor</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', backgroundColor: 'var(--color-bg-subtle)' }}>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Typist Profile</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Role Authority</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Best / Avg WPM</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Tests / Streak</th>
                    <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Governance Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                        No registered typists match your search filter.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                        <td style={{ padding: '0.85rem 1.25rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <img
                              src={u.avatar_url || 'https://api.dicebear.com/7.x/identicon/svg?seed=user'}
                              alt={u.full_name}
                              style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-full)' }}
                            />
                            <div>
                              <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>{u.full_name}</div>
                              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                                @{u.username} &bull; {u.email}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td style={{ padding: '0.85rem 1rem' }}>
                          <select
                            className="input"
                            value={u.role}
                            onChange={(e) => handleRoleChange(u, e.target.value)}
                            disabled={u.id === user.id}
                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.825rem', width: 'auto', fontWeight: 600 }}
                          >
                            <option value="user">User</option>
                            <option value="moderator">Moderator</option>
                            <option value="editor">Editor</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>

                        <td style={{ padding: '0.85rem 1rem' }}>
                          {u.is_banned ? (
                            <span className="badge badge-danger" title={u.ban_reason || 'Suspended'}>
                              Suspended
                            </span>
                          ) : u.shadowbanned ? (
                            <span className="badge badge-warning" title="Excluded from public leaderboards">
                              Shadowbanned
                            </span>
                          ) : (
                            <span className="badge badge-forest">
                              Active
                            </span>
                          )}
                        </td>

                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span style={{ fontWeight: 700, color: 'var(--color-primary-forest)' }}>
                            {u.best_wpm || 0}
                          </span>
                          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                            {' '}/ {u.avg_wpm || 0} WPM
                          </span>
                        </td>

                        <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem' }}>
                          {u.total_tests || 0} tests &bull; {u.current_streak || 0}d
                        </td>

                        <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.35rem' }}>
                            {/* Ban / Unban */}
                            <button
                              className={`btn btn-sm ${u.is_banned ? 'btn-outline' : 'btn-ghost'}`}
                              onClick={() => {
                                setBanModalUser(u);
                                setBanReason(u.ban_reason || '');
                              }}
                              disabled={u.id === user.id}
                              title={u.is_banned ? 'Lift Suspension' : 'Suspend Account'}
                              style={{ color: u.is_banned ? 'var(--color-primary-forest)' : 'var(--color-error)' }}
                            >
                              {u.is_banned ? <UserCheck size={15} /> : <UserX size={15} />}
                            </button>

                            {/* Shadowban Toggle */}
                            <button
                              className={`btn btn-sm ${u.shadowbanned ? 'btn-outline' : 'btn-ghost'}`}
                              onClick={() => handleShadowbanToggle(u)}
                              disabled={u.id === user.id}
                              title={u.shadowbanned ? 'Remove Shadowban' : 'Shadowban from Leaderboard'}
                              style={{ color: u.shadowbanned ? '#D97706' : 'var(--color-text-muted)' }}
                            >
                              {u.shadowbanned ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>

                            {/* Reset Password */}
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => {
                                setPasswordModalUser(u);
                                setNewPassword('');
                              }}
                              title="Force Reset Password"
                            >
                              <Key size={15} />
                            </button>

                            {/* Delete User */}
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => handleDeleteUser(u)}
                              disabled={u.id === user.id}
                              style={{ color: 'var(--color-error)' }}
                              title="Purge Account"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: LEADERBOARD & ANTI-CHEAT MODERATION */}
      {/* ========================================================================= */}
      {activeTab === 'moderation' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button
                className={`btn btn-sm ${scoresFilter === 'suspicious' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => {
                  setScoresFilter('suspicious');
                  loadScores(true);
                }}
              >
                <Flag size={14} />
                <span>Suspicious Runs (&gt;160 WPM / Flagged)</span>
              </button>
              <button
                className={`btn btn-sm ${scoresFilter === 'all' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => {
                  setScoresFilter('all');
                  loadScores(false);
                }}
              >
                All Recent Drills
              </button>
            </div>

            <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input
                type="text"
                placeholder="Filter by username..."
                className="input"
                value={scoresSearch}
                onChange={(e) => setScoresSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadScores()}
                style={{ paddingLeft: '2.25rem', fontSize: '0.875rem' }}
              />
            </div>
          </div>

          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', backgroundColor: 'var(--color-bg-subtle)' }}>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Typist</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Speed Telemetry</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Accuracy</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Flags / Status</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Date & Drill</th>
                    <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Fair-Play Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {scoresList.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                        No flagged suspicious typing scores detected.
                      </td>
                    </tr>
                  ) : (
                    scoresList.map((s) => (
                      <tr key={s.id} style={{ borderBottom: '1px solid var(--color-border-subtle)', backgroundColor: s.is_disqualified ? 'rgba(239, 68, 68, 0.04)' : 'transparent' }}>
                        <td style={{ padding: '0.85rem 1.25rem' }}>
                          <div style={{ fontWeight: 600 }}>{s.full_name}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>@{s.username}</div>
                        </td>

                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span style={{ fontWeight: 700, fontSize: '1rem', color: s.net_wpm >= 160 ? '#D97706' : 'var(--color-primary-forest)' }}>
                            {s.net_wpm} Net WPM
                          </span>
                          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                            {s.gross_wpm} Gross &bull; {Math.round(s.duration_seconds)}s
                          </div>
                        </td>

                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span style={{ fontWeight: 600 }}>{s.accuracy}%</span>
                        </td>

                        <td style={{ padding: '0.85rem 1rem' }}>
                          {s.is_disqualified ? (
                            <span className="badge badge-danger" title={s.disqualified_reason || 'Disqualified'}>
                              Disqualified
                            </span>
                          ) : s.is_flagged ? (
                            <span className="badge badge-warning" title="Flagged by heuristic anti-cheat">
                              Suspicious Burst
                            </span>
                          ) : (
                            <span className="badge badge-forest">
                              Verified
                            </span>
                          )}
                        </td>

                        <td style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                          <div>{s.practice_type} ({s.language || 'English'})</div>
                          <div>{new Date(s.completed_at).toLocaleDateString()} {new Date(s.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        </td>

                        <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                            {!s.is_disqualified && (
                              <button
                                className="btn btn-outline btn-sm"
                                onClick={() => {
                                  setDisqualifyModalSession(s);
                                  setDisqualifyReason('Inhuman WPM spike / automated keystrokes detected');
                                }}
                                style={{ color: '#D97706', borderColor: '#D97706' }}
                                title="Disqualify from leaderboards"
                              >
                                Disqualify
                              </button>
                            )}

                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => handleDeleteScore(s.id)}
                              style={{ color: 'var(--color-error)' }}
                              title="Delete record completely"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: PLATFORM SETTINGS & GLOBAL ANNOUNCEMENTS */}
      {/* ========================================================================= */}
      {activeTab === 'settings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Announcement Banner Configuration */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
              <Megaphone size={22} color="var(--color-primary-forest)" />
              <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Global Platform Announcement Banner</h2>
            </div>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Broadcast messages across the top of CodeTyper for all visitors and authenticated typists.
            </p>

            <form onSubmit={handleSaveSystemSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <input
                  type="checkbox"
                  id="announcement-enabled-toggle"
                  checked={systemSettings.announcement_enabled === '1'}
                  onChange={(e) => setSystemSettings({ ...systemSettings, announcement_enabled: e.target.checked ? '1' : '0' })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="announcement-enabled-toggle" style={{ fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer' }}>
                  Enable Announcement Banner
                </label>
              </div>

              <div>
                <label className="input-label">Announcement Text</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. 🚀 Welcome to the new seasonal leaderboard! New Rust & Python 3.12 curricula are now live."
                  value={systemSettings.announcement_text}
                  onChange={(e) => setSystemSettings({ ...systemSettings, announcement_text: e.target.value })}
                />
              </div>

              <div>
                <label className="input-label">Banner Notice Type</label>
                <select
                  className="input"
                  value={systemSettings.announcement_type}
                  onChange={(e) => setSystemSettings({ ...systemSettings, announcement_type: e.target.value })}
                  style={{ maxWidth: '300px' }}
                >
                  <option value="info">Information (Blue Calm)</option>
                  <option value="announcement">Platform Update (Emerald Forest)</option>
                  <option value="warning">System Alert / Maintenance Notice (Warm Amber)</option>
                </select>
              </div>

              {/* Live Preview */}
              {systemSettings.announcement_text && (
                <div style={{ marginTop: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                    Live Preview:
                  </span>
                  <div
                    style={{
                      marginTop: '0.35rem',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor:
                        systemSettings.announcement_type === 'warning'
                          ? 'rgba(224, 159, 62, 0.15)'
                          : systemSettings.announcement_type === 'announcement'
                          ? 'rgba(35, 107, 77, 0.12)'
                          : 'rgba(59, 130, 246, 0.12)',
                      border: '1px solid var(--color-border)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      fontSize: '0.9rem'
                    }}
                  >
                    <Megaphone size={16} color="var(--color-primary-forest)" />
                    <span style={{ fontWeight: 600 }}>{systemSettings.announcement_text}</span>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '0.5rem' }}>
                <button type="submit" className="btn btn-primary" disabled={savingSettings}>
                  {savingSettings ? 'Saving...' : 'Save Banner Configuration'}
                </button>
              </div>
            </form>
          </div>

          {/* Database Backup & Disaster Recovery */}
          <div className="card" style={{ padding: '1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
                <Database size={22} color="var(--color-primary-forest)" />
                <h3 style={{ fontSize: '1.2rem', margin: 0 }}>SQLite Database Snapshot Download</h3>
              </div>
              <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                Download an immediate encrypted, intact snapshot of the live SQLite database (`codetyper.db`).
              </p>
            </div>

            <button className="btn btn-outline" onClick={handleDownloadBackup}>
              <Download size={16} />
              <span>Download Backup (.db)</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: SECURITY & AUDIT TRAIL */}
      {/* ========================================================================= */}
      {activeTab === 'audit' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Security Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="stat-card">
              <span className="stat-label">Suspended Users</span>
              <div className="stat-value" style={{ color: 'var(--color-error)' }}>
                {securityStats?.bannedUsers || 0}
              </div>
              <span className="stat-subtext">Access completely revoked</span>
            </div>

            <div className="stat-card">
              <span className="stat-label">Shadowbanned Typists</span>
              <div className="stat-value" style={{ color: '#D97706' }}>
                {securityStats?.shadowbannedUsers || 0}
              </div>
              <span className="stat-subtext">Excluded from leaderboards</span>
            </div>

            <div className="stat-card">
              <span className="stat-label">Disqualified Sessions</span>
              <div className="stat-value">{securityStats?.disqualifiedScores || 0}</div>
              <span className="stat-subtext">Scrubbed from competition</span>
            </div>

            <div className="stat-card">
              <span className="stat-label">Security Audits</span>
              <div className="stat-value">{auditLogs.length}</div>
              <span className="stat-subtext">Recorded administrative events</span>
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--color-border)', fontWeight: 600 }}>
              Chronological Administrative Activity Trail
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', backgroundColor: 'var(--color-bg-subtle)' }}>
                    <th style={{ padding: '0.75rem 1.25rem' }}>Timestamp</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Administrator</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Action Taken</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Target Entity</th>
                    <th style={{ padding: '0.75rem 1.25rem' }}>Event Payload / Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                        No audit events recorded yet.
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => (
                      <tr key={log.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                        <td style={{ padding: '0.75rem 1.25rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>
                          @{log.admin_username}
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <span className="badge badge-sage" style={{ fontSize: '0.75rem' }}>
                            {log.action}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-secondary)' }}>
                          {log.target_type ? `${log.target_type} #${log.target_id || ''}` : 'System'}
                        </td>
                        <td style={{ padding: '0.75rem 1.25rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--color-text-secondary)', maxWidth: '360px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {log.details || '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ADD / EDIT PRACTICE PASSAGE */}
      {/* ========================================================================= */}
      {showContentModal && (
        <div className="modal-backdrop" onClick={() => setShowContentModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px', width: '92%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0 }}>{editingContent ? 'Edit Practice Snippet' : 'Create Practice Snippet'}</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowContentModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveContent} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="input-label">Snippet Title</label>
                <input
                  type="text"
                  className="input"
                  required
                  placeholder="e.g. Async Fetch & Error Handling"
                  value={contentFormData.title}
                  onChange={(e) => setContentFormData({ ...contentFormData, title: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <div>
                  <label className="input-label">Type</label>
                  <select
                    className="input"
                    value={contentFormData.is_code}
                    onChange={(e) => {
                      const isCode = Number(e.target.value);
                      setContentFormData({
                        ...contentFormData,
                        is_code: isCode,
                        language: isCode ? 'JavaScript' : 'English',
                        category: isCode ? 'Programming' : 'General English'
                      });
                    }}
                  >
                    <option value={0}>English Passage</option>
                    <option value={1}>Source Code</option>
                  </select>
                </div>

                <div>
                  <label className="input-label">Difficulty</label>
                  <select
                    className="input"
                    value={contentFormData.difficulty}
                    onChange={(e) => setContentFormData({ ...contentFormData, difficulty: e.target.value })}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              {contentFormData.is_code ? (
                <div>
                  <label className="input-label">Programming Language</label>
                  <select
                    className="input"
                    value={contentFormData.language}
                    onChange={(e) => setContentFormData({ ...contentFormData, language: e.target.value })}
                  >
                    {programmingLanguages.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="input-label">English Category</label>
                  <select
                    className="input"
                    value={contentFormData.category}
                    onChange={(e) => setContentFormData({ ...contentFormData, category: e.target.value })}
                  >
                    {englishCategories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="input-label">Content (Characters & formatting)</label>
                <textarea
                  className="input"
                  rows={6}
                  required
                  placeholder="Enter the exact code or prose to be typed..."
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}
                  value={contentFormData.content}
                  onChange={(e) => setContentFormData({ ...contentFormData, content: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowContentModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingContent ? 'Save Changes' : 'Create Passage'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: BULK IMPORT JSON */}
      {/* ========================================================================= */}
      {showBulkModal && (
        <div className="modal-backdrop" onClick={() => setShowBulkModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px', width: '92%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Upload size={20} color="var(--color-primary-forest)" />
                <h3 style={{ margin: 0 }}>Bulk Import Practice Content</h3>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowBulkModal(false)}>
                <X size={18} />
              </button>
            </div>

            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>
              Paste a JSON array of snippets. Each object can define <code>title</code>, <code>content</code>, <code>is_code</code>, <code>language</code>, <code>difficulty</code>, and <code>category</code>.
            </p>

            <textarea
              className="input"
              rows={8}
              placeholder={`[\n  {\n    "title": "Quick Sort Algorithm",\n    "is_code": 1,\n    "language": "Python",\n    "difficulty": "intermediate",\n    "category": "Algorithms",\n    "content": "def quicksort(arr):\\n    if len(arr) <= 1:\\n        return arr\\n    pivot = arr[len(arr) // 2]\\n    left = [x for x in arr if x < pivot]\\n    middle = [x for x in arr if x == pivot]\\n    right = [x for x in arr if x > pivot]\\n    return quicksort(left) + middle + quicksort(right)"\n  }\n]`}
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', whiteSpace: 'pre' }}
              value={bulkJsonText}
              onChange={(e) => setBulkJsonText(e.target.value)}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
              <button type="button" className="btn btn-ghost" onClick={() => setShowBulkModal(false)}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary" onClick={handleBulkImport} disabled={bulkImporting}>
                {bulkImporting ? 'Importing Snippets...' : 'Execute Bulk Import'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: BAN / UNBAN USER */}
      {/* ========================================================================= */}
      {banModalUser && (
        <div className="modal-backdrop" onClick={() => setBanModalUser(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px', width: '92%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserX size={20} color={banModalUser.is_banned ? 'var(--color-primary-forest)' : 'var(--color-error)'} />
                <h3 style={{ margin: 0 }}>
                  {banModalUser.is_banned ? `Lift Suspension: @${banModalUser.username}` : `Suspend Account: @${banModalUser.username}`}
                </h3>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setBanModalUser(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleBanToggle} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {!banModalUser.is_banned ? (
                <div>
                  <label className="input-label">Reason for Account Suspension</label>
                  <input
                    type="text"
                    className="input"
                    required
                    placeholder="e.g. Automated typing script detected / spam abuse"
                    value={banReason}
                    onChange={(e) => setBanReason(e.target.value)}
                  />
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.35rem' }}>
                    The user will receive this explanation when attempting to sign in.
                  </p>
                </div>
              ) : (
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                  Are you sure you want to restore full platform access for @{banModalUser.username}?
                </p>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setBanModalUser(null)}>
                  Cancel
                </button>
                <button type="submit" className={`btn ${banModalUser.is_banned ? 'btn-primary' : 'btn-danger'}`}>
                  {banModalUser.is_banned ? 'Lift Suspension' : 'Confirm Suspension'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: FORCE PASSWORD RESET */}
      {/* ========================================================================= */}
      {passwordModalUser && (
        <div className="modal-backdrop" onClick={() => setPasswordModalUser(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px', width: '92%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Key size={20} color="var(--color-primary-forest)" />
                <h3 style={{ margin: 0 }}>Reset Password for @{passwordModalUser.username}</h3>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setPasswordModalUser(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="input-label">Set New Temporary Password</label>
                <input
                  type="text"
                  className="input"
                  required
                  placeholder="Enter at least 6 characters..."
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setPasswordModalUser(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Reset Password Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: DISQUALIFY SCORE */}
      {/* ========================================================================= */}
      {disqualifyModalSession && (
        <div className="modal-backdrop" onClick={() => setDisqualifyModalSession(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px', width: '92%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Flag size={20} color="#D97706" />
                <h3 style={{ margin: 0 }}>Disqualify Score: {disqualifyModalSession.net_wpm} WPM</h3>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setDisqualifyModalSession(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleDisqualifyScore} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', margin: 0 }}>
                Disqualifying this score will remove it from all public leaderboards and recalculate @{disqualifyModalSession.username}&apos;s overall best & average WPM statistics.
              </p>

              <div>
                <label className="input-label">Disqualification Reason</label>
                <input
                  type="text"
                  className="input"
                  required
                  value={disqualifyReason}
                  onChange={(e) => setDisqualifyReason(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setDisqualifyModalSession(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ backgroundColor: '#D97706', borderColor: '#D97706' }}>
                  Disqualify & Recalculate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
