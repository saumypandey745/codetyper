import { useState, useEffect, useRef, useCallback } from 'react';
import { soundEngine } from '../utils/soundEngine.js';
import { calculateMetrics, calculateConsistency, calculateHandBalance } from '../utils/wpmCalculator.js';
import { keyStatsManager } from '../utils/gamificationEngine.js';

export function useTypingEngine({
  targetText = '',
  snippetId = null,
  mode = 'time', // 'time', 'text', 'words'
  duration = 60,
  countdownEnabled = true,
  onComplete = null
}) {
  const [status, setStatus] = useState('idle'); // 'idle', 'countdown', 'typing', 'completed'
  const [countdown, setCountdown] = useState(3);
  const [typedText, setTypedText] = useState('');
  const [cursorIndex, setCursorIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(duration);
  const [wpmTimeline, setWpmTimeline] = useState([]);
  const [lastPressedKey, setLastPressedKey] = useState(null);
  const [lastMatchState, setLastMatchState] = useState(null);

  // Pro Telemetry & Ghost Replay State
  const [ghostIndex, setGhostIndex] = useState(0);
  const [ghostInfo, setGhostInfo] = useState(null); // { wpm, accuracy }

  const startTimeRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const keystrokeEventsRef = useRef([]);
  const recentHitsRef = useRef([]);
  const peakBurstWpmRef = useRef(0);

  // Mutable refs for decoupled timer access (eliminating timer interval recreation on keypress)
  const typedTextRef = useRef('');
  typedTextRef.current = typedText;

  const remainingSecondsRef = useRef(duration);
  remainingSecondsRef.current = remainingSeconds;

  const wpmTimelineRef = useRef([]);
  wpmTimelineRef.current = wpmTimeline;

  // Load existing ghost replay for this snippet
  const ghostStorageKey = `codetyper_ghost_${String(snippetId || targetText.slice(0, 32)).replace(/[^a-zA-Z0-9]/g, '_')}`;

  useEffect(() => {
    try {
      const savedGhost = localStorage.getItem(ghostStorageKey);
      if (savedGhost) {
        const parsed = JSON.parse(savedGhost);
        setGhostInfo({ wpm: parsed.wpm, accuracy: parsed.accuracy });
      } else {
        setGhostInfo(null);
      }
    } catch (e) {
      setGhostInfo(null);
    }
  }, [ghostStorageKey]);

  // Compute live character correctness (Typing Master style: uncorrected errors)
  let correctCount = 0;
  let incorrectCount = 0;
  for (let i = 0; i < typedText.length; i++) {
    if (typedText[i] === targetText[i]) {
      correctCount++;
    } else {
      incorrectCount++;
    }
  }

  // Active uncorrected errors in typed text
  const totalErrors = incorrectCount;
  const totalErrorsRef = useRef(0);
  totalErrorsRef.current = incorrectCount;

  const metricsRef = useRef({ correctCount: 0, incorrectCount: 0 });
  metricsRef.current = { correctCount, incorrectCount };

  // Reset engine when targetText or duration changes
  const resetEngine = useCallback(() => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setStatus('idle');
    setCountdown(3);
    setTypedText('');
    setCursorIndex(0);
    setGhostIndex(0);
    setElapsedSeconds(0);
    setRemainingSeconds(duration);
    setWpmTimeline([]);
    setLastPressedKey(null);
    setLastMatchState(null);
    startTimeRef.current = null;
    keystrokeEventsRef.current = [];
    recentHitsRef.current = [];
    peakBurstWpmRef.current = 0;
  }, [duration]);

  // Real-time live metrics updated on keystrokes and timer ticks
  const currentElapsedSeconds = startTimeRef.current && status === 'typing'
    ? Math.max(0, (Date.now() - startTimeRef.current) / 1000)
    : elapsedSeconds;

  const liveMetrics = calculateMetrics({
    totalCharacters: typedText.length,
    correctCharacters: correctCount,
    incorrectCharacters: incorrectCount,
    errorCount: incorrectCount,
    totalErrors: incorrectCount,
    durationSeconds: currentElapsedSeconds
  });

  // Finish session
  const finishSession = useCallback(() => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setStatus('completed');
    soundEngine.playComplete();

    const currentTyped = typedTextRef.current;
    let finalCorrect = 0;
    let finalIncorrect = 0;
    for (let i = 0; i < currentTyped.length; i++) {
      if (currentTyped[i] === targetText[i]) {
        finalCorrect++;
      } else {
        finalIncorrect++;
      }
    }

    const elapsed = startTimeRef.current
      ? Math.max(0.1, (Date.now() - startTimeRef.current) / 1000)
      : Math.max(0.1, elapsedSeconds);

    // If time mode and timer expired (remaining <= 0), use full test duration.
    // If finished early or text mode, use the actual elapsed time.
    const finalSecs = (mode === 'time' && remainingSecondsRef.current <= 0)
      ? duration
      : elapsed;

    const finalMetrics = calculateMetrics({
      totalCharacters: currentTyped.length,
      correctCharacters: finalCorrect,
      incorrectCharacters: finalIncorrect,
      errorCount: finalIncorrect,
      totalErrors: finalIncorrect,
      durationSeconds: finalSecs
    });

    // Pro Telemetry Calculations
    const consistency = calculateConsistency(wpmTimelineRef.current, finalMetrics.netWpm);
    const handBalance = calculateHandBalance(currentTyped);
    const finalBurstWpm = Math.max(finalMetrics.netWpm, Math.round(peakBurstWpmRef.current * 10) / 10);

    // Save ghost if this is a personal best
    try {
      const savedGhost = localStorage.getItem(ghostStorageKey);
      const existingGhost = savedGhost ? JSON.parse(savedGhost) : null;
      if (!existingGhost || finalMetrics.netWpm > existingGhost.wpm) {
        localStorage.setItem(
          ghostStorageKey,
          JSON.stringify({
            wpm: finalMetrics.netWpm,
            accuracy: finalMetrics.accuracy,
            events: keystrokeEventsRef.current
          })
        );
      }
    } catch (e) {}

    if (onCompleteRef.current) {
      onCompleteRef.current({
        ...finalMetrics,
        totalCharacters: currentTyped.length,
        correctCharacters: finalCorrect,
        incorrectCharacters: finalIncorrect,
        errorCount: finalIncorrect,
        totalErrors: finalIncorrect,
        totalChars: currentTyped.length,
        correctChars: finalCorrect,
        incorrectChars: finalIncorrect,
        durationSeconds: finalSecs,
        timeline: wpmTimelineRef.current,
        burstWpm: finalBurstWpm,
        consistency,
        handBalance,
        hadGhost: !!ghostInfo
      });
    }
  }, [targetText, mode, duration, elapsedSeconds, ghostStorageKey, ghostInfo]);

  const finishSessionRef = useRef(finishSession);
  finishSessionRef.current = finishSession;

  // Decoupled timer interval: depends ONLY on [status, mode, duration]
  // Keystrokes do NOT recreate this interval
  useEffect(() => {
    if (status !== 'typing') return;

    startTimeRef.current = Date.now();

    // Load ghost events for replay tracking
    let ghostEvents = [];
    try {
      const savedGhost = localStorage.getItem(ghostStorageKey);
      if (savedGhost) {
        ghostEvents = JSON.parse(savedGhost).events || [];
      }
    } catch (e) {}

    timerIntervalRef.current = setInterval(() => {
      const now = Date.now();
      const currentElapsedMs = now - startTimeRef.current;
      const currentElapsed = Math.max(1, currentElapsedMs / 1000);
      setElapsedSeconds(currentElapsed);

      // Advance ghost cursor along recorded timeline
      if (ghostEvents.length > 0) {
        let currentGhostIdx = 0;
        for (let i = 0; i < ghostEvents.length; i++) {
          if (ghostEvents[i].t <= currentElapsedMs) {
            currentGhostIdx = ghostEvents[i].i;
          } else {
            break;
          }
        }
        setGhostIndex(currentGhostIdx);
      }

      if (mode === 'time') {
        const left = Math.max(0, Math.ceil(duration - currentElapsed));
        setRemainingSeconds(left);
        if (left <= 0) {
          finishSessionRef.current();
          return;
        }
      }

      // Record second snapshot for analytics timeline chart
      const secondMark = Math.floor(currentElapsed);
      const currentTypedLen = typedTextRef.current.length;
      const { correctCount: cCount, incorrectCount: iCount } = metricsRef.current;
      const errCount = totalErrorsRef.current;

      setWpmTimeline((prev) => {
        if (prev.length > 0 && prev[prev.length - 1].second === secondMark) {
          return prev;
        }
        const snapMetrics = calculateMetrics({
          totalCharacters: currentTypedLen,
          correctCharacters: cCount,
          incorrectCharacters: iCount,
          errorCount: errCount,
          durationSeconds: currentElapsed
        });
        return [
          ...prev,
          { second: secondMark, wpm: snapMetrics.netWpm, accuracy: snapMetrics.accuracy }
        ];
      });
    }, 250);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [status, mode, duration]);

  // Handle countdown if enabled
  useEffect(() => {
    if (status !== 'countdown') return;

    if (countdown > 1) {
      const timeout = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timeout);
    } else if (countdown === 1) {
      const timeout = setTimeout(() => {
        setStatus('typing');
        setCountdown(0);
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [status, countdown]);

  const startTyping = useCallback(() => {
    if (status === 'completed') return;
    if (countdownEnabled) {
      setStatus('countdown');
      setCountdown(3);
    } else {
      setStatus('typing');
    }
  }, [status, countdownEnabled]);

  // Process keystrokes
  const handleKeyDown = useCallback(
    (e) => {
      // Shortcuts
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        resetEngine();
        startTyping();
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        if (status === 'typing' || status === 'countdown') {
          setStatus('idle');
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        }
        return;
      }

      // Tab key handling for code indentation
      if (e.key === 'Tab') {
        e.preventDefault();
        if (status === 'idle') {
          startTyping();
          if (countdownEnabled) return;
        }
        if (status === 'typing' || (!countdownEnabled && status === 'idle')) {
          const expected = targetText.slice(cursorIndex, cursorIndex + 2);
          const addition = expected === '  ' ? '  ' : ' ';
          setTypedText((prev) => prev + addition);
          setCursorIndex((idx) => idx + addition.length);
          soundEngine.playKeypress();
        }
        return;
      }

      // If idle, start typing on printable key
      if (status === 'idle') {
        if (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Enter') {
          startTyping();
          // P1-ENG-06 FIX: If countdown is enabled, start countdown and DO NOT leak the triggering key
          if (countdownEnabled) {
            return;
          }
        } else {
          return;
        }
      }

      // During countdown or when completed, ignore keystrokes
      if (status !== 'typing' && !(status === 'idle' && !countdownEnabled)) {
        return;
      }

      if (e.key === 'Backspace') {
        e.preventDefault();
        if (cursorIndex > 0) {
          setTypedText((prev) => prev.slice(0, -1));
          setCursorIndex((idx) => Math.max(0, idx - 1));
          soundEngine.playKeypress();
        }
        return;
      }

      let charToAdd = null;
      if (e.key === 'Enter') {
        e.preventDefault();
        charToAdd = '\n';
      } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        charToAdd = e.key;
      }

      if (charToAdd !== null) {
        e.preventDefault();
        const expectedChar = targetText[cursorIndex];
        const isMatch = charToAdd === expectedChar;

        if (isMatch) {
          soundEngine.playKeypress();
        } else {
          soundEngine.playError();
        }

        // Live Virtual Keyboard & Heatmap Telemetry
        setLastPressedKey(charToAdd === '\n' ? 'Enter' : charToAdd);
        setLastMatchState(isMatch ? 'correct' : 'wrong');
        keyStatsManager.recordKeystroke(charToAdd, isMatch);

        // Record for ghost replay and burst telemetry
        const now = Date.now();
        if (startTimeRef.current) {
          keystrokeEventsRef.current.push({
            t: Math.round(now - startTimeRef.current),
            i: cursorIndex + 1
          });
        }
        recentHitsRef.current = recentHitsRef.current.filter((ts) => now - ts <= 2000);
        recentHitsRef.current.push(now);
        if (recentHitsRef.current.length >= 2) {
          const instantBurst = Math.round(((recentHitsRef.current.length / 5) / (2 / 60)) * 10) / 10;
          peakBurstWpmRef.current = Math.max(peakBurstWpmRef.current, instantBurst);
        }

        const nextTyped = typedText + charToAdd;
        const nextIndex = cursorIndex + 1;

        setTypedText(nextTyped);
        setCursorIndex(nextIndex);

        // Check if finished entire text
        if (nextIndex >= targetText.length) {
          finishSession();
        }
      }
    },
    [status, cursorIndex, targetText, typedText, countdownEnabled, startTyping, resetEngine, finishSession]
  );

  return {
    status,
    countdown,
    typedText,
    cursorIndex,
    ghostIndex,
    ghostInfo,
    elapsedSeconds,
    remainingSeconds,
    totalErrors,
    liveMetrics,
    lastPressedKey,
    lastMatchState,
    handleKeyDown,
    startTyping,
    resetEngine,
    finishSession
  };
}
