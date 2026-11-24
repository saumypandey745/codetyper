// CodeTyper Real-Time Announcement Broadcaster
// Provides SSE (Server-Sent Events) live streaming so platform updates and
// admin announcements reach all visitors and typists in real-time without delay.

import { db } from './db.js';

class AnnouncementBroadcaster {
  constructor() {
    this.clients = new Set();

    // Heartbeat every 25s to prevent intermediary proxy timeouts
    const heartbeat = setInterval(() => {
      for (const res of this.clients) {
        try {
          res.write(': keepalive\n\n');
        } catch {
          this.clients.delete(res);
        }
      }
    }, 25000);
    if (heartbeat.unref) heartbeat.unref();
  }

  getCurrentAnnouncement() {
    try {
      const textRow = db.prepare("SELECT value FROM system_settings WHERE key = 'announcement_text'").get();
      const typeRow = db.prepare("SELECT value FROM system_settings WHERE key = 'announcement_type'").get();
      const enabledRow = db.prepare("SELECT value FROM system_settings WHERE key = 'announcement_enabled'").get();
      const maintenanceRow = db.prepare("SELECT value FROM system_settings WHERE key = 'maintenance_mode'").get();

      return {
        enabled: enabledRow?.value === '1',
        text: textRow?.value || '',
        type: typeRow?.value || 'info',
        maintenance_mode: maintenanceRow?.value === '1',
        timestamp: Date.now()
      };
    } catch {
      return {
        enabled: false,
        text: '',
        type: 'info',
        maintenance_mode: false,
        timestamp: Date.now()
      };
    }
  }

  subscribe(req, res) {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no'
    });

    // Send immediate current announcement payload upon connection
    const current = this.getCurrentAnnouncement();
    res.write(`data: ${JSON.stringify(current)}\n\n`);

    this.clients.add(res);

    req.on('close', () => {
      this.clients.delete(res);
    });
  }

  broadcast(overrideData = null) {
    const data = overrideData || this.getCurrentAnnouncement();
    const payload = `data: ${JSON.stringify(data)}\n\n`;

    for (const res of this.clients) {
      try {
        res.write(payload);
      } catch {
        this.clients.delete(res);
      }
    }
    return data;
  }
}

export const announcementBroadcaster = new AnnouncementBroadcaster();
