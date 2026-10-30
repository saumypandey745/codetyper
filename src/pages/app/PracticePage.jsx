import React, { useState, useEffect, useCallback } from 'react';
import {
  Code2,
  BookOpen,
  Timer,
  Keyboard,
  RotateCcw,
  Sparkles,
  Sliders,
  ChevronDown,
  Shuffle,
  FileText,
  CheckCircle,
  CheckCircle2,
  HelpCircle,
  Layers,
  ArrowRight,
  ArrowLeft,
  ListOrdered,
  X,
  GraduationCap,
  Trophy,
  Lock,
  Unlock,
  Search
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSettings } from '../../context/SettingsContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { api } from '../../utils/api.js';
import { TypingEngine } from '../../components/typing/TypingEngine.jsx';
import { ResultsCard } from '../../components/typing/ResultsCard.jsx';
import { programmingLanguages, englishCategories } from '../../../server/seedData.js';

const GUEST_COMPLETED_KEY = 'codetyper_completed_lessons';

export function PracticePage({
  initialType = 'practice',
  initialLanguage = null,
  onNavigate
}) {
  const { user, updateUserStats } = useAuth();
  const { settings } = useSettings();
  const toast = useToast();

  // Mode and filter states
  const [practiceType, setPracticeType] = useState(initialType);
  const [selectedLanguage, setSelectedLanguage] = useState(initialLanguage || settings.default_language || 'JavaScript');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [mode, setMode] = useState(initialType === 'test' ? 'time' : 'time');
  const [duration, setDuration] = useState(initialType === 'test' ? 60 : 30);
  const [wordCount, setWordCount] = useState(25);

  // Content & Curriculum state
  const [contentList, setContentList] = useState([]);
  const [currentSnippet, setCurrentSnippet] = useState(null);
  const [loadingContent, setLoadingContent] = useState(true);
  const [customText, setCustomText] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [showCurriculumModal, setShowCurriculumModal] = useState(false);

  // Curriculum modal search & filter
  const [modalFilter, setModalFilter] = useState('all');
  const [modalSearch, setModalSearch] = useState('');

  // Completed lesson IDs (stored in localStorage for guest, DB for authenticated)
  const [completedLessonIds, setCompletedLessonIds] = useState(() => {
    try {
      const saved = localStorage.getItem(GUEST_COMPLETED_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Result state
  const [completedResult, setCompletedResult] = useState(null);
  const [engineKey, setEngineKey] = useState(Date.now());

  // Sync when initialType changes from sidebar
  useEffect(() => {
    if (initialType) {
      setPracticeType(initialType);
      setCompletedResult(null);
      if (initialType === 'test') {
        setDuration(60);
        setMode('time');
      }
    }
  }, [initialType]);

  const isCode = practiceType === 'coding';
  const isTest = practiceType === 'test';

  // Load content from API
  const fetchContent = useCallback(async (preferredSnippetId = null) => {
    setLoadingContent(true);
    try {
      const params = {};
      if (practiceType === 'coding') {
        params.type = 'code';
        if (selectedLanguage && selectedLanguage !== 'All') {
          params.language = selectedLanguage;
        }
      } else if (practiceType === 'english') {
        params.type = 'english';
        if (selectedCategory && selectedCategory !== 'All') {
          params.category = selectedCategory;
        }
      } else if (practiceType === 'test') {
        params.type = 'english';
      }

      if (selectedDifficulty && selectedDifficulty !== 'all') {
        params.difficulty = selectedDifficulty;
      }

      const res = await api.practice.getContent(params);
      const items = res.items || (res.item ? [res.item] : []);
      setContentList(items);

      // Merge server completed lesson IDs with local storage
      let mergedCompleted = completedLessonIds;
      if (Array.isArray(res.completedLessonIds)) {
        mergedCompleted = Array.from(new Set([...completedLessonIds, ...res.completedLessonIds]));
        setCompletedLessonIds(mergedCompleted);
        try {
          localStorage.setItem(GUEST_COMPLETED_KEY, JSON.stringify(mergedCompleted));
        } catch {}
      }

      if (items.length > 0) {
        if (preferredSnippetId) {
          const found = items.find((it) => it.id === preferredSnippetId);
          setCurrentSnippet(found || items[0]);
        } else {
          // Select the first unlocked but incomplete lesson, or Lesson 1
          const firstIncompleteUnlocked = items.find((it, idx) => {
            const unlocked = idx === 0 || mergedCompleted.includes(items[idx - 1]?.id);
            return unlocked && !mergedCompleted.includes(it.id);
          });
          setCurrentSnippet(firstIncompleteUnlocked || items[0]);
        }
      } else {
        // Fallback default text if server returns empty list
        setCurrentSnippet({
          id: null,
          title: isCode ? `${selectedLanguage} Function Practice` : 'Focused Typing Discipline',
          language: isCode ? selectedLanguage : 'English',
          difficulty: 'intermediate',
          content: isCode
            ? `function calculateVelocity(distance, time) {\n  if (time <= 0) return 0;\n  const speed = distance / time;\n  return Number(speed.toFixed(2));\n}`
            : 'Typing with consistent rhythm and deliberate calmness prevents muscle fatigue. Keep your shoulders relaxed, breathe evenly, and let muscle memory guide your fingers across the keyboard.'
        });
      }
    } catch (err) {
      console.warn('Failed to fetch practice content', err);
      setCurrentSnippet({
        id: null,
        title: 'Calm Practice Session',
        language: 'English',
        difficulty: 'intermediate',
        content: 'Breathe deeply and find your focus. True mastery is built through relaxed consistency, deliberate keystrokes, and mindful repetition.'
      });
    } finally {
      setLoadingContent(false);
      setEngineKey(Date.now());
    }
  }, [practiceType, selectedLanguage, selectedCategory, selectedDifficulty, isCode, completedLessonIds]);

  useEffect(() => {
    if (!isCustomMode) {
      fetchContent();
    }
  }, [fetchContent, isCustomMode]);

  // Sequential Unlock Rule:
  // Lesson 1 is always unlocked.
  // Lesson N is unlocked only if Lesson N-1 is completed.
  const isLessonUnlocked = useCallback(
    (idx) => {
      if (idx === 0) return true;
      const prev = contentList[idx - 1];
      return prev ? completedLessonIds.includes(prev.id) : false;
    },
    [contentList, completedLessonIds]
  );

  // Derived lesson & curriculum calculations
  const currentLessonIndex = contentList.findIndex((c) => c.id === currentSnippet?.id);
  const currentLessonNumber = currentLessonIndex >= 0 ? currentLessonIndex + 1 : 1;
  const totalLessons = contentList.length;
  const completedCount = contentList.filter((c) => completedLessonIds.includes(c.id)).length;
  const unlockedLessonsCount = contentList.filter((_, idx) => isLessonUnlocked(idx)).length;
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  const isCurrentCompleted = currentSnippet?.id && completedLessonIds.includes(currentSnippet.id);
  const nextLesson = currentLessonIndex >= 0 && currentLessonIndex + 1 < contentList.length
    ? contentList[currentLessonIndex + 1]
    : null;
  const prevLesson = currentLessonIndex > 0
    ? contentList[currentLessonIndex - 1]
    : null;

  // Direct lesson selector with unlock validation
  const handleSelectLesson = (lesson, idx) => {
    if (!isLessonUnlocked(idx)) {
      toast.warning(`🔒 Lesson ${idx + 1} is locked! Complete Lesson ${idx} first to unlock it.`);
      return;
    }
    setCurrentSnippet(lesson);
    setCompletedResult(null);
    setEngineKey(Date.now());
    setShowCurriculumModal(false);
  };

  // Next lesson handler (sequential guided path)
  const handleNextSnippet = () => {
    if (nextLesson && currentLessonIndex + 1 < contentList.length) {
      const nextIdx = currentLessonIndex + 1;
      if (!isLessonUnlocked(nextIdx)) {
        toast.warning(`🔒 Lesson ${nextIdx + 1} is locked! Complete Lesson ${currentLessonNumber} with ≥80% accuracy to unlock!`);
        return;
      }
      setCurrentSnippet(nextLesson);
      setCompletedResult(null);
      setEngineKey(Date.now());
    } else if (contentList.length > 1 && currentSnippet) {
      // Loop back to lesson 1
      setCurrentSnippet(contentList[0]);
      setCompletedResult(null);
      setEngineKey(Date.now());
    } else {
      fetchContent();
    }
  };

  // Previous lesson handler
  const handlePrevSnippet = () => {
    if (prevLesson) {
      setCurrentSnippet(prevLesson);
      setCompletedResult(null);
      setEngineKey(Date.now());
    }
  };

  // Completion handler
  const handleSessionComplete = async (metrics) => {
    const isPassing = metrics.accuracy >= 80;
    const wasAlreadyCompleted = currentSnippet?.id && completedLessonIds.includes(currentSnippet.id);

    if (currentSnippet?.id && isPassing) {
      setCompletedLessonIds((prev) => {
        if (!prev.includes(currentSnippet.id)) {
          const updated = [...prev, currentSnippet.id];
          try {
            localStorage.setItem(GUEST_COMPLETED_KEY, JSON.stringify(updated));
          } catch {}
          return updated;
        }
        return prev;
      });

      if (!wasAlreadyCompleted && nextLesson) {
        toast.success(`🎉 Lesson ${currentLessonNumber} completed! 🔓 Lesson ${currentLessonNumber + 1} is now UNLOCKED!`);
      }
    }

    // Detect level up (e.g. from beginner to intermediate, or intermediate to advanced)
    let levelUpInfo = null;
    if (nextLesson && currentSnippet?.difficulty && nextLesson.difficulty) {
      if (currentSnippet.difficulty.toLowerCase() !== nextLesson.difficulty.toLowerCase()) {
        levelUpInfo = {
          from: currentSnippet.difficulty,
          to: nextLesson.difficulty
        };
      }
    }

    const isCourseComplete = (currentLessonIndex + 1 >= totalLessons) && isPassing;

    setCompletedResult({
      ...metrics,
      lessonNumber: currentLessonNumber,
      totalLessons,
      nextLesson,
      levelUpInfo,
      isCourseComplete
    });

    // Prepare payload for backend
    const sessionPayload = {
      content_id: currentSnippet?.id || null,
      practice_type: practiceType,
      language: currentSnippet?.language || (isCode ? selectedLanguage : 'English'),
      difficulty: currentSnippet?.difficulty || selectedDifficulty || 'intermediate',
      duration_seconds: metrics.durationSeconds,
      gross_wpm: metrics.grossWpm,
      net_wpm: metrics.netWpm,
      accuracy: metrics.accuracy,
      total_characters: metrics.totalChars,
      correct_characters: metrics.correctChars,
      incorrect_characters: metrics.incorrectChars,
      error_count: metrics.errorCount,
      raw_timeline_json: metrics.timeline || []
    };

    if (user) {
      try {
        const response = await api.sessions.save(sessionPayload);
        if (response.statistics) {
          updateUserStats(response.statistics);
        }
        toast.success(`Lesson recorded! Speed: ${metrics.netWpm} WPM (${metrics.accuracy}% acc)`);
      } catch (err) {
        console.error('Failed to save session to server', err);
        toast.warning('Session completed. Offline queue saved.');
      }
    } else {
      toast.info('Sign up or log in to permanently save your progress and sync across devices.');
    }
  };

  const handleApplyCustomText = () => {
    if (!customText.trim()) {
      toast.error('Please enter some text or code to practice.');
      return;
    }
    setIsCustomMode(true);
    setCurrentSnippet({
      id: null,
      title: 'Custom Practice Passage',
      language: isCode ? selectedLanguage : 'Custom',
      difficulty: 'custom',
      content: customText.trim()
    });
    setShowCustomModal(false);
    setCompletedResult(null);
    setEngineKey(Date.now());
    toast.success('Custom passage loaded.');
  };

  const targetText = currentSnippet?.content || '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '1080px', margin: '0 auto' }}>
      {/* Top Header & Mode Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            {practiceType === 'coding' && <Code2 size={22} color="var(--color-primary-forest)" />}
            {practiceType === 'english' && <BookOpen size={22} color="var(--color-primary-forest)" />}
            {practiceType === 'test' && <Timer size={22} color="var(--color-primary-forest)" />}
            {practiceType === 'practice' && <Keyboard size={22} color="var(--color-primary-forest)" />}
            <h1 style={{ fontSize: '1.75rem', margin: 0, textTransform: 'capitalize' }}>
              {practiceType === 'coding' && 'Coding Practice'}
              {practiceType === 'english' && 'English Practice'}
              {practiceType === 'test' && 'Typing Speed Test'}
              {practiceType === 'practice' && 'Quick Practice'}
            </h1>
          </div>
          <p style={{ margin: 0, fontSize: '0.95rem' }}>
            {practiceType === 'coding' && 'Refine muscle memory for syntactical punctuation, indentation, and logic.'}
            {practiceType === 'english' && 'Cultivate fluid cadence, common word flows, and high accuracy.'}
            {practiceType === 'test' && 'Standardized timed test under exam conditions to establish your rating.'}
            {practiceType === 'practice' && 'Distraction-free everyday typing warm-up.'}
          </p>
        </div>

        {/* Practice Mode Switcher Pills */}
        <div style={{ display: 'inline-flex', padding: '0.25rem', backgroundColor: 'var(--color-bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <button
            className={`btn btn-sm ${practiceType === 'practice' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => { setPracticeType('practice'); setCompletedResult(null); }}
          >
            <Keyboard size={15} />
            <span>Quick</span>
          </button>
          <button
            className={`btn btn-sm ${practiceType === 'coding' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => { setPracticeType('coding'); setCompletedResult(null); }}
          >
            <Code2 size={15} />
            <span>Coding</span>
          </button>
          <button
            className={`btn btn-sm ${practiceType === 'english' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => { setPracticeType('english'); setCompletedResult(null); }}
          >
            <BookOpen size={15} />
            <span>English</span>
          </button>
          <button
            className={`btn btn-sm ${practiceType === 'test' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => { setPracticeType('test'); setDuration(60); setMode('time'); setCompletedResult(null); }}
          >
            <Timer size={15} />
            <span>Speed Test</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Filters, Languages, Difficulty, Timer */}
      <div className="card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {/* Coding Language Dropdown */}
          {practiceType === 'coding' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Language:</span>
              <select
                className="input"
                style={{ padding: '0.4rem 0.75rem', width: 'auto', minWidth: '140px', fontSize: '0.875rem' }}
                value={selectedLanguage}
                onChange={(e) => {
                  setSelectedLanguage(e.target.value);
                  setIsCustomMode(false);
                  setCompletedResult(null);
                }}
              >
                {programmingLanguages.map((lang) => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>
          )}

          {/* English Category Dropdown */}
          {practiceType === 'english' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Category:</span>
              <select
                className="input"
                style={{ padding: '0.4rem 0.75rem', width: 'auto', minWidth: '150px', fontSize: '0.875rem' }}
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setIsCustomMode(false);
                  setCompletedResult(null);
                }}
              >
                <option value="All">All Categories</option>
                {englishCategories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          )}

          {/* Difficulty Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginRight: '0.25rem' }}>
              Level:
            </span>
            {['all', 'beginner', 'intermediate', 'advanced'].map((lvl) => (
              <button
                key={lvl}
                className={`btn btn-sm ${selectedDifficulty === lvl ? 'btn-primary' : 'btn-outline'}`}
                style={{ textTransform: 'capitalize', padding: '0.25rem 0.65rem', fontSize: '0.8rem' }}
                onClick={() => {
                  setSelectedDifficulty(lvl);
                  setIsCustomMode(false);
                  setCompletedResult(null);
                }}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Right side controls: Mode, Duration, Shuffle, Custom */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Mode Switcher: Time vs Words vs Complete Passage */}
          {!isTest && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <button
                className={`btn btn-sm ${mode === 'time' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setMode('time')}
                title="Time-based countdown"
              >
                Time
              </button>
              <button
                className={`btn btn-sm ${mode === 'words' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setMode('words')}
                title="Fixed word count"
              >
                Words
              </button>
              <button
                className={`btn btn-sm ${mode === 'text' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setMode('text')}
                title="Complete full snippet"
              >
                Passage
              </button>
            </div>
          )}

          {/* Duration selectors */}
          {mode === 'time' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              {(isTest ? [30, 60, 120, 300] : [15, 30, 60, 120]).map((sec) => (
                <button
                  key={sec}
                  className={`btn btn-sm ${duration === sec ? 'btn-primary' : 'btn-outline'}`}
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', minWidth: '38px' }}
                  onClick={() => { setDuration(sec); setCompletedResult(null); setEngineKey(Date.now()); }}
                >
                  {sec >= 60 ? `${sec / 60}m` : `${sec}s`}
                </button>
              ))}
            </div>
          )}

          {/* Word count selectors */}
          {mode === 'words' && !isTest && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              {[10, 25, 50, 100].map((w) => (
                <button
                  key={w}
                  className={`btn btn-sm ${wordCount === w ? 'btn-primary' : 'btn-outline'}`}
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', minWidth: '36px' }}
                  onClick={() => { setWordCount(w); setCompletedResult(null); setEngineKey(Date.now()); }}
                >
                  {w}
                </button>
              ))}
            </div>
          )}

          {/* Shuffle / Next Snippet */}
          <button
            className="btn btn-outline btn-sm"
            onClick={handleNextSnippet}
            title="Load another passage"
          >
            <Shuffle size={14} />
            <span>Next</span>
          </button>

          {/* Custom text button */}
          <button
            className={`btn btn-sm ${isCustomMode ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setShowCustomModal(true)}
            title="Paste custom text or code"
          >
            <FileText size={14} />
            <span>Custom</span>
          </button>
        </div>
      </div>

      {/* Lesson Curriculum & Level Progression Bar */}
      {!isCustomMode && !isTest && totalLessons > 0 && (
        <div
          className="card"
          style={{
            padding: '0.85rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            background: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border)',
            borderLeft: '4px solid var(--color-primary-forest)'
          }}
        >
          {/* Left: Lesson Number, Title & Level Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span
              className="badge badge-forest"
              style={{ fontWeight: 700, fontSize: '0.82rem', padding: '0.3rem 0.65rem' }}
            >
              Lesson {currentLessonNumber} of {totalLessons}
            </span>

            <span style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--color-text-primary)' }}>
              {currentSnippet?.title || 'Focused Practice'}
            </span>

            <span
              className={`badge ${
                currentSnippet?.difficulty === 'beginner'
                  ? 'badge-sage'
                  : currentSnippet?.difficulty === 'intermediate'
                  ? 'badge-sand'
                  : 'badge-terracotta'
              }`}
              style={{ textTransform: 'capitalize', fontSize: '0.75rem' }}
            >
              {currentSnippet?.difficulty || 'Practice'}
            </span>

            {isCurrentCompleted && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  color: 'var(--color-primary-forest)',
                  fontSize: '0.8rem',
                  fontWeight: 600
                }}
              >
                <CheckCircle2 size={15} />
                <span>Completed</span>
              </span>
            )}
          </div>

          {/* Right: Progress % Bar & Prev / Next Navigation & All Lessons Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            {/* Progress Bar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', minWidth: '150px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.75rem',
                  color: 'var(--color-text-muted)'
                }}
              >
                <span>Curriculum Progress</span>
                <span style={{ fontWeight: 600, color: 'var(--color-primary-forest)' }}>
                  {completedCount}/{totalLessons} ({progressPercent}%)
                </span>
              </div>
              <div
                style={{
                  width: '100%',
                  height: '6px',
                  backgroundColor: 'var(--color-bg-soft)',
                  borderRadius: '999px',
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    width: `${progressPercent}%`,
                    height: '100%',
                    backgroundColor: 'var(--color-primary-forest)',
                    borderRadius: '999px',
                    transition: 'width 0.4s ease'
                  }}
                />
              </div>
            </div>

            {/* Quick Prev / Next Arrows */}
            <div style={{ display: 'inline-flex', gap: '0.25rem' }}>
              <button
                className="btn btn-outline btn-sm"
                disabled={!prevLesson}
                onClick={handlePrevSnippet}
                title={prevLesson ? `Previous: Lesson ${currentLessonNumber - 1} (${prevLesson.title})` : 'First lesson'}
                style={{ padding: '0.35rem 0.55rem' }}
              >
                <ArrowLeft size={14} />
              </button>
              <button
                className="btn btn-outline btn-sm"
                disabled={!nextLesson || !isLessonUnlocked(currentLessonIndex + 1)}
                onClick={handleNextSnippet}
                title={
                  !nextLesson
                    ? 'Last lesson'
                    : !isLessonUnlocked(currentLessonIndex + 1)
                    ? 'Next lesson locked (Complete this lesson first)'
                    : `Next: Lesson ${currentLessonNumber + 1} (${nextLesson.title})`
                }
                style={{ padding: '0.35rem 0.55rem' }}
              >
                <ArrowRight size={14} />
              </button>
            </div>

            {/* Curriculum Modal Trigger */}
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setShowCurriculumModal(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem' }}
            >
              <ListOrdered size={15} />
              <span>All Lessons ({totalLessons})</span>
            </button>
          </div>
        </div>
      )}

      {/* 50-Lesson Quick Progress & Unlock Strip (Horizontal Scroll Roadmap) */}
      {!isCustomMode && !isTest && totalLessons > 0 && (
        <div
          className="card"
          style={{
            padding: '0.75rem 1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.8rem' }}>
            <span style={{ fontWeight: 600, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>Lesson Roadmap (1 to {totalLessons})</span>
              <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>• Complete a lesson to unlock the next</span>
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem' }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>
                🔓 <strong>{unlockedLessonsCount}</strong> Unlocked
              </span>
              <span style={{ color: 'var(--color-text-secondary)' }}>
                ✓ <strong style={{ color: 'var(--color-primary-forest)' }}>{completedCount}</strong> Completed
              </span>
              <span style={{ color: 'var(--color-text-muted)' }}>
                🔒 <strong>{totalLessons - unlockedLessonsCount}</strong> Locked
              </span>
            </div>
          </div>

          {/* Horizontally scrollable pill strip */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              overflowX: 'auto',
              paddingBottom: '0.35rem',
              scrollbarWidth: 'thin'
            }}
          >
            {contentList.map((item, idx) => {
              const isSelected = item.id === currentSnippet?.id;
              const isCompleted = completedLessonIds.includes(item.id);
              const isUnlocked = isLessonUnlocked(idx);
              const lessonNum = idx + 1;

              return (
                <button
                  key={item.id || idx}
                  onClick={() => handleSelectLesson(item, idx)}
                  disabled={!isUnlocked}
                  title={
                    !isUnlocked
                      ? `Lesson ${lessonNum}: Locked (Complete Lesson ${lessonNum - 1} first)`
                      : isCompleted
                      ? `Lesson ${lessonNum}: ${item.title} (Completed ✓)`
                      : isSelected
                      ? `Lesson ${lessonNum}: ${item.title} (Currently Active)`
                      : `Lesson ${lessonNum}: ${item.title} (Unlocked)`
                  }
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    padding: '0.25rem 0.55rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.75rem',
                    fontWeight: isSelected ? 700 : 500,
                    whiteSpace: 'nowrap',
                    cursor: isUnlocked ? 'pointer' : 'not-allowed',
                    border: isSelected
                      ? '2px solid var(--color-primary-forest)'
                      : isCompleted
                      ? '1px solid var(--color-primary-forest)'
                      : isUnlocked
                      ? '1px solid var(--color-border)'
                      : '1px solid var(--color-bg-soft)',
                    backgroundColor: isSelected
                      ? 'var(--color-primary-forest)'
                      : isCompleted
                      ? 'var(--color-bg-soft)'
                      : isUnlocked
                      ? 'var(--color-bg-surface)'
                      : 'var(--color-bg-soft)',
                    color: isSelected
                      ? '#ffffff'
                      : isCompleted
                      ? 'var(--color-primary-forest)'
                      : isUnlocked
                      ? 'var(--color-text-primary)'
                      : 'var(--color-text-muted)',
                    opacity: isUnlocked ? 1 : 0.45,
                    transition: 'all 0.15s ease'
                  }}
                >
                  {isCompleted ? (
                    <CheckCircle2 size={12} />
                  ) : isSelected ? (
                    <span>▶</span>
                  ) : !isUnlocked ? (
                    <Lock size={11} />
                  ) : null}
                  <span>{lessonNum}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Practice Surface */}
      {completedResult ? (
        <ResultsCard
          result={completedResult}
          onTryAgain={() => {
            setCompletedResult(null);
            setEngineKey(Date.now());
          }}
          onNextPractice={handleNextSnippet}
          onNavigate={onNavigate}
        />
      ) : loadingContent ? (
        <div className="card" style={{ padding: '4rem', textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--color-text-secondary)' }}>Preparing your calm typing environment...</p>
        </div>
      ) : (
        <TypingEngine
          key={engineKey}
          targetText={targetText}
          title={currentSnippet?.title || 'Focused Practice'}
          language={currentSnippet?.language || (isCode ? selectedLanguage : 'English')}
          difficulty={currentSnippet?.difficulty || selectedDifficulty}
          isCode={isCode}
          mode={mode}
          duration={duration}
          onComplete={handleSessionComplete}
        />
      )}

      {/* Custom Text Modal */}
      {showCustomModal && (
        <div className="modal-backdrop" onClick={() => setShowCustomModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', width: '90%' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>Paste Custom Practice Text</h3>
            <p style={{ fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              Paste your own code excerpt, documentation paragraph, or study notes to practice typing custom content.
            </p>

            <textarea
              className="input"
              rows={8}
              placeholder="Paste code or text here..."
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', marginBottom: '1.25rem', resize: 'vertical' }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button className="btn btn-ghost" onClick={() => setShowCustomModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleApplyCustomText}>
                Load Custom Passage
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Curriculum / All Lessons Modal (50 Lessons with Filters & Search) */}
      {showCurriculumModal && (
        <div className="modal-backdrop" onClick={() => setShowCurriculumModal(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '720px', width: '94%', maxHeight: '88vh', display: 'flex', flexDirection: 'column' }}
          >
            <div className="modal-header" style={{ marginBottom: '0.75rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <GraduationCap size={22} color="var(--color-primary-forest)" />
                  <h3 style={{ margin: 0, fontSize: '1.25rem' }}>
                    {isCode ? `${selectedLanguage} Curriculum (50 Lessons)` : `${selectedCategory} Curriculum (50 Lessons)`}
                  </h3>
                </div>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                  Progressive curriculum from Lesson 1 to Lesson 50. Complete each lesson to unlock subsequent challenges.
                </p>
              </div>
              <button className="modal-close" onClick={() => setShowCurriculumModal(false)}>
                <X size={18} />
              </button>
            </div>

            {/* Curriculum Stats Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.65rem 1rem',
                backgroundColor: 'var(--color-bg-soft)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '0.75rem',
                fontSize: '0.85rem'
              }}
            >
              <span>
                Total: <strong>{totalLessons} Lessons</strong>
              </span>
              <span>
                Unlocked: <strong style={{ color: 'var(--color-text-primary)' }}>{unlockedLessonsCount}</strong>
              </span>
              <span>
                Completed:{' '}
                <strong style={{ color: 'var(--color-primary-forest)' }}>
                  {completedCount} / {totalLessons} ({progressPercent}%)
                </strong>
              </span>
            </div>

            {/* Filter Tabs & Search Bar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                {[
                  { key: 'all', label: `All (${totalLessons})` },
                  { key: 'beginner', label: 'Beginner (1-15)' },
                  { key: 'intermediate', label: 'Intermediate (16-35)' },
                  { key: 'advanced', label: 'Advanced (36-50)' },
                  { key: 'unlocked', label: `Unlocked Only (${unlockedLessonsCount})` }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    className={`btn btn-sm ${modalFilter === tab.key ? 'btn-primary' : 'btn-outline'}`}
                    style={{ fontSize: '0.75rem', padding: '0.2rem 0.55rem' }}
                    onClick={() => setModalFilter(tab.key)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search input */}
              <div style={{ position: 'relative' }}>
                <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input
                  type="text"
                  className="input"
                  placeholder="Search lessons by title, keyword, or number..."
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                  style={{ paddingLeft: '2.25rem', fontSize: '0.85rem', padding: '0.4rem 0.75rem 0.4rem 2.25rem' }}
                />
              </div>
            </div>

            {/* Lessons List */}
            <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingRight: '0.25rem' }}>
              {contentList
                .filter((lesson, idx) => {
                  const lessonNum = idx + 1;
                  const isUnlocked = isLessonUnlocked(idx);

                  // Tab filter
                  if (modalFilter === 'beginner' && (lessonNum < 1 || lessonNum > 15)) return false;
                  if (modalFilter === 'intermediate' && (lessonNum < 16 || lessonNum > 35)) return false;
                  if (modalFilter === 'advanced' && (lessonNum < 36 || lessonNum > 50)) return false;
                  if (modalFilter === 'unlocked' && !isUnlocked) return false;

                  // Search filter
                  if (modalSearch.trim()) {
                    const q = modalSearch.toLowerCase();
                    const matchTitle = lesson.title.toLowerCase().includes(q);
                    const matchNum = String(lessonNum) === q || `lesson ${lessonNum}`.includes(q);
                    return matchTitle || matchNum;
                  }

                  return true;
                })
                .map((lesson) => {
                  const originalIdx = contentList.findIndex((item) => item.id === lesson.id);
                  const idx = originalIdx >= 0 ? originalIdx : 0;
                  const isSelected = lesson.id === currentSnippet?.id;
                  const isCompleted = completedLessonIds.includes(lesson.id);
                  const isUnlocked = isLessonUnlocked(idx);
                  const lessonNum = idx + 1;

                  return (
                    <div
                      key={lesson.id || idx}
                      onClick={() => handleSelectLesson(lesson, idx)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        border: isSelected
                          ? '1.5px solid var(--color-primary-forest)'
                          : isCompleted
                          ? '1px solid var(--color-primary-forest)'
                          : isUnlocked
                          ? '1px solid var(--color-border)'
                          : '1px solid var(--color-bg-soft)',
                        backgroundColor: isSelected
                          ? 'var(--color-bg-surface)'
                          : isUnlocked
                          ? 'var(--color-bg-card)'
                          : 'var(--color-bg-soft)',
                        cursor: isUnlocked ? 'pointer' : 'not-allowed',
                        opacity: isUnlocked ? 1 : 0.55,
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        <div
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            backgroundColor: isCompleted
                              ? 'var(--color-primary-forest)'
                              : isSelected
                              ? 'var(--color-primary-sage)'
                              : isUnlocked
                              ? 'var(--color-bg-soft)'
                              : 'var(--color-bg-surface)',
                            color: isCompleted
                              ? '#ffffff'
                              : isSelected
                              ? '#ffffff'
                              : 'var(--color-text-secondary)'
                          }}
                        >
                          {isCompleted ? (
                            <CheckCircle2 size={16} />
                          ) : !isUnlocked ? (
                            <Lock size={13} color="var(--color-text-muted)" />
                          ) : (
                            lessonNum
                          )}
                        </div>

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.15rem' }}>
                            <span style={{ fontWeight: 600, fontSize: '0.92rem', color: isUnlocked ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>
                              {lesson.title}
                            </span>
                            <span
                              className={`badge ${
                                lesson.difficulty === 'beginner'
                                  ? 'badge-sage'
                                  : lesson.difficulty === 'intermediate'
                                  ? 'badge-sand'
                                  : 'badge-terracotta'
                              }`}
                              style={{ textTransform: 'capitalize', fontSize: '0.7rem', padding: '0.12rem 0.45rem' }}
                            >
                              {lesson.difficulty}
                            </span>
                          </div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                            {lesson.word_count || lesson.content?.split(/\s+/).length || 0} words • {lesson.char_count || lesson.content?.length || 0} chars
                          </span>
                        </div>
                      </div>

                      <div>
                        {isSelected ? (
                          <span className="badge badge-forest" style={{ fontSize: '0.75rem' }}>
                            Active
                          </span>
                        ) : isCompleted ? (
                          <span style={{ color: 'var(--color-primary-forest)', fontSize: '0.8rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            <CheckCircle2 size={14} /> Completed
                          </span>
                        ) : isUnlocked ? (
                          <span className="btn btn-ghost btn-sm" style={{ fontSize: '0.78rem', padding: '0.2rem 0.5rem' }}>
                            Play →
                          </span>
                        ) : (
                          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Lock size={12} /> Locked
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--color-border)' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowCurriculumModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
