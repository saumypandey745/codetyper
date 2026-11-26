import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Shield,
  ShieldOff,
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
  RefreshCw,
  Award,
  MessageSquare,
  Mail,
  ExternalLink,
  Copy,
  FileText,
  Inbox,
  Filter,
  Send,
  Sparkles,
  BarChart3,
  Zap,
  TrendingUp,
  Server,
  Cpu,
  ArrowUpRight,
  Radio,
  Terminal,
  Globe,
  Sliders,
  ChevronRight,
  Star
} from 'lucide-react';
import { api } from '../../utils/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { programmingLanguages, englishCategories } from '../../../server/seedData.js';
import { TypingCertificateModal } from '../../components/typing/TypingCertificateModal.jsx';
import { getSiteUrl } from '../../utils/seoConfig.js';

export function AdminPage({ onNavigate }) {
  const { user } = useAuth();
  const toast = useToast();

  const [stats, setStats] = useState(null);
  const [securityStats, setSecurityStats] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'content' | 'users' | 'moderation' | 'certificates' | 'feedback' | 'subscribers' | 'settings' | 'audit'
  const [loading, setLoading] = useState(true);

  // Real-time Notifications State
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const notifPanelRef = useRef(null);
  const sseRef = useRef(null);

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

  // Certificates Governance Tab State
  const [certificatesList, setCertificatesList] = useState([]);
  const [certSummary, setCertSummary] = useState({ total: 0, active: 0, revoked: 0, highestWpm: 0 });
  const [certFilter, setCertFilter] = useState('all'); // 'all' | 'active' | 'revoked'
  const [certSearch, setCertSearch] = useState('');
  const [revokeModalCert, setRevokeModalCert] = useState(null);
  const [revokeReason, setRevokeReason] = useState('');
  const [previewCert, setPreviewCert] = useState(null);
  const [quickCertLookupId, setQuickCertLookupId] = useState('');

  // Feedback & Reports Tab State
  const [feedbackList, setFeedbackList] = useState([]);
  const [feedbackCounts, setFeedbackCounts] = useState({ total: 0, pending: 0, inReview: 0, resolved: 0, archived: 0, featured: 0 });
  const [feedbackFilter, setFeedbackFilter] = useState('all'); // 'all' | 'pending' | 'in_review' | 'resolved' | 'archived' | 'featured'
  const [feedbackCategory, setFeedbackCategory] = useState('all');
  const [feedbackSearch, setFeedbackSearch] = useState('');
  const [expandedFeedbackId, setExpandedFeedbackId] = useState(null);
  const [editingNotesId, setEditingNotesId] = useState(null);
  const [adminNotesText, setAdminNotesText] = useState('');

  // Feedback detail editing modal state
  const [editingFeedbackItem, setEditingFeedbackItem] = useState(null);
  const [editFeedbackForm, setEditFeedbackForm] = useState({
    name: '',
    email: '',
    display_role: '',
    rating: 5,
    message: '',
    subject: '',
    is_featured: false,
    status: 'resolved',
    admin_notes: ''
  });

  // Manual new testimonial creation modal state
  const [showAddTestimonialModal, setShowAddTestimonialModal] = useState(false);
  const [newTestimonialForm, setNewTestimonialForm] = useState({
    name: '',
    email: '',
    display_role: '',
    rating: 5,
    message: '',
    subject: '',
    is_featured: true,
    category: 'feedback'
  });

  // Newsletter & Subscribers Tab State
  const [subscribersList, setSubscribersList] = useState([]);
  const [subscriberCounts, setSubscriberCounts] = useState({ total: 0, active: 0, unsubscribed: 0 });
  const [subscriberFilter, setSubscriberFilter] = useState('all'); // 'all' | 'active' | 'unsubscribed'
  const [subscriberSearch, setSubscriberSearch] = useState('');
  const [emailLogs, setEmailLogs] = useState([]);
  const [emailStats, setEmailStats] = useState({ total: 0, sent: 0, simulated: 0, failed: 0 });
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({
    title: '',
    versionTag: 'v2.5 LTS',
    changelog: ''
  });
  const [broadcasting, setBroadcasting] = useState(false);
  const [subscribersViewMode, setSubscribersViewMode] = useState('subscribers'); // 'subscribers' | 'outbox'

  // Platform Settings Tab State
  const [systemSettings, setSystemSettings] = useState({
    announcement_text: '',
    announcement_type: 'info',
    announcement_enabled: '0',
    maintenance_mode: '0'
  });
  const [savingSettings, setSavingSettings] = useState(false);

  // Webhook Integrations (Discord & Slack) State
  const [webhookConfig, setWebhookConfig] = useState({
    discordUrl: '',
    slackUrl: '',
    events: {
      certIssued: true,
      feedbackSubmitted: true,
      subscriberJoined: true,
      securityAlert: true
    }
  });
  const [webhookLogs, setWebhookLogs] = useState([]);
  const [testingDiscord, setTestingDiscord] = useState(false);
  const [testingSlack, setTestingSlack] = useState(false);
  const [savingWebhooks, setSavingWebhooks] = useState(false);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState([]);

  // Load All Admin Data
  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, contentRes, usersRes, secRes, settingsRes, auditRes, scoresRes, certsRes, feedbackRes, subsRes, emailLogsRes, webhookConfigRes, webhookLogsRes] = await Promise.all([
        api.admin.getStats().catch(() => null),
        api.admin.getContent({ limit: 200 }).catch(() => ({ items: [] })),
        api.admin.getUsers().catch(() => ({ users: [] })),
        api.admin.getSecuritySummary().catch(() => null),
        api.admin.getSettings().catch(() => ({ settings: {} })),
        api.admin.getAuditLogs().catch(() => ({ logs: [] })),
        api.admin.getScores({ suspicious: true, limit: 100 }).catch(() => ({ scores: [] })),
        api.admin.getCertificates({ limit: 100 }).catch(() => ({ certificates: [], summary: {} })),
        api.admin.getFeedback({ limit: 100 }).catch(() => ({ feedback: [], counts: {} })),
        api.admin.getSubscribers({ limit: 100 }).catch(() => ({ subscribers: [], counts: {} })),
        api.admin.getEmailLogs().catch(() => ({ logs: [], stats: {} })),
        api.admin.getWebhooksConfig().catch(() => null),
        api.admin.getWebhookLogs().catch(() => ({ logs: [] }))
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
      if (certsRes?.certificates) {
        setCertificatesList(certsRes.certificates);
        if (certsRes.summary) setCertSummary(certsRes.summary);
      }
      if (feedbackRes?.feedback) {
        setFeedbackList(feedbackRes.feedback);
        if (feedbackRes.counts) setFeedbackCounts(feedbackRes.counts);
      }
      if (subsRes?.subscribers) {
        setSubscribersList(subsRes.subscribers);
        if (subsRes.counts) setSubscriberCounts(subsRes.counts);
      }
      if (emailLogsRes?.logs) {
        setEmailLogs(emailLogsRes.logs);
        if (emailLogsRes.stats) setEmailStats(emailLogsRes.stats);
      }
      if (webhookConfigRes) {
        setWebhookConfig({
          discordUrl: webhookConfigRes.discordUrl || '',
          slackUrl: webhookConfigRes.slackUrl || '',
          events: {
            certIssued: webhookConfigRes.events?.certIssued ?? true,
            feedbackSubmitted: webhookConfigRes.events?.feedbackSubmitted ?? true,
            subscriberJoined: webhookConfigRes.events?.subscriberJoined ?? true,
            securityAlert: webhookConfigRes.events?.securityAlert ?? true
          }
        });
      }
      if (webhookLogsRes?.logs) {
        setWebhookLogs(webhookLogsRes.logs);
      }
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

  // Set up SSE for real-time notifications
  useEffect(() => {
    if (user?.role !== 'admin') return;

    // Load historical notifications first
    api.admin.getNotifications().then((res) => {
      if (res?.notifications) {
        const mapped = res.notifications.map((n) => ({
          id: n.id,
          type: n.action,
          payload: n.details ? (() => { try { return JSON.parse(n.details); } catch { return {}; } })() : {},
          timestamp: n.created_at,
          read: true
        }));
        setNotifications(mapped);
      }
    }).catch(() => {});

    // Connect to SSE stream
    const token = localStorage.getItem('codetyper_token');
    const streamUrl = api.admin.streamNotifications();
    const eventSource = new EventSource(`${streamUrl}?token=${token}`);
    sseRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'CONNECTED') return;
        setNotifications((prev) => [{ ...data, id: Date.now(), read: false }, ...prev.slice(0, 49)]);
        setUnreadCount((prev) => prev + 1);
      } catch (e) {}
    };

    eventSource.onerror = () => {
      // SSE will auto-reconnect; no action needed
    };

    return () => {
      eventSource.close();
    };
  }, [user]);

  // Close notification panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifPanelRef.current && !notifPanelRef.current.contains(e.target)) {
        setShowNotifPanel(false);
      }
    };
    if (showNotifPanel) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifPanel]);

  const handleOpenNotifPanel = () => {
    setShowNotifPanel((prev) => !prev);
    setUnreadCount(0); // mark all as read on open
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const loadCertificates = async (filter = certFilter, search = certSearch) => {
    try {
      const res = await api.admin.getCertificates({ status: filter, search: search.trim(), limit: 100 });
      setCertificatesList(res.certificates || []);
      if (res.summary) setCertSummary(res.summary);
    } catch (err) {
      toast.error('Could not load certificates list.');
    }
  };

  const loadFeedback = async (status = feedbackFilter, category = feedbackCategory, search = feedbackSearch) => {
    try {
      const params = { category, search: search.trim(), limit: 100 };
      if (status === 'featured') {
        params.featured = 1;
      } else {
        params.status = status;
      }
      const res = await api.admin.getFeedback(params);
      setFeedbackList(res.feedback || []);
      if (res.counts) setFeedbackCounts(res.counts);
    } catch (err) {
      toast.error('Could not load user feedback reports.');
    }
  };

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
      // Refresh stats so KPI boxes update immediately
      loadAdminData();
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
  // Certificate Governance Handlers
  // ==========================================
  const handleOpenRevokeModal = (cert) => {
    setRevokeModalCert(cert);
    setRevokeReason(cert.revoked_reason || '');
  };

  const handleToggleRevoke = async (e) => {
    e.preventDefault();
    if (!revokeModalCert) return;
    const isRevoking = !revokeModalCert.is_revoked;
    try {
      const res = await api.admin.revokeCertificate(revokeModalCert.cert_id, {
        is_revoked: isRevoking,
        reason: isRevoking ? revokeReason : null
      });
      toast.success(res.message);
      setRevokeModalCert(null);
      setRevokeReason('');
      loadCertificates();
      loadAdminData();
    } catch (err) {
      toast.error(err.message || 'Could not update certificate revocation status.');
    }
  };

  const handleDeleteCertificate = async (cert) => {
    if (!window.confirm(`Permanently purge certificate ${cert.cert_id} for "${cert.recipient_name}" from the global registry?`)) return;
    try {
      const res = await api.admin.deleteCertificate(cert.cert_id);
      toast.success(res.message);
      loadCertificates();
      loadAdminData();
    } catch (err) {
      toast.error(err.message || 'Failed to delete certificate.');
    }
  };

  const handleQuickLookup = (e) => {
    e.preventDefault();
    if (!quickCertLookupId.trim()) return;
    const clean = quickCertLookupId.trim().toUpperCase();
    setCertSearch(clean);
    loadCertificates(certFilter, clean);
  };

  // ==========================================
  // Feedback & Reports Handlers
  // ==========================================
  const handleUpdateFeedbackStatus = async (item, newStatus) => {
    try {
      const res = await api.admin.updateFeedbackStatus(item.id, { status: newStatus });
      setFeedbackList((prev) =>
        prev.map((f) => (f.id === item.id ? { ...f, status: newStatus } : f))
      );
      toast.success(res.message);
      loadFeedback();
      loadAdminData();
    } catch (err) {
      toast.error(err.message || 'Could not update status.');
    }
  };

  const handleSaveAdminNotes = async (item) => {
    try {
      const res = await api.admin.updateFeedbackStatus(item.id, { admin_notes: adminNotesText });
      setFeedbackList((prev) =>
        prev.map((f) => (f.id === item.id ? { ...f, admin_notes: adminNotesText } : f))
      );
      setEditingNotesId(null);
      toast.success('Admin note saved.');
    } catch (err) {
      toast.error(err.message || 'Failed to save admin note.');
    }
  };

  const handleDeleteFeedback = async (item) => {
    if (!window.confirm(`Permanently remove note #${item.id} from "${item.name}"?`)) return;
    try {
      const res = await api.admin.deleteFeedback(item.id);
      setFeedbackList((prev) => prev.filter((f) => f.id !== item.id));
      toast.success(res.message);
      loadFeedback();
      loadAdminData();
    } catch (err) {
      toast.error(err.message || 'Failed to delete feedback note.');
    }
  };

  const handleToggleFeedbackFeatured = async (item) => {
    try {
      const res = await api.admin.toggleFeedbackFeatured(item.id);
      setFeedbackList((prev) =>
        prev.map((f) => (f.id === item.id ? { ...f, is_featured: res.is_featured } : f))
      );
      toast.success(res.message);
      loadFeedback();
      loadAdminData();
    } catch (err) {
      toast.error(err.message || 'Failed to toggle featured status.');
    }
  };

  const handleQuickRateFeedback = async (item, newRating) => {
    try {
      await api.admin.updateFeedback(item.id, { rating: newRating });
      setFeedbackList((prev) =>
        prev.map((f) => (f.id === item.id ? { ...f, rating: newRating } : f))
      );
      toast.success(`Rating set to ${newRating} ★ for ${item.name}.`);
      loadFeedback();
    } catch (err) {
      toast.error(err.message || 'Failed to update rating.');
    }
  };

  const openEditFeedbackModal = (item) => {
    setEditingFeedbackItem(item);
    setEditFeedbackForm({
      name: item.name || '',
      email: item.email || '',
      display_role: item.display_role || '',
      rating: item.rating || 5,
      message: item.message || '',
      subject: item.subject || '',
      is_featured: !!item.is_featured,
      status: item.status || 'resolved',
      admin_notes: item.admin_notes || ''
    });
  };

  const handleSaveEditedFeedback = async (e) => {
    e.preventDefault();
    if (!editingFeedbackItem) return;
    try {
      const res = await api.admin.updateFeedback(editingFeedbackItem.id, editFeedbackForm);
      toast.success(res.message || 'Feedback details updated.');
      setEditingFeedbackItem(null);
      loadFeedback();
      loadAdminData();
    } catch (err) {
      toast.error(err.message || 'Failed to update feedback details.');
    }
  };

  const handleCreateTestimonial = async (e) => {
    e.preventDefault();
    if (!newTestimonialForm.name.trim() || !newTestimonialForm.message.trim()) {
      toast.error('Please provide an author name and testimonial quote.');
      return;
    }
    try {
      const res = await api.admin.createFeedback(newTestimonialForm);
      toast.success(res.message || 'Testimonial created and featured on website!');
      setShowAddTestimonialModal(false);
      setNewTestimonialForm({
        name: '',
        email: '',
        display_role: '',
        rating: 5,
        message: '',
        subject: '',
        is_featured: true,
        category: 'feedback'
      });
      loadFeedback();
      loadAdminData();
    } catch (err) {
      toast.error(err.message || 'Failed to create testimonial.');
    }
  };

  // ==========================================
  // Newsletter & Subscribers Handlers
  // ==========================================
  const loadSubscribers = async (status = subscriberFilter, search = subscriberSearch) => {
    try {
      const res = await api.admin.getSubscribers({ status, search: search.trim(), limit: 100 });
      setSubscribersList(res.subscribers || []);
      if (res.counts) setSubscriberCounts(res.counts);
    } catch (err) {
      toast.error('Could not load newsletter subscribers.');
    }
  };

  const loadEmailLogs = async () => {
    try {
      const res = await api.admin.getEmailLogs();
      setEmailLogs(res.logs || []);
      if (res.stats) setEmailStats(res.stats);
    } catch (err) {
      console.warn('[Admin] Failed to load email logs:', err);
    }
  };

  const handleDeleteSubscriber = async (sub) => {
    if (!window.confirm(`Permanently remove subscriber "${sub.email}"?`)) return;
    try {
      const res = await api.admin.deleteSubscriber(sub.id);
      setSubscribersList((prev) => prev.filter((s) => s.id !== sub.id));
      toast.success(res.message);
      loadSubscribers();
      loadAdminData();
    } catch (err) {
      toast.error(err.message || 'Could not delete subscriber.');
    }
  };

  const handleBroadcastUpdate = async (e) => {
    e.preventDefault();
    if (!broadcastForm.title.trim() || !broadcastForm.changelog.trim()) {
      toast.error('Please enter both announcement headline and changelog notes.');
      return;
    }
    setBroadcasting(true);
    try {
      const res = await api.admin.broadcastUpdate(broadcastForm);
      toast.success(res.message || 'Update broadcast dispatched successfully!');
      setShowBroadcastModal(false);
      setBroadcastForm({ title: '', versionTag: 'v2.5 LTS', changelog: '' });
      loadEmailLogs();
      loadAdminData();
    } catch (err) {
      toast.error(err.message || 'Failed to dispatch broadcast update.');
    } finally {
      setBroadcasting(false);
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

  // Webhook Integrations Handlers
  const handleSaveWebhookConfig = async (e) => {
    if (e) e.preventDefault();
    setSavingWebhooks(true);
    try {
      const res = await api.admin.updateWebhooksConfig(webhookConfig);
      if (res?.config) {
        setWebhookConfig(res.config);
      }
      toast.success(res.message || 'Discord & Slack webhook configuration saved!');
      const logsRes = await api.admin.getWebhookLogs().catch(() => null);
      if (logsRes?.logs) setWebhookLogs(logsRes.logs);
    } catch (err) {
      toast.error(err.message || 'Failed to update webhook settings.');
    } finally {
      setSavingWebhooks(false);
    }
  };

  const handleTestWebhook = async (service) => {
    if (service === 'discord') setTestingDiscord(true);
    if (service === 'slack') setTestingSlack(true);

    try {
      const targetUrl = service === 'discord' ? webhookConfig.discordUrl : webhookConfig.slackUrl;
      if (!targetUrl || !targetUrl.trim()) {
        toast.error(`Please enter a ${service === 'discord' ? 'Discord' : 'Slack'} webhook URL first.`);
        return;
      }

      const res = await api.admin.testWebhook({ service, targetUrl });
      toast.success(res.message || `${service.toUpperCase()} test alert sent successfully!`);

      const logsRes = await api.admin.getWebhookLogs().catch(() => null);
      if (logsRes?.logs) setWebhookLogs(logsRes.logs);
    } catch (err) {
      toast.error(err.message || `Failed to dispatch ${service} test alert.`);
    } finally {
      if (service === 'discord') setTestingDiscord(false);
      if (service === 'slack') setTestingSlack(false);
    }
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

  // Calculate language distribution for Overview tab
  const languageStats = useMemo(() => {
    const map = {};
    contentItems.forEach((item) => {
      const lang = item.is_code ? (item.language || 'Code') : 'English Prose';
      map[lang] = (map[lang] || 0) + 1;
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  }, [contentItems]);

  const maxLanguageCount = Math.max(...languageStats.map(([, count]) => count), 1);

  return (
    <div className="admin-mission-control" style={{ maxWidth: '1240px', margin: '0 auto', paddingBottom: '3.5rem' }}>
      {/* 1. EXECUTIVE MISSION CONTROL HERO DECK */}
      <div className="admin-hero-deck">
        <div className="admin-hero-content">
          <div className="admin-identity">
            <div className="admin-badge-icon">
              <ShieldCheck size={28} />
            </div>
            <div className="admin-title-wrap">
              <h1>
                <span>CodeTyper Mission Control</span>
                <span className="admin-role-pill">Executive Authority</span>
              </h1>
              <p className="admin-subtitle">
                Super-administrative oversight across typists, coding curriculum, anti-cheat telemetry, certificates, and automated communications.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem', position: 'relative' }}>
            <div className="admin-telemetry-pill" title="Live System Telemetry">
              <span className="admin-pulse-dot" />
              <span>All Systems Operational • &lt; 3ms Input Latency • Node 22 Engine</span>
            </div>

            {/* Quick Actions Launchpad */}
            <div className="admin-quick-actions">
              {/* Bell Notification Icon */}
              <div ref={notifPanelRef} style={{ position: 'relative' }}>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={handleOpenNotifPanel}
                  title="Activity Notifications"
                  style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Bell size={16} />
                  {unreadCount > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '-6px',
                      right: '-6px',
                      background: '#ef4444',
                      color: '#fff',
                      borderRadius: '999px',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      minWidth: '18px',
                      height: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0 4px',
                      boxShadow: '0 0 0 2px var(--color-bg)',
                      animation: 'pulse 1.5s ease-in-out infinite'
                    }}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Panel Dropdown */}
                {showNotifPanel && (
                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 10px)',
                    right: 0,
                    width: '340px',
                    maxHeight: '460px',
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '12px',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                    zIndex: 9999,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    {/* Panel Header */}
                    <div style={{
                      padding: '1rem 1.25rem',
                      borderBottom: '1px solid var(--color-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'var(--color-surface-elevated, var(--color-surface))'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Bell size={15} style={{ color: 'var(--color-primary-forest)' }} />
                        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Activity Feed</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{
                          background: 'rgba(34,197,94,0.15)',
                          color: '#22c55e',
                          borderRadius: '999px',
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          padding: '2px 8px'
                        }}>LIVE</span>
                        <button
                          onClick={() => setShowNotifPanel(false)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', padding: '2px' }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Notifications List */}
                    <div style={{ overflowY: 'auto', flex: 1 }}>
                      {notifications.length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                          <Bell size={28} style={{ opacity: 0.3, marginBottom: '0.5rem', display: 'block', margin: '0 auto 0.5rem' }} />
                          <p style={{ margin: 0, fontSize: '0.85rem' }}>No recent activity</p>
                        </div>
                      ) : (
                        notifications.slice(0, 30).map((notif, idx) => {
                          const isNewUser = notif.type === 'USER_REGISTERED';
                          const isBan = notif.type === 'BAN_USER';
                          const isDelete = notif.type === 'DELETE_USER';
                          const payload = notif.payload || {};
                          const username = payload.username || payload.target_id || 'Unknown';
                          const fullName = payload.full_name || username;
                          const time = notif.timestamp ? new Date(notif.timestamp).toLocaleString() : '';

                          return (
                            <div key={notif.id || idx} style={{
                              padding: '0.75rem 1.25rem',
                              borderBottom: '1px solid var(--color-border)',
                              display: 'flex',
                              gap: '0.75rem',
                              alignItems: 'flex-start',
                              background: notif.read ? 'transparent' : 'rgba(34,197,94,0.04)',
                              transition: 'background 0.3s'
                            }}>
                              {/* Avatar / icon */}
                              <div style={{
                                width: '34px',
                                height: '34px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                background: isNewUser ? 'linear-gradient(135deg,#22c55e,#16a34a)'
                                  : isBan ? 'linear-gradient(135deg,#ef4444,#b91c1c)'
                                  : isDelete ? 'linear-gradient(135deg,#f59e0b,#d97706)'
                                  : 'linear-gradient(135deg,#6366f1,#4f46e5)'
                              }}>
                                {isNewUser ? <Users size={16} color="#fff" />
                                  : isBan ? <UserX size={16} color="#fff" />
                                  : isDelete ? <Trash2 size={16} color="#fff" />
                                  : <Activity size={16} color="#fff" />}
                              </div>

                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: '0.82rem', lineHeight: 1.4 }}>
                                  {isNewUser ? (
                                    <><strong style={{ color: 'var(--color-text)' }}>{fullName}</strong>
                                    {' '}<span style={{ color: 'var(--color-text-secondary)' }}>signed up as</span>
                                    {' '}<span style={{ color: 'var(--color-primary-forest)', fontFamily: 'monospace' }}>@{username}</span></>
                                  ) : isBan ? (
                                    <><span style={{ color: 'var(--color-text-secondary)' }}>Suspended</span>
                                    {' '}<strong>@{username}</strong></>
                                  ) : isDelete ? (
                                    <><span style={{ color: 'var(--color-text-secondary)' }}>Deleted account</span>
                                    {' '}<strong>@{username}</strong></>
                                  ) : (
                                    <span style={{ color: 'var(--color-text-secondary)' }}>{notif.type?.replace(/_/g, ' ')}</span>
                                  )}
                                </div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>{time}</div>
                              </div>

                              {!notif.read && (
                                <div style={{
                                  width: '7px', height: '7px', borderRadius: '50%',
                                  background: '#22c55e', flexShrink: 0, marginTop: '5px'
                                }} />
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Panel Footer */}
                    <div style={{
                      padding: '0.6rem 1.25rem',
                      borderTop: '1px solid var(--color-border)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                        {notifications.length} recent events
                      </span>
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                        onClick={() => { setActiveTab('audit'); setShowNotifPanel(false); }}
                      >
                        View Audit Log →
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                className="btn btn-primary btn-sm"
                onClick={() => setShowBroadcastModal(true)}
                title="Broadcast release notes to all active subscribers"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Sparkles size={14} />
                <span>Broadcast Update</span>
              </button>

              <button
                className="btn btn-outline btn-sm"
                onClick={handleOpenAddContent}
                title="Create a new typing practice passage"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Plus size={14} />
                <span>Add Snippet</span>
              </button>

              <button
                className="btn btn-outline btn-sm"
                onClick={handleExportLibrary}
                title="Export practice library as JSON"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Download size={14} />
                <span>Export JSON</span>
              </button>

              <button
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  loadAdminData();
                  toast.info('Administrative telemetry refreshed.');
                }}
                title="Sync Live Data"
              >
                <RefreshCw size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. INTERACTIVE 3D COMMAND KPI CARDS */}
      <div className="admin-kpi-grid">
        {/* Card 1: Typist Community */}
        <div
          className={`admin-kpi-card ${activeTab === 'users' ? 'active-kpi' : ''}`}
          onClick={() => setActiveTab('users')}
          title="Click to manage typist accounts and security permissions"
        >
          <div className="admin-kpi-card-header">
            <span className="admin-kpi-label">Typist Community</span>
            <div className="admin-kpi-icon-box" style={{ color: '#0284c7' }}>
              <Users size={17} />
            </div>
          </div>
          <div className="admin-kpi-value">{stats?.users || 0}</div>
          <div className="admin-kpi-footer">
            <span>{stats?.bannedUsers || 0} suspended • {stats?.users ? stats.users - (stats.bannedUsers || 0) : 0} active typists</span>
            <span className="admin-kpi-arrow">&rarr;</span>
          </div>
        </div>

        {/* Card 2: Practice Library */}
        <div
          className={`admin-kpi-card ${activeTab === 'content' ? 'active-kpi' : ''}`}
          onClick={() => setActiveTab('content')}
          title="Click to view and edit typing curriculum"
        >
          <div className="admin-kpi-card-header">
            <span className="admin-kpi-label">Practice Engine</span>
            <div className="admin-kpi-icon-box" style={{ color: 'var(--color-primary-forest)' }}>
              <Layers size={17} />
            </div>
          </div>
          <div className="admin-kpi-value" style={{ color: 'var(--color-primary-forest)' }}>
            {stats?.contentItems || 0}
          </div>
          <div className="admin-kpi-footer">
            <span>{stats?.totalPracticeHours || 0} hrs typed • 25+ real languages</span>
            <span className="admin-kpi-arrow">&rarr;</span>
          </div>
        </div>

        {/* Card 3: Anti-Cheat Moderation */}
        <div
          className={`admin-kpi-card ${activeTab === 'moderation' ? 'active-kpi' : ''}`}
          onClick={() => {
            setActiveTab('moderation');
            loadScores();
          }}
          title="Click to review flagged leaderboards and anti-cheat runs"
        >
          <div className="admin-kpi-card-header">
            <span className="admin-kpi-label">Anti-Cheat Flags</span>
            <div className="admin-kpi-icon-box" style={{ color: '#D97706' }}>
              <Flag size={17} />
            </div>
          </div>
          <div className="admin-kpi-value" style={{ color: (stats?.flaggedSessions || 0) > 0 ? '#D97706' : 'inherit' }}>
            {stats?.flaggedSessions || 0}
          </div>
          <div className="admin-kpi-footer">
            <span>{stats?.disqualifiedSessions || 0} disqualified • Telemetry audit</span>
            <span className="admin-kpi-arrow">&rarr;</span>
          </div>
        </div>

        {/* Card 4: Accredited Certificates */}
        <div
          className={`admin-kpi-card ${activeTab === 'certificates' ? 'active-kpi' : ''}`}
          onClick={() => {
            setActiveTab('certificates');
            loadCertificates();
          }}
          title="Click to view and issue accredited certificates"
        >
          <div className="admin-kpi-card-header">
            <span className="admin-kpi-label">Certificates Hub</span>
            <div className="admin-kpi-icon-box" style={{ color: '#8b5cf6' }}>
              <Award size={17} />
            </div>
          </div>
          <div className="admin-kpi-value" style={{ color: '#8b5cf6' }}>
            {stats?.certificatesCount || 0}
          </div>
          <div className="admin-kpi-footer">
            <span>{stats?.revokedCertificatesCount || 0} revoked • SHA-256 verifier</span>
            <span className="admin-kpi-arrow">&rarr;</span>
          </div>
        </div>

        {/* Card 5: Feedback & Reports */}
        <div
          className={`admin-kpi-card ${activeTab === 'feedback' ? 'active-kpi' : ''}`}
          onClick={() => {
            setActiveTab('feedback');
            loadFeedback();
          }}
          title="Click to review developer feedback and typo reports"
        >
          <div className="admin-kpi-card-header">
            <span className="admin-kpi-label">Feedback &amp; Reports</span>
            <div className="admin-kpi-icon-box" style={{ color: '#EC4899' }}>
              <MessageSquare size={17} />
            </div>
          </div>
          <div className="admin-kpi-value" style={{ color: (stats?.pendingFeedbackCount || 0) > 0 ? '#D97706' : 'inherit' }}>
            {stats?.feedbackCount || 0}
          </div>
          <div className="admin-kpi-footer">
            <span>{(stats?.pendingFeedbackCount || 0) > 0 ? `${stats.pendingFeedbackCount} pending review` : 'All inquiries addressed'}</span>
            <span className="admin-kpi-arrow">&rarr;</span>
          </div>
        </div>

        {/* Card 6: Subscribers & Mailer */}
        <div
          className={`admin-kpi-card ${activeTab === 'subscribers' ? 'active-kpi' : ''}`}
          onClick={() => {
            setActiveTab('subscribers');
            loadSubscribers();
            loadEmailLogs();
          }}
          title="Click to view newsletter subscribers and email dispatch outbox"
        >
          <div className="admin-kpi-card-header">
            <span className="admin-kpi-label">Subscribers &amp; Mailer</span>
            <div className="admin-kpi-icon-box" style={{ color: '#10B981' }}>
              <Mail size={17} />
            </div>
          </div>
          <div className="admin-kpi-value" style={{ color: '#10B981' }}>
            {stats?.subscribersCount || subscriberCounts?.active || 0}
          </div>
          <div className="admin-kpi-footer">
            <span>{stats?.emailsDispatchedCount || emailStats?.total || 0} emails dispatched</span>
            <span className="admin-kpi-arrow">&rarr;</span>
          </div>
        </div>
      </div>

      {/* 3. EXECUTIVE SEGMENTED NAVIGATION SHELF */}
      <div className="admin-navigation-shelf">
        <nav aria-label="Administrative Console Navigation" className="admin-nav-pills">
          <button
            className={`admin-nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <BarChart3 size={16} />
            <span>Overview &amp; Analytics</span>
          </button>

          <button
            className={`admin-nav-tab ${activeTab === 'content' ? 'active' : ''}`}
            onClick={() => setActiveTab('content')}
          >
            <Layers size={16} />
            <span>Practice Library</span>
            <span className="admin-nav-badge">{contentItems.length}</span>
          </button>

          <button
            className={`admin-nav-tab ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={16} />
            <span>Typist Governance</span>
            <span className="admin-nav-badge">{userList.length}</span>
          </button>

          <button
            className={`admin-nav-tab ${activeTab === 'moderation' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('moderation');
              loadScores();
            }}
          >
            <Flag size={16} />
            <span>Anti-Cheat Moderation</span>
            {(stats?.flaggedSessions || 0) > 0 && (
              <span className="admin-nav-badge admin-nav-badge-alert">{stats.flaggedSessions} flagged</span>
            )}
          </button>

          <button
            className={`admin-nav-tab ${activeTab === 'certificates' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('certificates');
              loadCertificates();
            }}
          >
            <Award size={16} />
            <span>Certificates Hub</span>
            <span className="admin-nav-badge">{certificatesList.length}</span>
          </button>

          <button
            className={`admin-nav-tab ${activeTab === 'feedback' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('feedback');
              loadFeedback();
            }}
          >
            <MessageSquare size={16} />
            <span>Feedback &amp; Reports</span>
            {feedbackCounts.pending > 0 ? (
              <span className="admin-nav-badge admin-nav-badge-alert">{feedbackCounts.pending} new</span>
            ) : (
              <span className="admin-nav-badge">{feedbackList.length}</span>
            )}
          </button>

          <button
            className={`admin-nav-tab ${activeTab === 'subscribers' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('subscribers');
              loadSubscribers();
              loadEmailLogs();
            }}
          >
            <Mail size={16} />
            <span>Subscribers &amp; Mailer</span>
            <span className="admin-nav-badge">{subscriberCounts.active}</span>
          </button>

          <button
            className={`admin-nav-tab ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={16} />
            <span>Settings &amp; Webhooks</span>
          </button>

          <button
            className={`admin-nav-tab ${activeTab === 'audit' ? 'active' : ''}`}
            onClick={() => setActiveTab('audit')}
          >
            <Activity size={16} />
            <span>Security Audit Trail</span>
            <span className="admin-nav-badge">{stats?.auditLogCount || auditLogs.length}</span>
          </button>
        </nav>
      </div>

      {/* ========================================================================= */}
      {/* TAB 0: EXECUTIVE OVERVIEW & PLATFORM ANALYTICS */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="admin-overview-section">
          {/* Top Highlights Banner */}
          <div className="card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(35, 107, 77, 0.08) 0%, var(--color-bg-surface) 100%)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <span className="badge badge-sage" style={{ marginBottom: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <TrendingUp size={13} /> Real-Time Telemetry &amp; Platform Vitals
                </span>
                <h3 style={{ margin: '0 0 0.4rem', fontSize: '1.35rem' }}>Executive System Summary</h3>
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                  Active typist throughput, coding curriculum coverage, integrity monitoring, and automated subscriber engagement.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setShowBroadcastModal(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Sparkles size={14} />
                  <span>Broadcast Update ({subscriberCounts.active})</span>
                </button>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={handleOpenAddContent}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Plus size={14} />
                  <span>Add Practice Snippet</span>
                </button>
              </div>
            </div>
          </div>

          {/* 2-Column Grid: Infrastructure & Language Distribution vs Quick Actions & Recent Audits */}
          <div className="admin-overview-grid">
            {/* Left Column (2fr) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Infrastructure & Services Status */}
              <div className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <h4 style={{ margin: 0, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Server size={18} color="var(--color-primary-forest)" />
                    <span>Platform Subsystems &amp; SLA Health</span>
                  </h4>
                  <span className="admin-telemetry-pill">
                    <span className="admin-pulse-dot" />
                    <span>All Systems Operational</span>
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                  <div className="admin-health-badge">
                    <div>
                      <div style={{ fontWeight: 600 }}>SQLite Storage Engine</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>WAL Mode • Zero Latency</div>
                    </div>
                    <CheckCircle2 size={18} color="#10B981" />
                  </div>

                  <div className="admin-health-badge">
                    <div>
                      <div style={{ fontWeight: 600 }}>Audio Synthesis Engine</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Sub-millisecond Web Audio</div>
                    </div>
                    <CheckCircle2 size={18} color="#10B981" />
                  </div>

                  <div className="admin-health-badge">
                    <div>
                      <div style={{ fontWeight: 600 }}>Multiplayer Arena</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Real-time SSE Stream Live</div>
                    </div>
                    <CheckCircle2 size={18} color="#10B981" />
                  </div>

                  <div className="admin-health-badge">
                    <div>
                      <div style={{ fontWeight: 600 }}>Automated Mailer</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Transactional Dispatch Active</div>
                    </div>
                    <CheckCircle2 size={18} color="#10B981" />
                  </div>

                  <div className="admin-health-badge">
                    <div>
                      <div style={{ fontWeight: 600 }}>Cryptographic Registry</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>SHA-256 Verifier Accredited</div>
                    </div>
                    <CheckCircle2 size={18} color="#10B981" />
                  </div>

                  <div className="admin-health-badge">
                    <div>
                      <div style={{ fontWeight: 600 }}>Anti-Cheat Telemetry</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Heuristic WPM &amp; CPS Guard</div>
                    </div>
                    <CheckCircle2 size={18} color="#10B981" />
                  </div>
                </div>
              </div>

              {/* Language Distribution Progress Bars */}
              <div className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <h4 style={{ margin: 0, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <BarChart3 size={18} color="var(--color-primary-forest)" />
                    <span>Curriculum &amp; Language Distribution ({contentItems.length} Passages)</span>
                  </h4>
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: '0.8rem', color: 'var(--color-primary-forest)' }}
                    onClick={() => setActiveTab('content')}
                  >
                    <span>Manage Content &rarr;</span>
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  {languageStats.map(([lang, count]) => {
                    const percent = Math.round((count / maxLanguageCount) * 100);
                    return (
                      <div key={lang} className="admin-lang-bar-row">
                        <div className="admin-lang-bar-label">
                          <span>{lang}</span>
                          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                            {count} snippets ({Math.round((count / (contentItems.length || 1)) * 100)}%)
                          </span>
                        </div>
                        <div className="admin-lang-progress-track">
                          <div
                            className="admin-lang-progress-fill"
                            style={{
                              width: `${percent}%`,
                              background: lang === 'English Prose'
                                ? 'linear-gradient(90deg, #64748B, #94A3B8)'
                                : lang === 'Python'
                                ? 'linear-gradient(90deg, #0284c7, #38bdf8)'
                                : lang === 'JavaScript'
                                ? 'linear-gradient(90deg, #eab308, #fde047)'
                                : lang === 'TypeScript'
                                ? 'linear-gradient(90deg, #3b82f6, #60a5fa)'
                                : lang === 'Rust'
                                ? 'linear-gradient(90deg, #ea580c, #f97316)'
                                : 'linear-gradient(90deg, var(--color-primary-forest), var(--color-primary-sage))'
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column (1fr): Quick Launchpad & Recent Audit Activity Stream */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Executive Quick Launchpad */}
              <div className="card" style={{ padding: '1.5rem' }}>
                <h4 style={{ margin: '0 0 1rem', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Terminal size={18} color="var(--color-primary-forest)" />
                  <span>Administrative Launchpad</span>
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  <button
                    className="btn btn-outline"
                    style={{ justifyContent: 'flex-start', padding: '0.6rem 0.85rem' }}
                    onClick={() => setShowBroadcastModal(true)}
                  >
                    <Sparkles size={16} color="var(--color-primary-forest)" />
                    <span>Broadcast Release Update</span>
                  </button>

                  <button
                    className="btn btn-outline"
                    style={{ justifyContent: 'flex-start', padding: '0.6rem 0.85rem' }}
                    onClick={handleOpenAddContent}
                  >
                    <Plus size={16} color="var(--color-primary-forest)" />
                    <span>Create Practice Snippet</span>
                  </button>

                  <button
                    className="btn btn-outline"
                    style={{ justifyContent: 'flex-start', padding: '0.6rem 0.85rem' }}
                    onClick={() => setShowBulkModal(true)}
                  >
                    <Upload size={16} color="#0284c7" />
                    <span>Bulk Import Library JSON</span>
                  </button>

                  <button
                    className="btn btn-outline"
                    style={{ justifyContent: 'flex-start', padding: '0.6rem 0.85rem' }}
                    onClick={handleExportLibrary}
                  >
                    <Download size={16} color="#0284c7" />
                    <span>Export Content Backup</span>
                  </button>

                  <button
                    className="btn btn-outline"
                    style={{ justifyContent: 'flex-start', padding: '0.6rem 0.85rem' }}
                    onClick={() => {
                      setActiveTab('feedback');
                      loadFeedback();
                    }}
                  >
                    <MessageSquare size={16} color="#EC4899" />
                    <span>User Inquiries ({feedbackCounts.pending} pending)</span>
                  </button>
                </div>
              </div>

              {/* Recent Security & Audit Trail Feed */}
              <div className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <h4 style={{ margin: 0, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Activity size={18} color="var(--color-primary-forest)" />
                    <span>Security Audit Stream</span>
                  </h4>
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: '0.75rem', padding: '0.2rem 0.4rem', color: 'var(--color-primary-forest)' }}
                    onClick={() => setActiveTab('audit')}
                  >
                    All Logs &rarr;
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {auditLogs.slice(0, 5).map((log) => (
                    <div
                      key={log.id}
                      style={{
                        padding: '0.65rem 0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--color-bg-subtle)',
                        border: '1px solid var(--color-border-subtle)',
                        fontSize: '0.8rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
                          {log.admin_username || 'Admin'}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                          {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span className="badge badge-sage" style={{ fontSize: '0.675rem', padding: '0.1rem 0.35rem' }}>
                          {log.action}
                        </span>
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {log.target_type || 'System'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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

          {/* Discord & Slack Webhook Integrations */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Radio size={22} color="var(--color-primary-forest)" />
                <div>
                  <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Real-Time Webhooks (Discord &amp; Slack)</h2>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', margin: '0.2rem 0 0' }}>
                    Stream immediate operational notifications when certificates are issued, bugs are reported, or new typists subscribe.
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className={`admin-webhook-status-badge ${webhookConfig.discordUrl || webhookConfig.slackUrl ? 'active' : 'inactive'}`}>
                  {webhookConfig.discordUrl || webhookConfig.slackUrl ? '● Channels Connected' : '○ Webhooks Inactive'}
                </span>
              </div>
            </div>

            <form onSubmit={handleSaveWebhookConfig} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Dual Channel Cards Grid */}
              <div className="admin-webhook-grid">
                {/* Discord Webhook Card */}
                <div className="admin-webhook-channel-card discord">
                  <div className="admin-webhook-header">
                    <div className="admin-webhook-brand">
                      <div className="admin-webhook-icon-wrap discord">
                        <MessageSquare size={20} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '1rem' }}>Discord Webhook</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Rich Embedded Cards</div>
                      </div>
                    </div>
                    <span className={`admin-webhook-status-badge ${webhookConfig.discordUrl ? 'active' : 'inactive'}`}>
                      {webhookConfig.discordUrl ? 'Active' : 'Unset'}
                    </span>
                  </div>

                  <div>
                    <label className="input-label" htmlFor="discord-webhook-url">Discord Webhook URL</label>
                    <input
                      id="discord-webhook-url"
                      type="url"
                      className="input"
                      placeholder="https://discord.com/api/webhooks/123456789/abcdef..."
                      value={webhookConfig.discordUrl}
                      onChange={(e) => setWebhookConfig({ ...webhookConfig, discordUrl: e.target.value })}
                      style={{ fontSize: '0.875rem', fontFamily: 'monospace' }}
                    />
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block', marginTop: '0.35rem' }}>
                      Server Settings &rarr; Integrations &rarr; Webhooks &rarr; New Webhook &rarr; Copy Webhook URL
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 'auto' }}>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => handleTestWebhook('discord')}
                      disabled={testingDiscord || !webhookConfig.discordUrl}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    >
                      <Zap size={14} color="#5865f2" />
                      <span>{testingDiscord ? 'Pinging Discord...' : 'Test Discord Webhook'}</span>
                    </button>
                  </div>
                </div>

                {/* Slack Webhook Card */}
                <div className="admin-webhook-channel-card slack">
                  <div className="admin-webhook-header">
                    <div className="admin-webhook-brand">
                      <div className="admin-webhook-icon-wrap slack">
                        <Radio size={20} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '1rem' }}>Slack Webhook</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Block Kit Formatted Feeds</div>
                      </div>
                    </div>
                    <span className={`admin-webhook-status-badge ${webhookConfig.slackUrl ? 'active' : 'inactive'}`}>
                      {webhookConfig.slackUrl ? 'Active' : 'Unset'}
                    </span>
                  </div>

                  <div>
                    <label className="input-label" htmlFor="slack-webhook-url">Slack Incoming Webhook URL</label>
                    <input
                      id="slack-webhook-url"
                      type="url"
                      className="input"
                      placeholder="https://hooks.slack.com/services/your/webhook/url"
                      value={webhookConfig.slackUrl}
                      onChange={(e) => setWebhookConfig({ ...webhookConfig, slackUrl: e.target.value })}
                      style={{ fontSize: '0.875rem', fontFamily: 'monospace' }}
                    />
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block', marginTop: '0.35rem' }}>
                      api.slack.com/apps &rarr; Incoming Webhooks &rarr; Activate &rarr; Add New Webhook to Workspace
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 'auto' }}>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => handleTestWebhook('slack')}
                      disabled={testingSlack || !webhookConfig.slackUrl}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    >
                      <Zap size={14} color="#e01e5a" />
                      <span>{testingSlack ? 'Pinging Slack...' : 'Test Slack Webhook'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Event Notification Routing Matrix */}
              <div>
                <label className="input-label" style={{ marginBottom: '0.35rem' }}>
                  Event Notification Routing Matrix
                </label>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.825rem', margin: '0 0 0.75rem' }}>
                  Select which platform activities trigger instant webhooks to your connected Discord and Slack channels.
                </p>

                <div className="admin-webhook-event-grid">
                  <div
                    className={`admin-webhook-event-toggle ${webhookConfig.events.certIssued ? 'selected' : ''}`}
                    onClick={() => setWebhookConfig({
                      ...webhookConfig,
                      events: { ...webhookConfig.events, certIssued: !webhookConfig.events.certIssued }
                    })}
                  >
                    <input
                      type="checkbox"
                      checked={webhookConfig.events.certIssued}
                      onChange={() => {}}
                      style={{ marginTop: '0.2rem', cursor: 'pointer' }}
                    />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>🏆 Accredited Certificate Issued</div>
                      <div style={{ fontSize: '0.775rem', color: 'var(--color-text-muted)' }}>
                        Celebratory alert with recipient, Net WPM, accuracy, and tamper-proof verification link.
                      </div>
                    </div>
                  </div>

                  <div
                    className={`admin-webhook-event-toggle ${webhookConfig.events.feedbackSubmitted ? 'selected' : ''}`}
                    onClick={() => setWebhookConfig({
                      ...webhookConfig,
                      events: { ...webhookConfig.events, feedbackSubmitted: !webhookConfig.events.feedbackSubmitted }
                    })}
                  >
                    <input
                      type="checkbox"
                      checked={webhookConfig.events.feedbackSubmitted}
                      onChange={() => {}}
                      style={{ marginTop: '0.2rem', cursor: 'pointer' }}
                    />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>🚨 Bug Report &amp; Support Ticket</div>
                      <div style={{ fontSize: '0.775rem', color: 'var(--color-text-muted)' }}>
                        Immediate triage card with issue category, reporter details, and message excerpt.
                      </div>
                    </div>
                  </div>

                  <div
                    className={`admin-webhook-event-toggle ${webhookConfig.events.subscriberJoined ? 'selected' : ''}`}
                    onClick={() => setWebhookConfig({
                      ...webhookConfig,
                      events: { ...webhookConfig.events, subscriberJoined: !webhookConfig.events.subscriberJoined }
                    })}
                  >
                    <input
                      type="checkbox"
                      checked={webhookConfig.events.subscriberJoined}
                      onChange={() => {}}
                      style={{ marginTop: '0.2rem', cursor: 'pointer' }}
                    />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>📬 Developer Digest Subscriber</div>
                      <div style={{ fontSize: '0.775rem', color: 'var(--color-text-muted)' }}>
                        Notification whenever a new developer signs up for newsletter and snippet updates.
                      </div>
                    </div>
                  </div>

                  <div
                    className={`admin-webhook-event-toggle ${webhookConfig.events.securityAlert ? 'selected' : ''}`}
                    onClick={() => setWebhookConfig({
                      ...webhookConfig,
                      events: { ...webhookConfig.events, securityAlert: !webhookConfig.events.securityAlert }
                    })}
                  >
                    <input
                      type="checkbox"
                      checked={webhookConfig.events.securityAlert}
                      onChange={() => {}}
                      style={{ marginTop: '0.2rem', cursor: 'pointer' }}
                    />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>🛡️ Governance &amp; Anti-Cheat Alert</div>
                      <div style={{ fontSize: '0.775rem', color: 'var(--color-text-muted)' }}>
                        Triggered upon account suspensions, disqualified scores, or bot detections.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="submit" className="btn btn-primary" disabled={savingWebhooks}>
                  {savingWebhooks ? 'Saving Webhooks...' : 'Save Webhook Configuration'}
                </button>
              </div>
            </form>

            {/* Live Webhook Outbox & Delivery Stream */}
            <div style={{ marginTop: '2rem', borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Activity size={18} color="var(--color-primary-forest)" />
                  <h3 style={{ fontSize: '1.05rem', margin: 0 }}>Recent Webhook Outbox &amp; Delivery Stream</h3>
                </div>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={async () => {
                    const logsRes = await api.admin.getWebhookLogs().catch(() => null);
                    if (logsRes?.logs) setWebhookLogs(logsRes.logs);
                    toast.info('Webhook logs refreshed.');
                  }}
                >
                  <RefreshCw size={14} />
                  <span>Refresh Stream</span>
                </button>
              </div>

              {webhookLogs.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)', background: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                  No webhooks dispatched yet. Send a test alert above to verify delivery.
                </div>
              ) : (
                <div style={{ overflowX: 'auto', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                  <table className="admin-webhook-logs-table">
                    <thead>
                      <tr>
                        <th>Time</th>
                        <th>Channel</th>
                        <th>Event</th>
                        <th>HTTP Status</th>
                        <th>Payload Summary</th>
                      </tr>
                    </thead>
                    <tbody>
                      {webhookLogs.slice(0, 15).map((log) => (
                        <tr key={log.id}>
                          <td style={{ whiteSpace: 'nowrap', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                            {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </td>
                          <td>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              fontWeight: 700,
                              fontSize: '0.75rem',
                              padding: '0.2rem 0.55rem',
                              borderRadius: '4px',
                              background: log.service === 'discord' ? 'rgba(88, 101, 242, 0.15)' : 'rgba(224, 30, 90, 0.15)',
                              color: log.service === 'discord' ? '#5865f2' : '#e01e5a'
                            }}>
                              {log.service.toUpperCase()}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontSize: '0.8rem', fontWeight: 600, fontFamily: 'monospace' }}>
                              {log.event_type}
                            </span>
                          </td>
                          <td>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              fontSize: '0.775rem',
                              fontWeight: 600,
                              color: log.status === 'success' ? '#10b981' : '#f43f5e'
                            }}>
                              {log.status === 'success' ? `● ${log.status_code || 200} OK` : `✕ ${log.error_message || 'Failed'}`}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.825rem', color: 'var(--color-text-secondary)', maxWidth: '350px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {log.payload_summary || 'Diagnostic Ping'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
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
      {/* TAB 6: CERTIFICATES GOVERNANCE & VERIFICATION REGISTRY */}
      {/* ========================================================================= */}
      {activeTab === 'certificates' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Certificate Overview Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="stat-card">
              <span className="stat-label">Accredited Typists</span>
              <div className="stat-value" style={{ color: '#0284c7' }}>{certSummary.total}</div>
              <span className="stat-subtext">Official issued credentials</span>
            </div>

            <div className="stat-card">
              <span className="stat-label">Active &amp; Valid Standing</span>
              <div className="stat-value" style={{ color: 'var(--color-primary-forest)' }}>{certSummary.active}</div>
              <span className="stat-subtext">Passes cryptographic audit</span>
            </div>

            <div className="stat-card">
              <span className="stat-label">Revoked Credentials</span>
              <div className="stat-value" style={{ color: certSummary.revoked > 0 ? 'var(--color-error)' : 'inherit' }}>
                {certSummary.revoked}
              </div>
              <span className="stat-subtext">Flagged / invalidated by admin</span>
            </div>

            <div className="stat-card">
              <span className="stat-label">Peak Velocity Certified</span>
              <div className="stat-value" style={{ color: '#ca8a04' }}>{certSummary.highestWpm} <span style={{ fontSize: '1rem' }}>WPM</span></div>
              <span className="stat-subtext">Highest verified typing speed</span>
            </div>
          </div>

          {/* Controls Bar & Quick Verifier */}
          <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              {/* Filter Tabs */}
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                <button
                  className={`btn btn-sm ${certFilter === 'all' ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => {
                    setCertFilter('all');
                    loadCertificates('all', certSearch);
                  }}
                >
                  All ({certSummary.total})
                </button>
                <button
                  className={`btn btn-sm ${certFilter === 'active' ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => {
                    setCertFilter('active');
                    loadCertificates('active', certSearch);
                  }}
                >
                  Active Valid ({certSummary.active})
                </button>
                <button
                  className={`btn btn-sm ${certFilter === 'revoked' ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => {
                    setCertFilter('revoked');
                    loadCertificates('revoked', certSearch);
                  }}
                >
                  Revoked ({certSummary.revoked})
                </button>
              </div>

              {/* Direct Quick Serial Lookup */}
              <form onSubmit={handleQuickLookup} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1 1 320px', maxWidth: '420px' }}>
                <div style={{ position: 'relative', width: '100%' }}>
                  <Search size={15} color="var(--color-text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    className="input"
                    style={{ paddingLeft: '2.25rem', fontSize: '0.85rem' }}
                    placeholder="Search Cert ID (CT-2026-...), name, fingerprint..."
                    value={certSearch}
                    onChange={(e) => {
                      setCertSearch(e.target.value);
                      loadCertificates(certFilter, e.target.value);
                    }}
                  />
                </div>
                {certSearch && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => {
                      setCertSearch('');
                      loadCertificates(certFilter, '');
                    }}
                    title="Clear filter"
                  >
                    <X size={15} />
                  </button>
                )}
              </form>
            </div>
          </div>

          {/* Certificates Table */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                <Award size={18} color="var(--color-primary-forest)" />
                <span>Accredited Certificate Ledger ({certificatesList.length} records)</span>
              </div>
              <button className="btn btn-outline btn-sm" onClick={() => loadCertificates()} title="Refresh list">
                <RefreshCw size={14} />
                <span>Refresh</span>
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', backgroundColor: 'var(--color-bg-subtle)' }}>
                    <th style={{ padding: '0.75rem 1.25rem' }}>Certificate Serial</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Accredited Typist</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Velocity &amp; Accuracy</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Tier &amp; Discipline</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Issued Date</th>
                    <th style={{ padding: '0.75rem 1.25rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {certificatesList.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                        <Award size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
                        <p style={{ margin: 0, fontWeight: 500 }}>No certificates found in the registry.</p>
                      </td>
                    </tr>
                  ) : (
                    certificatesList.map((c) => {
                      const isRevoked = Boolean(c.is_revoked);
                      return (
                        <tr key={c.id || c.cert_id} style={{ borderBottom: '1px solid var(--color-border-subtle)', backgroundColor: isRevoked ? 'rgba(239, 68, 68, 0.03)' : 'transparent' }}>
                          <td style={{ padding: '0.75rem 1.25rem', whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.85rem', color: isRevoked ? 'var(--color-error)' : 'var(--color-primary-forest)' }}>
                                {c.cert_id}
                              </span>
                              <button
                                className="btn btn-ghost btn-sm"
                                style={{ padding: '0.2rem', minWidth: 'auto', height: 'auto' }}
                                onClick={() => {
                                  navigator.clipboard.writeText(c.cert_id);
                                  toast.success(`Copied ${c.cert_id}`);
                                }}
                                title="Copy Serial"
                              >
                                <Copy size={13} />
                              </button>
                            </div>
                          </td>

                          <td style={{ padding: '0.75rem 1rem' }}>
                            <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{c.recipient_name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                              {c.username ? `@${c.username}` : (c.user_email || 'Unregistered')}
                            </div>
                          </td>

                          <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>
                            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                              {c.net_wpm} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--color-text-muted)' }}>WPM</span>
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                              {c.accuracy}% acc • {c.duration_seconds || 60}s drill
                            </div>
                          </td>

                          <td style={{ padding: '0.75rem 1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                              <span className="badge badge-sage" style={{ fontSize: '0.75rem' }}>
                                {c.tier_badge || c.tier_title || 'Certified'}
                              </span>
                              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                                {c.tier_grade || 'Grade A'}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {c.discipline}
                            </div>
                          </td>

                          <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>
                            {isRevoked ? (
                              <span className="badge" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: 'var(--color-error)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem' }} title={c.revoked_reason || 'Revoked by admin'}>
                                <ShieldOff size={13} />
                                <span>Revoked</span>
                              </span>
                            ) : (
                              <span className="badge badge-sage" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem' }}>
                                <CheckCircle2 size={13} />
                                <span>Active</span>
                              </span>
                            )}
                          </td>

                          <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', fontSize: '0.8rem' }}>
                            {new Date(c.issued_at || c.created_at).toLocaleDateString()}
                          </td>

                          <td style={{ padding: '0.75rem 1.25rem', textAlign: 'right' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.35rem' }}>
                              <button
                                className="btn btn-ghost btn-sm"
                                onClick={() => setPreviewCert(c)}
                                title="Inspect Full Official Certificate"
                              >
                                <Eye size={15} />
                              </button>

                              <button
                                className="btn btn-ghost btn-sm"
                                onClick={() => window.open(`/verify/${c.cert_id}`, '_blank')}
                                title="Open Public Verifier URL"
                              >
                                <ExternalLink size={15} />
                              </button>

                              <button
                                className="btn btn-ghost btn-sm"
                                onClick={() => handleOpenRevokeModal(c)}
                                title={isRevoked ? 'Reinstate Certificate' : 'Revoke / Invalidate Certificate'}
                                style={{ color: isRevoked ? 'var(--color-primary-forest)' : 'var(--color-error)' }}
                              >
                                {isRevoked ? <RotateCcw size={15} /> : <ShieldAlert size={15} />}
                              </button>

                              <button
                                className="btn btn-ghost btn-sm"
                                onClick={() => handleDeleteCertificate(c)}
                                style={{ color: 'var(--color-error)' }}
                                title="Permanently Purge Record"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: USER FEEDBACK, TYPO REPORTS & INQUIRIES */}
      {/* ========================================================================= */}
      {activeTab === 'feedback' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Feedback Filter Bar */}
          <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              {/* Status Filter Tabs */}
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <button
                  className={`btn btn-sm ${feedbackFilter === 'all' ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => {
                    setFeedbackFilter('all');
                    loadFeedback('all', feedbackCategory, feedbackSearch);
                  }}
                >
                  All ({feedbackCounts.total})
                </button>
                <button
                  className={`btn btn-sm ${feedbackFilter === 'pending' ? 'btn-primary' : 'btn-ghost'}`}
                  style={feedbackCounts.pending > 0 && feedbackFilter !== 'pending' ? { borderColor: '#D97706', color: '#D97706' } : {}}
                  onClick={() => {
                    setFeedbackFilter('pending');
                    loadFeedback('pending', feedbackCategory, feedbackSearch);
                  }}
                >
                  Pending Review ({feedbackCounts.pending})
                </button>
                <button
                  className={`btn btn-sm ${feedbackFilter === 'featured' ? 'btn-primary' : 'btn-ghost'}`}
                  style={feedbackFilter === 'featured'
                    ? { backgroundColor: '#eab308', color: '#000', borderColor: '#eab308' }
                    : { borderColor: 'rgba(234, 179, 8, 0.4)', color: '#ca8a04' }}
                  onClick={() => {
                    setFeedbackFilter('featured');
                    loadFeedback('featured', feedbackCategory, feedbackSearch);
                  }}
                  title="Filter to testimonials currently visible on the public website"
                >
                  <Star size={13} fill={feedbackFilter === 'featured' ? '#000' : '#ca8a04'} />
                  <span>Featured on Website ({feedbackCounts.featured || 0})</span>
                </button>
                <button
                  className={`btn btn-sm ${feedbackFilter === 'in_review' ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => {
                    setFeedbackFilter('in_review');
                    loadFeedback('in_review', feedbackCategory, feedbackSearch);
                  }}
                >
                  In Review ({feedbackCounts.inReview})
                </button>
                <button
                  className={`btn btn-sm ${feedbackFilter === 'resolved' ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => {
                    setFeedbackFilter('resolved');
                    loadFeedback('resolved', feedbackCategory, feedbackSearch);
                  }}
                >
                  Resolved ({feedbackCounts.resolved})
                </button>
                <button
                  className={`btn btn-sm ${feedbackFilter === 'archived' ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => {
                    setFeedbackFilter('archived');
                    loadFeedback('archived', feedbackCategory, feedbackSearch);
                  }}
                >
                  Archived ({feedbackCounts.archived})
                </button>
              </div>

              {/* Category Filter & Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Filter size={15} color="var(--color-text-muted)" />
                  <select
                    className="input"
                    style={{ fontSize: '0.85rem', padding: '0.35rem 0.65rem', height: 'auto' }}
                    value={feedbackCategory}
                    onChange={(e) => {
                      setFeedbackCategory(e.target.value);
                      loadFeedback(feedbackFilter, e.target.value, feedbackSearch);
                    }}
                  >
                    <option value="all">All Categories</option>
                    <option value="feedback">💡 Feedback &amp; Ideas</option>
                    <option value="bug_report">🐛 Bug Reports</option>
                    <option value="typo">🔤 Typo in Snippet</option>
                    <option value="snippet_suggestion">📝 Snippet Requests</option>
                    <option value="account">❓ Account Inquiries</option>
                    <option value="other">💬 Other</option>
                  </select>
                </div>

                {/* Search */}
                <div style={{ position: 'relative', width: '200px' }}>
                  <Search size={14} color="var(--color-text-muted)" style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    className="input"
                    style={{ paddingLeft: '2rem', fontSize: '0.85rem', padding: '0.35rem 0.5rem 0.35rem 2rem', height: 'auto' }}
                    placeholder="Search feedback..."
                    value={feedbackSearch}
                    onChange={(e) => {
                      setFeedbackSearch(e.target.value);
                      loadFeedback(feedbackFilter, feedbackCategory, e.target.value);
                    }}
                  />
                </div>

                {/* Add Testimonial Button */}
                <button
                  className="btn btn-primary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', whiteSpace: 'nowrap' }}
                  onClick={() => setShowAddTestimonialModal(true)}
                  title="Manually create a new review or testimonial to feature"
                >
                  <Plus size={15} />
                  <span>Add Testimonial</span>
                </button>
              </div>
            </div>
          </div>

          {/* Feedback Items List */}
          {feedbackList.length === 0 ? (
            <div className="card" style={{ padding: '3.5rem 2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              <Inbox size={42} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No User Feedback / Reports Found</h3>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>
                There are currently no inquiries matching your active filters.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {feedbackList.map((item) => {
                const isResolved = item.status === 'resolved';
                const isPending = item.status === 'pending';
                const isFeatured = Boolean(item.is_featured);
                const ratingCount = Math.max(1, Math.min(5, Number(item.rating) || 5));

                // Category styling
                let catBadge = { label: 'Feedback', color: 'var(--color-primary-forest)', bg: 'rgba(35, 107, 77, 0.12)' };
                if (item.category === 'bug_report') {
                  catBadge = { label: 'Bug Report', color: 'var(--color-error)', bg: 'rgba(239, 68, 68, 0.12)' };
                } else if (item.category === 'typo') {
                  catBadge = { label: 'Typo Report', color: '#D97706', bg: 'rgba(217, 119, 6, 0.12)' };
                } else if (item.category === 'snippet_suggestion') {
                  catBadge = { label: 'Snippet Request', color: '#0284c7', bg: 'rgba(2, 132, 199, 0.12)' };
                } else if (item.category === 'account') {
                  catBadge = { label: 'Account Inquiry', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.12)' };
                }

                return (
                  <div
                    key={item.id}
                    className="card"
                    style={{
                      padding: '1.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem',
                      borderLeft: isFeatured
                        ? '3px solid #eab308'
                        : isPending
                        ? '3px solid #D97706'
                        : isResolved
                        ? '3px solid var(--color-primary-forest)'
                        : '1px solid var(--color-border)'
                    }}
                  >
                    {/* Header Row */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                        <span style={{
                          backgroundColor: catBadge.bg,
                          color: catBadge.color,
                          padding: '0.2rem 0.6rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem',
                          fontWeight: 700
                        }}>
                          {catBadge.label}
                        </span>

                        {/* Featured on Website Badge */}
                        {isFeatured ? (
                          <span style={{
                            backgroundColor: 'rgba(234, 179, 8, 0.15)',
                            color: '#ca8a04',
                            border: '1px solid rgba(234, 179, 8, 0.4)',
                            padding: '0.2rem 0.6rem',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem'
                          }}>
                            <Star size={12} fill="#ca8a04" /> Featured on Website
                          </span>
                        ) : (
                          <span style={{
                            fontSize: '0.75rem',
                            color: 'var(--color-text-muted)',
                            padding: '0.2rem 0.5rem',
                            backgroundColor: 'var(--color-bg-subtle)',
                            borderRadius: 'var(--radius-sm)'
                          }}>
                            Not on Website
                          </span>
                        )}

                        {/* Interactive Quick Star Rating */}
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.2rem',
                            backgroundColor: 'var(--color-bg-subtle)',
                            padding: '0.2rem 0.5rem',
                            borderRadius: 'var(--radius-sm)'
                          }}
                          title="Click any star to adjust this rating"
                        >
                          {[1, 2, 3, 4, 5].map((starVal) => (
                            <button
                              key={starVal}
                              type="button"
                              onClick={() => handleQuickRateFeedback(item, starVal)}
                              style={{
                                background: 'none',
                                border: 'none',
                                padding: '0 1px',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center'
                              }}
                              title={`Set rating to ${starVal} Star${starVal > 1 ? 's' : ''}`}
                            >
                              <Star
                                size={14}
                                fill={starVal <= ratingCount ? '#eab308' : 'none'}
                                color={starVal <= ratingCount ? '#eab308' : 'var(--color-border)'}
                              />
                            </button>
                          ))}
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#eab308', marginLeft: '0.25rem' }}>
                            {ratingCount}.0
                          </span>
                        </div>

                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                          #{item.id} • {new Date(item.created_at).toLocaleString()}
                        </span>
                      </div>

                      {/* Status Selector Dropdown */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Status:</span>
                        <select
                          className="input"
                          style={{
                            fontSize: '0.8rem',
                            padding: '0.25rem 0.5rem',
                            height: 'auto',
                            fontWeight: 600,
                            color: isPending ? '#D97706' : isResolved ? 'var(--color-primary-forest)' : 'inherit'
                          }}
                          value={item.status}
                          onChange={(e) => handleUpdateFeedbackStatus(item, e.target.value)}
                        >
                          <option value="pending">⏳ Pending Review</option>
                          <option value="in_review">🔍 In Review</option>
                          <option value="resolved">✔ Resolved</option>
                          <option value="archived">📁 Archived</option>
                        </select>
                      </div>
                    </div>

                    {/* Sender Identity & Role */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.45rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '1rem' }}>{item.name}</span>
                        {item.display_role && (
                          <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                            • {item.display_role}
                          </span>
                        )}
                        <a
                          href={`mailto:${item.email}?subject=Re: [CodeTyper] ${encodeURIComponent(item.subject)}`}
                          style={{ fontSize: '0.85rem', color: 'var(--color-primary-forest)', textDecoration: 'none', marginLeft: '0.25rem' }}
                          title="Click to write email"
                        >
                          &lt;{item.email}&gt;
                        </a>
                        {item.user_username && (
                          <span className="badge badge-sage" style={{ fontSize: '0.7rem' }}>
                            @{item.user_username}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Subject & Message Content */}
                    <div>
                      <h4 style={{ margin: '0 0 0.5rem', fontSize: '1.05rem', fontWeight: 600 }}>{item.subject}</h4>
                      <div style={{
                        padding: '1rem',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--color-bg-subtle)',
                        fontSize: '0.9rem',
                        lineHeight: 1.6,
                        whiteSpace: 'pre-wrap',
                        color: 'var(--color-text-primary)',
                        fontStyle: isFeatured ? 'italic' : 'normal'
                      }}>
                        &quot;{item.message}&quot;
                      </div>
                    </div>

                    {/* Admin Internal Notepad Section */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', borderTop: '1px solid var(--color-border-subtle)', paddingTop: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                          Maintainer Internal Notes:
                        </span>
                        {editingNotesId !== item.id && (
                          <button
                            className="btn btn-ghost btn-sm"
                            style={{ fontSize: '0.75rem', padding: '0.15rem 0.45rem' }}
                            onClick={() => {
                              setEditingNotesId(item.id);
                              setAdminNotesText(item.admin_notes || '');
                            }}
                          >
                            <Edit size={12} />
                            <span>{item.admin_notes ? 'Edit Note' : 'Add Note'}</span>
                          </button>
                        )}
                      </div>

                      {editingNotesId === item.id ? (
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                          <input
                            type="text"
                            className="input"
                            style={{ fontSize: '0.85rem', flex: 1 }}
                            placeholder="Add internal resolution note (e.g. Verified and approved for landing page)"
                            value={adminNotesText}
                            onChange={(e) => setAdminNotesText(e.target.value)}
                          />
                          <button className="btn btn-primary btn-sm" onClick={() => handleSaveAdminNotes(item)}>
                            <Check size={14} />
                            <span>Save</span>
                          </button>
                          <button className="btn btn-ghost btn-sm" onClick={() => setEditingNotesId(null)}>
                            <X size={14} />
                          </button>
                        </div>
                      ) : item.admin_notes ? (
                        <p style={{ margin: 0, fontSize: '0.825rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                          📌 &quot;{item.admin_notes}&quot;
                        </p>
                      ) : (
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                          No maintainer notes attached yet.
                        </p>
                      )}
                    </div>

                    {/* Footer Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', borderTop: '1px solid var(--color-border-subtle)', paddingTop: '0.75rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        {/* 1-Click Feature on Website Toggle */}
                        <button
                          className={`btn btn-sm ${isFeatured ? 'btn-outline' : 'btn-primary'}`}
                          style={isFeatured
                            ? { borderColor: '#ca8a04', color: '#ca8a04', fontWeight: 600 }
                            : { backgroundColor: '#eab308', color: '#000', borderColor: '#eab308', fontWeight: 600 }}
                          onClick={() => handleToggleFeedbackFeatured(item)}
                          title={isFeatured
                            ? 'Remove this review from the public website landing page'
                            : 'Promote this comment as a verified public testimonial on the website landing page'}
                        >
                          <Star size={13} fill={isFeatured ? 'none' : '#000'} />
                          <span>{isFeatured ? 'Remove from Website' : '⭐ Show on Website'}</span>
                        </button>

                        {/* Edit Feedback Details Modal Button */}
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                          onClick={() => openEditFeedbackModal(item)}
                          title="Edit author name, role headline, rating, or review text"
                        >
                          <Edit size={13} />
                          <span>Edit Details &amp; Rating</span>
                        </button>

                        <a
                          href={`mailto:${item.email}?subject=Re: [CodeTyper] ${encodeURIComponent(item.subject)}`}
                          className="btn btn-outline btn-sm"
                          title="Open mail client"
                        >
                          <Mail size={13} />
                          <span>Reply</span>
                        </a>

                        {item.status !== 'resolved' ? (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleUpdateFeedbackStatus(item, 'resolved')}
                            title="Resolves issue and automatically emails the user"
                          >
                            <Send size={13} />
                            <span>Resolve &amp; Email</span>
                          </button>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span className="badge badge-sage" style={{ fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                              <CheckCircle2 size={12} /> Resolved
                            </span>
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => handleUpdateFeedbackStatus(item, 'pending')}
                              title="Re-open report"
                            >
                              <RotateCcw size={12} />
                            </button>
                          </div>
                        )}
                      </div>

                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ color: 'var(--color-error)' }}
                        onClick={() => handleDeleteFeedback(item)}
                        title="Delete Note"
                      >
                        <Trash2 size={14} />
                        <span>Delete Note</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 8: NEWSLETTER SUBSCRIBERS & AUTOMATED MAILER HUB */}
      {/* ========================================================================= */}
      {activeTab === 'subscribers' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Header Panel */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ margin: '0 0 0.4rem', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Mail size={20} color="var(--color-primary-forest)" />
                  <span>Developer Digest Subscribers &amp; Email Automation</span>
                </h3>
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                  Active typists subscribed via footer newsletter, automated issue resolution notifications, and platform release broadcasts.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setShowBroadcastModal(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Sparkles size={15} />
                  <span>Broadcast New Update ({subscriberCounts.active})</span>
                </button>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    loadSubscribers();
                    loadEmailLogs();
                    loadAdminData();
                    toast.info('Refreshed subscriber & mailer records.');
                  }}
                >
                  <RefreshCw size={14} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {/* Sub-View Switcher: Subscribers vs Outbox */}
            <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--color-border-subtle)', marginTop: '1.25rem', paddingTop: '1rem' }}>
              <button
                className={`btn btn-sm ${subscribersViewMode === 'subscribers' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setSubscribersViewMode('subscribers')}
              >
                <Users size={15} />
                <span>Active Subscribers ({subscriberCounts.active})</span>
              </button>
              <button
                className={`btn btn-sm ${subscribersViewMode === 'outbox' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setSubscribersViewMode('outbox')}
              >
                <Send size={15} />
                <span>Automated Email Outbox &amp; Logs ({emailStats.total})</span>
              </button>
            </div>
          </div>

          {/* VIEW A: SUBSCRIBERS LIST */}
          {subscribersViewMode === 'subscribers' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Search & Filter Bar */}
              <div className="card" style={{ padding: '1rem 1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    <button
                      className={`btn btn-sm ${subscriberFilter === 'all' ? 'btn-primary' : 'btn-ghost'}`}
                      onClick={() => {
                        setSubscriberFilter('all');
                        loadSubscribers('all', subscriberSearch);
                      }}
                    >
                      All ({subscriberCounts.total})
                    </button>
                    <button
                      className={`btn btn-sm ${subscriberFilter === 'active' ? 'btn-primary' : 'btn-ghost'}`}
                      onClick={() => {
                        setSubscriberFilter('active');
                        loadSubscribers('active', subscriberSearch);
                      }}
                    >
                      Active ({subscriberCounts.active})
                    </button>
                    <button
                      className={`btn btn-sm ${subscriberFilter === 'unsubscribed' ? 'btn-primary' : 'btn-ghost'}`}
                      onClick={() => {
                        setSubscriberFilter('unsubscribed');
                        loadSubscribers('unsubscribed', subscriberSearch);
                      }}
                    >
                      Unsubscribed ({subscriberCounts.unsubscribed})
                    </button>
                  </div>

                  <div style={{ position: 'relative', width: '260px' }}>
                    <Search size={14} color="var(--color-text-muted)" style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="text"
                      className="input"
                      style={{ paddingLeft: '2rem', fontSize: '0.85rem', padding: '0.35rem 0.5rem 0.35rem 2rem', height: 'auto' }}
                      placeholder="Search subscriber email..."
                      value={subscriberSearch}
                      onChange={(e) => {
                        setSubscriberSearch(e.target.value);
                        loadSubscribers(subscriberFilter, e.target.value);
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Subscribers Table */}
              <div className="card" style={{ padding: '0', overflowX: 'auto' }}>
                <table className="table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-subtle)' }}>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Subscriber Email</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Source</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Status</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Subscribed On</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscribersList.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                          <Mail size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.35 }} />
                          <div>No newsletter subscribers found.</div>
                        </td>
                      </tr>
                    ) : (
                      subscribersList.map((sub) => {
                        const isActive = sub.status === 'active';
                        return (
                          <tr key={sub.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                            <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Mail size={14} color="var(--color-primary-forest)" />
                                <span>{sub.email}</span>
                              </div>
                            </td>
                            <td style={{ padding: '0.75rem 1rem' }}>
                              <span className="badge badge-subtle" style={{ fontSize: '0.75rem', textTransform: 'capitalize' }}>
                                {sub.source || 'footer'}
                              </span>
                            </td>
                            <td style={{ padding: '0.75rem 1rem' }}>
                              <span
                                style={{
                                  backgroundColor: isActive ? 'rgba(35, 107, 77, 0.12)' : 'rgba(156, 163, 175, 0.15)',
                                  color: isActive ? 'var(--color-primary-forest)' : 'var(--color-text-muted)',
                                  padding: '0.2rem 0.55rem',
                                  borderRadius: 'var(--radius-sm)',
                                  fontSize: '0.75rem',
                                  fontWeight: 700
                                }}
                              >
                                {isActive ? 'Active Typist' : 'Unsubscribed'}
                              </span>
                            </td>
                            <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-muted)' }}>
                              {new Date(sub.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                            </td>
                            <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                              <button
                                className="btn btn-ghost btn-sm"
                                style={{ color: 'var(--color-error)', padding: '0.2rem 0.5rem' }}
                                onClick={() => handleDeleteSubscriber(sub)}
                                title="Remove subscriber"
                              >
                                <Trash2 size={13} />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW B: EMAIL OUTBOX & LOGS */}
          {subscribersViewMode === 'outbox' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Outbox Metrics Strip */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                <div className="card" style={{ padding: '1rem' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Total Emails Dispatched</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{emailStats.total}</div>
                </div>
                <div className="card" style={{ padding: '1rem' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Delivered via SMTP</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-primary-forest)' }}>{emailStats.sent}</div>
                </div>
                <div className="card" style={{ padding: '1rem' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Simulated (Local / Dev)</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0284c7' }}>{emailStats.simulated}</div>
                </div>
                <div className="card" style={{ padding: '1rem' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Failed Attempts</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: emailStats.failed > 0 ? 'var(--color-error)' : 'inherit' }}>{emailStats.failed}</div>
                </div>
              </div>

              {/* Email Outbox Table */}
              <div className="card" style={{ padding: '0', overflowX: 'auto' }}>
                <table className="table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-subtle)' }}>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Recipient</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Type</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Subject &amp; Preview</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Status</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Sent At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {emailLogs.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                          <Send size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.35 }} />
                          <div>No automated emails recorded yet.</div>
                        </td>
                      </tr>
                    ) : (
                      emailLogs.map((log) => {
                        let typeBadge = { label: 'System', color: '#6B7280', bg: 'rgba(107, 114, 128, 0.12)' };
                        if (log.email_type === 'feedback_resolved') {
                          typeBadge = { label: 'Issue Resolved', color: 'var(--color-primary-forest)', bg: 'rgba(35, 107, 77, 0.12)' };
                        } else if (log.email_type === 'newsletter_welcome') {
                          typeBadge = { label: 'Welcome Digest', color: '#0284c7', bg: 'rgba(2, 132, 199, 0.12)' };
                        } else if (log.email_type === 'broadcast') {
                          typeBadge = { label: 'Release Broadcast', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.12)' };
                        } else if (log.email_type === 'password_reset') {
                          typeBadge = { label: 'Password Reset', color: '#D97706', bg: 'rgba(217, 119, 6, 0.12)' };
                        }

                        return (
                          <tr key={log.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                            <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>
                              {log.recipient_email}
                            </td>
                            <td style={{ padding: '0.75rem 1rem' }}>
                              <span style={{
                                backgroundColor: typeBadge.bg,
                                color: typeBadge.color,
                                padding: '0.2rem 0.5rem',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '0.75rem',
                                fontWeight: 700
                              }}>
                                {typeBadge.label}
                              </span>
                            </td>
                            <td style={{ padding: '0.75rem 1rem', maxWidth: '380px' }}>
                              <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{log.subject}</div>
                              {log.preview_text && (
                                <div style={{ fontSize: '0.775rem', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {log.preview_text}
                                </div>
                              )}
                            </td>
                            <td style={{ padding: '0.75rem 1rem' }}>
                              <span style={{
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                color: log.status === 'sent' ? 'var(--color-primary-forest)' : log.status === 'simulated' ? '#0284c7' : 'var(--color-error)'
                              }}>
                                {log.status === 'sent' ? '✓ Sent (SMTP)' : log.status === 'simulated' ? '⚡ Simulated (Local)' : '✖ Failed'}
                              </span>
                            </td>
                            <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: 'var(--color-text-muted)' }}>
                              {new Date(log.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
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

      {/* ========================================================================= */}
      {/* MODAL 6: REVOKE / REINSTATE CERTIFICATE */}
      {/* ========================================================================= */}
      {revokeModalCert && (
        <div className="modal-backdrop" onClick={() => setRevokeModalCert(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px', width: '92%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {revokeModalCert.is_revoked ? (
                  <RotateCcw size={22} color="var(--color-primary-forest)" />
                ) : (
                  <ShieldAlert size={22} color="var(--color-error)" />
                )}
                <h3 style={{ margin: 0 }}>
                  {revokeModalCert.is_revoked ? 'Reinstate Certificate' : 'Revoke Certificate Accreditation'}
                </h3>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setRevokeModalCert(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleToggleRevoke} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-bg-subtle)', fontSize: '0.875rem' }}>
                <div><strong>Certificate Serial:</strong> <span style={{ fontFamily: 'var(--font-mono)' }}>{revokeModalCert.cert_id}</span></div>
                <div><strong>Recipient:</strong> {revokeModalCert.recipient_name}</div>
                <div><strong>Discipline:</strong> {revokeModalCert.discipline}</div>
                <div><strong>Speed:</strong> {revokeModalCert.net_wpm} WPM ({revokeModalCert.accuracy}% accuracy)</div>
              </div>

              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', margin: 0, lineHeight: 1.5 }}>
                {revokeModalCert.is_revoked
                  ? 'Reinstating this certificate will restore its active standing and allow it to pass public verification searches.'
                  : 'Revoking this certificate will invalidate it across the platform and return an explicit revocation alert to anyone scanning its QR code or verification link.'}
              </p>

              {!revokeModalCert.is_revoked && (
                <div>
                  <label className="input-label">Reason for Revocation *</label>
                  <input
                    type="text"
                    className="input"
                    required
                    placeholder="e.g. Automated script injection / suspected bot session"
                    value={revokeReason}
                    onChange={(e) => setRevokeReason(e.target.value)}
                  />
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setRevokeModalCert(null)}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{
                    backgroundColor: revokeModalCert.is_revoked ? 'var(--color-primary-forest)' : 'var(--color-error)',
                    borderColor: revokeModalCert.is_revoked ? 'var(--color-primary-forest)' : 'var(--color-error)'
                  }}
                >
                  {revokeModalCert.is_revoked ? 'Reinstate Standing' : 'Confirm Revocation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 7: FULL LUXURY CERTIFICATE PREVIEW */}
      {/* ========================================================================= */}
      {previewCert && (
        <TypingCertificateModal
          certificate={{
            certId: previewCert.cert_id,
            recipientName: previewCert.recipient_name,
            titleRole: previewCert.title_role || 'Touch-Typing Specialist',
            discipline: previewCert.discipline,
            netWpm: previewCert.net_wpm,
            grossWpm: previewCert.gross_wpm,
            accuracy: previewCert.accuracy,
            durationSeconds: previewCert.duration_seconds || 60,
            totalCharacters: previewCert.total_characters || 250,
            tierTitle: previewCert.tier_title,
            tierBadge: previewCert.tier_badge,
            tierGrade: previewCert.tier_grade || 'Grade A',
            signatoryName: previewCert.signatory_name || 'Saumy Pandey',
            signatoryTitle: previewCert.signatory_title || 'App Owner & Creator • Founder, CodeTyper',
            sha256Fingerprint: previewCert.sha256_fingerprint,
            biometricVerified: Boolean(previewCert.biometric_verified),
            theme: previewCert.theme || 'royal-obsidian',
            issuedAt: previewCert.issued_at || previewCert.created_at,
            verificationUrl: `${getSiteUrl()}/verify/${previewCert.cert_id}`
          }}
          onClose={() => setPreviewCert(null)}
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL 8: BROADCAST RELEASE ANNOUNCEMENT TO SUBSCRIBERS */}
      {/* ========================================================================= */}
      {showBroadcastModal && (
        <div className="modal-backdrop" onClick={() => !broadcasting && setShowBroadcastModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '620px', width: '92%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={20} color="var(--color-primary-forest)" />
                <h3 style={{ margin: 0 }}>Broadcast Platform Release Update</h3>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => !broadcasting && setShowBroadcastModal(false)}>
                <X size={18} />
              </button>
            </div>

            <p style={{ margin: '0 0 1.25rem', fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
              This will dispatch an official developer digest email to all <strong>{subscriberCounts.active} active typist subscribers</strong> and log the dispatch history in your Email Outbox.
            </p>

            <form onSubmit={handleBroadcastUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="input-label">Update Title / Headline</label>
                <input
                  type="text"
                  className="input"
                  required
                  placeholder="e.g. CodeTyper v2.5: Custom Keypress Audio & Vim Navigation Mode"
                  value={broadcastForm.title}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                  disabled={broadcasting}
                />
              </div>

              <div>
                <label className="input-label">Version Tag / Milestone</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. v2.5 LTS"
                  value={broadcastForm.versionTag}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, versionTag: e.target.value })}
                  disabled={broadcasting}
                />
              </div>

              <div>
                <label className="input-label">Release Changelog &amp; Highlights</label>
                <textarea
                  className="input"
                  rows={6}
                  required
                  placeholder={`• Added 8 authentic mechanical switch audio synthesizer models
• Introduced full Vim normal & insert mode for developer typists
• Real-time multiplayer lobby reconnection resilience`}
                  value={broadcastForm.changelog}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, changelog: e.target.value })}
                  disabled={broadcasting}
                  style={{ fontFamily: 'inherit', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setShowBroadcastModal(false)}
                  disabled={broadcasting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={broadcasting || subscriberCounts.active === 0}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Send size={15} />
                  <span>{broadcasting ? 'Broadcasting to Typists...' : `Send Broadcast (${subscriberCounts.active} Typists)`}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 9: EDIT FEEDBACK, RATING & TESTIMONIAL DETAILS */}
      {/* ========================================================================= */}
      {editingFeedbackItem && (
        <div className="modal-backdrop" onClick={() => setEditingFeedbackItem(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px', width: '92%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Star size={20} fill="#eab308" color="#eab308" />
                <h3 style={{ margin: 0 }}>Edit Testimonial &amp; Rating</h3>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setEditingFeedbackItem(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEditedFeedback} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label className="input-label">Author Name *</label>
                  <input
                    type="text"
                    className="input"
                    required
                    value={editFeedbackForm.name}
                    onChange={(e) => setEditFeedbackForm({ ...editFeedbackForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="input-label">Role / Company Headline</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. Senior Frontend Engineer @ FinTech"
                    value={editFeedbackForm.display_role}
                    onChange={(e) => setEditFeedbackForm({ ...editFeedbackForm, display_role: e.target.value })}
                  />
                </div>
              </div>

              {/* Star Rating Selector */}
              <div>
                <label className="input-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Experience Rating</span>
                  <span style={{ color: '#eab308', fontWeight: 700 }}>
                    {editFeedbackForm.rating} of 5 Stars
                  </span>
                </label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.6rem 0.85rem',
                  backgroundColor: 'var(--color-bg-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)'
                }}>
                  {[1, 2, 3, 4, 5].map((starVal) => (
                    <button
                      key={starVal}
                      type="button"
                      onClick={() => setEditFeedbackForm({ ...editFeedbackForm, rating: starVal })}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.2rem' }}
                      title={`Select ${starVal} Star${starVal > 1 ? 's' : ''}`}
                    >
                      <Star
                        size={22}
                        fill={starVal <= editFeedbackForm.rating ? '#eab308' : 'none'}
                        color={starVal <= editFeedbackForm.rating ? '#eab308' : 'var(--color-border)'}
                      />
                    </button>
                  ))}
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginLeft: '0.5rem' }}>
                    ({editFeedbackForm.rating} ★)
                  </span>
                </div>
              </div>

              <div>
                <label className="input-label">Review / Testimonial Quote *</label>
                <textarea
                  className="input"
                  rows={4}
                  required
                  placeholder="The user's feedback or quote text..."
                  value={editFeedbackForm.message}
                  onChange={(e) => setEditFeedbackForm({ ...editFeedbackForm, message: e.target.value })}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label className="input-label">Workflow Status</label>
                  <select
                    className="input"
                    value={editFeedbackForm.status}
                    onChange={(e) => setEditFeedbackForm({ ...editFeedbackForm, status: e.target.value })}
                  >
                    <option value="pending">⏳ Pending Review</option>
                    <option value="in_review">🔍 In Review</option>
                    <option value="resolved">✔ Resolved</option>
                    <option value="archived">📁 Archived</option>
                  </select>
                </div>
                <div>
                  <label className="input-label">Internal Maintainer Notes</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. Verified quote from Slack"
                    value={editFeedbackForm.admin_notes}
                    onChange={(e) => setEditFeedbackForm({ ...editFeedbackForm, admin_notes: e.target.value })}
                  />
                </div>
              </div>

              {/* Website Landing Page Feature Toggle Checkbox */}
              <div style={{
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: editFeedbackForm.is_featured ? 'rgba(234, 179, 8, 0.12)' : 'var(--color-bg-subtle)',
                border: editFeedbackForm.is_featured ? '1px solid rgba(234, 179, 8, 0.35)' : '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                cursor: 'pointer'
              }}
              onClick={() => setEditFeedbackForm({ ...editFeedbackForm, is_featured: !editFeedbackForm.is_featured })}
              >
                <input
                  type="checkbox"
                  id="modal-feedback-featured-checkbox"
                  checked={editFeedbackForm.is_featured}
                  onChange={(e) => setEditFeedbackForm({ ...editFeedbackForm, is_featured: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#eab308' }}
                />
                <label htmlFor="modal-feedback-featured-checkbox" style={{ cursor: 'pointer', margin: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: editFeedbackForm.is_featured ? '#ca8a04' : 'var(--color-text-primary)' }}>
                    ⭐ Feature on Public Website Landing Page
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                    When enabled, this quote and rating will display in the &quot;Loved By Engineers Worldwide&quot; community grid.
                  </div>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setEditingFeedbackItem(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Check size={15} />
                  <span>Save Testimonial Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 10: MANUALLY ADD NEW FEATURED TESTIMONIAL */}
      {/* ========================================================================= */}
      {showAddTestimonialModal && (
        <div className="modal-backdrop" onClick={() => setShowAddTestimonialModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px', width: '92%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Star size={20} fill="#eab308" color="#eab308" />
                <h3 style={{ margin: 0 }}>Add Verified Community Testimonial</h3>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowAddTestimonialModal(false)}>
                <X size={18} />
              </button>
            </div>

            <p style={{ margin: '0 0 1.25rem', fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
              Create a curated developer review or testimonial from LinkedIn, Twitter, Discord, or direct feedback to showcase on your landing page.
            </p>

            <form onSubmit={handleCreateTestimonial} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label className="input-label">Author Full Name *</label>
                  <input
                    type="text"
                    className="input"
                    required
                    placeholder="e.g. Priya Sharma"
                    value={newTestimonialForm.name}
                    onChange={(e) => setNewTestimonialForm({ ...newTestimonialForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="input-label">Role / Company Headline</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. Staff Systems Engineer (Rust / Go)"
                    value={newTestimonialForm.display_role}
                    onChange={(e) => setNewTestimonialForm({ ...newTestimonialForm, display_role: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="input-label">Contact Email (Optional)</label>
                <input
                  type="email"
                  className="input"
                  placeholder="e.g. developer@company.com"
                  value={newTestimonialForm.email}
                  onChange={(e) => setNewTestimonialForm({ ...newTestimonialForm, email: e.target.value })}
                />
              </div>

              {/* Star Rating Selector */}
              <div>
                <label className="input-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Experience Rating *</span>
                  <span style={{ color: '#eab308', fontWeight: 700 }}>
                    {newTestimonialForm.rating} of 5 Stars
                  </span>
                </label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.6rem 0.85rem',
                  backgroundColor: 'var(--color-bg-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)'
                }}>
                  {[1, 2, 3, 4, 5].map((starVal) => (
                    <button
                      key={starVal}
                      type="button"
                      onClick={() => setNewTestimonialForm({ ...newTestimonialForm, rating: starVal })}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.2rem' }}
                      title={`Select ${starVal} Star${starVal > 1 ? 's' : ''}`}
                    >
                      <Star
                        size={22}
                        fill={starVal <= newTestimonialForm.rating ? '#eab308' : 'none'}
                        color={starVal <= newTestimonialForm.rating ? '#eab308' : 'var(--color-border)'}
                      />
                    </button>
                  ))}
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginLeft: '0.5rem' }}>
                    ({newTestimonialForm.rating} ★)
                  </span>
                </div>
              </div>

              <div>
                <label className="input-label">Testimonial Quote / Review Text *</label>
                <textarea
                  className="input"
                  rows={4}
                  required
                  placeholder="e.g. Practicing curly braces and arrow functions on CodeTyper jumped my technical interview confidence..."
                  value={newTestimonialForm.message}
                  onChange={(e) => setNewTestimonialForm({ ...newTestimonialForm, message: e.target.value })}
                  style={{ resize: 'vertical' }}
                />
              </div>

              {/* Feature Immediately Toggle */}
              <div style={{
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: newTestimonialForm.is_featured ? 'rgba(234, 179, 8, 0.12)' : 'var(--color-bg-subtle)',
                border: newTestimonialForm.is_featured ? '1px solid rgba(234, 179, 8, 0.35)' : '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                cursor: 'pointer'
              }}
              onClick={() => setNewTestimonialForm({ ...newTestimonialForm, is_featured: !newTestimonialForm.is_featured })}
              >
                <input
                  type="checkbox"
                  id="modal-add-featured-checkbox"
                  checked={newTestimonialForm.is_featured}
                  onChange={(e) => setNewTestimonialForm({ ...newTestimonialForm, is_featured: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#eab308' }}
                />
                <label htmlFor="modal-add-featured-checkbox" style={{ cursor: 'pointer', margin: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: newTestimonialForm.is_featured ? '#ca8a04' : 'var(--color-text-primary)' }}>
                    ⭐ Feature Immediately on Landing Page
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                    This review will immediately become visible to all visitors in the community feedback section.
                  </div>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setShowAddTestimonialModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#eab308', color: '#000', borderColor: '#eab308' }}
                >
                  <Plus size={15} />
                  <span>Create &amp; Publish Testimonial</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
