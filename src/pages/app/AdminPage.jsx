import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  Layers,
  Clock,
  Plus,
  Trash2,
  Edit,
  Search,
  CheckCircle2,
  X,
  FileCode,
  BookOpen
} from 'lucide-react';
import { api } from '../../utils/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { programmingLanguages, englishCategories } from '../../../server/seedData.js';

export function AdminPage({ onNavigate }) {
  const { user } = useAuth();
  const toast = useToast();

  const [stats, setStats] = useState(null);
  const [contentItems, setContentItems] = useState([]);
  const [userList, setUserList] = useState([]);
  const [activeTab, setActiveTab] = useState('content'); // 'content' | 'users'
  const [loading, setLoading] = useState(true);

  // Filter state
  const [contentFilter, setContentFilter] = useState('all'); // 'all' | 'code' | 'english'
  const [searchQuery, setSearchQuery] = useState('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Technology',
    subcategory: '',
    language: 'JavaScript',
    difficulty: 'intermediate',
    is_code: 1,
    content: ''
  });

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, contentRes, usersRes] = await Promise.all([
        api.admin.getStats(),
        api.admin.getContent({ limit: 100 }),
        api.admin.getUsers()
      ]);
      setStats(statsRes);
      setContentItems(contentRes.items || []);
      setUserList(usersRes.users || []);
    } catch (err) {
      console.warn('Admin load failed', err);
      toast.error('Could not load admin portal data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      loadAdminData();
    }
  }, [user]);

  if (user?.role !== 'admin') {
    return (
      <div className="card" style={{ padding: '3rem', textAlign: 'center', maxWidth: '600px', margin: '4rem auto' }}>
        <ShieldAlert size={48} color="var(--color-error)" style={{ margin: '0 auto 1rem' }} />
        <h2>Access Restricted</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
          This administrative control console requires elevated platform privileges.
        </p>
        <button className="btn btn-primary" onClick={() => onNavigate('dashboard')}>
          Return to Dashboard
        </button>
      </div>
    );
  }

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      category: 'General English',
      subcategory: '',
      language: 'English',
      difficulty: 'intermediate',
      is_code: 0,
      content: ''
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      category: item.category,
      subcategory: item.subcategory || '',
      language: item.language || 'English',
      difficulty: item.difficulty || 'intermediate',
      is_code: item.is_code ? 1 : 0,
      content: item.content
    });
    setShowModal(true);
  };

  const handleSaveContent = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Title and content are required.');
      return;
    }

    try {
      if (editingItem) {
        await api.admin.updateContent(editingItem.id, formData);
        toast.success('Practice passage updated.');
      } else {
        await api.admin.createContent(formData);
        toast.success('New practice passage created.');
      }
      setShowModal(false);
      loadAdminData();
    } catch (err) {
      toast.error(err.message || 'Failed to save content item.');
    }
  };

  const handleDeleteContent = async (id) => {
    if (!window.confirm('Delete this practice snippet permanently?')) return;
    try {
      await api.admin.deleteContent(id);
      setContentItems((prev) => prev.filter((i) => i.id !== id));
      toast.success('Content snippet removed.');
    } catch (err) {
      toast.error('Could not delete content.');
    }
  };

  const filteredItems = contentItems.filter((i) => {
    if (contentFilter === 'code' && !i.is_code) return false;
    if (contentFilter === 'english' && i.is_code) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = i.title?.toLowerCase().includes(q);
      const matchLang = i.language?.toLowerCase().includes(q);
      const matchCat = i.category?.toLowerCase().includes(q);
      if (!matchTitle && !matchLang && !matchCat) return false;
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1080px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <ShieldAlert size={24} color="var(--color-primary-forest)" />
            <h1 style={{ fontSize: '2rem', margin: 0 }}>Platform Administration</h1>
          </div>
          <p style={{ margin: 0, fontSize: '0.95rem' }}>
            Manage practice libraries, review system statistics, and monitor registered typists.
          </p>
        </div>

        <button className="btn btn-primary btn-sm" onClick={handleOpenAddModal}>
          <Plus size={16} />
          <span>Add Practice Content</span>
        </button>
      </div>

      {/* KPI Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Total Typists</span>
            <div className="stat-icon"><Users size={16} /></div>
          </div>
          <div className="stat-value">{stats?.users || 0}</div>
          <span className="stat-subtext">Registered user accounts</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Tests Completed</span>
            <div className="stat-icon"><CheckCircle2 size={16} /></div>
          </div>
          <div className="stat-value" style={{ color: 'var(--color-primary-forest)' }}>
            {stats?.sessions || 0}
          </div>
          <span className="stat-subtext">Lifetime completed sessions</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Practice Library</span>
            <div className="stat-icon"><Layers size={16} /></div>
          </div>
          <div className="stat-value">{stats?.contentItems || 0}</div>
          <span className="stat-subtext">Curated snippets and texts</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Practice Hours</span>
            <div className="stat-icon"><Clock size={16} /></div>
          </div>
          <div className="stat-value">{stats?.totalPracticeHours || 0} hrs</div>
          <span className="stat-subtext">Collective typing focus</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
        <button
          className={`btn btn-sm ${activeTab === 'content' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('content')}
        >
          <Layers size={16} />
          <span>Practice Content Library ({contentItems.length})</span>
        </button>
        <button
          className={`btn btn-sm ${activeTab === 'users' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('users')}
        >
          <Users size={16} />
          <span>Registered Users ({userList.length})</span>
        </button>
      </div>

      {/* Content Tab */}
      {activeTab === 'content' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Content Search & Filters */}
          <div className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input
                type="text"
                placeholder="Search snippets by title or language..."
                className="input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '2.25rem', fontSize: '0.875rem' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                className={`btn btn-sm ${contentFilter === 'all' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setContentFilter('all')}
              >
                All ({contentItems.length})
              </button>
              <button
                className={`btn btn-sm ${contentFilter === 'code' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setContentFilter('code')}
              >
                <FileCode size={14} />
                <span>Code</span>
              </button>
              <button
                className={`btn btn-sm ${contentFilter === 'english' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setContentFilter('english')}
              >
                <BookOpen size={14} />
                <span>English</span>
              </button>
            </div>
          </div>

          {/* Content Table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="results-breakdown-table">
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-muted)', fontSize: '0.825rem', textTransform: 'uppercase', backgroundColor: 'var(--color-bg-subtle)' }}>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Title</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Type</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Category / Lang</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Difficulty</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Words</th>
                    <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                      <td style={{ padding: '0.85rem 1.25rem', fontWeight: 600, fontSize: '0.9rem' }}>
                        {item.title}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span className={`badge ${item.is_code ? 'badge-primary' : 'badge-sage'}`}>
                          {item.is_code ? 'Code' : 'English'}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.875rem' }}>
                        {item.is_code ? item.language : item.category}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textTransform: 'capitalize', fontSize: '0.85rem' }}>
                        {item.difficulty}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                        {item.word_count} w ({item.char_count} chars)
                      </td>
                      <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                          <button
                            className="btn btn-ghost btn-sm"
                            style={{ padding: '0.3rem 0.5rem' }}
                            onClick={() => handleOpenEditModal(item)}
                            title="Edit snippet"
                          >
                            <Edit size={15} />
                          </button>
                          <button
                            className="btn btn-ghost btn-sm"
                            style={{ padding: '0.3rem 0.5rem', color: 'var(--color-error)' }}
                            onClick={() => handleDeleteContent(item.id)}
                            title="Delete snippet"
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
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="results-breakdown-table">
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-muted)', fontSize: '0.825rem', textTransform: 'uppercase', backgroundColor: 'var(--color-bg-subtle)' }}>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Typist</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Role</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Best Speed</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Avg Speed</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Tests Completed</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Streak</th>
                </tr>
              </thead>
              <tbody>
                {userList.map((u) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <td style={{ padding: '0.85rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img
                          src={u.avatar_url || 'https://api.dicebear.com/7.x/identicon/svg?seed=user'}
                          alt={u.full_name}
                          style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-full)' }}
                        />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{u.full_name}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>@{u.username} &bull; {u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span className="badge badge-sage" style={{ textTransform: 'capitalize' }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--color-primary-forest)' }}>
                      {u.best_wpm || 0} WPM
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      {u.avg_wpm || 0} WPM
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      {u.total_tests || 0}
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem' }}>
                      {u.current_streak || 0} days
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Content Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '620px', width: '92%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0 }}>{editingItem ? 'Edit Practice Snippet' : 'Create Practice Snippet'}</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>
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
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <div>
                  <label className="input-label">Type</label>
                  <select
                    className="input"
                    value={formData.is_code}
                    onChange={(e) => {
                      const isCode = Number(e.target.value);
                      setFormData({
                        ...formData,
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
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              {formData.is_code ? (
                <div>
                  <label className="input-label">Programming Language</label>
                  <select
                    className="input"
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
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
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
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
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingItem ? 'Save Changes' : 'Create Passage'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
