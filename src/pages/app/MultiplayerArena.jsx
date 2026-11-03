import React, { useState, useEffect, useRef } from 'react';
import {
  Swords,
  Copy,
  Check,
  Play,
  RotateCcw,
  Trophy,
  Users,
  Zap,
  ArrowRight,
  ShieldCheck,
  Clock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { TypingEngine } from '../../components/typing/TypingEngine.jsx';
import confetti from 'canvas-confetti';

export function MultiplayerArena({ onNavigate }) {
  const { user } = useAuth();
  const toast = useToast();

  const [viewState, setViewState] = useState('lobby'); // 'lobby' | 'waiting' | 'racing' | 'results'
  const [roomId, setRoomId] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('JavaScript');
  const [roomData, setRoomData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const pollIntervalRef = useRef(null);
  const myPlayerId = user?.id ? String(user.id) : useRef(`guest_${Math.floor(1000 + Math.random() * 9000)}`).current;

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  // Poll room state while in waiting, countdown, or racing
  const startPolling = (rId) => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/multiplayer/room/${rId}`);
        if (!res.ok) return;
        const data = await res.json();
        setRoomData(data.room);

        if (data.room.status === 'countdown' || data.room.status === 'racing') {
          setViewState('racing');
        } else if (data.room.status === 'finished') {
          setViewState('results');
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          try {
            confetti({ particleCount: 70, spread: 70 });
          } catch (e) {}
        }
      } catch (e) {}
    }, 600);
  };

  // Create Battle Room
  const handleCreateRoom = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/multiplayer/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: selectedLanguage })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create room.');

      setRoomId(data.room.id);
      setRoomData(data.room);
      setViewState('waiting');
      startPolling(data.room.id);
      toast.success(`Battle Room ${data.room.id} created! Share the code with your opponent.`);
    } catch (err) {
      toast.error(err.message || 'Could not create battle room.');
    } finally {
      setLoading(false);
    }
  };

  // Join Room by Code
  const handleJoinRoom = async (e) => {
    e.preventDefault();
    if (!inputCode.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/multiplayer/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: inputCode.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to join room.');

      setRoomId(data.room.id);
      setRoomData(data.room);
      setViewState('racing');
      startPolling(data.room.id);
      toast.success('Joined battle room! Get ready to race.');
    } catch (err) {
      toast.error(err.message || 'Could not join room.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.info('Room Code copied to clipboard!');
  };

  const playersList = roomData ? Object.values(roomData.players) : [];
  const opponent = playersList.find((p) => p.id !== myPlayerId);
  const myPlayer = roomData?.players[myPlayerId];

  // Send local typing progress to server
  const handleLiveProgress = (metrics, currentProgress) => {
    if (!roomId) return;
    fetch('/api/multiplayer/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomId,
        playerId: myPlayerId,
        progressPercent: currentProgress,
        wpm: metrics.netWpm || 0,
        accuracy: metrics.accuracy || 100
      })
    }).catch(() => {});
  };

  // --- Render 1: Lobby ---
  if (viewState === 'lobby') {
    return (
      <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.4rem 0.95rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-primary-light)',
              color: 'var(--color-primary-forest)',
              fontSize: '0.85rem',
              fontWeight: 700,
              marginBottom: '0.75rem'
            }}
          >
            <Swords size={16} />
            <span>Real-Time 1v1 Arena</span>
          </div>
          <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>Typing Duels & Code Battles</h1>
          <p style={{ color: 'var(--color-text-secondary)', maxWidth: '520px', margin: '0 auto', fontSize: '1rem' }}>
            Race head-to-head in real time against friends or fellow developers on real code snippets.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {/* Create Room Card */}
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-primary-light)',
                  color: 'var(--color-primary-forest)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Zap size={22} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Create Battle Room</h3>
                <span style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)' }}>Host a private duel</span>
              </div>
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1.25rem' }}>
              Select a programming language. You will receive an instant 6-character room code to send to your challenger.
            </p>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Battle Language</label>
              <select
                className="form-input"
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
              >
                <option value="JavaScript">JavaScript (ES6+)</option>
                <option value="TypeScript">TypeScript</option>
                <option value="Python">Python</option>
                <option value="Go">Go (Golang)</option>
                <option value="Rust">Rust</option>
                <option value="HTML">HTML / CSS</option>
              </select>
            </div>

            <button
              className="btn btn-primary"
              style={{ width: '100%' }}
              onClick={handleCreateRoom}
              disabled={loading}
            >
              <Swords size={18} />
              <span>{loading ? 'Creating...' : 'Create Duel Room'}</span>
            </button>
          </div>

          {/* Join Room Card */}
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-primary-light)',
                  color: 'var(--color-primary-forest)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Users size={22} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Join Battle</h3>
                <span style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)' }}>Enter with Code</span>
              </div>
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1.25rem' }}>
              Have a room code from a friend? Enter it below to immediately connect to the battle track.
            </p>

            <form onSubmit={handleJoinRoom}>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" htmlFor="duel-room-code">Room Code</label>
                <input
                  id="duel-room-code"
                  type="text"
                  className="form-input"
                  placeholder="e.g. CT-9824"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-secondary"
                style={{ width: '100%' }}
                disabled={loading || !inputCode.trim()}
              >
                <ArrowRight size={18} />
                <span>{loading ? 'Connecting...' : 'Join Duel'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // --- Render 2: Waiting Room ---
  if (viewState === 'waiting') {
    return (
      <div style={{ maxWidth: '540px', margin: '3rem auto', padding: '0 1rem', textAlign: 'center' }}>
        <div className="card" style={{ padding: '2.5rem' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-primary-light)',
              color: 'var(--color-primary-forest)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem'
            }}
          >
            <Clock size={32} />
          </div>

          <h2 style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>Waiting for Challenger</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '1.75rem' }}>
            Share this room code with your friend. As soon as they enter, the 3-second countdown begins automatically!
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              padding: '1rem',
              backgroundColor: 'var(--color-bg-soft)',
              borderRadius: 'var(--radius-lg)',
              border: '2px dashed var(--color-primary-sage)',
              marginBottom: '1.75rem'
            }}
          >
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.8rem', fontWeight: 800, letterSpacing: '0.15em', color: 'var(--color-primary-forest)' }}>
              {roomId}
            </span>
            <button
              className="btn btn-outline btn-sm"
              onClick={handleCopyCode}
              title="Copy room code"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            <span className="spinner" style={{ width: '14px', height: '14px' }} />
            <span>Listening for player 2 connection...</span>
          </div>

          <div style={{ marginTop: '2rem', borderTop: '1px solid var(--color-border-subtle)', paddingTop: '1.25rem' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setViewState('lobby')}>
              Cancel Battle
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Render 3: Racing Track Arena ---
  return (
    <div style={{ maxWidth: '1000px', margin: '1.5rem auto', padding: '0 1rem' }}>
      {/* Race Progress Tracks */}
      <div
        className="card"
        style={{
          padding: '1.25rem 1.5rem',
          marginBottom: '1.5rem',
          backgroundColor: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Swords size={18} style={{ color: 'var(--color-primary-forest)' }} />
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>
              Live Duel: {roomData?.title || 'Coding Sprint'} ({roomData?.language})
            </h3>
          </div>
          <span className="badge badge-forest">Room {roomId}</span>
        </div>

        {/* Players Tracks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {playersList.map((p) => {
            const isMe = p.id === myPlayerId;
            return (
              <div key={p.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <img
                      src={p.avatar}
                      alt={p.username}
                      style={{ width: '22px', height: '22px', borderRadius: '50%' }}
                    />
                    <strong>{p.username}</strong>
                    {isMe && <span className="badge badge-sage" style={{ fontSize: '0.7rem' }}>You</span>}
                    {p.isFinished && <span style={{ color: 'var(--color-primary-forest)', fontWeight: 700 }}>🏁 Finished</span>}
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', fontWeight: 600 }}>
                    <span>{p.wpm} WPM</span>
                    <span style={{ color: 'var(--color-text-muted)' }}>{p.progressPercent}%</span>
                  </div>
                </div>

                {/* Progress Bar Track */}
                <div
                  style={{
                    width: '100%',
                    height: '10px',
                    backgroundColor: 'var(--color-bg-soft)',
                    borderRadius: '5px',
                    overflow: 'hidden',
                    position: 'relative'
                  }}
                >
                  <div
                    style={{
                      width: `${p.progressPercent}%`,
                      height: '100%',
                      background: isMe
                        ? 'linear-gradient(90deg, var(--color-primary-sage), var(--color-primary-forest))'
                        : 'linear-gradient(90deg, #E0A96D, #C67D3B)',
                      borderRadius: '5px',
                      transition: 'width 250ms ease'
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Duel Results Banner if Finished */}
      {viewState === 'results' && roomData?.winner && (
        <div
          className="card"
          style={{
            padding: '1.5rem',
            textAlign: 'center',
            marginBottom: '1.5rem',
            backgroundColor: 'var(--color-primary-light)',
            border: '2px solid var(--color-primary-forest)'
          }}
        >
          <Trophy size={36} style={{ color: 'var(--color-primary-forest)', margin: '0 auto 0.5rem' }} />
          <h2 style={{ fontSize: '1.5rem', margin: '0 0 0.5rem', color: 'var(--color-primary-forest)' }}>
            {roomData.winner.id === myPlayerId ? '🏆 Victory! You Won The Duel!' : `🏁 ${roomData.winner.username} Won The Duel!`}
          </h2>
          <p style={{ margin: '0 0 1rem', fontSize: '0.9rem' }}>
            Winning Speed: <strong>{roomData.winner.wpm} WPM</strong>
          </p>
          <button className="btn btn-primary" onClick={() => setViewState('lobby')}>
            <RotateCcw size={16} />
            <span>Race Again</span>
          </button>
        </div>
      )}

      {/* Interactive Typing Engine */}
      {roomData?.targetText && (
        <TypingEngine
          targetText={roomData.targetText}
          title={roomData.title}
          language={roomData.language}
          isCode={true}
          mode="text"
          onComplete={(res) => {
            handleLiveProgress(res, 100);
          }}
        />
      )}
    </div>
  );
}

