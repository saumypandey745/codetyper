import { Router } from 'express';
import { multiplayerManager } from '../multiplayer.js';
import { optionalAuthenticate } from '../authMiddleware.js';

const router = Router();

// Create 1v1 Room
router.post('/create', optionalAuthenticate, (req, res) => {
  const { language } = req.body;
  try {
    const room = multiplayerManager.createRoom({
      hostUser: req.user,
      language: language || 'JavaScript'
    });
    return res.status(201).json({ room });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Join Room by Code
router.post('/join', optionalAuthenticate, (req, res) => {
  const { roomId } = req.body;
  if (!roomId) {
    return res.status(400).json({ error: 'Room code is required.' });
  }

  try {
    const room = multiplayerManager.joinRoom({
      roomId,
      user: req.user
    });
    return res.json({ room });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

// Update Live Progress
router.post('/progress', optionalAuthenticate, (req, res) => {
  const { roomId, playerId, progressPercent, wpm, accuracy } = req.body;
  if (!roomId || !playerId) {
    return res.status(400).json({ error: 'roomId and playerId are required.' });
  }

  const room = multiplayerManager.updateProgress({
    roomId,
    playerId,
    progressPercent: progressPercent || 0,
    wpm: wpm || 0,
    accuracy: accuracy || 100
  });

  if (!room) {
    return res.status(404).json({ error: 'Room not found.' });
  }

  return res.json({ room });
});

// Get Room State
router.get('/room/:id', (req, res) => {
  const room = multiplayerManager.getRoom(req.params.id);
  if (!room) {
    return res.status(404).json({ error: 'Room not found.' });
  }
  return res.json({ room });
});

export default router;
