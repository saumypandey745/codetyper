// CodeTyper Real-Time Multiplayer Room Manager
// In-memory 1v1 battle rooms with synchronized countdowns and live telemetry.

import { db } from './db.js';

class MultiplayerManager {
  constructor() {
    this.rooms = new Map();
    // Auto-clean rooms older than 1 hour (unref so it doesn't block process exit)
    const cleaner = setInterval(() => this.cleanup(), 15 * 60 * 1000);
    if (cleaner.unref) cleaner.unref();
  }

  generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'CT-';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  createRoom({ hostUser, language = 'JavaScript' }) {
    const roomId = this.generateRoomCode();

    // Fetch an engaging coding snippet for the battle
    let snippet = db.prepare(`
      SELECT * FROM practice_content
      WHERE is_code = 1 AND LOWER(language) = LOWER(?)
      ORDER BY RANDOM() LIMIT 1
    `).get(language);

    if (!snippet) {
      snippet = db.prepare('SELECT * FROM practice_content WHERE is_code = 1 ORDER BY RANDOM() LIMIT 1').get();
    }

    const hostId = hostUser?.id ? String(hostUser.id) : `guest_${Date.now().toString().slice(-4)}`;
    const hostName = hostUser?.username || hostUser?.full_name || 'Host Typer';
    const hostAvatar = hostUser?.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${hostId}`;

    const room = {
      id: roomId,
      status: 'waiting', // 'waiting' | 'countdown' | 'racing' | 'finished'
      targetText: snippet.content,
      title: snippet.title,
      language: snippet.language || language,
      countdown: 3,
      startTime: null,
      winner: null,
      createdAt: Date.now(),
      players: {
        [hostId]: {
          id: hostId,
          username: hostName,
          avatar: hostAvatar,
          progressPercent: 0,
          wpm: 0,
          accuracy: 100,
          isFinished: false,
          finishTimeMs: null,
          isHost: true
        }
      }
    };

    this.rooms.set(roomId, room);
    return room;
  }

  joinRoom({ roomId, user }) {
    const cleanId = roomId.trim().toUpperCase();
    const room = this.rooms.get(cleanId);
    if (!room) {
      throw new Error('Battle room not found. Please verify your room code.');
    }

    const playerId = user?.id ? String(user.id) : `guest_${Date.now().toString().slice(-4)}`;
    const playerName = user?.username || user?.full_name || 'Challenger';
    const playerAvatar = user?.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${playerId}`;

    // If player already in room, update/return
    if (!room.players[playerId]) {
      // Room full check (max 2 players for 1v1 duel)
      const currentCount = Object.keys(room.players).length;
      if (currentCount >= 2) {
        throw new Error('This duel room already has 2 racers.');
      }

      room.players[playerId] = {
        id: playerId,
        username: playerName,
        avatar: playerAvatar,
        progressPercent: 0,
        wpm: 0,
        accuracy: 100,
        isFinished: false,
        finishTimeMs: null,
        isHost: false
      };
    }

    // If both players are in, start countdown!
    if (Object.keys(room.players).length === 2 && room.status === 'waiting') {
      room.status = 'countdown';
      room.countdown = 3;

      const countdownInterval = setInterval(() => {
        room.countdown -= 1;
        if (room.countdown <= 0) {
          clearInterval(countdownInterval);
          room.status = 'racing';
          room.startTime = Date.now();
        }
      }, 1000);
      if (countdownInterval.unref) countdownInterval.unref();
    }

    return room;
  }

  updateProgress({ roomId, playerId, progressPercent, wpm, accuracy }) {
    const room = this.rooms.get(roomId.trim().toUpperCase());
    if (!room) return null;

    const player = room.players[playerId];
    if (!player) return room;

    player.progressPercent = Math.min(100, Math.max(0, Math.round(progressPercent)));
    player.wpm = Math.max(0, Math.round(wpm));
    player.accuracy = Math.min(100, Math.max(0, Math.round(accuracy)));

    if (player.progressPercent >= 100 && !player.isFinished) {
      player.isFinished = true;
      player.finishTimeMs = Date.now() - (room.startTime || Date.now());

      if (!room.winner) {
        room.winner = {
          id: player.id,
          username: player.username,
          wpm: player.wpm,
          finishTimeMs: player.finishTimeMs
        };
      }

      // Check if all players finished
      const allDone = Object.values(room.players).every((p) => p.isFinished);
      if (allDone) {
        room.status = 'finished';
      }
    }

    return room;
  }

  getRoom(roomId) {
    return this.rooms.get(roomId.trim().toUpperCase()) || null;
  }

  cleanup() {
    const now = Date.now();
    for (const [id, room] of this.rooms.entries()) {
      if (now - room.createdAt > 3600 * 1000) {
        this.rooms.delete(id);
      }
    }
  }
}

export const multiplayerManager = new MultiplayerManager();
