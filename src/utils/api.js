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
        headers
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
    getCategories: () => this.request('/practice/categories')
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
    getStats: () => this.request('/sessions/stats')
  };

  // User & Settings
  user = {
    updateProfile: (profile) => this.request('/user/profile', { method: 'PUT', body: JSON.stringify(profile) }),
    updateSettings: (settings) => this.request('/user/settings', { method: 'PUT', body: JSON.stringify(settings) }),
    changePassword: (passwords) => this.request('/user/change-password', { method: 'POST', body: JSON.stringify(passwords) }),
    deleteAccount: () => this.request('/user/account', { method: 'DELETE' })
  };

  // Admin
  admin = {
    getStats: () => this.request('/admin/stats'),
    getContent: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return this.request(`/admin/content?${query}`);
    },
    createContent: (content) => this.request('/admin/content', { method: 'POST', body: JSON.stringify(content) }),
    updateContent: (id, content) => this.request(`/admin/content/${id}`, { method: 'PUT', body: JSON.stringify(content) }),
    deleteContent: (id) => this.request(`/admin/content/${id}`, { method: 'DELETE' }),
    getUsers: () => this.request('/admin/users')
  };
}

export const api = new ApiClient();
