import { useState, useEffect, useRef, useCallback } from 'react';
import { soundEngine } from '../utils/soundEngine.js';
import { calculateMetrics } from '../utils/wpmCalculator.js';

export function useTypingEngine({
  targetText = '',
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
  const [totalErrors, setTotalErrors] = useState(0);

  const startTimeRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Mutable refs for decoupled timer access (eliminating timer interval recreation on keypress)
  const typedTextRef = useRef('');
  typedTextRef.current = typedText;

  const totalErrorsRef = useRef(0);
  totalErrorsRef.current = totalErrors;

  const wpmTimelineRef = useRef([]);
  wpmTimelineRef.current = wpmTimeline;

  // Compute live character correctness
  let correctCount = 0;
  let incorrectCount = 0;
  for (let i = 0; i < typedText.length; i++) {
    if (typedText[i] === targetText[i]) {
      correctCount++;
    } else {
      incorrectCount++;
    }
  }

  const metricsRef = useRef({ correctCount: 0, incorrectCount: 0 });
  metricsRef.current = { correctCount, incorrectCount };

  // Reset engine when targetText or duration changes
  const resetEngine = useCallback(() => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setStatus('idle');
    setCountdown(3);
    setTypedText('');
    setCursorIndex(0);
    setElapsedSeconds(0);
    setRemainingSeconds(duration);
    setWpmTimeline([]);
    setTotalErrors(0);
    startTimeRef.current = null;
  }, [duration]);

  const liveMetrics = calculateMetrics({
    totalCharacters: typedText.length,
    correctCharacters: correctCount,
    incorrectCharacters: incorrectCount,
    errorCount: totalErrors,
    durationSeconds: elapsedSeconds > 0 ? elapsedSeconds : 1
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
      ? Math.max(1, (Date.now() - startTimeRef.current) / 1000)
      : (elapsedSeconds > 0 ? elapsedSeconds : 1);

    const finalSecs = mode === 'time' ? duration : elapsed;

    const finalMetrics = calculateMetrics({
      totalCharacters: currentTyped.length,
      correctCharacters: finalCorrect,
      incorrectCharacters: finalIncorrect,
      errorCount: totalErrorsRef.current,
      durationSeconds: finalSecs
    });

    if (onCompleteRef.current) {
      onCompleteRef.current({
        ...finalMetrics,
        totalCharacters: currentTyped.length,
        correctCharacters: finalCorrect,
        incorrectCharacters: finalIncorrect,
        errorCount: totalErrorsRef.current,
        timeline: wpmTimelineRef.current
      });
    }
  }, [targetText, mode, duration, elapsedSeconds]);

  const finishSessionRef = useRef(finishSession);
  finishSessionRef.current = finishSession;

  // Decoupled timer interval: depends ONLY on [status, mode, duration]
  // Keystrokes do NOT recreate this interval
  useEffect(() => {
    if (status !== 'typing') return;

    startTimeRef.current = Date.now();

    timerIntervalRef.current = setInterval(() => {
      const now = Date.now();
      const currentElapsed = Math.max(1, (now - startTimeRef.current) / 1000);
      setElapsedSeconds(currentElapsed);

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
          setTotalErrors((err) => err + 1);
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
    elapsedSeconds,
    remainingSeconds,
    totalErrors,
    liveMetrics,
    handleKeyDown,
    startTyping,
    resetEngine,
    finishSession
  };
}
