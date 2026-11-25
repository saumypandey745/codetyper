const API_BASE = '/api';

class ApiClient {
  constructor() {
    this.token = localStorage.getItem('codetyper_token') || null;
    this.initOfflineSync();
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('codetyper_token', token);
    } else {
      localStorage.removeItem('codetyper_token');
    }
  }

  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
        credentials: 'include'
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (err) {
      // If network offline and saving a session, queue it
      if (endpoint === '/sessions/save' && options.method === 'POST') {
        this.queueOfflineSession(JSON.parse(options.body));
        return { message: 'Session saved offline. Will sync once reconnected.', offline: true };
      }
      throw err;
    }
  }

  queueOfflineSession(sessionData) {
    try {
      const queue = JSON.parse(localStorage.getItem('codetyper_offline_queue') || '[]');
      queue.push(sessionData);
      localStorage.setItem('codetyper_offline_queue', JSON.stringify(queue));
    } catch (e) {
      console.warn('Could not queue offline session', e);
    }
  }

  initOfflineSync() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', async () => {
        try {
          const queue = JSON.parse(localStorage.getItem('codetyper_offline_queue') || '[]');
          if (queue.length > 0 && this.token) {
            console.log(`[Sync] Synchronizing ${queue.length} offline sessions...`);
            for (const item of queue) {
              await this.request('/sessions/save', {
                method: 'POST',
                body: JSON.stringify(item)
              });
            }
            localStorage.removeItem('codetyper_offline_queue');
            console.log('[Sync] All offline sessions synchronized.');
          }
        } catch (e) {
          console.warn('[Sync] Sync failed, will retry on next online event', e);
        }
      });
    }
  }

  // Auth Endpoints
  auth = {
    login: (credentials) => this.request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    register: (userData) => this.request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
    me: () => this.request('/auth/me'),
    logout: () => this.request('/auth/logout', { method: 'POST' }),
    forgotPassword: (email) => this.request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
    resetPassword: (payload) => this.request('/auth/reset-password', { method: 'POST', body: JSON.stringify(payload) })
  };

  // Practice Content
  practice = {
    getContent: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return this.request(`/practice/content?${query}`);
    },
    getLanguages: () => this.request('/practice/languages'),
    getCategories: () => this.request('/practice/categories'),
    getCustomSnippets: () => this.request('/practice/custom'),
    saveCustomSnippet: (snippet) => this.request('/practice/custom', { method: 'POST', body: JSON.stringify(snippet) }),
    deleteCustomSnippet: (id) => this.request(`/practice/custom/${id}`, { method: 'DELETE' }),
    fetchGithubSnippet: (url) => this.request('/practice/github-fetch', { method: 'POST', body: JSON.stringify({ url }) })
  };

  // Multiplayer Duels
  multiplayer = {
    createRoom: (payload) => this.request('/multiplayer/create', { method: 'POST', body: JSON.stringify(payload) }),
    joinRoom: (payload) => this.request('/multiplayer/join', { method: 'POST', body: JSON.stringify(payload) }),
    getRoom: (roomId) => this.request(`/multiplayer/room/${roomId}`),
    sendProgress: (payload) => this.request('/multiplayer/progress', { method: 'POST', body: JSON.stringify(payload) })
  };

  // Sessions & Stats
  sessions = {
    save: (sessionData) =>
      this.request('/sessions/save', {
        method: 'POST',
        body: JSON.stringify({
          timezone_offset_minutes: new Date().getTimezoneOffset(),
          ...sessionData
        })
      }),
    getHistory: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return this.request(`/sessions/history?${query}`);
    },
    delete: (id) => this.request(`/sessions/${id}`, { method: 'DELETE' }),
    getStats: () => this.request('/sessions/stats'),
    getLeaderboard: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return this.request(`/sessions/leaderboard?${query}`);
    }
  };

  // User & Settings
  user = {
    updateProfile: (profile) => this.request('/user/profile', { method: 'PUT', body: JSON.stringify(profile) }),
    updateSettings: (settings) => this.request('/user/settings', { method: 'PUT', body: JSON.stringify(settings) }),
    changePassword: (passwords) => this.request('/user/change-password', { method: 'POST', body: JSON.stringify(passwords) }),
    sendResetOtp: () => this.request('/user/send-reset-otp', { method: 'POST' }),
    deleteAccount: () => this.request('/user/account', { method: 'DELETE' })
  };

  // System
  system = {
    getAnnouncement: () => this.request('/system/announcement')
  };

  // Admin Portal & Platform Governance
  admin = {
    getStats: () => this.request('/admin/stats'),
    getSecuritySummary: () => this.request('/admin/security-summary'),
    getContent: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return this.request(`/admin/content?${query}`);
    },
    createContent: (content) => this.request('/admin/content', { method: 'POST', body: JSON.stringify(content) }),
    updateContent: (id, content) => this.request(`/admin/content/${id}`, { method: 'PUT', body: JSON.stringify(content) }),
    togglePublish: (id) => this.request(`/admin/content/${id}/toggle-publish`, { method: 'PUT' }),
    deleteContent: (id) => this.request(`/admin/content/${id}`, { method: 'DELETE' }),
    bulkImport: (items) => this.request('/admin/content/bulk-import', { method: 'POST', body: JSON.stringify({ items }) }),
    getUsers: () => this.request('/admin/users'),
    updateUserRole: (id, role) => this.request(`/admin/users/${id}/role`, { method: 'PUT', body: JSON.stringify({ role }) }),
    banUser: (id, payload) => this.request(`/admin/users/${id}/ban`, { method: 'PUT', body: JSON.stringify(payload) }),
    shadowbanUser: (id, shadowbanned) => this.request(`/admin/users/${id}/shadowban`, { method: 'PUT', body: JSON.stringify({ shadowbanned }) }),
    resetUserPassword: (id, new_password) => this.request(`/admin/users/${id}/reset-password`, { method: 'POST', body: JSON.stringify({ new_password }) }),
    deleteUser: (id) => this.request(`/admin/users/${id}`, { method: 'DELETE' }),
    getScores: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return this.request(`/admin/scores?${query}`);
    },
    disqualifyScore: (id, reason) => this.request(`/admin/scores/${id}/disqualify`, { method: 'PUT', body: JSON.stringify({ reason }) }),
    deleteScore: (id) => this.request(`/admin/scores/${id}`, { method: 'DELETE' }),
    getSettings: () => this.request('/admin/settings'),
    updateSettings: (settings) => this.request('/admin/settings', { method: 'PUT', body: JSON.stringify(settings) }),
    getAuditLogs: () => this.request('/admin/audit-logs'),
    getCertificates: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return this.request(`/admin/certificates?${query}`);
    },
    revokeCertificate: (certId, payload) =>
      this.request(`/admin/certificates/${encodeURIComponent(certId)}/revoke`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      }),
    deleteCertificate: (certId) =>
      this.request(`/admin/certificates/${encodeURIComponent(certId)}`, {
        method: 'DELETE'
      }),
    getFeedback: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return this.request(`/admin/feedback?${query}`);
    },
    toggleFeedbackFeatured: (id) =>
      this.request(`/admin/feedback/${id}/toggle-featured`, {
        method: 'PUT'
      }),
    updateFeedback: (id, payload) =>
      this.request(`/admin/feedback/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      }),
    createFeedback: (payload) =>
      this.request('/admin/feedback', {
        method: 'POST',
        body: JSON.stringify(payload)
      }),
    updateFeedbackStatus: (id, payload) =>
      this.request(`/admin/feedback/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      }),
    deleteFeedback: (id) =>
      this.request(`/admin/feedback/${id}`, {
        method: 'DELETE'
      }),
    getSubscribers: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return this.request(`/admin/subscribers?${query}`);
    },
    deleteSubscriber: (id) =>
      this.request(`/admin/subscribers/${id}`, {
        method: 'DELETE'
      }),
    broadcastUpdate: (payload) =>
      this.request('/admin/broadcast-update', {
        method: 'POST',
        body: JSON.stringify(payload)
      }),
    getEmailLogs: () => this.request('/admin/email-logs'),
    getWebhooksConfig: () => this.request('/admin/webhooks/config'),
    updateWebhooksConfig: (payload) =>
      this.request('/admin/webhooks/config', {
        method: 'PUT',
        body: JSON.stringify(payload)
      }),
    testWebhook: (payload) =>
      this.request('/admin/webhooks/test', {
        method: 'POST',
        body: JSON.stringify(payload)
      }),
    getWebhookLogs: () => this.request('/admin/webhooks/logs')
  };

  // Feedback & Developer Reports
  feedback = {
    submit: (payload) => this.request('/feedback', { method: 'POST', body: JSON.stringify(payload) }),
    getFeatured: () => this.request('/feedback/featured')
  };

  // Newsletter & Developer Digest
  newsletter = {
    subscribe: (payload) => this.request('/newsletter/subscribe', { method: 'POST', body: JSON.stringify(payload) }),
    unsubscribe: (payload) => this.request('/newsletter/unsubscribe', { method: 'POST', body: JSON.stringify(payload) })
  };

  // Official Accredited Certificate Registry
  certificate = {
    verify: (certId) => this.request(`/certificate/verify/${encodeURIComponent(certId)}`),
    issue: (data) => this.request('/certificate/issue', { method: 'POST', body: JSON.stringify(data) }),
    getMyCertificates: () => this.request('/certificate/my')
  };
}

export const api = new ApiClient();
